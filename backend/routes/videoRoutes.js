const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getAllVideos,
  getVideoById,
  createVideo,
  getContinueWatching,
  getRecentlyWatched,
} = require("../controllers/videoController");

router.get("/", auth, getAllVideos);
router.get("/continue-watching", auth, getContinueWatching);
router.get("/recently-watched", auth, getRecentlyWatched);
router.get("/:id", auth, getVideoById);
router.post("/", auth, createVideo); // admin/seed use

module.exports = router;
