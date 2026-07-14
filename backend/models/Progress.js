const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true },
    lastPosition: { type: Number, default: 0 }, // seconds
    percentWatched: { type: Number, default: 0 }, // 0-100
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
