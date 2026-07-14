const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    youtubeId: { type: String, required: true }, // YouTube video ID, e.g. "vDqOoI-4Z6M"
    thumbnail: { type: String, default: "" },    subject: { type: String, default: "General" },
    instructor: { type: String, default: "Unknown" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
