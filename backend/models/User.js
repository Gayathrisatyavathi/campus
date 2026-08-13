const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, trim: true, maxlength: 20 },
  dateOfBirth: { type: Date },
  college: { type: String, trim: true },
  studentId: { type: String, trim: true },
  role: { type: String, enum: ["student", "admin"], default: "student" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
