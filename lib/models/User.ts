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
  location?: string;
  
  // Student-specific fields
  course?: string;
  branch?: string;
  year?: number;
  dob?: Date;
  gender?: string;

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
  location: String,
  
  // 🎓 Student-specific fields
  course: String,
  branch: String,
  year: Number,
  dob: Date,
  gender: String,

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
