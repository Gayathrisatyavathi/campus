const dns = require("dns");

// Use Google DNS.
// This helps with MongoDB Atlas SRV resolution on systems
// where the default DNS server has problems.
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

const { notFound, errorHandler } = require("./middleware/error");
const { downloadStream } = require("./services/gridfs");
const { authRequired } = require("./middleware/auth");


/* =========================================================
   APP
========================================================= */

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const frontendOrigin =
    process.env.FRONTEND_URL ||
    "http://localhost:3000";


/* =========================================================
   TRUST PROXY
========================================================= */

app.set("trust proxy", 1);


/* =========================================================
   SECURITY
========================================================= */

app.use(
    helmet({
        crossOriginResourcePolicy: {
            policy: "cross-origin"
        },

        contentSecurityPolicy: false
    })
);


/* =========================================================
   CORS
========================================================= */

app.use(
    cors({
        origin: frontendOrigin,
        credentials: true
    })
);


/* =========================================================
   BODY PARSING
========================================================= */

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


/* =========================================================
   DATABASE MIDDLEWARE
========================================================= */

/*
    Every API request first makes sure that MongoDB
    is connected.

    This is important on Vercel because Vercel uses
    serverless functions and the process may be reused
    between requests.
*/

app.use("/api", async (req, res, next) =>
{
    try
    {
        await connectDB();

        next();
    }
    catch (error)
    {
        console.error(
            "MongoDB connection error:",
            error
        );

        return res.status(503).json({
            success: false,
            message: "Database unavailable."
        });
    }
});


/* =========================================================
   AUTH RATE LIMIT
========================================================= */

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 100,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many authentication requests. Please try again later."
    }
});


/* =========================================================
   AUTH ROUTES
========================================================= */

app.use(
    "/api/auth",
    authLimiter,
    authRoutes
);


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", async (req, res) =>
{
    try
    {
        await connectDB();

        return res.status(200).json({
            success: true,
            ok: true,
            service: "Campus Management Protocol",
            database: "connected",
            environment: process.env.NODE_ENV || "development"
        });
    }
    catch (error)
    {
        console.error(
            "Health check failed:",
            error
        );

        return res.status(503).json({
            success: false,
            ok: false,
            service: "Campus Management Protocol",
            database: "disconnected"
        });
    }
});


/* =========================================================
   STUDENT ROUTES
========================================================= */

app.use(
    "/api/student",
    studentRoutes
);


/* =========================================================
   DASHBOARD ROUTES
========================================================= */

app.use(
    "/api/dashboard",
    dashboardRoutes
);


/* =========================================================
   RESOURCE ROUTES
========================================================= */

/*
    This route file can contain:

    /api/placements
    /api/company-calls
    /api/jobs
    /api/training
    /api/courses
    /api/interviews
    /api/tests
    /api/achievements
*/

app.use(
    "/api",
    resourceRoutes
);


/* =========================================================
   ADMIN ROUTES
========================================================= */

app.use(
    "/api/admin",
    adminRoutes
);


/* =========================================================
   RESUME DOWNLOAD
========================================================= */

app.get(
    "/api/student/resume/:fileId",
    authRequired,
    async (req, res, next) =>
    {
        try
        {
            const { ObjectId } = require("mongodb");

            const fileId = req.params.fileId;


            /* ---------------------------------------------
               Validate ObjectId
            --------------------------------------------- */

            if (!ObjectId.isValid(fileId))
            {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file id."
                });
            }


            /* ---------------------------------------------
               Create GridFS stream
            --------------------------------------------- */

            const stream = downloadStream(fileId);


            /* ---------------------------------------------
               File information
            --------------------------------------------- */

            stream.on("file", (file) =>
            {
                const metadata = file.metadata || {};


                /* -----------------------------------------
                   Ownership check
                ----------------------------------------- */

                if (
                    metadata.userId &&
                    String(metadata.userId) !== String(req.userId)
                )
                {
                    stream.destroy();

                    return res.status(403).json({
                        success: false,
                        message: "Forbidden."
                    });
                }


                /* -----------------------------------------
                   Headers
                ----------------------------------------- */

                res.setHeader(
                    "Content-Type",
                    file.contentType ||
                    "application/octet-stream"
                );


                const filename = String(
                    file.filename || "resume"
                ).replace(/"/g, "");


                res.setHeader(
                    "Content-Disposition",
                    `inline; filename="${filename}"`
                );
            });


            /* ---------------------------------------------
               Stream error
            --------------------------------------------- */

            stream.on("error", (error) =>
            {
                console.error(
                    "Resume download error:",
                    error
                );

                if (!res.headersSent)
                {
                    return res.status(404).json({
                        success: false,
                        message: "File not found."
                    });
                }

                res.end();
            });


            /* ---------------------------------------------
               Send stream
            --------------------------------------------- */

            stream.pipe(res);
        }
        catch (error)
        {
            next(error);
        }
    }
);


/* =========================================================
   FRONTEND STATIC FILES
========================================================= */

const frontendPath = path.join(
    __dirname,
    "../frontend"
);


/*
    This makes files such as:

    frontend/index.html
    frontend/login.html
    frontend/register.html
    frontend/css/style.css
    frontend/js/main.js

    available to the browser.
*/

app.use(
    express.static(frontendPath)
);


/* =========================================================
   FRONTEND ROUTING
========================================================= */

/*
    API routes have already been registered above.

    Everything that is NOT an API request is treated
    as a frontend request.
*/

app.get("/{*splat}", (req, res, next) =>
{
    if (req.path.startsWith("/api/"))
    {
        return next();
    }


    /*
        If the requested file exists, express.static()
        above will already have served it.

        Otherwise return the main frontend page.
    */

    res.sendFile(
        path.join(
            frontendPath,
            "index.html"
        )
    );
});


/* =========================================================
   404 HANDLER
========================================================= */

app.use(notFound);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(errorHandler);


/* =========================================================
   LOCAL DEVELOPMENT SERVER
========================================================= */

async function bootstrap()
{
    try
    {
        /*
            Connect to MongoDB before starting
            the local development server.
        */

        await connectDB();


        /*
            Vercel does NOT use app.listen().
            Vercel handles the HTTP server itself.
        */

        if (!process.env.VERCEL)
        {
            const port =
                process.env.PORT || 3000;


            app.listen(
                port,
                () =>
                {
                    console.log(
                        "========================================"
                    );

                    console.log(
                        "Campus Management Protocol"
                    );

                    console.log(
                        `Running at: http://localhost:${port}`
                    );

                    console.log(
                        "MongoDB: Connected"
                    );

                    console.log(
                        "Environment:",
                        process.env.NODE_ENV ||
                        "development"
                    );

                    console.log(
                        "========================================"
                    );
                }
            );
        }
    }
    catch (error)
    {
        console.error(
            "Startup failed:",
            error
        );

        process.exit(1);
    }
}


/* =========================================================
   START LOCAL SERVER
========================================================= */

if (require.main === module)
{
    bootstrap();
}


/* =========================================================
   EXPORT FOR VERCEL
========================================================= */

module.exports = app;