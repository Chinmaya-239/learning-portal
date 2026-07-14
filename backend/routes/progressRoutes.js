const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getProgress, upsertProgress } = require("../controllers/progressController");

router.get("/:videoId", auth, getProgress);
router.put("/:videoId", auth, upsertProgress);

module.exports = router;
