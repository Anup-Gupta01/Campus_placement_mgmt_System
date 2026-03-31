import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  pdfUrl: { type: String, required: true },
  publicId: { type: String }, // Cloudinary public_id for deletion
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  universityCode: { type: String, trim: true, uppercase: true, default: "LEGACY" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
