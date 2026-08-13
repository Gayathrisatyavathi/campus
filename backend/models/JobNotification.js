const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: String, company: String, description: String, type: String, location: String,
  salary: String, deadline: Date, link: String, newNotification: { type: Boolean, default: true }
}, { timestamps: true });
module.exports = mongoose.model("JobNotification", schema);
