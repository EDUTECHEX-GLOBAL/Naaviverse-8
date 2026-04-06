const Subscription = require("../models/subscription.model");
const VaultTransaction = require("../models/VaultTransaction"); // your existing wallet model

const LAYER_COST = { micro: 2, nano: 4 };
const PRODUCT_ID = "naavi-platform"; // same productId used everywhere

/* ─────────────────────────────────────────────────────────────────
   HELPER — compute endDate from billingMethod
───────────────────────────────────────────────────────────────────*/
const computeEndDate = (billingMethod) => {
  if (billingMethod === "lifetime") return null;
  const now = new Date();
  if (billingMethod === "monthly") return new Date(now.setMonth(now.getMonth() + 1));
  if (billingMethod === "annual") return new Date(now.setFullYear(now.getFullYear() + 1));
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

/* ─────────────────────────────────────────────────────────────────
   HELPER — get wallet balance from VaultTransaction
───────────────────────────────────────────────────────────────────*/
const getWalletBalance = async (email) => {
  const now = new Date();
  const txns = await VaultTransaction.find({ email });

  return txns.reduce((acc, t) => {
    if (t.type === "credit") {
      if (t.expiresAt && t.expiresAt < now) return acc;  // expired — skip
      return acc + t.amount;
    }
    return acc - t.amount;
  }, 0);
};

/* =================================================================
   1. CREATE / ACTIVATE SUBSCRIPTION  (unchanged)
================================================================= */
const createSubscription = async (req, res) => {
  try {
    const { userEmail, profileId, productId, productName, billingMethod, tier } = req.body;

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
    const existing = await Subscription.findOne({ userEmail, productId });

    // UPGRADE micro → nano
    if (existing && isActive(existing)) {
      if (existing.tier === "micro" && resolvedTier === "nano") {
        existing.tier = "nano";
        existing.billingMethod = billingMethod;
        existing.startDate = new Date();
        existing.endDate = computeEndDate(billingMethod);
        if (profileId) existing.profileId = profileId;
        await existing.save();
        return res.status(200).json({ success: true, message: "Subscription upgraded to Nano successfully.", subscription: existing });
      }
      return res.status(409).json({ success: false, message: "User already has an active subscription for this product.", subscription: existing });
    }

    const endDate = computeEndDate(billingMethod);

    // REACTIVATE expired
    if (existing) {
      existing.tier = resolvedTier;
      existing.billingMethod = billingMethod;
      existing.status = "active";
      existing.startDate = new Date();
      existing.endDate = endDate;
      if (profileId) existing.profileId = profileId;
      await existing.save();
      return res.status(200).json({ success: true, message: "Subscription reactivated successfully.", subscription: existing });
    }

    // CREATE fresh
    const subscription = await Subscription.create({
      userEmail,
      profileId: profileId || null,
      productId,
      productName,
      tier: resolvedTier,
      billingMethod,
      status: "active",
      startDate: new Date(),
      endDate,
    });

    return res.status(201).json({ success: true, message: "Subscription created successfully.", subscription });
  } catch (err) {
    console.error("❌ createSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   2. CHECK SUBSCRIPTION STATUS  (unchanged)
================================================================= */
const checkStatus = async (req, res) => {
  try {
    const { email, productId } = req.query;
    if (!email || !productId) {
      return res.status(400).json({ success: false, message: "email and productId query params are required." });
    }

    const sub = await Subscription.findOne({ userEmail: email, productId });
    if (!sub) return res.json({ success: true, subscribed: false, tier: null });

    if (sub.billingMethod !== "lifetime" && sub.endDate < new Date()) {
      sub.status = "expired";
      await sub.save();
      return res.json({ success: true, subscribed: false, tier: null, subscription: sub });
    }

    const active = sub.status === "active";
    return res.json({
      success: true,
      subscribed: active,
      tier: active ? (sub.tier || "micro") : null,
      subscription: sub,
    });
  } catch (err) {
    console.error("❌ checkStatus error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   3. GET ALL SUBSCRIPTIONS FOR A USER  (unchanged)
================================================================= */
const getUserSubscriptions = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "email query param is required." });

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
   4. CANCEL SUBSCRIPTION  (unchanged)
================================================================= */
const cancelSubscription = async (req, res) => {
  try {
    const { email, productId } = req.body;
    if (!email || !productId) return res.status(400).json({ success: false, message: "email and productId are required." });

    const sub = await Subscription.findOne({ userEmail: email, productId, status: "active" });
    if (!sub) return res.status(404).json({ success: false, message: "No active subscription found." });

    sub.status = "expired";
    sub.endDate = new Date();
    await sub.save();
    return res.json({ success: true, message: "Subscription cancelled successfully.", subscription: sub });
  } catch (err) {
    console.error("❌ cancelSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   5. RENEW SUBSCRIPTION  (unchanged)
================================================================= */
const renewSubscription = async (req, res) => {
  try {
    const { email, productId, billingMethod, tier } = req.body;
    if (!email || !productId) return res.status(400).json({ success: false, message: "email and productId are required." });

    const sub = await Subscription.findOne({ userEmail: email, productId });
    if (!sub) return res.status(404).json({ success: false, message: "No subscription record found." });

    if (billingMethod) {
      const validMethods = ["monthly", "annual", "lifetime"];
      if (!validMethods.includes(billingMethod)) return res.status(400).json({ success: false, message: `billingMethod must be one of: ${validMethods.join(", ")}` });
      sub.billingMethod = billingMethod;
    }

    const validTiers = ["micro", "nano"];
    if (tier && validTiers.includes(tier)) sub.tier = tier;

    sub.status = "active";
    sub.startDate = new Date();
    sub.endDate = computeEndDate(sub.billingMethod);
    await sub.save();
    return res.json({ success: true, message: "Subscription renewed successfully.", subscription: sub });
  } catch (err) {
    console.error("❌ renewSubscription error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   6. ADMIN — GET ALL SUBSCRIPTIONS  (unchanged)
================================================================= */
const getAllSubscriptions = async (req, res) => {
  try {
    const { status, billingMethod, tier, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (billingMethod) filter.billingMethod = billingMethod;
    if (tier) filter.tier = tier;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [subscriptions, total] = await Promise.all([
      Subscription.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Subscription.countDocuments(filter),
    ]);

    return res.json({ success: true, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)), subscriptions });
  } catch (err) {
    console.error("❌ getAllSubscriptions error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* =================================================================
   7. NEW — CHECK STEP UNLOCKS
   GET /api/subscriptions/step-unlock/check?email=...&step_id=...

   Looks inside the user's existing subscription document's
   unlockedSteps array — no separate collection needed.

   Returns: { status: true, unlocked: { micro: bool, nano: bool } }
================================================================= */
const checkStepUnlock = async (req, res) => {
  try {
    const { email, step_id } = req.query;
    if (!email || !step_id) {
      return res.status(400).json({ status: false, message: "email and step_id are required" });
    }

    // Find the user's subscription for this platform
    const sub = await Subscription.findOne({ userEmail: email, productId: PRODUCT_ID });

    // No subscription at all → no credit unlocks either
    if (!sub || !Array.isArray(sub.unlockedSteps)) {
      return res.json({ status: true, unlocked: { micro: false, nano: false } });
    }

    const stepUnlocks = sub.unlockedSteps.filter((u) => u.step_id === step_id);
    const layers = stepUnlocks.map((u) => u.layer);

    return res.json({
      status: true,
      unlocked: {
        micro: layers.includes("micro"),
        nano: layers.includes("nano"),
      },
    });
  } catch (err) {
    console.error("❌ checkStepUnlock error:", err);
    return res.status(500).json({ status: false, error: err.message });
  }
};

/* =================================================================
   8. NEW — UNLOCK A STEP LAYER WITH CREDITS
   POST /api/subscriptions/step-unlock/unlock
   Body: { email, step_id, layer }   layer = "micro" | "nano"

   Flow:
     1. Validate inputs
     2. Find or create subscription record for this user
     3. Check not already unlocked
     4. Check sufficient wallet balance
     5. Deduct from VaultTransaction (your existing wallet)
     6. Push to sub.unlockedSteps and save
     7. Return remainingBalance
================================================================= */
const unlockStep = async (req, res) => {
  try {
    const { email, step_id, layer } = req.body;

    // ── Validate ──────────────────────────────────────────────────
    if (!email || !step_id || !layer) {
      return res.status(400).json({ status: false, message: "email, step_id and layer are required" });
    }
    if (!["micro", "nano"].includes(layer)) {
      return res.status(400).json({ status: false, message: "layer must be 'micro' or 'nano'" });
    }

    const cost = LAYER_COST[layer];

    // ── Find subscription record ──────────────────────────────────
    // We need a subscription record to store the unlock on.
    // Users who haven't subscribed yet can still credit-unlock.
    // In that case we find any existing sub record (even expired),
    // or create a minimal placeholder record.
    let sub = await Subscription.findOne({ userEmail: email, productId: PRODUCT_ID });

    if (!sub) {
      sub = await Subscription.create({
        userEmail: email,
        productId: PRODUCT_ID,
        productName: "Naavi Platform",
        billingMethod: "credit_only",  // ← was "lifetime"
        status: "expired",
        tier: "micro",
        unlockedSteps: [],
      });
    }

    // ── Check already unlocked ────────────────────────────────────
    const alreadyUnlocked = sub.unlockedSteps?.some(
      (u) => u.step_id === step_id && u.layer === layer
    );
    if (alreadyUnlocked) {
      return res.status(409).json({ status: false, message: `${layer} is already unlocked for this step` });
    }

    // ── Check wallet balance ──────────────────────────────────────
    const balance = await getWalletBalance(email);
    if (balance < cost) {
      return res.status(400).json({
        status: false,
        message: `Insufficient credits. You need ${cost} but have ${balance}.`,
        balance,
      });
    }

    // ── Deduct from wallet (VaultTransaction) ─────────────────────
    await VaultTransaction.create({
      email,
      type: "debit",
      amount: cost,
      metadata: {
        type: "step_unlock",
        description: `Unlocked ${layer.charAt(0).toUpperCase() + layer.slice(1)} View`,
        source: "step_unlock",
        step_id,
        layer,
      },
    });

    // ── Push unlock into subscription's unlockedSteps array ───────
    sub.unlockedSteps.push({
      step_id,
      layer,
      credits_spent: cost,
      unlocked_at: new Date(),
    });
    await sub.save();

    const remaining = balance - cost;

    return res.json({
      status: true,
      message: `${layer} view unlocked successfully!`,
      credits_spent: cost,
      remainingBalance: remaining,
    });
  } catch (err) {
    console.error("❌ unlockStep error:", err);
    return res.status(500).json({ status: false, error: err.message });
  }
};

module.exports = {
  createSubscription,
  checkStatus,
  getUserSubscriptions,
  cancelSubscription,
  renewSubscription,
  getAllSubscriptions,
  // ── NEW ──
  checkStepUnlock,
  unlockStep,
};