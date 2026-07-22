// Shared submission logic for the four add-on submit pages (skill / worker / routine /
// personality). Each page differs only in its copy, its field labels, and one line:
// `<form data-addon-type="…">`. Everything below is type-agnostic: sign-in, the required
// proof-of-work screenshot upload, and the Firestore write.
//
// Sign-in has two paths:
//   • Opened from inside Archie, the URL carries a one-time Firebase custom token (?ct=…) minted
//     for the developer's Archie account. We sign in with it, so the page shows the SAME account
//     they use in the app, fixing the "signed in as someone else" mismatch that a plain browser
//     Google session caused.
//   • Opened directly, it falls back to the Google popup.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCustomToken,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA46RqJV4tcJD8h4mdcSZ26dDoikA9L64M",
  authDomain: "archie-77170.firebaseapp.com",
  projectId: "archie-77170",
  storageBucket: "archie-77170.firebasestorage.app",
  messagingSenderId: "516396797258",
  appId: "1:516396797258:web:362cf2815128f3c82345b3",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const MAX_SHOT_BYTES = 8 * 1024 * 1024; // 8 MB, matches the copy and the Storage rule.

const form = document.getElementById("skillForm");
const addonType = form.dataset.addonType || "skill";

const gate = document.getElementById("signinGate");
const done = document.getElementById("doneBanner");
const signinError = document.getElementById("signinError");
const formError = document.getElementById("formError");

// Panel shown to a signed-in account that isn't an active Archie user. Submissions require an active
// subscription: we only list add-ons that were built and tested inside the app, and you can't do
// that without one. The server-side gate is the Firestore /submissions rule and the Storage rule;
// this is only the friendly front door so a non-subscriber sees WHY up front instead of filling out
// the whole form and hitting a permission error at submit. Built in JS so all four submit pages
// inherit it without editing their HTML.
const subGate = document.createElement("div");
subGate.className = "cta-banner fade-up";
subGate.style.display = "none";
subGate.innerHTML =
  "<h2>You need an active Archie subscription to submit</h2>" +
  "<p>Add-ons are only listed once they've been built and tested inside Archie, so submitting one " +
  'requires an active account. Signed in as <strong id="subGateEmail"></strong>.</p>' +
  '<a href="../../../questionnaire/" class="btn btn-primary btn-lg">Get Archie</a>' +
  '<p style="margin-top:0.9rem; font-size:0.9rem;"><a href="#" id="subGateSignOut">Use a different account</a></p>';
form.parentNode.insertBefore(subGate, form);
subGate.querySelector("#subGateSignOut").addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth);
});

// Whether the signed-in account may submit: the same "active Archie account" the app and the
// security rules require (admin / client / active subscriber). Reads the caller's own user doc,
// which the Firestore rules allow. Fails OPEN on a read error: a network blip shouldn't lock out a
// real subscriber, and the /submissions rule still blocks the actual write for anyone who isn't.
async function isEntitledUser(user) {
  try {
    const snap = await getDoc(doc(db, "users", user.uid));
    if (!snap.exists()) return false;
    const d = snap.data();
    const tier = d.access_tier || "none";
    return (
      tier === "admin" ||
      tier === "client" ||
      (tier === "subscriber" && d.subscription_status === "active")
    );
  } catch (e) {
    return true;
  }
}

function showSigninError(msg) {
  signinError.textContent = msg;
  signinError.style.display = "";
}

