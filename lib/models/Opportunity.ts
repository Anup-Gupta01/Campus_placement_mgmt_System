import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, required: true },
  type: { type: String, required: true }, // e.g. Full-time, Internship
  location: { type: String, required: true },
  package: { type: String, required: true }, // Package / Stipend
  applyLink: { type: String },
  description: { type: String, required: true },
  minCGPA: { type: Number, required: true },
  eligibleBranches: [{ type: String }],
  requiredSkills: { type: String },
  applicationDeadline: { type: Date, required: true },
  onlineAssessmentDate: { type: Date },
  interviewDate: { type: Date },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who posted it
});

export default mongoose.models.Opportunity || mongoose.model("Opportunity", opportunitySchema);
