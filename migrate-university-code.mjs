/**
 * migrate-university-code.mjs
 *
 * One-time migration script: assigns a universityCode to all existing
 * documents that don't have one yet.
 *
 * Collections updated:
 *   - users         → universityCode = "LEGACY"
 *   - opportunities → universityCode = "LEGACY"
 *   - notices       → universityCode = "LEGACY"
 *   - applications  → universityCode = "LEGACY"
 *
 * Run: node migrate-university-code.mjs
 *
 * After running, optionally change "LEGACY" in MongoDB Atlas or via
 * another targeted script to assign the real university codes.
 */

import mongoose from "mongoose";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Load .env.local manually
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
} catch {
  console.error("Could not find .env.local");
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

async function migrate() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  const db = mongoose.connection.db;

  // Patch users
  const usersResult = await db.collection("users").updateMany(
    { universityCode: { $exists: false } },
    { $set: { universityCode: "LEGACY" } }
  );
  console.log(`👤 Users patched: ${usersResult.modifiedCount}`);

  // Patch opportunities
  const oppsResult = await db.collection("opportunities").updateMany(
    { universityCode: { $exists: false } },
    { $set: { universityCode: "LEGACY" } }
  );
  console.log(`💼 Opportunities patched: ${oppsResult.modifiedCount}`);

  // Patch notices
  const noticesResult = await db.collection("notices").updateMany(
    { universityCode: { $exists: false } },
    { $set: { universityCode: "LEGACY" } }
  );
  console.log(`📢 Notices patched: ${noticesResult.modifiedCount}`);

  // Patch applications
  const appsResult = await db.collection("applications").updateMany(
    { universityCode: { $exists: false } },
    { $set: { universityCode: "LEGACY" } }
  );
  console.log(`📋 Applications patched: ${appsResult.modifiedCount}`);

  console.log("\n✅ Migration complete! All legacy documents now have universityCode = \"LEGACY\".");
  console.log("\n💡 TIP: You can now update specific users/documents in MongoDB Atlas");
  console.log("   to assign their real universityCode if needed.");
  
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
