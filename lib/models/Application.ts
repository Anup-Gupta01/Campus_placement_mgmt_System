import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  status: { 
    type: String, 
    enum: ['Applied', 'QA Pending', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied'
  },
  resumeUrl: { type: String }, // Used to store Cloudinary URL
  appliedOn: { type: Date, default: Date.now }
});

export default mongoose.models.Application || mongoose.model("Application", applicationSchema);
