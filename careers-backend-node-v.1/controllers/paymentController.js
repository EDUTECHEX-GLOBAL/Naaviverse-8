const Payment      = require("../models/payment.model");
const Subscription = require("../models/subscription.model");
const Razorpay     = require("razorpay");
const crypto       = require("crypto");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

const PRICES = {
  // Micro tier plans
  standard:      { monthly: 830,   annual: 9960   },
  pro:           { monthly: 4150,  annual: 49800  },
  proplus:       { monthly: 8300,  annual: 99600  },
  // Nano tier plans
  standard_nano: { monthly: 1660,  annual: 19920  },
  pro_nano:      { monthly: 8300,  annual: 99600  },
  proplus_nano:  { monthly: 16600, annual: 199200 },
};

const PLAN_LABELS = {
  standard:      "Standard",
  pro:           "Pro",
  proplus:       "Pro Plus",
  standard_nano: "Standard Nano",
  pro_nano:      "Pro Nano",
  proplus_nano:  "Pro Plus Nano",
};

// ── Derive planTier and tier from request body ────────────────────
function derivePlanFields(productName = "", planTierOverride = null, tierOverride = null) {
  // Use explicit overrides from frontend if provided
  const validPlanTiers = ["standard", "pro", "proplus"];
  const validTiers     = ["micro", "nano"];

  const planTier = validPlanTiers.includes(planTierOverride)
    ? planTierOverride
    : (() => {
        const name = (productName || "").toLowerCase();
        return name.includes("proplus") || name.includes("pro plus") ? "proplus"
          : name.includes("pro") ? "pro"
          : "standard";
      })();

  const tier = validTiers.includes(tierOverride)
    ? tierOverride
    : (productName || "").toLowerCase().includes("nano") ? "nano" : "micro";

  return { planTier, tier };
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
      tier:     tierFromBody,        // ← NOW READING tier FROM BODY
      amount:   amountFromBody,
    } = req.body;

    const { planTier, tier } = derivePlanFields(productName, planTierFromBody, tierFromBody);

    if (!billingMethod || !["monthly", "annual"].includes(billingMethod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid billingMethod "${billingMethod}".`,
      });
    }

    // Use amount from frontend (supports nano pricing), fallback to PRICES table
    const amount = amountFromBody || PRICES[planTier]?.[billingMethod];
    if (!amount) {
      return res.status(400).json({
        success: false,
        error: `Cannot determine amount for plan "${planTier}" / billing "${billingMethod}"`,
      });
    }

    const payment = await Payment.create({
      userEmail,
      productId,
      productName:   productName || `Naavi Plan`,
      billingMethod,
      profileId:     profileId || null,
      amount,
      currency,
      tier,          // ← SAVES CORRECT tier ("micro" or "nano")
      planTier,      // ← SAVES CORRECT planTier
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

    console.log(`✅ Order created: ${order.id} | ${planTier}/${tier}/${billingMethod} | ₹${amount}`);
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

    // ── 4. Use tier/planTier already saved on payment record ──────
    const resolvedPlanTier = payment.planTier || "standard";
    const resolvedTier     = payment.tier     || "micro";   // ← reads what was saved

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
          tier:          resolvedTier,      // ← "micro" or "nano" ✅
          planTier:      resolvedPlanTier,  // ← "standard"|"pro"|"proplus" ✅
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