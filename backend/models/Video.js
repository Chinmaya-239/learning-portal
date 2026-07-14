const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    url: { type: String, required: true }, // mp4 url or hosted stream url
    thumbnail: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // seconds
    subject: { type: String, default: "General" },
    instructor: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
