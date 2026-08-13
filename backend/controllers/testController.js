const Test = require("../models/Test");
const TestResult = require("../models/TestResult");

async function submit(req, res) {
  const test = await Test.findById(req.params.id);
  if (!test) return res.status(404).json({ message: "Test not found." });

  const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
  let score = 0;

  for (const item of answers) {
    const question = test.questions.id(item.questionId);
    if (question && Number(item.selected) === Number(question.answer)) score += question.marks || 1;
  }

  const total = test.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
  const percentage = total ? Math.round((score / total) * 100) : 0;

  const result = await TestResult.create({
    userId: req.userId, testId: test._id, answers, score, total, percentage
  });

  res.json({ message: "Test submitted successfully.", result });
}

module.exports = { submit };

async function getMyResults(req,res){ const data=await TestResult.find({userId:req.userId}).populate("testId","title category").sort({submittedAt:-1}).limit(50); res.json({data}); }
module.exports.getMyResults=getMyResults;
