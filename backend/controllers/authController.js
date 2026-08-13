const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const { signToken } = require("../middleware/auth");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/"
};

async function register(req, res) {
  const { name, email, password, confirmPassword, phone, dateOfBirth, gender, college, studentId } = req.body;

  if (!name || !email || !password || !confirmPassword) return res.status(400).json({ message: "Please fill all required fields." });
  if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email address." });
  if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });
  if (password !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

  const normalized = email.toLowerCase().trim();
  const exists = await User.findOne({ email: normalized });
  if (exists) return res.status(409).json({ message: "Email already registered." });

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name, email: normalized, password: hashed, phone, dateOfBirth, gender, college, studentId
  });

  await StudentProfile.create({
    userId: user._id, fullName: name, email: normalized, phone, dateOfBirth, gender, college, rollNumber: studentId, profileCompletion: 0
  });

  res.cookie(process.env.COOKIE_NAME || "cmp_token", signToken(user), cookieOptions);
  res.status(201).json({ message: "Account created successfully!", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.cookie(process.env.COOKIE_NAME || "cmp_token", signToken(user), cookieOptions);
  res.json({ message: "Signed in successfully.", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

async function logout(req, res) {
  res.clearCookie(process.env.COOKIE_NAME || "cmp_token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  res.json({ message: "Signed out successfully." });
}

async function me(req, res) {
  const user = await User.findById(req.userId).select("-password");
  if (!user) return res.status(401).json({ message: "User not found." });
  const profile = await StudentProfile.findOne({ userId: user._id });
  res.json({ user, profile });
}

module.exports = { register, login, logout, me };
