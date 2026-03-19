import mongoose from "mongoose";

const timelineStepSchema = new mongoose.Schema({
  stage: { type: String, required: true },
  date: { type: Date },
  note: { type: String },
  isCurrent: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: {
    type: String,
    enum: ['Applied', 'Shortlisted', 'OA Pending', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  progress: { type: Number, default: 14 }, // percentage 0-100
  timeline: [timelineStepSchema],
  resumeUrl: { type: String },
  offerLetterUrl: { type: String },
  appliedOn: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
