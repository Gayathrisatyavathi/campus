const mongoose = require("mongoose");

/*
 * MongoDB connection cache.
 * Vercel may reuse the same serverless instance, so keep one connection
 * promise globally instead of opening a new connection for every request.
 */
const globalCache = global.__campusMongo || {
    conn: null,
    promise: null
};

global.__campusMongo = globalCache;

async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("MONGODB_URI is not configured.");
    }

    if (!/^mongodb(?:\+srv)?:\/\/[^@]+@/i.test(uri)) {
        throw new Error(
            "Invalid MONGODB_URI. Expected mongodb+srv://USERNAME:PASSWORD@HOST/..."
        );
    }

    // readyState: 1 = connected, 2 = connecting
    if (mongoose.connection.readyState === 1 && globalCache.conn) {
        return globalCache.conn;
    }

    if (globalCache.promise) {
        return globalCache.promise;
    }

    globalCache.promise = mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 0,
        retryWrites: true
    })
        .then((connection) => {
            globalCache.conn = connection;
            console.log("MongoDB connected successfully.");
            return connection;
        })
        .catch((error) => {
            globalCache.conn = null;
            globalCache.promise = null;
            console.error("MongoDB connection failed:", error.message);
            throw error;
        });

    return globalCache.promise;
}

module.exports = connectDB;
