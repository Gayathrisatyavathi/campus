const dns = require("dns");

// Use Google DNS locally/Vercel where supported.
// This helps with MongoDB SRV DNS resolution.
dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);

require("dotenv").config();

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
const adminRoutes = require("./routes/admin");

const {
    notFound,
    errorHandler
} = require("./middleware/error");

const {
    downloadStream
} = require("./services/gridfs");

const {
    authRequired
} = require("./middleware/auth");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const frontendOrigin =
    process.env.FRONTEND_URL ||
    (isProduction
        ? "https://your-vercel-domain.vercel.app"
        : "http://localhost:3000");


// ======================================================
// BASIC APP SETTINGS
// ======================================================

app.set("trust proxy", 1);


// ======================================================
// SECURITY
// ======================================================

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        },

        contentSecurityPolicy: false
    })
);


// ======================================================
// CORS
// ======================================================

const allowedOrigins = frontendOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow server-to-server / Postman requests
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            // Allow Vercel preview deployments
            if (
                isProduction &&
                origin.endsWith(".vercel.app")
            ) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true
    })
);


// ======================================================
// BODY PARSING
// ======================================================

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

app.use(cookieParser());


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", async (req, res) => {

    try {

        await connectDB();

        return res.status(200).json({
            ok: true,
            service: "Campus Management Protocol",
            database: "connected",
            environment: process.env.NODE_ENV || "development"
        });

    } catch (error) {

        console.error(
            "Health check database error:",
            error
        );

        return res.status(503).json({
            ok: false,
            service: "Campus Management Protocol",
            database: "disconnected",
            message: "Database unavailable"
        });
    }
});


// ======================================================
// AUTH RATE LIMIT
// ======================================================

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 100,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        message:
            "Too many authentication requests. Please try again later."
    }
});

app.use(
    "/api/auth",
    authLimiter
);


// ======================================================
// API ROUTES
// ======================================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/student",
    studentRoutes
);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

app.use(
    "/api",
    resourceRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// ======================================================
// RESUME / GRIDFS DOWNLOAD
// ======================================================

app.get(
    "/api/student/resume/:fileId",
    authRequired,
    async (req, res, next) => {

        try {

            const {
                ObjectId
            } = require("mongodb");

            const fileId =
                req.params.fileId;

            if (!ObjectId.isValid(fileId)) {

                return res.status(400).json({
                    message: "Invalid file id."
                });
            }

            const stream =
                downloadStream(fileId);

            let headersSent = false;

            stream.on("file", (file) => {

                const ownerId =
                    file.metadata?.userId;

                const currentUserId =
                    String(req.userId);

                if (
                    ownerId &&
                    String(ownerId) !== currentUserId
                ) {

                    if (!res.headersSent) {

                        return res.status(403).json({
                            message: "Forbidden."
                        });
                    }

                    return;
                }

                if (!res.headersSent) {

                    res.setHeader(
                        "Content-Type",
                        file.contentType ||
                        "application/octet-stream"
                    );

                    res.setHeader(
                        "Content-Disposition",
                        `inline; filename="${String(
                            file.filename || "resume"
                        ).replace(/"/g, "")}"`
                    );

                    headersSent = true;
                }
            });

            stream.on("error", (error) => {

                console.error(
                    "Resume download error:",
                    error
                );

                if (!res.headersSent) {

                    return res.status(404).json({
                        message: "File not found."
                    });
                }
            });

            stream.pipe(res);

        } catch (error) {

            next(error);
        }
    }
);


// ======================================================
// STATIC FRONTEND
// ======================================================

const frontendPath =
    path.join(__dirname, "../frontend");

app.use(
    express.static(frontendPath, {
        index: "index.html"
    })
);


// ======================================================
// LOCAL DEVELOPMENT FALLBACK
// ======================================================

if (!process.env.VERCEL) {

    app.get("*", (req, res, next) => {

        if (
            req.path.startsWith("/api/")
        ) {

            return next();
        }

        return res.sendFile(
            path.join(
                frontendPath,
                "index.html"
            )
        );
    });
}


// ======================================================
// ERROR HANDLERS
// ======================================================

app.use(notFound);

app.use(errorHandler);


// ======================================================
// LOCAL DEVELOPMENT SERVER
// ======================================================

async function bootstrap() {

    try {

        await connectDB();

        const port =
            process.env.PORT || 3000;

        app.listen(
            port,
            () => {

                console.log(
                    `Campus Management Protocol running at http://localhost:${port}`
                );
            }
        );

    } catch (error) {

        console.error(
            "Startup failed:",
            error
        );

        process.exit(1);
    }
}


// ======================================================
// START ONLY LOCALLY
// ======================================================

if (
    require.main === module &&
    !process.env.VERCEL
) {

    bootstrap();
}


// ======================================================
// EXPORT FOR VERCEL
// ======================================================

module.exports = app;