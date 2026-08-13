require("dotenv").config();
const dns=require("dns"); dns.setServers(["8.8.8.8","8.8.4.4"]);
const mongoose=require("mongoose"); const bcrypt=require("bcryptjs"); const fs=require("fs"); const path=require("path");
const connectDB=require("./config/db");
const User=require("./models/User"); const StudentProfile=require("./models/StudentProfile");
const Placement=require("./models/Placement"); const CompanyCall=require("./models/CompanyCall"); const Job=require("./models/JobNotification");
const Training=require("./models/Training"); const Course=require("./models/Course"); const Interview=require("./models/Interview"); const Test=require("./models/Test"); const Achievement=require("./models/Achievement"); const Hiring=require("./models/HiringStatus");
const students=JSON.parse(fs.readFileSync(path.join(__dirname,"data/students.json"),"utf8"));
const d=(days)=>new Date(Date.now()+days*86400000);
async function upsert(Model, key, docs){ for(const doc of docs){ await Model.findOneAndUpdate(key(doc),doc,{upsert:true,new:true,setDefaultsOnInsert:true}); } }
async function run(){
 await connectDB();
 const adminPassword=await bcrypt.hash("Admin@12345",12);
 await User.findOneAndUpdate({email:"admin@campus.local"},{name:"Campus Administrator",email:"admin@campus.local",password:adminPassword,role:"admin"},{upsert:true,setDefaultsOnInsert:true,new:true});
 const users=[];
 for(const s of students){ const pass=await bcrypt.hash("Demo@12345",12); const u=await User.findOneAndUpdate({email:s.email},{...s,password:pass,role:"student"},{upsert:true,new:true,setDefaultsOnInsert:true}); users.push(u); await StudentProfile.findOneAndUpdate({userId:u._id},{userId:u._id,fullName:s.name,email:s.email,phone:s.phone,college:s.college,department:s.department,course:s.course,year:s.year,rollNumber:s.rollNumber,cgpa:s.cgpa,skills:s.skills,programmingLanguages:s.skills,technicalSkills:s.skills,aiSkills:["Generative AI"],preferredJobRole:"Software Developer",preferredLocation:"Hyderabad",careerInterests:["Software Development","AI"]},{upsert:true,setDefaultsOnInsert:true,new:true}); }
 await upsert(Placement,x=>({companyName:x.companyName,jobRole:x.jobRole}),[
  {companyName:"TCS",jobRole:"Software Developer",description:"Build enterprise applications and APIs.",eligibility:"60%+ with no active backlogs",requiredSkills:["Java","SQL","DSA"],package:"₹7 LPA",location:"Hyderabad",applicationDeadline:d(18),jobType:"Full Time",status:"Open"},
  {companyName:"Infosys",jobRole:"Graduate Engineer",description:"Develop and maintain cloud-ready applications.",eligibility:"60%+",requiredSkills:["Java","Python","SQL"],package:"₹6 LPA",location:"Bengaluru",applicationDeadline:d(22),jobType:"Full Time",status:"Open"},
  {companyName:"Accenture",jobRole:"Associate Software Engineer",description:"Work on digital engineering projects.",eligibility:"65%+",requiredSkills:["JavaScript","Java","Cloud"],package:"₹6.5 LPA",location:"Hyderabad",applicationDeadline:d(25),jobType:"Full Time",status:"Open"},
  {companyName:"Deloitte",jobRole:"Analyst",description:"Technology consulting and analytics role.",eligibility:"70%+",requiredSkills:["SQL","Python","Communication"],package:"₹8 LPA",location:"Hyderabad",applicationDeadline:d(30),jobType:"Full Time",status:"Open"}
 ]);
 await upsert(CompanyCall,x=>({companyName:x.companyName,role:x.role}),[
  {companyName:"TCS",logo:"🏢",role:"Software Developer",description:"Campus recruitment drive",eligibility:"60%+",date:d(7),venue:"College Auditorium",requiredSkills:["Java","DSA"],registrationLink:"https://www.tcs.com/",status:"Upcoming"},
  {companyName:"Infosys",logo:"◈",role:"System Engineer",description:"Graduate hiring drive",eligibility:"60%+",date:d(12),venue:"Placement Cell",requiredSkills:["Java","SQL"],registrationLink:"https://www.infosys.com/",status:"Upcoming"},
  {companyName:"Wipro",logo:"W",role:"Project Engineer",description:"Engineering graduate recruitment",eligibility:"60%+",date:d(18),venue:"Seminar Hall",requiredSkills:["Programming","Communication"],registrationLink:"https://www.wipro.com/",status:"Upcoming"}
 ]);
 await upsert(Job,x=>({title:x.title,company:x.company}),[
  {title:"Software Developer Intern",company:"TechNova",description:"6-month full stack internship",type:"Internship",location:"Remote",salary:"₹25,000/month",deadline:d(14),link:"https://example.com/apply",newNotification:true},
  {title:"Java Developer",company:"Cognizant",description:"Entry-level Java engineering role",type:"Full Time",location:"Pune",salary:"₹6.2 LPA",deadline:d(20),link:"https://www.cognizant.com/",newNotification:true},
  {title:"AI/ML Intern",company:"DataSphere",description:"Work on applied machine learning projects",type:"Internship",location:"Bengaluru",salary:"₹30,000/month",deadline:d(24),link:"https://example.com/apply",newNotification:true},
  {title:"Cloud Engineer",company:"CloudEdge",description:"Cloud infrastructure and DevOps graduate role",type:"Full Time",location:"Hyderabad",salary:"₹7 LPA",deadline:d(28),link:"https://example.com/apply",newNotification:true}
 ]);
 await upsert(Training,x=>({title:x.title,provider:x.provider}),[
  {title:"Full Stack Java Training",provider:"Campus Skill Lab",description:"Java, Spring Boot, REST and MongoDB",duration:"8 Weeks",skills:["Java","Spring Boot","MongoDB"],startDate:d(5),registrationLink:"#",category:"Coding"},
  {title:"Aptitude & Reasoning Bootcamp",provider:"Placement Cell",description:"Quantitative, logical and verbal preparation",duration:"4 Weeks",skills:["Aptitude","Reasoning","Verbal"],startDate:d(3),registrationLink:"#",category:"Aptitude"},
  {title:"Generative AI Foundations",provider:"AI Learning Hub",description:"LLMs, prompt engineering and AI projects",duration:"6 Weeks",skills:["GenAI","Prompt Engineering"],startDate:d(10),registrationLink:"#",category:"AI Training"},
  {title:"Interview Mastery",provider:"Career Studio",description:"Technical and HR mock interview preparation",duration:"3 Weeks",skills:["Communication","Interview Skills"],startDate:d(15),registrationLink:"#",category:"Interview Skills"}
 ]);
 await upsert(Course,x=>({title:x.title,provider:x.provider}),[
  {title:"Java Full Stack Development",provider:"Campus Skill Lab",category:"Full Stack",duration:"12 Weeks",level:"Intermediate",skills:["Java","Spring","MongoDB"],link:"#"},
  {title:"Python for Data Science",provider:"Data Academy",category:"Data Science",duration:"8 Weeks",level:"Beginner",skills:["Python","Pandas","SQL"],link:"#"},
  {title:"Generative AI & Prompt Engineering",provider:"AI Learning Hub",category:"AI/ML",duration:"6 Weeks",level:"Beginner",skills:["GenAI","Prompt Engineering"],link:"#"},
  {title:"AWS Cloud Practitioner",provider:"Cloud Academy",category:"Cloud",duration:"7 Weeks",level:"Beginner",skills:["AWS","Cloud"],link:"#"},
  {title:"DSA with Java",provider:"Coding Arena",category:"Programming",duration:"10 Weeks",level:"Intermediate",skills:["Java","DSA"],link:"#"}
 ]);
 const testDocs=[
 {title:"Aptitude Starter Test",category:"Aptitude",duration:10,difficulty:"Basic",questions:[{question:"If 20% of a number is 40, what is the number?",options:["100","150","200","250"],answer:2,marks:1},{question:"What is 12 × 8?",options:["86","96","108","112"],answer:1,marks:1},{question:"A train travels 60 km in 1 hour. Speed?",options:["30 km/h","45 km/h","60 km/h","90 km/h"],answer:2,marks:1},{question:"Next number: 2, 4, 8, 16, ?",options:["20","24","32","36"],answer:2,marks:1},{question:"Average of 10 and 20?",options:["10","15","20","30"],answer:1,marks:1}]},
 {title:"Java Fundamentals Test",category:"Programming",duration:15,difficulty:"Intermediate",questions:[{question:"Which keyword creates an object?",options:["class","new","this","static"],answer:1,marks:1},{question:"Which collection does not allow duplicates?",options:["List","Set","Queue","ArrayList"],answer:1,marks:1},{question:"Java bytecode runs on?",options:["JVM","JDK only","OS kernel","Compiler"],answer:0,marks:1},{question:"Which is not a primitive type?",options:["int","boolean","String","double"],answer:2,marks:1},{question:"Which method is entry point?",options:["start()","run()","main()","init()"],answer:2,marks:1}]},
 {title:"DSA Quick Check",category:"Technical",duration:12,difficulty:"Intermediate",questions:[{question:"Stack follows which principle?",options:["FIFO","LIFO","Random","Priority"],answer:1,marks:1},{question:"Binary search requires?",options:["Sorted data","Hashing","Graph","Queue"],answer:0,marks:1},{question:"Average lookup in HashMap is?",options:["O(n)","O(log n)","O(1)","O(n²)"],answer:2,marks:1},{question:"BFS commonly uses?",options:["Stack","Queue","Heap","Set"],answer:1,marks:1},{question:"Merge sort complexity?",options:["O(n)","O(log n)","O(n log n)","O(n²)"],answer:2,marks:1}]}
 ];
 for(const t of testDocs) await Test.findOneAndUpdate({title:t.title},t,{upsert:true,new:true,setDefaultsOnInsert:true});
 for(let i=0;i<users.length;i++){
   const u=users[i]; const p=await Placement.findOne({companyName:i===0?"TCS":i===1?"Infosys":"Accenture"});
   await Interview.findOneAndUpdate({userId:u._id,company:i===0?"TCS":i===1?"Infosys":"Accenture"},{userId:u._id,company:i===0?"TCS":i===1?"Infosys":"Accenture",role:"Software Developer",interviewDate:d(6+i),interviewType:"Technical + HR",status:i===0?"Scheduled":"Shortlisted",preparation:["DSA","Core Java","HR Questions"]},{upsert:true,new:true,setDefaultsOnInsert:true});
   if(p) await Hiring.findOneAndUpdate({userId:u._id,company:p.companyName,role:p.jobRole},{userId:u._id,company:p.companyName,role:p.jobRole,applicationStatus:i===0?"Interview Scheduled":"Applied",interviewStatus:i===0?"Scheduled":"Not Scheduled",offerStatus:"Pending"},{upsert:true,new:true,setDefaultsOnInsert:true});
   await Achievement.findOneAndUpdate({userId:u._id,title:"Campus Hackathon Finalist"},{userId:u._id,title:"Campus Hackathon Finalist",description:"Built a student career dashboard prototype.",date:d(-20),category:"Hackathon"},{upsert:true,new:true,setDefaultsOnInsert:true});
 }
 console.log("Seed complete. Admin: admin@campus.local / Admin@12345"); console.log("Demo students use password: Demo@12345"); await mongoose.disconnect();
}
run().catch(e=>{console.error(e);process.exit(1)});
