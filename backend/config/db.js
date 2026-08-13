const mongoose = require("mongoose");


/* =========================================================
   MONGOOSE CONNECTION CACHE
========================================================= */

let cached = global.mongooseConnection;

if (!cached)
{
    cached = global.mongooseConnection = {
        conn: null,
        promise: null
    };
}


/* =========================================================
   CONNECT TO MONGODB
========================================================= */

async function connectDB()
{
    /* -----------------------------------------------------
       If already connected, reuse the connection
    ----------------------------------------------------- */

    if (cached.conn)
    {
        return cached.conn;
    }


    /* -----------------------------------------------------
       Check MongoDB URI
    ----------------------------------------------------- */

    if (!process.env.MONGODB_URI)
    {
        throw new Error(
            "MONGODB_URI is not defined in environment variables."
        );
    }


    /* -----------------------------------------------------
       Create connection promise only once
    ----------------------------------------------------- */

    if (!cached.promise)
    {
        cached.promise = mongoose.connect(
            process.env.MONGODB_URI,
            {
                serverSelectionTimeoutMS: 10000
            }
        );
    }


    /* -----------------------------------------------------
       Wait for MongoDB connection
    ----------------------------------------------------- */

    try
    {
        cached.conn = await cached.promise;

        console.log(
            "MongoDB connected successfully."
        );
    }
    catch (error)
    {
        cached.promise = null;

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        throw error;
    }


    return cached.conn;
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = connectDB;