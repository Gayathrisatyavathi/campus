const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  placementId: { type: mongoose.Schema.Types.ObjectId, ref: "Placement", required: true },
  status: { type: String, enum: ["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "Offer Received"], default: "Applied" }
}, { timestamps: true });
schema.index({ userId: 1, placementId: 1 }, { unique: true });
module.exports = mongoose.model("Application", schema);
