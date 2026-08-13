const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: String, description: String, date: Date, certificate: String, category: String
}, { timestamps: true });
module.exports = mongoose.model("Achievement", schema);
