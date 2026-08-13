const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: String, provider: String, category: String, duration: String,
  level: String, skills: [String], link: String
}, { timestamps: true });
module.exports = mongoose.model("Course", schema);
