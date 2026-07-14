const Bookmark = require("../models/Bookmark");
const Video = require("../models/Video");

// GET /api/bookmarks/:videoId -> all bookmarks for this user + video, sorted by timestamp
exports.getBookmarksForVideo = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({
      user: req.userId,
      video: req.params.videoId,
    }).sort({ timestamp: 1 });
    res.json({ bookmarks });
  } catch (err) {
    res.status(500).json({ message: "Could not load bookmarks.", error: err.message });
  }
};

// POST /api/bookmarks -> { videoId, name, timestamp }
exports.createBookmark = async (req, res) => {
  try {
    const { videoId, name, timestamp } = req.body;

    if (videoId === undefined || timestamp === undefined) {
      return res.status(400).json({ message: "videoId and timestamp are required." });
    }
    if (typeof timestamp !== "number" || timestamp < 0) {
      return res.status(400).json({ message: "timestamp must be a non-negative number of seconds." });
    }

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found." });

    const bookmark = await Bookmark.create({
      user: req.userId,
      video: videoId,
      name: (name || "").trim(),
      timestamp,
    });

    res.status(201).json({ bookmark });
  } catch (err) {
    res.status(400).json({ message: "Could not create bookmark.", error: err.message });
  }
};

// PUT /api/bookmarks/:id -> { name, timestamp }
exports.updateBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({ _id: req.params.id, user: req.userId });
    if (!bookmark) return res.status(404).json({ message: "Bookmark not found." });

    const { name, timestamp } = req.body;
    if (name !== undefined) bookmark.name = name.trim();
    if (timestamp !== undefined) {
      if (typeof timestamp !== "number" || timestamp < 0) {
        return res.status(400).json({ message: "timestamp must be a non-negative number of seconds." });
      }
      bookmark.timestamp = timestamp;
    }

    await bookmark.save();
    res.json({ bookmark });
  } catch (err) {
    res.status(400).json({ message: "Could not update bookmark.", error: err.message });
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!bookmark) return res.status(404).json({ message: "Bookmark not found." });
    res.json({ message: "Bookmark deleted.", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Could not delete bookmark.", error: err.message });
  }
};
