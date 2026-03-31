/**
 * seed-universities.mjs
 * 
 * Seeds sample universities into MongoDB.
 * Run once: node seed-universities.mjs
 * 
 * Prerequisites: MONGODB_URI in .env.local
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
  console.error("Could not find .env.local — make sure MONGODB_URI is set.");
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  universityCode: { type: String, required: true, unique: true, uppercase: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const University = mongoose.models.University || mongoose.model("University", universitySchema);

const universities = [
  { name: "Indian Institute of Technology Bombay",   universityCode: "IITB",   isActive: true },
  { name: "Indian Institute of Technology Delhi",    universityCode: "IITD",   isActive: true },
  { name: "National Institute of Technology Karnataka", universityCode: "NITK", isActive: true },
  { name: "ABC University",                          universityCode: "ABCU",   isActive: true },
  { name: "XYZ College of Engineering",             universityCode: "XYZCE",  isActive: true },
  { name: "Demo University",                         universityCode: "DEMO",   isActive: true },
];

async function seed() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  let inserted = 0;
  let skipped = 0;

  for (const uni of universities) {
    const existing = await University.findOne({ universityCode: uni.universityCode });
    if (existing) {
      console.log(`⏭️  Skipped (already exists): ${uni.universityCode} — ${uni.name}`);
      skipped++;
    } else {
      await University.create(uni);
      console.log(`✅ Inserted: ${uni.universityCode} — ${uni.name}`);
      inserted++;
    }
  }

  console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
