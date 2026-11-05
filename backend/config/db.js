const dns = require("node:dns");

// Fix Node.js MongoDB SRV DNS resolution
if (process.env.NODE_ENV !== "production")
{
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

const mongoose = require("mongoose");
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
