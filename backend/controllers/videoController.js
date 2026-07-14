const Video = require("../models/Video");
const Progress = require("../models/Progress");

exports.getAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json({ videos });
  } catch (err) {
    res.status(500).json({ message: "Could not load videos.", error: err.message });
  }
};

exports.getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ message: "Video not found." });
    res.json({ video });
  } catch (err) {
    res.status(500).json({ message: "Could not load video.", error: err.message });
  }
};

exports.createVideo = async (req, res) => {
  try {
    const video = await Video.create(req.body);
    res.status(201).json({ video });
  } catch (err) {
    res.status(400).json({ message: "Could not create video.", error: err.message });
  }
};

// Videos the student has partially or fully watched, most recent first
exports.getContinueWatching = async (req, res) => {
  try {
    const progressList = await Progress.find({
      user: req.userId,
      completed: false,
      lastPosition: { $gt: 0 },
    })
      .sort({ lastWatchedAt: -1 })
      .limit(10)
      .populate("video");

    res.json({ items: progressList.filter((p) => p.video) });
  } catch (err) {
    res.status(500).json({ message: "Could not load continue watching.", error: err.message });
  }
};

exports.getRecentlyWatched = async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.userId })
      .sort({ lastWatchedAt: -1 })
      .limit(10)
      .populate("video");

    res.json({ items: progressList.filter((p) => p.video) });
  } catch (err) {
    res.status(500).json({ message: "Could not load recently watched.", error: err.message });
  }
};
