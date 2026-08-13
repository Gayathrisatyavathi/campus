const mongoose = require("mongoose");
const { GridFSBucket, ObjectId } = require("mongodb");

function bucket() {
  if (!mongoose.connection.db) throw new Error("MongoDB connection is not ready");
  return new GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
}

function uploadBuffer(buffer, filename, contentType, metadata = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = bucket().openUploadStream(filename, {
      contentType,
      metadata
    });
    uploadStream.on("error", reject);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.end(buffer);
  });
}

function deleteFile(fileId) {
  return bucket().delete(new ObjectId(fileId));
}

function downloadStream(fileId) {
  return bucket().openDownloadStream(new ObjectId(fileId));
}

module.exports = { uploadBuffer, deleteFile, downloadStream };
