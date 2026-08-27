// routes/activityRouter.js
// Mounted at /api/activity in app.js  (already done — no app.js change needed)
//
// Endpoints:
//   GET  /api/activity/users           ← Dashboard user activity card
//   GET  /api/activity/partners        ← Dashboard partner activity card
//   POST /api/activity/log             ← frontend activityLogger.js (user events)
//   POST /api/activity/partners/log    ← frontend partner event logger
//
// Replaces:
//   - routes/activityRouter.js         (user-only)
//   - routes/partneractivityrouter.js  ← DELETE that file

const express = require("express");
const router  = express.Router();

const {
  getActivityUsers,
  getActivityPartners,
  logActivity,
  logPartnerActivity,
} = require("../controllers/ActivityController");

// ── User activity ─────────────────────────────────────────────────────────
router.get("/users",         getActivityUsers);
router.post("/log",          logActivity);

// ── Partner activity ──────────────────────────────────────────────────────
router.get("/partners",      getActivityPartners);
router.post("/partners/log", logPartnerActivity);

module.exports = router;