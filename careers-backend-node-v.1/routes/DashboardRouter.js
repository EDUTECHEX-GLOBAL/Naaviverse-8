const express = require("express");
const router  = express.Router();

const { getDashboardStats, getAdminNotifications } = require("../controllers/DashboardController");

// GET /api/dashboard/stats
router.get("/stats", getDashboardStats);

// GET /api/dashboard/notifications
router.get("/notifications", getAdminNotifications);
router.get("/admin/notifications", getAdminNotifications);

module.exports = router;
