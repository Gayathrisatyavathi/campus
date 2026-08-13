const multer = require("multer");

const allowed = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]);

const maxSize = Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxSize, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!allowed.has(file.mimetype)) return cb(new Error("Only PDF, DOC and DOCX files are allowed."));
    cb(null, true);
  }
});

module.exports = upload;
