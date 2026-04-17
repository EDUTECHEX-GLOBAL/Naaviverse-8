/**
 * ═══════════════════════════════════════════════════════════════
 *  NAAVI — paymentController.js
 *  NOTE: This project uses paymentRoutes.js as the main handler.
 *  This controller is kept as a clean reference / fallback.
 *  If your routes call these exports, they are fully aligned
 *  with the same planTier logic.
 * ═══════════════════════════════════════════════════════════════
 */

const Payment      = require("../models/payment.model");
const Subscription = require("../models/subscription.model");
const Razorpay     = require("razorpay");
const crypto       = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// ── Price table — matches frontend PLAN_META exactly ─────────────────────────
const PRICES = {
  standard: { monthly: 830,  annual: 9960  },
  pro:      { monthly: 4150, annual: 49800 },
  proplus:  { monthly: 8300, annual: 99600 },
};

const PLAN_CREDITS = {
  standard: 100,
  pro:      500,
  proplus:  1000,
};

const PLAN_LABELS = {
  standard: "Standard",
  pro:      "Pro",
  proplus:  "Pro Plus",
};

// ── Helper ────────────────────────────────────────────────────────────────────
function derivePlanFields(productName = "", planTierOverride = null) {
  if (planTierOverride && ["standard", "pro", "proplus"].includes(planTierOverride)) {
    return { planTier: planTierOverride, tier: "micro" };
  }
  const name = productName.toLowerCase();
  const planTier = name.includes("proplus") || name.includes("pro plus")
    ? "proplus"
    : name.includes("pro")
    ? "pro"
    : name.includes("standard")
    ? "standard"
    : null;
  return { planTier, tier: "micro" };
}

// ═════════════════════════════════════════
//   CREATE ORDER
// ═════════════════════════════════════════
exports.createOrder = async (req, res) => {
  try {
    const {
      userEmail,
      productId,
      productName,
      billingMethod,
      profileId,
      currency = "INR",
      planTier: planTierFromBody,
    } = req.body;

    const { planTier, tier } = derivePlanFields(productName, planTierFromBody);

    if (!planTier) {
      return res.status(400).json({
        success: false,
        error: `Invalid plan. productName="${productName}", planTier="${planTierFromBody}"`,
      });
    }

    if (!billingMethod || !["monthly", "annual"].includes(billingMethod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid billingMethod "${billingMethod}".`,
      });
    }

    const amount = PRICES[planTier][billingMethod];

    const payment = await Payment.create({
      userEmail,
      productId,
      productName:   productName || `Naavi ${PLAN_LABELS[planTier]} Plan`,
      billingMethod,
      profileId:     profileId || null,
      amount,
      currency,
      tier,
      planTier,
      status: "pending",
    });

    const order = await razorpay.orders.create({
      amount:   amount * 100,
      currency,
      receipt:  "receipt_" + payment._id,
      notes: { userEmail, productId, planTier, tier, billingMethod },
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    console.log(`✅ Order created: ${order.id} | ${planTier}/${billingMethod} | ₹${amount}`);
    return res.json({ success: true, order });

  } catch (err) {
    console.error("❌ Create Order Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ═════════════════════════════════════════
//   VERIFY PAYMENT
// ═════════════════════════════════════════
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── 1. Verify signature ───────────────────────────────────────
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ── 2. Mark payment paid ──────────────────────────────────────
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status:            "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment record not found." });
    }

    // ── 3. End date ───────────────────────────────────────────────
    let endDate = null;
    if (payment.billingMethod === "monthly") {
      endDate = new Date(Date.now() + 30  * 24 * 60 * 60 * 1000);
    } else if (payment.billingMethod === "annual") {
      endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // ── 4. Resolve plan fields ────────────────────────────────────
    const { planTier: derivedPlanTier, tier: derivedTier } = derivePlanFields(payment.productName);
    const resolvedPlanTier = payment.planTier || derivedPlanTier || "standard";
    const resolvedTier     = payment.tier     || derivedTier     || "micro";

    // ── 5. Upsert subscription ────────────────────────────────────
    await Subscription.findOneAndUpdate(
      { userEmail: payment.userEmail, productId: payment.productId },
      {
        $set: {
          userEmail:     payment.userEmail,
          productId:     payment.productId,
          productName:   payment.productName || "Naavi Platform",
          billingMethod: payment.billingMethod,
          profileId:     payment.profileId || null,
          tier:          resolvedTier,
          planTier:      resolvedPlanTier,
          startDate:     new Date(),
          endDate,
          status:        "active",
        },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Subscription active: ${payment.userEmail} — ${resolvedPlanTier}/${resolvedTier}`);

    return res.json({
      success: true,
      message: "Payment verified & subscription activated",
    });

  } catch (err) {
    console.error("❌ Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};