// SSO from Archie: a one-time custom token in the URL. Consume it, then scrub it from the address
// bar / history so the token isn't left sitting in the URL.
const params = new URLSearchParams(window.location.search);
const customToken = params.get("ct");
if (customToken) {
  gate.querySelector("h2").textContent = "Signing you in…";
  signInWithCustomToken(auth, customToken).catch((e) => {
    showSigninError("Couldn't sign in from Archie automatically. Sign in with Google instead. (" + (e.code || e.message) + ")");
  });
  const clean = window.location.pathname;
  window.history.replaceState({}, document.title, clean);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    gate.querySelector("h2").textContent = "Sign in to submit";
    gate.style.display = "";
    form.style.display = "none";
    subGate.style.display = "none";
    return;
  }
  const who = user.email || user.displayName || "your account";
  // Keep the gate visible with a "checking" note during the entitlement read, so there's no flash of
  // empty page between sign-in and whichever panel (form vs. subscribe) we end up showing.
  gate.querySelector("h2").textContent = "Checking your account…";
  gate.style.display = "";
  const entitled = await isEntitledUser(user);
  gate.style.display = "none";
  if (entitled) {
    subGate.style.display = "none";
    form.style.display = "";
    document.getElementById("signedInAs").textContent = who;
  } else {
    form.style.display = "none";
    subGate.style.display = "";
    subGate.querySelector("#subGateEmail").textContent = who;
  }
});

document.getElementById("btnSignIn").addEventListener("click", async () => {
  signinError.style.display = "none";
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) {
    if (e.code !== "auth/popup-closed-by-user") showSigninError(e.message);
  }
});

document.getElementById("btnSignOut").addEventListener("click", (e) => {
  e.preventDefault();
  signOut(auth);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formError.style.display = "none";
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("skillName").value.trim();
  const description = document.getElementById("skillDescription").value.trim();
  const template_md = document.getElementById("skillTemplate").value.trim();
  const license = document.getElementById("licenseGranted").checked;
  const shotInput = document.getElementById("proofShot");
  const shot = shotInput.files && shotInput.files[0];

  if (!name || !description || !template_md || !license) {
    return fail("Please fill in the required fields and confirm the license checkbox.");
  }
  if (!shot) {
    return fail("Attach a screenshot showing your add-on working; it's required for review.");
  }
  if (!shot.type.startsWith("image/")) {
    return fail("The proof needs to be an image (PNG, JPG, or WebP).");
  }
  if (shot.size > MAX_SHOT_BYTES) {
    return fail("That screenshot is over 8 MB. Please attach a smaller image.");
  }

  const btn = document.getElementById("btnSubmit");
  btn.disabled = true;
  btn.textContent = "Uploading…";
  try {
    // Upload the proof screenshot first: a submission with no proof is worthless, so we don't want
    // to create the doc unless the image lands. Path is namespaced to the uid so the Storage rule
    // can scope writes to the owner. The extension is derived from the mime type, not the (spoofable)
    // filename.
    const ext = shot.type === "image/png" ? "png" : shot.type === "image/webp" ? "webp" : "jpg";
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const shotRef = ref(storage, `submissions/${user.uid}/${addonType}-${stamp}.${ext}`);
    await uploadBytes(shotRef, shot, { contentType: shot.type });
    const screenshot_url = await getDownloadURL(shotRef);

    btn.textContent = "Submitting…";
    // Field names + limits mirror the Firestore rules for /submissions; keep in sync.
    await addDoc(collection(db, "submissions"), {
      type: addonType,
      submitter_uid: user.uid,
      submitter_email: user.email || "",
      name,
      description,
      category: document.getElementById("skillCategory").value,
      // Triggers only exist on the skill page; guard so the shared script works everywhere.
      triggers: (document.getElementById("skillTriggers")?.value || "")
        .split(",").map((t) => t.trim()).filter(Boolean),
      suggested_price_usd: Number(document.getElementById("skillPrice").value) || 0,
      template_md,
      screenshot_url,
      license_granted: true,
      submitted_at: serverTimestamp(),
    });
    form.style.display = "none";
    done.style.display = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    fail("Submission failed: " + (err.message || err));
    btn.disabled = false;
    btn.textContent = "Submit for review";
  }

  // Hoisted within this handler, so the validation returns above (`return fail(…)`) reach it.
  function fail(msg) {
    formError.textContent = msg;
    formError.style.display = "";
  }
});
