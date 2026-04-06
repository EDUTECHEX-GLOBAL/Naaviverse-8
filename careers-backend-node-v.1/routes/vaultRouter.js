const express = require("express");
const router = express.Router();
const VaultTransaction = require("../models/VaultTransaction");

const WELCOME_BONUS = 50;

// In walletRouter.js — balance endpoint
// Replace the existing /balance route entirely:

router.get("/balance", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    const now = new Date();
    const txns = await VaultTransaction.find({ email });

    const balance = txns.reduce((acc, t) => {
      // ← KEY CHANGE: skip credit transactions that have expired
      if (t.type === "credit") {
        if (t.expiresAt && t.expiresAt < now) return acc;  // expired — skip
        return acc + t.amount;
      }
      // debits always count (the spend already happened)
      return acc - t.amount;
    }, 0);

    res.json({ status: true, balance: Math.max(0, balance) });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// GET /api/wallet/txns?email=...
router.get("/txns", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    const now = new Date();
    const txns = await VaultTransaction.find({ email }).sort({ timestamp: -1 });

    // Annotate each transaction with whether it's expired
    const annotated = txns.map(t => ({
      ...t.toObject(),
      isExpired: t.type === "credit" && t.expiresAt && t.expiresAt < now,
    }));

    res.json({ status: true, txns: annotated });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// POST /api/wallet/credit
// Body: { email, amount, description?, source? }
router.post("/credit", async (req, res) => {
  try {
    const { email, amount, description, source } = req.body;
    if (!email || !amount) return res.status(400).json({ status: false, message: "email and amount are required" });

    const txn = await VaultTransaction.create({
      email, type: "credit", amount,
      metadata: { description: description || "Credits added", source: source || "manual" },
    });
    res.json({ status: true, txn });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// POST /api/wallet/deduct
// Body: { email, amount, description?, source? }
router.post("/deduct", async (req, res) => {
  try {
    const { email, amount, description, source } = req.body;
    if (!email || !amount) return res.status(400).json({ status: false, message: "email and amount are required" });

    const txns = await VaultTransaction.find({ email });
    const balance = txns.reduce(
      (acc, t) => (t.type === "credit" ? acc + t.amount : acc - t.amount), 0
    );
    if (balance < amount) return res.status(400).json({ status: false, message: "Insufficient credits" });

    const txn = await VaultTransaction.create({
      email, type: "debit", amount,
      metadata: { description: description || "Credits used", source: source || "manual" },
    });
    res.json({ status: true, txn, remainingBalance: balance - amount });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// In walletRouter.js — welcome-bonus endpoint

router.post("/welcome-bonus", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    const already = await VaultTransaction.findOne({ email, "metadata.type": "welcome_bonus" });
    if (already) return res.status(400).json({ status: false, message: "Welcome bonus already applied" });

    // ← SET expiresAt = 14 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const txn = await VaultTransaction.create({
      email,
      type: "credit",
      amount: WELCOME_BONUS,
      expiresAt,                           // ← ADD THIS
      metadata: {
        type: "welcome_bonus",
        description: "Welcome Bonus (expires in 14 days)",
        source: "signup",
      },
    });

    res.json({ status: true, txn, creditsAdded: WELCOME_BONUS });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;