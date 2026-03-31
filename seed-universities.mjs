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
      let val = rest.join("=").trim();
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1);
      }
      process.env[key.trim()] = val;
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

// 📌 Correctly define the University Schema for the seed script
const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  universityCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const University = mongoose.models.University || mongoose.model("University", universitySchema);

async function seedUniversities() {
  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected!\n");

  const universities = [
    { name: "ABC University", universityCode: "ABC", isActive: true },
    { name: "XYZ College", universityCode: "XYZ", isActive: true },
    { name: "Legacy University", universityCode: "LEGACY", isActive: true },
    { name: "MMMUT", universityCode: "MMMUT", isActive: true } // Added for user testing
  ];

  for (const uni of universities) {
    const existing = await University.findOne({ universityCode: uni.universityCode });
    if (!existing) {
      await University.create(uni);
      console.log(`✅ Created university: ${uni.name} (${uni.universityCode})`);
    } else {
      console.log(`ℹ️ University already exists: ${uni.name} (${uni.universityCode})`);
    }
  }

  console.log("\n🚀 Seeding Complete! You can now use 'ABC', 'XYZ', or 'LEGACY' as a universityCode during signup.");
  await mongoose.disconnect();
}

seedUniversities().catch(err => {
  console.error("❌ Seeding failed:", err.message);
  process.exit(1);
});
