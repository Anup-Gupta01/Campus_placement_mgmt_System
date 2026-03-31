import mongoose from "mongoose";

const universitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  universityCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.University || mongoose.model("University", universitySchema);
