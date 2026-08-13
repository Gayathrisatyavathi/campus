const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema({
  question: String, options: [String], answer: Number, marks: { type: Number, default: 1 }
}, { _id: true });
const schema = new mongoose.Schema({
  title: String, category: String, duration: Number, questions: [questionSchema],
  marks: Number, difficulty: String
}, { timestamps: true });
module.exports = mongoose.model("Test", schema);
