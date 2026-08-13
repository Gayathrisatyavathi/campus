const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  company: { type: String, required: true },
  role: { type: String, required: true },
  applicationStatus: { type: String, enum: ["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "Offer Received"], default: "Applied" },
  interviewStatus: { type: String, default: "Not Scheduled" },
  offerStatus: { type: String, default: "Pending" },
  notes: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
module.exports = mongoose.model("HiringStatus", schema);
