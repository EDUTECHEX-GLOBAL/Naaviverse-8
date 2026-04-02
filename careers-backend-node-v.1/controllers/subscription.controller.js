const Subscription = require("../models/subscription.model");

/* ─────────────────────────────────────────────────────────────────
   HELPER — compute endDate from billingMethod
───────────────────────────────────────────────────────────────────*/
const computeEndDate = (billingMethod) => {
  if (billingMethod === "lifetime") return null;
  const now = new Date();
  if (billingMethod === "monthly") return new Date(now.setMonth(now.getMonth() + 1));
  if (billingMethod === "annual")  return new Date(now.setFullYear(now.getFullYear() + 1));
  return null;
};

/* ─────────────────────────────────────────────────────────────────
   HELPER — check if a subscription record is currently active
───────────────────────────────────────────────────────────────────*/
const isActive = (sub) => {
  if (!sub) return false;
  if (sub.status === "expired") return false;
  if (sub.billingMethod === "lifetime") return true;
  return sub.endDate && sub.endDate > new Date();
};

/* =================================================================
   1. CREATE / ACTIVATE SUBSCRIPTION
   POST /api/subscriptions/create
   Body: { userEmail, profileId?, productId, productName, billingMethod, tier }

   tier: "micro" | "nano"
   — If upgrading from micro → nano on same productId, we UPDATE the
     existing record's tier rather than reject with 409.
================================================================= */
const createSubscription = async (req, res) => {
  try {
    const { userEmail, profileId, productId, productName, billingMethod, tier } = req.body;

    // ── Validate required fields ──────────────────────────────────────────
    if (!userEmail || !productId || !productName || !billingMethod) {
      return res.status(400).json({
        success: false,
        message: "userEmail, productId, productName, and billingMethod are required.",
      });
    }

    const validMethods = ["monthly", "annual", "lifetime"];
    if (!validMethods.includes(billingMethod)) {
      return res.status(400).json({
        success: false,
        message: `billingMethod must be one of: ${validMethods.join(", ")}`,
      });
    }

    const validTiers = ["micro", "nano"];
    const resolvedTier = validTiers.includes(tier) ? tier : "micro";

    // ── Check for existing subscription ──────────────────────────────────
    const existing = await Subscription.findOne({ userEmail, productId });

    // ── UPGRADE CASE: active micro → nano ─────────────────────────────────
    // Allow upgrading tier without rejecting as duplicate
    if (existing && isActive(existing)) {
      if (existing.tier === "micro" && resolvedTier === "nano") {
        existing.tier          = "nano";
        existing.billingMethod = billingMethod;
        existing.startDate     = new Date();
        existing.endDate       = computeEndDate(billingMethod);
        if (profileId) existing.profileId = profileId;
        await existing.save();

        return res.status(200).json({
          success: true,
          message: "Subscription upgraded to Nano successfully.",
          subscription: existing,
        });
      }

      // Same tier already active — return 409 as before
      return res.status(409).json({
        success: false,
        message: "User already has an active subscription for this product.",
        subscription: existing,
      });
    }

    const endDate = computeEndDate(billingMethod);

    // ── REACTIVATE expired record ─────────────────────────────────────────
    if (existing) {
      existing.tier          = resolvedTier;
      existing.billingMethod = billingMethod;
      existing.status        = "active";
      existing.startDate     = new Date();
      existing.endDate       = endDate;
      if (profileId) existing.profileId = profileId;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated successfully.",
        subscription: existing,
      });
    }

    // ── CREATE fresh ─────────────────────────────────────────────────────
    const subscription = await Subscription.create({
      userEmail,
      profileId:     profileId || null,
      productId,
      productName,
      tier:          resolvedTier,
      billingMethod,
      status:        "active",
      startDate:     new Date(),
      endDate,
    });

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully.",
      subscription,
    });
  } catch (err) {
    console.error("❌ createSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   2. CHECK SUBSCRIPTION STATUS
   GET /api/subscriptions/status?email=...&productId=...

   NOW RETURNS: { subscribed, tier, subscription }
   tier will be "micro" | "nano" | null
================================================================= */
const checkStatus = async (req, res) => {
  try {
    const { email, productId } = req.query;

    if (!email || !productId) {
      return res.status(400).json({
        success: false,
        message: "email and productId query params are required.",
      });
    }

    const sub = await Subscription.findOne({ userEmail: email, productId });

    if (!sub) {
      return res.json({ success: true, subscribed: false, tier: null });
    }

    // ── Auto-expire if past endDate ───────────────────────────────────────
    if (sub.billingMethod !== "lifetime" && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.json({ success: true, subscribed: false, tier: null, subscription: sub });
    }

    const active = sub.status === "active";

    return res.json({
      success:      true,
      subscribed:   active,
      tier:         active ? (sub.tier || "micro") : null,  // ← NEW: expose tier
      subscription: sub,
    });
  } catch (err) {
    console.error("❌ checkStatus error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   3. GET ALL SUBSCRIPTIONS FOR A USER
   GET /api/subscriptions/user?email=...
================================================================= */
const getUserSubscriptions = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "email query param is required." });
    }

    const subscriptions = await Subscription.find({ userEmail: email }).sort({ createdAt: -1 });

    const now = new Date();
    const updates = subscriptions
      .filter((s) => s.billingMethod !== "lifetime" && s.endDate < now && s.status === "active")
      .map((s) => { s.status = "expired"; return s.save(); });

    if (updates.length) await Promise.all(updates);

    return res.json({ success: true, total: subscriptions.length, subscriptions });
  } catch (err) {
    console.error("❌ getUserSubscriptions error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   4. CANCEL SUBSCRIPTION
   PUT /api/subscriptions/cancel
   Body: { email, productId }
================================================================= */
const cancelSubscription = async (req, res) => {
  try {
    const { email, productId } = req.body;
    if (!email || !productId) {
      return res.status(400).json({ success: false, message: "email and productId are required." });
    }

    const sub = await Subscription.findOne({ userEmail: email, productId, status: "active" });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found for this user and product.",
      });
    }

    sub.status  = "expired";
    sub.endDate = new Date();
    await sub.save();

    return res.json({ success: true, message: "Subscription cancelled successfully.", subscription: sub });
  } catch (err) {
    console.error("❌ cancelSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   5. RENEW SUBSCRIPTION
   PUT /api/subscriptions/renew
   Body: { email, productId, billingMethod?, tier? }
================================================================= */
const renewSubscription = async (req, res) => {
  try {
    const { email, productId, billingMethod, tier } = req.body;
    if (!email || !productId) {
      return res.status(400).json({ success: false, message: "email and productId are required." });
    }

    const sub = await Subscription.findOne({ userEmail: email, productId });
    if (!sub) {
      return res.status(404).json({
        success: false,
        message: "No subscription record found. Please create a new subscription.",
      });
    }

    if (billingMethod) {
      const validMethods = ["monthly", "annual", "lifetime"];
      if (!validMethods.includes(billingMethod)) {
        return res.status(400).json({
          success: false,
          message: `billingMethod must be one of: ${validMethods.join(", ")}`,
        });
      }
      sub.billingMethod = billingMethod;
    }

    // Allow tier change on renewal too
    const validTiers = ["micro", "nano"];
    if (tier && validTiers.includes(tier)) sub.tier = tier;

    sub.status    = "active";
    sub.startDate = new Date();
    sub.endDate   = computeEndDate(sub.billingMethod);
    await sub.save();

    return res.json({ success: true, message: "Subscription renewed successfully.", subscription: sub });
  } catch (err) {
    console.error("❌ renewSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   6. ADMIN — GET ALL SUBSCRIPTIONS
   GET /api/subscriptions/all?status=active&billingMethod=monthly&page=1&limit=20
================================================================= */
const getAllSubscriptions = async (req, res) => {
  try {
    const { status, billingMethod, tier, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status)        filter.status        = status;
    if (billingMethod) filter.billingMethod = billingMethod;
    if (tier)          filter.tier          = tier; // ← NEW: filter by tier

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscription.countDocuments(filter),
    ]);

    return res.json({
      success:     true,
      total,
      page:        parseInt(page),
      totalPages:  Math.ceil(total / parseInt(limit)),
      subscriptions,
    });
  } catch (err) {
    console.error("❌ getAllSubscriptions error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  createSubscription,
  checkStatus,
  getUserSubscriptions,
  cancelSubscription,
  renewSubscription,
  getAllSubscriptions,
};