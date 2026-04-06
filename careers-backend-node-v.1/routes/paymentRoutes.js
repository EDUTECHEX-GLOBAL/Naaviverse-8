const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Razorpay = require("razorpay");

const Payment = require("../models/payment.model");
const Subscription = require('../models/subscription.model');

// ── Debug: print keys on startup (remove after confirming it works) ──────────
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔑 KEY_ID :", process.env.RAZORPAY_KEY_ID);
console.log("🔑 SECRET :", process.env.RAZORPAY_SECRET_KEY ? "✅ EXISTS" : "❌ MISSING");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

// ── Razorpay Init ─────────────────────────────────────────────────────────────
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,   // ✅ fixed — was RAZORPAY_SECRET
});

// ═════════════════════════════════════════
//   CREATE ORDER
// ═════════════════════════════════════════
router.post("/create-order", async (req, res) => {
  try {
    console.log("📦 Body received:", req.body);
    console.log("🔑 Keys loaded:", !!process.env.RAZORPAY_KEY_ID, !!process.env.RAZORPAY_SECRET_KEY);

    const { userEmail, productId, productName, billingMethod, profileId, amount, currency = "INR" } = req.body;

    // Step A: Test Mongo first
    console.log("💾 Creating payment record...");
    const payment = await Payment.create({
      userEmail, productId, productName, billingMethod, profileId, amount, currency, status: "pending",
    });
    console.log("✅ Payment record created:", payment._id);

    // Step B: Test Razorpay
    console.log("💳 Creating Razorpay order, amount in paise:", amount * 100);
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency,
      receipt: "receipt_" + payment._id,
    });
    console.log("✅ Razorpay order created:", order.id);

    payment.razorpayOrderId = order.id;
    await payment.save();

    return res.json({ success: true, order });

  } catch (err) {
    console.error("❌ Create Order Error:", err.message);
    console.error("❌ Full error:", err); // ← shows exactly where it died
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════
//   VERIFY PAYMENT & ACTIVATE SUBSCRIPTION
// ═════════════════════════════════════════
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ── 1. Verify signature ───────────────────────────────────────────────────
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)  // ✅ fixed — was RAZORPAY_SECRET
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // ── 2. Mark payment as paid ───────────────────────────────────────────────
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    );

    // ── 3. Calculate subscription end date ───────────────────────────────────
    let endDate = null;
    if (payment.billingMethod === "monthly") {
      endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    } else if (payment.billingMethod === "annual") {
      endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }
    // lifetime → endDate stays null (never expires)

    // ── 4. Upsert subscription record ────────────────────────────────────────
    await Subscription.findOneAndUpdate(
      { userEmail: payment.userEmail, productId: payment.productId },
      {
        userEmail: payment.userEmail,
        productId: payment.productId,
        productName: payment.productName,
        billingMethod: payment.billingMethod,
        profileId: payment.profileId,
        startDate: new Date(),
        endDate,
        status: "active",
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Payment verified & subscription activated",
    });

  } catch (err) {
    console.error("❌ Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/transactions", async (req, res) => {
  try {
    const { email } = req.query;

    const payments = await Payment.find({ userEmail: email })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: payments,
    });

  } catch (err) {
    console.error("❌ Fetch transactions error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;