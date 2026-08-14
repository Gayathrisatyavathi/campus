const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    trainingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Training",
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["Registered", "Cancelled", "Completed"],
        default: "Registered"
    }
}, { timestamps: true });

schema.index({ userId: 1, trainingId: 1 }, { unique: true });

module.exports = mongoose.model("TrainingRegistration", schema);
