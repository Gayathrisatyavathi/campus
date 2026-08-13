const models = {
  placements: require("../models/Placement"),
  companyCalls: require("../models/CompanyCall"),
  jobs: require("../models/JobNotification"),
  training: require("../models/Training"),
  courses: require("../models/Course"),
  interviews: require("../models/Interview"),
  tests: require("../models/Test"),
  achievements: require("../models/Achievement"),
  hiring: require("../models/HiringStatus")
};

async function list(req, res) {
  const resource = req.params.resource;
  const Model = models[resource];
  if (!Model) return res.status(404).json({ message: "Resource not found." });

  const query = {};
  const search = String(req.query.search || "").trim();
  if (search) {
    const fields = {
      placements: ["companyName","jobRole","location","description"],
      hiring: ["company","role","applicationStatus","interviewStatus","offerStatus"],
      companyCalls: ["companyName","role","venue"],
      jobs: ["title","company","location","description"],
      training: ["title","provider","category","description"],
      courses: ["title","provider","category"],
      interviews: ["company","role"],
      tests: ["title","category","difficulty"],
      achievements: ["title","category","description"]
    }[req.params.resource] || [];
    query.$or = fields.map(field => ({ [field]: { $regex: search, $options: "i" } }));
  }

  if (["interviews","achievements","hiring"].includes(resource)) query.userId = req.userId;

  const data = await Model.find(query).sort({ createdAt: -1 }).limit(100).lean();
  if (resource === "tests") {
    data.forEach(test => { test.questions = (test.questions || []).map(q => { const { answer, ...safe } = q; return safe; }); });
  }
  res.json({ data });
}

async function createAchievement(req, res) {
  const Achievement = models.achievements;
  const item = await Achievement.create({ ...req.body, userId: req.userId });
  res.status(201).json({ message: "Achievement added.", item });
}

async function updateAchievement(req, res) {
  const item = await models.achievements.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId }, req.body, { new: true, runValidators: true }
  );
  if (!item) return res.status(404).json({ message: "Achievement not found." });
  res.json({ message: "Achievement updated.", item });
}

async function deleteAchievement(req, res) {
  const item = await models.achievements.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  if (!item) return res.status(404).json({ message: "Achievement not found." });
  res.json({ message: "Achievement deleted." });
}

async function applyPlacement(req, res) {
  const Placement = models.placements;
  const Application = require("../models/Application");
  const HiringStatus = require("../models/HiringStatus");
  const item = await Placement.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Placement not found." });
  try {
    await Application.create({ userId: req.userId, placementId: item._id, status: "Applied" });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You already applied for this placement." });
    throw error;
  }
  await HiringStatus.findOneAndUpdate({ userId:req.userId, company:item.companyName, role:item.jobRole }, { userId:req.userId, company:item.companyName, role:item.jobRole, applicationStatus:"Applied", interviewStatus:"Not Scheduled", offerStatus:"Pending" }, { upsert:true, new:true, setDefaultsOnInsert:true });
  res.json({ message: `Application recorded for ${item.companyName} — ${item.jobRole}.` });
}

module.exports = { list, createAchievement, updateAchievement, deleteAchievement, applyPlacement };
