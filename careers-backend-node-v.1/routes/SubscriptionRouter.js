const express = require("express");
const router  = express.Router();

const {
  createSubscription,
  checkStatus,
  getUserSubscriptions,
  cancelSubscription,
  renewSubscription,
  getAllSubscriptions,
  // ── NEW ──
  checkStepUnlock,
  unlockStep,
} = require("../controllers/SubscriptionController");

// ── Existing routes (unchanged) ───────────────────────────────────
router.post("/create",  createSubscription);
router.get("/status",   checkStatus);
router.get("/user",     getUserSubscriptions);
router.put("/cancel",   cancelSubscription);
router.put("/renew",    renewSubscription);
router.get("/all",      getAllSubscriptions);

// ── NEW: credit-based step unlock routes ──────────────────────────
// GET  /api/subscriptions/step-unlock/check?email=...&step_id=...
router.get("/step-unlock/check",   checkStepUnlock);

// POST /api/subscriptions/step-unlock/unlock
// Body: { email, step_id, layer }
router.post("/step-unlock/unlock", unlockStep);

module.exports = router;
