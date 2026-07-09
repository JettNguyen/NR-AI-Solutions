/**
 * Seed Firestore marketplace collections from the JSON files in data/marketplace/.
 *
 * Usage:
 *   node functions/seed-marketplace.js
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS to be set (or run from a CI env
 * that already has Firebase Admin credentials via a service account).
 *
 * This script is idempotent — it overwrites existing documents with matching IDs.
 * It is called automatically by the GitHub Actions deploy workflow.
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Initialize only if not already initialized (allows importing from Cloud Functions too).
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const COLLECTIONS = ["skills", "personalities", "routines", "subagents"];
const DATA_ROOT = path.resolve(__dirname, "..", "data", "marketplace");

async function seedCollection(collection) {
  const dir = path.join(DATA_ROOT, collection);
  if (!fs.existsSync(dir)) {
    console.log(`  skip ${collection} (no directory)`);
    return 0;
  }

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.log(`  skip ${collection} (no JSON files)`);
    return 0;
  }

  const batch = db.batch();
  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"));
    const docId = data.id || path.basename(file, ".json");
    const ref = db.collection("marketplace").doc(collection).collection("items").doc(docId);
    batch.set(ref, data, { merge: false });
  }

  await batch.commit();
  console.log(`  ${collection}: ${files.length} item(s) synced`);
  return files.length;
}

async function main() {
  console.log("Seeding Firestore marketplace from data/marketplace/ ...");
  let total = 0;
  for (const col of COLLECTIONS) {
    total += await seedCollection(col);
  }
  console.log(`Done — ${total} total item(s) written to Firestore.`);
}

// Run if called directly (not imported).
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}

module.exports = { seedCollection, main };
