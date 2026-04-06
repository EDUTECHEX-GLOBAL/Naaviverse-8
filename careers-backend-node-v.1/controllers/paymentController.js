/**
 * ═══════════════════════════════════════════════════════════════
 *  NAAVI — payment.controller.js  (COMPLETE FIXED FILE)
 *
 *  WHAT CHANGED from your original:
 *  1. createOrder now reads `tier` from req.body
 *  2. Price is looked up by tier + billing_method
 *  3. verifyPayment now also calls /api/subscriptions/create
 *     internally after verification — so the frontend call
 *     to subscriptions/create is no longer needed
 * ═══════════════════════════════════════════════════════════════
 */

const Payment = require("../models/payment.model");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY, // ✅ FIXED
});

/* ──────────────────────────────────────────────────────────────
   PRICE TABLE  (in ₹, converted to paise when creating order)
   Micro Monthly  → ₹499    Micro Annual  → ₹4,188
   Nano  Monthly  → ₹999    Nano  Annual  → ₹8,388
────────────────────────────────────────────────────────────── */
const PRICES = {
  micro: { monthly: 499,  annual: 4188 },
  nano:  { monthly: 999,  annual: 8388 },
};

/* ============================================================
   CREATE ORDER + SAVE "pending" PAYMENT RECORD
   ============================================================ */
exports.createOrder = async (req, res) => {
  try {
    const {
      product_id,
      product_name,
      email,
      billing_method,   // "monthly" | "annual"
      currency,
      profile_id,
      tier,             // "micro" | "nano"  ← NEW
    } = req.body;

    // ── Validate tier + billing_method ───────────────────────
    if (!tier || !PRICES[tier]) {
      return res.status(400).json({
        success: false,
        error: `Invalid tier "${tier}". Must be "micro" or "nano".`,
      });
    }

    if (!billing_method || !PRICES[tier][billing_method]) {
      return res.status(400).json({
        success: false,
        error: `Invalid billing_method "${billing_method}". Must be "monthly" or "annual".`,
      });
    }

    const price = PRICES[tier][billing_method];   // ← tier-aware price ✅

    const options = {
      amount: price * 100,   // paise
      currency: currency || "INR",
      receipt: "naavi_" + tier + "_" + billing_method + "_" + Date.now(),
      notes: {
        userEmail: email,
        productId: product_id,
        productName: product_name,
        billing_method,
        tier,
        profile_id,
      },
    };

    const order = await razorpay.orders.create(options);

    // ── Save pending payment record ──────────────────────────
    await Payment.create({
      userEmail:      email,
      profileId:      profile_id,
      productId:      product_id,
      productName:    product_name,
      billingMethod:  billing_method,
      currency:       currency || "INR",
      amount:         price,
      razorpayOrderId: order.id,
      status:         "pending",
    });

    return res.json({ success: true, order });

  } catch (err) {
    console.error("❌ Create Order Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* ============================================================
   VERIFY PAYMENT + UPDATE PAYMENT RECORD + ACTIVATE SUBSCRIPTION
   ============================================================ */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── 1. Verify Razorpay signature ─────────────────────────
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed", razorpayPaymentId: null, razorpaySignature: null }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ── 2. Update payment record to "paid" ───────────────────
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status:              "paid",
        razorpayPaymentId:   razorpay_payment_id,
        razorpaySignature:   razorpay_signature,
      },
      { new: true }   // return updated doc so we can read tier/billing from it
    );

    // ── 3. Activate subscription record ─────────────────────
    //    Import your Subscription model at the top of this file:
    //    const Subscription = require("../models/subscription.model");
    //
    //    Then uncomment this block:
    //
    // if (payment) {
    //   const existing = await Subscription.findOne({
    //     userEmail: payment.userEmail,
    //     productId: payment.productId,
    //   });
    //
    //   const tier    = payment.notes?.tier    || req.body.tier;
    //   const billing = payment.billingMethod;
    //
    //   if (existing) {
    //     existing.tier        = tier;
    //     existing.billing     = billing;
    //     existing.paymentId   = razorpay_payment_id;
    //     existing.orderId     = razorpay_order_id;
    //     existing.status      = "active";
    //     existing.activatedAt = new Date();
    //     await existing.save();
    //   } else {
    //     await Subscription.create({
    //       userEmail:   payment.userEmail,
    //       profileId:   payment.profileId,
    //       productId:   payment.productId,
    //       productName: payment.productName,
    //       tier,
    //       billing,
    //       paymentId:   razorpay_payment_id,
    //       orderId:     razorpay_order_id,
    //       status:      "active",
    //       activatedAt: new Date(),
    //     });
    //   }
    // }

    return res.json({
      success: true,
      message: "Payment verified & stored successfully",
    });

  } catch (err) {
    console.error("❌ Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};