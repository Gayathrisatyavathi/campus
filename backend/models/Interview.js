const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  company: String, role: String, interviewDate: Date, interviewType: String,
  status: { type: String, default: "Scheduled" }, result: String,
  preparation: [String]
}, { timestamps: true });
module.exports = mongoose.model("Interview", schema);
