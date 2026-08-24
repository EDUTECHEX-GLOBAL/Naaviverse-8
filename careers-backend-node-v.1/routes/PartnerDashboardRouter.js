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
  getExclusiveDashboardStats,
  getPartnerLiveActivity,
} = require("../controllers/PartnerDashboardController");

// GET /api/partner-dashboard/stats?email=partner@x.com
// Returns: totalSelected, thisWeek, percentChange, paths[], liveActivity[]
router.get("/stats", getDashboardStats);

// GET /api/partner-dashboard/path-users?pathId=xxx&partnerEmail=partner@x.com
// Returns: enrolled user list with completion% for a specific path
router.get("/path-users", getPathEnrolledUsers);

// GET /api/partner-dashboard/exclusive-stats?partnerId=NVP-XXX
router.get("/exclusive-stats", getExclusiveDashboardStats);

// GET /api/partner-dashboard/live-activity?email=partner@x.com&partnerId=NVP-XXX
// Returns: real-time live activity stream for partner
router.get("/live-activity", getPartnerLiveActivity);

module.exports = router;
