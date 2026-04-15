// routes/partnerDashboardRouter.js
// ─────────────────────────────────────────────────────────────────────────────
// Mount in app.js / server.js as:
//   const partnerDashboardRouter = require("./routes/partnerDashboardRouter");
//   app.use("/api/partner-dashboard", partnerDashboardRouter);
// ─────────────────────────────────────────────────────────────────────────────

const router = require("express").Router();
const {
  getDashboardStats,
  getPathEnrolledUsers,
} = require("../controllers/Partnerdashboard.controller");

// GET /api/partner-dashboard/stats?email=partner@x.com
// Returns: totalSelected, thisWeek, percentChange, paths[]
router.get("/stats", getDashboardStats);

// GET /api/partner-dashboard/path-users?pathId=xxx&partnerEmail=partner@x.com
// Returns: enrolled user list with completion% for a specific path
router.get("/path-users", getPathEnrolledUsers);

module.exports = router;