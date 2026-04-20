// controllers/userActivity.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/activity?email=xxx
// Returns: selectedPaths, subscriptions (paid plans), exploredPaths
// ─────────────────────────────────────────────────────────────────────────────

const mongoose         = require("mongoose");
const UserPath         = require("../models/userpaths.model");         // email + pathId + status
const UserPathSelection = require("../models/userpathselection.model"); // userEmail + pathId + steps
const Payment          = require("../models/payment.model");           // userEmail + planTier + status
const Path             = require("../models/path.model");              // _id + nameOfPath

const getUserActivity = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ status: false, message: "email is required" });
    }

    // ── 1. Selected Paths ─────────────────────────────────────────────────
    // From userPaths collection: all active paths this user selected
    const userPaths = await UserPath.find({ email, status: "active" }).lean();

    let selectedPaths = [];
    if (userPaths.length > 0) {
      const pathIds = userPaths.map((up) => up.pathId).filter(Boolean);
      const paths   = await Path.find({ _id: { $in: pathIds } })
                                .select("nameOfPath title name")
                                .lean();

      const pathMap = {};
      for (const p of paths) {
        pathMap[p._id.toString()] = p.nameOfPath || p.title || p.name || "Unnamed Path";
      }

      selectedPaths = pathIds.map((id) => pathMap[id?.toString()] || "Unknown Path");
    }

    // ── 2. Subscriptions (Paid Plans) ─────────────────────────────────────
    // From Payment collection: paid records for this user
    const payments = await Payment.find({
      userEmail: email,
      status:    "paid",
    })
      .select("productName planTier billingMethod amount createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const subscriptions = payments.map((p) => {
      const planLabel = p.planTier
        ? p.planTier.charAt(0).toUpperCase() + p.planTier.slice(1)
        : p.productName || "Plan";
      const billing = p.billingMethod ? ` (${p.billingMethod})` : "";
      return `${planLabel}${billing}`;
    });

    // ── 3. Explored / Discovered Paths ────────────────────────────────────
    // From UserPathSelection collection (separate exploration tracking model)
    let exploredPaths = [];
    try {
      const selections = await UserPathSelection.find({ userEmail: email })
                                                .select("pathId steps")
                                                .lean();

      if (selections.length > 0) {
        const exploredPathIds = selections.map((s) => s.pathId).filter(Boolean);
        const exploredPathDocs = await Path.find({ _id: { $in: exploredPathIds } })
                                           .select("nameOfPath title name")
                                           .lean();

        const exploredMap = {};
        for (const p of exploredPathDocs) {
          exploredMap[p._id.toString()] = p.nameOfPath || p.title || p.name || "Unnamed Path";
        }
        exploredPaths = exploredPathIds.map((id) => exploredMap[id?.toString()] || "Unknown Path");
      }
    } catch (_) {
      // UserPathSelection model may not exist in all envs — skip gracefully
      exploredPaths = [];
    }

    // ── 4. Last Seen ──────────────────────────────────────────────────────
    // Use the most recent userPath createdAt as a proxy for last activity
    const lastActivity = userPaths.sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    )[0];

    const lastSeen = lastActivity
      ? new Date(lastActivity.updatedAt || lastActivity.createdAt).toLocaleDateString("en-IN", {
          day:   "numeric",
          month: "short",
          year:  "numeric",
        })
      : "Recently";

    return res.status(200).json({
      status: true,
      data: {
        lastSeen,
        selectedPaths,
        subscriptions,
        exploredPaths,
      },
    });
  } catch (error) {
    console.error("getUserActivity error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = { getUserActivity };