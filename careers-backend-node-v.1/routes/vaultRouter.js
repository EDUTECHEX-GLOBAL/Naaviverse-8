const express = require("express");
const router = express.Router();
const VaultTransaction = require("../models/VaultTransaction");

const WELCOME_BONUS = 50;

// GET /api/wallet/balance?email=...
router.get("/balance", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    const txns = await VaultTransaction.find({ email });
    const balance = txns.reduce(
      (acc, t) => (t.type === "credit" ? acc + t.amount : acc - t.amount), 0
    );
    res.json({ status: true, balance });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// GET /api/wallet/txns?email=...
router.get("/txns", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    const txns = await VaultTransaction.find({ email }).sort({ timestamp: -1 });
    res.json({ status: true, txns });
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

// POST /api/wallet/welcome-bonus
// Body: { email }
// Called automatically by partnerRouter after successful signup.
router.post("/welcome-bonus", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: false, message: "email is required" });

    // Prevent duplicates
    const already = await VaultTransaction.findOne({ email, "metadata.type": "welcome_bonus" });
    if (already) return res.status(400).json({ status: false, message: "Welcome bonus already applied" });

    const txn = await VaultTransaction.create({
      email,
      type: "credit",
      amount: WELCOME_BONUS,
      metadata: { type: "welcome_bonus", description: "Welcome Bonus", source: "signup" },
    });
    res.json({ status: true, txn, creditsAdded: WELCOME_BONUS });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

module.exports = router;