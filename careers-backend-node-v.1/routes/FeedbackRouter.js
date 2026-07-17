const express = require("express");
const router = express.Router();
const { createFeedback, getFeedbackForPath } = require("../controllers/FeedbackController");

// POST /api/feedback
router.post("/", createFeedback);

// GET /api/feedback/path/:pathId
router.get("/path/:pathId", getFeedbackForPath);

module.exports = router;
