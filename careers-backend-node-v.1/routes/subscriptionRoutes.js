const express = require("express");
const router = express.Router();

const {
  createSubscription,
  checkStatus,
  getUserSubscriptions,
  cancelSubscription,
  renewSubscription,
  getAllSubscriptions,
} = require("../controllers/subscription.controller");

// ── User-facing routes ────────────────────────────────────────────
router.post("/create", createSubscription);          // Activate a new subscription
router.get("/status", checkStatus);                  // Check if user is subscribed
router.get("/user", getUserSubscriptions);           // Get all subs for a user
router.put("/cancel", cancelSubscription);           // Cancel a subscription
router.put("/renew", renewSubscription);             // Renew / change billing cycle

// ── Admin route ───────────────────────────────────────────────────
router.get("/all", getAllSubscriptions);             // List all subscriptions (paginated)

module.exports = router;