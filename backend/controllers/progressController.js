const Progress = require("../models/Progress");
const Video = require("../models/Video");

// GET /api/progress/:videoId
exports.getProgress = async (req, res) => {
  try {
    const progress = await Progress.findOne({ user: req.userId, video: req.params.videoId });
    res.json({ progress: progress || null });
  } catch (err) {
    res.status(500).json({ message: "Could not load progress.", error: err.message });
  }
};

// PUT /api/progress/:videoId -> { lastPosition, duration }
exports.upsertProgress = async (req, res) => {
  try {
    const { lastPosition, duration } = req.body;
    if (typeof lastPosition !== "number" || lastPosition < 0) {
      return res.status(400).json({ message: "lastPosition must be a non-negative number." });
    }

    const video = await Video.findById(req.params.videoId);
    if (!video) return res.status(404).json({ message: "Video not found." });

    const effectiveDuration = duration && duration > 0 ? duration : video.duration || 0;
    const percentWatched = effectiveDuration > 0
      ? Math.min(100, Math.round((lastPosition / effectiveDuration) * 100))
      : 0;
    const completed = percentWatched >= 95;

    const progress = await Progress.findOneAndUpdate(
      { user: req.userId, video: req.params.videoId },
      {
        lastPosition,
        percentWatched,
        completed,
        lastWatchedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    res.json({ progress });
  } catch (err) {
    res.status(400).json({ message: "Could not save progress.", error: err.message });
  }
};
