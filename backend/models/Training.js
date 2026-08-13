const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: String, provider: String, description: String, duration: String,
  skills: [String], startDate: Date, registrationLink: String, category: String
}, { timestamps: true });
module.exports = mongoose.model("Training", schema);
