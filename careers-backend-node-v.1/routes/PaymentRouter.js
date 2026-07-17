const express = require("express");
const router  = express.Router();
const crypto  = require("crypto");
const Razorpay = require("razorpay");

const Payment          = require("../models/PaymentModel");
const Subscription     = require("../models/SubscriptionModel");
const VaultTransaction = require("../models/VaultTransactionModel");          // ✅ ADDED
const { sendInvoiceEmail } = require("../utils/sendInvoiceEmail");
const { trackMarketplaceEvent } = require("../services/MarketplaceRankingService");

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

    const isMarketplace = productId?.startsWith("micro-") || productId?.startsWith("nano-") || productId?.startsWith("macro-") || billingMethod === "lifetime";
    
    let planTier = "standard";
    let tier = tierFromBody || ((productName || "").toLowerCase().includes("nano") ? "nano" : "micro");

    if (!isMarketplace) {
      const derived = derivePlanFields(productName, planTierFromBody, tierFromBody);
      planTier = derived.planTier;
      tier = derived.tier;

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
    } else {
      if (!billingMethod || !["monthly", "annual", "lifetime"].includes(billingMethod)) {
        return res.status(400).json({
          success: false,
          error: `Invalid billingMethod "${billingMethod}". Must be "monthly", "annual", or "lifetime".`,
        });
      }
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
      planTier: planTier || undefined,
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
    const resolvedPlanTier = payment.planTier || null;
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
    // ── 6. Credit wallet if standard plan tier exists (skip for marketplace) ──
    const isMkt = payment.productId?.startsWith("micro-") || payment.productId?.startsWith("nano-") || payment.productId?.startsWith("macro-") || payment.billingMethod === "lifetime";
    if (!isMkt && resolvedPlanTier && PLAN_CREDITS[resolvedPlanTier]) {
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
        console.error("❌ Wallet credit failed:", walletErr.message);
      }
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

// ═════════════════════════════════════════
//   MARKETPLACE — CREATE RAZORPAY ORDER
//   POST /api/payment/marketplace-order
// ═════════════════════════════════════════
router.post("/marketplace-order", async (req, res) => {
  try {
    const { userEmail, items = [], total, currency = "INR" } = req.body;

    if (!userEmail || !total || total <= 0) {
      return res.status(400).json({ success: false, error: "userEmail and total are required" });
    }

    // Determine tier (nano > micro > macro)
    const layers = items.map(i => (i.layer || "macro").toLowerCase());
    const tier = layers.includes("nano") ? "nano" : layers.includes("micro") ? "micro" : "macro";

    // Create a combined payment record
    const payment = await Payment.create({
      userEmail,
      productId:     "naavi-marketplace",
      productName:   `Marketplace — ${items.map(i => i.name).join(", ")}`,
      billingMethod: "monthly",
      amount:        total,
      currency,
      tier:          tier === "macro" ? "micro" : tier,
      planTier:      "standard",
      status:        "pending",
    });

    const order = await razorpay.orders.create({
      amount:   total * 100,
      currency,
      receipt:  "mkt_" + payment._id,
      notes:    { userEmail, tier, productId: "naavi-marketplace" },
    });

    payment.razorpayOrderId = order.id;
    await payment.save();

    console.log(`✅ Marketplace order created: ${order.id} | ₹${total} | ${tier}`);
    return res.json({ success: true, order, paymentId: payment._id });

  } catch (err) {
    console.error("❌ Marketplace Order Error:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════
//   MARKETPLACE — VERIFY RAZORPAY PAYMENT
//   POST /api/payment/marketplace-verify
// ═════════════════════════════════════════
router.post("/marketplace-verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items = [],
      userEmail,
    } = req.body;

    // 1. Verify signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // 2. Mark payment as paid
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
      return res.status(404).json({ success: false, message: "Payment record not found" });
    }

    // 3. Determine tier (nano > micro > macro)
    const layers = items.map(i => (i.layer || "macro").toLowerCase());
    const tier = layers.includes("nano") ? "nano" : layers.includes("micro") ? "micro" : null;

    // 4. Activate subscription for micro/nano
    if (tier) {
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await Subscription.findOneAndUpdate(
        { userEmail: payment.userEmail, productId: "naavi-marketplace" },
        {
          $set: {
            userEmail:     payment.userEmail,
            productId:     "naavi-marketplace",
            productName:   "Naaviverse Marketplace",
            billingMethod: "monthly",
            tier,
            planTier:      "standard",
            startDate:     new Date(),
            endDate,
            status:        "active",
          },
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Marketplace subscription activated: ${payment.userEmail} — ${tier}`);
    }

    // 5. Credit wallet tokens
    try {
      const credits = tier === "nano" ? 10 : tier === "micro" ? 5 : 2;
      await VaultTransaction.create({
        email:       payment.userEmail,
        type:        "credit",
        amount:      credits,
        description: `Marketplace purchase reward`,
        paymentId:   razorpay_payment_id,
        expiresAt:   new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      });
    } catch (e) {
      console.warn("Wallet credit failed:", e.message);
    }

    console.log(`✅ Marketplace payment verified: ${razorpay_payment_id}`);
    for (const item of items) {
      await trackMarketplaceEvent({
        serviceId: item._id || item.service_id,
        action: "purchase",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified & confirmed",
      tier,
      razorpayPaymentId: razorpay_payment_id,
    });

  } catch (err) {
    console.error("❌ Marketplace Verify Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ═════════════════════════════════════════
//   MOCK PURCHASE (Marketplace Test Payment)
//   POST /api/payment/mock-purchase
// ═════════════════════════════════════════
router.post("/mock-purchase", async (req, res) => {
  try {
    const {
      userEmail,
      items = [],        // Array of { name, layer, cost, _id }
      total,             // Total amount in INR
      orderId,           // Frontend-generated order ID e.g. #NV-123456
      stepId,
      pathId,
    } = req.body;

    if (!userEmail) {
      return res.status(400).json({ success: false, message: "userEmail is required" });
    }

    // Determine the highest-tier layer purchased (nano > micro > macro)
    const layers = items.map(i => (i.layer || "macro").toLowerCase());
    const tier = layers.includes("nano") ? "nano" : layers.includes("micro") ? "micro" : null;

    // Save a payment record for each item
    const paymentRecords = [];
    for (const item of items) {
      const itemLayer = (item.layer || "macro").toLowerCase();
      const amount = Math.round(parseFloat(String(item.cost || "0").replace(/[^0-9.]/g, "")) || 0);
      const rec = await Payment.create({
        userEmail,
        productId: item._id ? String(item._id) : `marketplace-${Date.now()}`,
        productName: item.name || "Marketplace Item",
        billingMethod: "monthly",
        amount,
        currency: "INR",
        tier: itemLayer === "macro" ? "micro" : itemLayer,
        planTier: "standard",
        status: "paid",
        razorpayOrderId: orderId || `MOCK-${Date.now()}`,
        razorpayPaymentId: `MOCK_PAY_${Date.now()}`,
        razorpaySignature: "mock_signature",
      });
      paymentRecords.push(rec);
      await trackMarketplaceEvent({
        serviceId: item._id || item.service_id,
        action: "purchase",
      });
    }

    // Activate subscription if micro/nano items were purchased
    if (tier) {
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await Subscription.findOneAndUpdate(
        { userEmail, productId: "naavi-marketplace" },
        {
          $set: {
            userEmail,
            productId: "naavi-marketplace",
            productName: "Naaviverse Marketplace",
            billingMethod: "monthly",
            tier,
            planTier: "standard",
            startDate: new Date(),
            endDate,
            status: "active",
          },
        },
        { upsert: true, new: true }
      );
      console.log(`✅ Mock marketplace subscription activated: ${userEmail} — ${tier}`);
    }

    return res.json({
      success: true,
      message: "Mock purchase recorded & subscription activated",
      orderId,
      tier,
      paymentCount: paymentRecords.length,
    });

  } catch (err) {
    console.error("❌ Mock purchase error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
