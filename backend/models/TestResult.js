const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  answers: [{ questionId: String, selected: Number }],
  score: Number,
  total: Number,
  percentage: Number,
  submittedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model("TestResult", schema);
