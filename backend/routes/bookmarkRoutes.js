const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getBookmarksForVideo,
  createBookmark,
  updateBookmark,
  deleteBookmark,
} = require("../controllers/bookmarkController");

router.get("/:videoId", auth, getBookmarksForVideo);
router.post("/", auth, createBookmark);
router.put("/:id", auth, updateBookmark);
router.delete("/:id", auth, deleteBookmark);

module.exports = router;
