const mongoose = require("mongoose");

const itemProject = new mongoose.Schema({
  title: String,
  description: String,
  technologies: [String],
  github: String,
  live: String
}, { _id: false });

const internship = new mongoose.Schema({
  company: String,
  role: String,
  duration: String,
  description: String
}, { _id: false });

const certificate = new mongoose.Schema({
  name: String,
  provider: String,
  date: Date,
  url: String,
  fileId: String
}, { _id: false });

const achievement = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  category: String
}, { _id: false });

const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, required: true, index: true },
  fullName: String,
  email: String,
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: String,
  college: String,
  department: String,
  course: String,
  year: String,
  rollNumber: String,
  qualification: String,
  percentage10: Number,
  percentage12: Number,
  diploma: String,
  degree: String,
  cgpa: Number,
  skills: [String],
  programmingLanguages: [String],
  technicalSkills: [String],
  softSkills: [String],
  aiSkills: [String],
  tools: [String],
  projects: [itemProject],
  internships: [internship],
  certifications: [certificate],
  achievements: [achievement],
  careerInterests: [String],
  preferredJobRole: String,
  preferredLocation: String,
  expectedSalary: Number,
  interestedIndustries: [String],
  resume: {
    fileId: String,
    filename: String,
    mimetype: String,
    size: Number,
    uploadedAt: Date
  },
  profileCompletion: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("StudentProfile", studentProfileSchema);
