const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    video: { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true, index: true },
    name: { type: String, default: "" }, // optional bookmark name/note
    timestamp: { type: Number, required: true }, // seconds into the video
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, video: 1, timestamp: 1 });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
