const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const Razorpay = require("razorpay");

const Payment          = require("../models/payment.model");
const Subscription     = require("../models/subscription.model");
const VaultTransaction = require("../models/VaultTransaction");          // ✅ ADDED
const { sendInvoiceEmail } = require("../utils/sendInvoiceEmail");

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("🔑 KEY_ID :", process.env.RAZORPAY_KEY_ID);
console.log("🔑 SECRET :", process.env.RAZORPAY_SECRET_KEY ? "✅ EXISTS" : "❌ MISSING");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});

// ── Plan credits map ──────────────────────────────────────────────
const PLAN_CREDITS = {
  standard: 100,
  pro:      500,
  proplus:  1000,
};

// ── Helper: derive planTier and tier ─────────────────────────────
function derivePlanFields(productName = "", planTierOverride = null, tierOverride = null) {
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
router.post("/create-order", async (req, res) => {
  try {
    console.log("📦 Body received:", req.body);

    const {
      userEmail,
      productId,
      productName,
      billingMethod,
      profileId,
      amount,
      currency = "INR",
      planTier: planTierFromBody,
      tier:     tierFromBody,
    } = req.body;

    console.log("📦 productName:", productName, "| planTierFromBody:", planTierFromBody, "| tierFromBody:", tierFromBody);

    const { planTier, tier } = derivePlanFields(productName, planTierFromBody, tierFromBody);

    if (!planTier) {
      console.error("❌ Cannot derive planTier. productName:", productName, "planTierFromBody:", planTierFromBody);
      return res.status(400).json({
        success: false,
        error: `Invalid plan selected. Received productName="${productName}", planTier="${planTierFromBody}"`,
      });
    }

    if (!billingMethod || !["monthly", "annual"].includes(billingMethod)) {
      return res.status(400).json({
        success: false,
        error: `Invalid billingMethod "${billingMethod}". Must be "monthly" or "annual".`,
      });
    }

    console.log(`✅ Derived: planTier=${planTier}, tier=${tier}`);

    const payment = await Payment.create({
      userEmail,
      productId,
      productName,
      billingMethod,
      profileId:  profileId || null,
      amount,
      currency,
      tier,
      planTier,
      status: "pending",
    });
    console.log("✅ Payment record created:", payment._id, "| tier:", tier, "| planTier:", planTier);

    const order = await razorpay.orders.create({
      amount:   amount * 100,
      currency,
      receipt:  "receipt_" + payment._id,
      notes: {
        userEmail,
        productId,
        productName,
        billingMethod,
        planTier,
        tier,
      },
    });
    console.log("✅ Razorpay order created:", order.id);

    payment.razorpayOrderId = order.id;
    await payment.save();

    return res.json({ success: true, order });

  } catch (err) {
    console.error("❌ Create Order Error:", err.message);
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

    // ── 1. Verify Razorpay signature ──────────────────────────────
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

    // ── 2. Mark payment as paid ───────────────────────────────────
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

    // ── 3. Calculate subscription end date ────────────────────────
    let endDate = null;
    if (payment.billingMethod === "monthly") {
      endDate = new Date(Date.now() + 30  * 24 * 60 * 60 * 1000);
    } else if (payment.billingMethod === "annual") {
      endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    // ── 4. Resolve tier/planTier from saved payment record ────────
    const resolvedPlanTier = payment.planTier || "standard";
    const resolvedTier     = payment.tier     || "micro";

    console.log(`✅ Resolved: planTier=${resolvedPlanTier}, tier=${resolvedTier}`);

    // ── 5. Upsert subscription ────────────────────────────────────
    await Subscription.findOneAndUpdate(
      { userEmail: payment.userEmail, productId: payment.productId },
      {
        $set: {
          userEmail:     payment.userEmail,
          productId:     payment.productId,
          productName:   payment.productName || "Naavi Platform",
          billingMethod: payment.billingMethod || "monthly",
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
    console.log(`✅ Subscription upserted: ${payment.userEmail} — ${resolvedPlanTier}/${resolvedTier}`);

    // ── 6. Credit wallet — DIRECT DB INSERT (no self-HTTP) ────────
    // ✅ FIX: was axios.post to self which silently failed when
    //         APP_BASE_URL was undefined or wrong port.
    //         Now writes directly to VaultTransaction collection.
    const credits = PLAN_CREDITS[resolvedPlanTier] || 100;
    try {
      await VaultTransaction.create({
        email:  payment.userEmail,
        type:   "credit",
        amount: credits,
        metadata: {
          description: `${resolvedPlanTier} Plan subscription credits`,
          source:      "subscription",
          planTier:    resolvedPlanTier,
          tier:        resolvedTier,
          paymentId:   razorpay_payment_id,
        },
      });
      console.log(`✅ Wallet credited: ${credits} credits → ${payment.userEmail}`);
    } catch (walletErr) {
      // Log as error (not warn) — credits missing is a real problem
      console.error("❌ Wallet credit failed:", walletErr.message);
      // Still return success to frontend (payment is confirmed)
      // but alert yourself via logs to fix manually if needed
    }

    // ── 7. Send invoice email (non-blocking) ──────────────────────
    sendInvoiceEmail({
      userEmail:         payment.userEmail,
      productName:       payment.productName,
      planTier:          resolvedPlanTier,
      billingMethod:     payment.billingMethod,
      amount:            payment.amount,
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId:   razorpay_order_id,
      createdAt:         payment.createdAt || new Date(),
    }).catch(err => console.error("❌ Invoice email failed (non-blocking):", err.message));

    return res.json({
      success: true,
      message: "Payment verified & subscription activated",
    });

  } catch (err) {
    console.error("❌ Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════
//   GET TRANSACTIONS
// ═════════════════════════════════════════
router.get("/transactions", async (req, res) => {
  try {
    const { email } = req.query;
    const payments = await Payment.find({ userEmail: email }).sort({ createdAt: -1 });
    return res.json({ success: true, data: payments });
  } catch (err) {
    console.error("❌ Fetch transactions error:", err);
    res.status(500).json({ success: false });
  }
});

// ═════════════════════════════════════════
//   DOWNLOAD INVOICE PDF
// ═════════════════════════════════════════
router.get("/invoice/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findOne({
      razorpayPaymentId: req.params.paymentId,
    });

    if (!payment) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    const { generateInvoicePDF } = require("../utils/generateInvoicePDF");
    const pdfBuffer = await generateInvoicePDF(payment);

    const invoiceNo = "INV-"
      + payment.createdAt.toISOString().slice(0, 10).replace(/-/g, "")
      + "-"
      + payment.razorpayPaymentId.slice(-4).toUpperCase();

    res.set({
      "Content-Type":        "application/pdf",
      "Content-Disposition": `attachment; filename="Naavi_Invoice_${invoiceNo}.pdf"`,
      "Content-Length":      pdfBuffer.length,
    });
    return res.send(pdfBuffer);

  } catch (err) {
    console.error("❌ Invoice download error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;