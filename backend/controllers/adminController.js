const bcrypt = require("bcryptjs");
const User = require("../models/User");
const StudentProfile = require("../models/StudentProfile");
const HiringStatus = require("../models/HiringStatus");
const models = {
  placements: require("../models/Placement"), companyCalls: require("../models/CompanyCall"), jobs: require("../models/JobNotification"),
  training: require("../models/Training"), courses: require("../models/Course"), interviews: require("../models/Interview"),
  tests: require("../models/Test"), achievements: require("../models/Achievement"), hiring: HiringStatus
};

async function stats(req,res){
  const [students,placements,companies,jobs,training,courses,interviews,tests,hired] = await Promise.all([
    User.countDocuments({role:"student"}), models.placements.countDocuments(), models.companyCalls.countDocuments(), models.jobs.countDocuments(),
    models.training.countDocuments(), models.courses.countDocuments(), models.interviews.countDocuments(), models.tests.countDocuments(),
    HiringStatus.countDocuments({applicationStatus:{ $in:["Selected","Offer Received"] }})
  ]);
  res.json({students,placements,companies,jobs,training,courses,interviews,tests,hired});
}

async function students(req,res){
  const data = await User.find({role:"student"}).select("-password").sort({createdAt:-1}).limit(500).lean();
  const ids=data.map(x=>x._id);
  const profiles=await StudentProfile.find({userId:{$in:ids}}).lean();
  const map=new Map(profiles.map(x=>[String(x.userId),x]));
  res.json({data:data.map(u=>({...u, profile:map.get(String(u._id))||null}))});
}

async function resources(req,res){
  const Model=models[req.params.resource];
  if(!Model) return res.status(404).json({message:"Admin resource not found."});
  const data=await Model.find().sort({createdAt:-1}).limit(500).lean();
  if(req.params.resource==="tests") data.forEach(t=>t.questions=(t.questions||[]).map(q=>({...q,answer:undefined})));
  res.json({data});
}
async function createResource(req,res){
  const Model=models[req.params.resource]; if(!Model) return res.status(404).json({message:"Admin resource not found."});
  const item=await Model.create(req.body); res.status(201).json({message:"Record created.",item});
}
async function updateResource(req,res){
  const Model=models[req.params.resource]; if(!Model) return res.status(404).json({message:"Admin resource not found."});
  const item=await Model.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true});
  if(!item) return res.status(404).json({message:"Record not found."}); res.json({message:"Record updated.",item});
}
async function deleteResource(req,res){
  const Model=models[req.params.resource]; if(!Model) return res.status(404).json({message:"Admin resource not found."});
  const item=await Model.findByIdAndDelete(req.params.id); if(!item) return res.status(404).json({message:"Record not found."});
  res.json({message:"Record deleted."});
}
async function upsertHiring(req,res){
  const {userId,company,role,applicationStatus,interviewStatus,offerStatus,notes}=req.body;
  if(!userId||!company||!role) return res.status(400).json({message:"Student, company and role are required."});
  const item=await HiringStatus.findOneAndUpdate({userId,company,role},{userId,company,role,applicationStatus,interviewStatus,offerStatus,notes,updatedBy:req.userId},{new:true,upsert:true,setDefaultsOnInsert:true,runValidators:true});
  res.json({message:"Hiring status saved.",item});
}
async function hiring(req,res){ const data=await HiringStatus.find().populate("userId","name email studentId").sort({updatedAt:-1}).limit(500).lean(); res.json({data}); }
async function createAdmin(req,res){
  const {name,email,password}=req.body; if(!name||!email||!password) return res.status(400).json({message:"Name, email and password are required."});
  const exists=await User.findOne({email:email.toLowerCase().trim()}); if(exists) return res.status(409).json({message:"Email already exists."});
  const user=await User.create({name,email:email.toLowerCase().trim(),password:await bcrypt.hash(password,12),role:"admin"});
  res.status(201).json({message:"Admin created.",user:{id:user._id,name:user.name,email:user.email,role:user.role}});
}
module.exports={stats,students,resources,createResource,updateResource,deleteResource,hiring,upsertHiring,createAdmin};
