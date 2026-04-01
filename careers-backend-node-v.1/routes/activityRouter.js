const express = require("express");
const router  = express.Router();

const { getActivityUsers, logActivity } = require("../controllers/Activity.controller");

// GET  /api/activity/users  — fetch all users with their event timeline
router.get("/users", getActivityUsers);

// POST /api/activity/log   — log a new activity event
router.post("/log", logActivity);

module.exports = router;