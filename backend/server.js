const dns = require("dns");

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const resourceRoutes = require("./routes/resources");
const dashboardRoutes = require("./routes/dashboard");
const { notFound, errorHandler } = require("./middleware/error");
const { downloadStream } = require("./services/gridfs");
const adminRoutes = require("./routes/admin");

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const frontendOrigin = process.env.FRONTEND_URL || true;


app.set("trust proxy", 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: "draft-8" }));
app.use("/api/auth", authRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, service: "Campus Management Protocol", database: "connected" });
  } catch (error) {
    res.status(503).json({ ok: false, message: "Database unavailable" });
  }
});

app.use("/api/student", studentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", resourceRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/student/resume/:fileId", require("./middleware/auth").authRequired, async (req, res, next) => {
  try {
    const { ObjectId } = require("mongodb");
    if (!ObjectId.isValid(req.params.fileId)) return res.status(400).json({ message: "Invalid file id." });
    const stream = downloadStream(req.params.fileId);
    stream.on("file", (file) => {
      if (file.metadata?.userId && file.metadata.userId !== req.userId) {
        stream.destroy();
        return res.status(403).json({ message: "Forbidden." });
      }
      res.setHeader("Content-Type", file.contentType || "application/octet-stream");
      res.setHeader("Content-Disposition", `inline; filename="${String(file.filename).replace(/"/g, "")}"`);
    });
    stream.on("error", () => res.status(404).json({ message: "File not found." }));
    stream.pipe(res);
  } catch (error) { next(error); }
});

if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "../frontend")));
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
  });
} else {
  app.use(express.static(path.join(__dirname, "../frontend")));
  app.get("/{*splat}", (req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  await connectDB();
  if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Campus Management Protocol running at http://localhost:${port}`));
  }
}

if (require.main === module) {
  bootstrap().catch(error => {
    console.error("Startup failed:", error);
    process.exit(1);
  });
}

module.exports = app;
