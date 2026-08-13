const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  companyName: String, jobRole: String, description: String, eligibility: String,
  requiredSkills: [String], package: String, location: String, applicationDeadline: Date,
  jobType: String, status: { type: String, default: "Open" }
}, { timestamps: true });
module.exports = mongoose.model("Placement", schema);
