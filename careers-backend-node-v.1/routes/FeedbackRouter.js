const express = require("express");
const router = express.Router();
const { createFeedback } = require("../controllers/FeedbackController");

// POST /api/feedback
router.post("/", createFeedback);

module.exports = router;
