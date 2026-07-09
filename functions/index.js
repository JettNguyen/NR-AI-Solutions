const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// ---------------------------------------------------------------------------
// verifyAccess
//
// Called by the desktop app on launch and after sign-in.
// Verifies the Firebase ID token, looks up the user's access tier in Firestore,
// and returns whether they are allowed to use Archie.
//
// Request:  POST { "id_token": "<firebase-id-token>" }
// Response: { "allowed": bool, "tier": "client" | "subscriber" | "none",
//             "email": string, "uid": string }
// ---------------------------------------------------------------------------
exports.verifyAccess = onRequest({ cors: ["https://otianai.com", "http://127.0.0.1"] }, async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id_token } = req.body;
  if (!id_token) {
    return res.status(400).json({ error: "id_token is required" });
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(id_token);
  } catch (e) {
    return res.status(401).json({ error: "Invalid or expired token", detail: e.message });
  }

  const uid = decoded.uid;
  const email = decoded.email || "";

  // Upsert the user document (creates on first sign-in).
  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();

  if (!userSnap.exists) {
    await userRef.set({
      email,
      display_name: decoded.name || "",
      access_tier: "none",
      stripe_customer_id: null,
      subscription_status: null,
      subscription_expires_at: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const userData = userSnap.exists ? userSnap.data() : { access_tier: "none", subscription_status: null };
  const tier = userData.access_tier || "none";
  const subStatus = userData.subscription_status;

  // Access rules:
  //   "client"     → always allowed (set manually in Firebase Console)
  //   "subscriber" → allowed if subscription_status is "active"
  //   "none"       → not allowed
  const allowed = tier === "client" || (tier === "subscriber" && subStatus === "active");

  return res.json({ allowed, tier, email, uid });
});

// ---------------------------------------------------------------------------
// stripeWebhook
//
// Receives Stripe events and updates Firestore subscription status.
// Set this URL in your Stripe Dashboard → Webhooks.
//
// Required env vars (set via: firebase functions:secrets:set STRIPE_SECRET_KEY etc.)
//   STRIPE_SECRET_KEY       — your Stripe secret key (sk_live_... or sk_test_...)
//   STRIPE_WEBHOOK_SECRET   — from Stripe Dashboard → Webhooks → signing secret
// ---------------------------------------------------------------------------
exports.stripeWebhook = onRequest({ rawBody: true }, async (req, res) => {
  const Stripe = require("stripe");
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      webhookSecret
    );
  } catch (e) {
    console.error("Stripe webhook signature verification failed:", e.message);
    return res.status(400).json({ error: "Webhook signature invalid" });
  }

  const data = event.data.object;

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      // Find user by stripe_customer_id and update subscription status.
      const customerId = data.customer;
      const status = data.status; // "active", "canceled", "past_due", etc.
      const expiresAt = data.current_period_end
        ? admin.firestore.Timestamp.fromMillis(data.current_period_end * 1000)
        : null;

      const snap = await db.collection("users")
        .where("stripe_customer_id", "==", customerId)
        .limit(1)
        .get();

      if (!snap.empty) {
        const tier = status === "active" ? "subscriber" : "none";
        await snap.docs[0].ref.update({
          subscription_status: status,
          subscription_expires_at: expiresAt,
          access_tier: tier,
        });
        console.log(`Updated subscription for customer ${customerId}: ${status}`);
      } else {
        console.warn(`No user found for Stripe customer ${customerId}`);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const customerId = data.customer;
      const snap = await db.collection("users")
        .where("stripe_customer_id", "==", customerId)
        .limit(1)
        .get();

      if (!snap.empty) {
        await snap.docs[0].ref.update({
          subscription_status: "canceled",
          access_tier: "none",
        });
      }
      break;
    }

    case "checkout.session.completed": {
      // Link the Stripe customer to the Firebase user.
      // The checkout session includes client_reference_id = Firebase UID.
      const uid = data.client_reference_id;
      const customerId = data.customer;
      if (uid && customerId) {
        await db.collection("users").doc(uid).update({
          stripe_customer_id: customerId,
        });
        console.log(`Linked Stripe customer ${customerId} to uid ${uid}`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.json({ received: true });
});

// ---------------------------------------------------------------------------
// marketplaceList
//
// Public endpoint that returns all marketplace items. The desktop app can call
// this instead of using the bundled built-in manifests.
// ---------------------------------------------------------------------------
exports.marketplaceList = onRequest({ cors: true }, async (req, res) => {
  const collections = ["skills", "personalities", "routines", "subagents"];
  const result = {};

  for (const col of collections) {
    const snap = await db.collection("marketplace").doc(col).collection("items").get();
    result[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  return res.json(result);
});
