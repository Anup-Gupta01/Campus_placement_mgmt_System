import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
  username?: string;
  password?: string;
  role: "student" | "admin";
  university: string;
  universityCode?: string;
  location?: string;
  
  // Student-specific fields
  course?: string;
  branch?: string;
  year?: number;
  dob?: Date;
  gender?: string;
  cgpa?: number;
  skills?: string[];
  projects?: { title: string; description: string; tags: string[]; link?: string }[];
  resumes?: { name: string; url: string; size: number; date: Date; tags: string[] }[];
  achievements?: string[];
  resumeUrl?: string;

  // Admin-specific fields
  designation?: string;
  jobId?: string;
  
  isVerified: boolean;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNo: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "admin"], default: "student" },
  university: { type: String, required: true },
  universityCode: { type: String, trim: true, uppercase: true, default: "LEGACY" },
  location: String,
  
  // 🎓 Student-specific fields
  course: String,
  branch: String,
  year: Number,
  dob: Date,
  gender: String,
  cgpa: Number,
  skills: [String],
  projects: [{
    title: String,
    description: String,
    tags: [String],
    link: String
  }],
  resumes: [{
    name: String,
    url: String,
    size: Number,
    date: { type: Date, default: Date.now },
    tags: [String]
  }],
  achievements: [String],
  resumeUrl: String,

  // 🏢 Admin-specific fields
  designation: String,
  jobId: String,

  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
