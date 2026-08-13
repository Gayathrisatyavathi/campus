const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  companyName: String, logo: String, role: String, description: String, eligibility: String,
  date: Date, venue: String, requiredSkills: [String], registrationLink: String, status: String
}, { timestamps: true });
module.exports = mongoose.model("CompanyCall", schema);
