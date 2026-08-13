const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");
const { calculateCompletion, suggestion } = require("../utils/profileCompletion");
const { uploadBuffer, deleteFile } = require("../services/gridfs");

async function getProfile(req, res) {
  let profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) {
    const user = await User.findById(req.userId).select("name email phone dateOfBirth college studentId");
    if (!user) return res.status(404).json({ message: "Student account not found." });
    profile = await StudentProfile.create({ userId: user._id, fullName: user.name, email: user.email, phone: user.phone, dateOfBirth: user.dateOfBirth, college: user.college, rollNumber: user.studentId, profileCompletion: 0 });
  }
  res.json({ profile, suggestion: suggestion(profile) });
}

async function updateProfile(req, res) {
  let profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) {
    const user = await User.findById(req.userId).select("name email phone dateOfBirth college studentId");
    if (!user) return res.status(404).json({ message: "Student account not found." });
    profile = await StudentProfile.create({ userId: user._id, fullName: user.name, email: user.email, phone: user.phone, dateOfBirth: user.dateOfBirth, college: user.college, rollNumber: user.studentId, profileCompletion: 0 });
  }

  const allowed = [
    "fullName","email","phone","dateOfBirth","gender","address","college","department","course","year",
    "rollNumber","qualification","percentage10","percentage12","diploma","degree","cgpa","skills",
    "programmingLanguages","technicalSkills","softSkills","aiSkills","tools","projects","internships",
    "certifications","achievements","careerInterests","preferredJobRole","preferredLocation",
    "expectedSalary","interestedIndustries"
  ];

  for (const key of allowed) {
    if (req.body[key] !== undefined) profile[key] = req.body[key];
  }

  // Normalize optional numeric/date values so empty form fields do not cause Mongoose cast errors.
  for (const key of ["percentage10", "percentage12", "cgpa", "expectedSalary"]) {
    if (profile[key] === "") profile[key] = undefined;
  }
  if (profile.dateOfBirth === "") profile.dateOfBirth = undefined;

  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();

  await User.findByIdAndUpdate(req.userId, {
    name: profile.fullName,
    phone: profile.phone,
    dateOfBirth: profile.dateOfBirth,
    college: profile.college
  });

  res.json({ message: "Profile saved successfully.", profile, suggestion: suggestion(profile) });
}

async function uploadResume(req, res) {
  if (!req.file) return res.status(400).json({ message: "Please select a PDF, DOC or DOCX resume." });

  const profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) return res.status(404).json({ message: "Profile not found." });

  if (profile.resume?.fileId) {
    try { await deleteFile(profile.resume.fileId); } catch {}
  }

  const fileId = await uploadBuffer(req.file.buffer, req.file.originalname, req.file.mimetype, {
    userId: req.userId, kind: "resume"
  });

  profile.resume = {
    fileId,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date()
  };
  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();

  res.status(201).json({ message: "Resume uploaded successfully ✓", resume: profile.resume, profileCompletion: profile.profileCompletion });
}

async function deleteResume(req, res) {
  const profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile?.resume?.fileId) return res.status(404).json({ message: "No resume found." });

  try { await deleteFile(profile.resume.fileId); } catch {}
  profile.resume = undefined;
  profile.profileCompletion = calculateCompletion(profile);
  await profile.save();

  res.json({ message: "Resume deleted.", profileCompletion: profile.profileCompletion });
}

module.exports = { getProfile, updateProfile, uploadResume, deleteResume };
