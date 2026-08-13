const fields = [
  "fullName", "phone", "dateOfBirth", "gender", "address", "college",
  "department", "course", "year", "rollNumber", "percentage10",
  "percentage12", "degree", "cgpa", "skills", "programmingLanguages",
  "technicalSkills", "softSkills", "aiSkills", "tools", "projects",
  "internships", "certifications", "achievements", "careerInterests",
  "preferredJobRole", "preferredLocation", "expectedSalary",
  "interestedIndustries", "resume"
];

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function calculateCompletion(profile) {
  const completed = fields.filter(field => hasValue(profile[field])).length;
  return Math.round((completed / fields.length) * 100);
}

function suggestion(profile) {
  const checks = [
    ["projects", "Add your projects"],
    ["internships", "Add an internship"],
    ["certifications", "Add certifications"],
    ["skills", "Add your skills"],
    ["resume", "Upload your resume"]
  ];
  const missing = checks.find(([key]) => !hasValue(profile[key]));
  return missing ? `${missing[1]} to improve your profile.` : "Great job! Your profile is complete.";
}

module.exports = { calculateCompletion, suggestion };
