const StudentProfile = require("../models/StudentProfile");
const Placement = require("../models/Placement");
const JobNotification = require("../models/JobNotification");
const CompanyCall = require("../models/CompanyCall");
const Training = require("../models/Training");
const Course = require("../models/Course");
const Interview = require("../models/Interview");
const Test = require("../models/Test");
const Achievement = require("../models/Achievement");
const TrainingRegistration = require("../models/TrainingRegistration");

async function dashboard(req, res) {
  const [profile, placements, jobs, calls, training, courses, interviews, tests, achievements] = await Promise.all([
    StudentProfile.findOne({ userId: req.userId }),
    Placement.find({ status: { $ne: "Closed" } }).sort({ applicationDeadline: 1 }).limit(4),
    JobNotification.find().sort({ createdAt: -1 }).limit(4),
    CompanyCall.find().sort({ date: 1 }).limit(4),
    Training.find().sort({ startDate: 1 }).limit(4),
    Course.find().limit(4),
    Interview.find({ userId: req.userId }).sort({ interviewDate: 1 }).limit(4),
    Test.find().limit(4),
    Achievement.find({ userId: req.userId }).sort({ date: -1 }).limit(5)
  ]);

  res.json({ profile, placements, jobs, calls, training, courses, interviews, tests, achievements });
}

module.exports = { dashboard };
