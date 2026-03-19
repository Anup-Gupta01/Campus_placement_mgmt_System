// seed-student.mjs — Run: node seed-student.mjs
// Creates a verified test student in MongoDB for development testing
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";

// Manually parse .env.local
try {
  const envFile = readFileSync(".env.local", "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
} catch {}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  mobileNo: String,
  username: { type: String, unique: true, sparse: true },
  password: String,
  role: { type: String, default: "student" },
  university: String,
  location: String,
  course: String,
  branch: String,
  year: Number,
  dob: Date,
  gender: String,
  cgpa: Number,
  skills: [String],
  projects: [{ title: String, description: String, tags: [String], link: String }],
  resumes: [{ name: String, url: String, size: Number, date: Date, tags: [String] }],
  achievements: [String],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models?.User || mongoose.model("User", UserSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const existing = await User.findOne({ email: "student@test.com" });
  if (existing) {
    console.log("ℹ️  Test student already exists. Updating password and verifying...");
    existing.password = await bcrypt.hash("Student@123", 10);
    existing.isVerified = true;
    await existing.save();
    console.log("✅ Test student updated successfully");
  } else {
    const hashedPassword = await bcrypt.hash("Student@123", 10);
    await User.create({
      firstName: "Rahul",
      lastName: "Sharma",
      email: "student@test.com",
      mobileNo: "9876543210",
      username: "rahul_sharma",
      password: hashedPassword,
      role: "student",
      university: "IIT Delhi",
      location: "New Delhi",
      course: "B.Tech",
      branch: "Computer Science Engineering",
      year: 3,
      gender: "Male",
      cgpa: 8.5,
      skills: ["React", "Node.js", "Python", "MongoDB", "TypeScript", "Express", "Machine Learning"],
      projects: [
        {
          title: "Campus Placement Portal",
          description: "A full-stack web application for managing campus placements",
          tags: ["Next.js", "MongoDB", "Node.js"],
          link: "https://github.com/rahul/placement-portal"
        },
        {
          title: "AI Chatbot",
          description: "Conversational AI chatbot using Google Gemini API",
          tags: ["Python", "Gemini API", "Flask"],
          link: ""
        }
      ],
      achievements: [
        "Winner - Smart India Hackathon 2024",
        "Google DSC Lead 2023-24",
        "Published IEEE paper on ML in Healthcare"
      ],
      isVerified: true,
    });
    console.log("✅ Test student created successfully!");
  }

  console.log("\n📋 Login credentials:");
  console.log("   Email:    student@test.com");
  console.log("   Password: Student@123");
  console.log("   URL:      http://localhost:3000/login\n");

  await mongoose.disconnect();
}

seed().catch(err => { console.error("❌ Seed failed:", err); process.exit(1); });
