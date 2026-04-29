const express = require("express");
const router = express.Router();
const VaultTransaction = require("../models/VaultTransaction");

const WELCOME_BONUS = 50;

// ─────────────────────────────────────────────────────────────────
// SHARED HELPER
// Logic:
//   - Debits always consumed bonus credits FIRST (bonus is given first)
//   - On expiry: only UNSPENT bonus is removed from total
//   - If user spent 20 of 50 bonus → 30 unspent → remove 30 on expiry
//   - If user spent all 50 bonus → 0 unspent → remove nothing on expiry
// ─────────────────────────────────────────────────────────────────
const computeBalance = (txns) => {
  const now = new Date();

  // Find the welcome bonus credit transaction
  const bonusTxn = txns.find(
    t => t.type === "credit" && t.metadata?.type === "welcome_bonus"
  );

  // Determine expiry date (handle old records with no expiresAt)
  let bonusExpired = false;
  if (bonusTxn) {
    let expiryDate;
    if (bonusTxn.expiresAt) {
      expiryDate = new Date(bonusTxn.expiresAt);
    } else {
      // Old record — infer expiry from timestamp + 14 days
      expiryDate = new Date(bonusTxn.timestamp);
      expiryDate.setDate(expiryDate.getDate() + 14);
    }
    bonusExpired = expiryDate < now;
  }

  // Sum all credits (include everything for now)
  const totalCredits = txns
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  // Sum all debits
  const totalDebits = txns
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + t.amount, 0);

  let balance = totalCredits - totalDebits;

  // On expiry: remove only the UNSPENT portion of the bonus
  if (bonusExpired && bonusTxn) {
    const bonusAmount = bonusTxn.amount; // 50
    // Bonus is consumed first → bonus spent = min(50, totalDebits)
    const bonusSpent   = Math.min(bonusAmount, totalDebits);
    const unusedBonus  = bonusAmount - bonusSpent;
    // Remove the unused bonus from balance
    balance = balance - unusedBonus;
  }

  return Math.max(0, balance);
};

// ─────────────────────────────────────────────────────────────────
// GET /api/wallet/balance
// ─────────────────────────────────────────────────────────────────
router.get("/balance", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ status: false, message: "email is required" });

    const txns    = await VaultTransaction.find({ email });
    const balance = computeBalance(txns);

    res.json({ status: true, balance });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// GET /api/wallet/txns
// ─────────────────────────────────────────────────────────────────
router.get("/txns", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email)
      return res.status(400).json({ status: false, message: "email is required" });

    const now  = new Date();
    const txns = await VaultTransaction.find({ email }).sort({ timestamp: -1 });

    const annotated = txns.map(t => {
      let isExpired = false;
      if (t.type === "credit" && t.metadata?.type === "welcome_bonus") {
        // Check expiry for bonus — handle both new and old records
        let expiryDate;
        if (t.expiresAt) {
          expiryDate = new Date(t.expiresAt);
        } else {
          expiryDate = new Date(t.timestamp);
          expiryDate.setDate(expiryDate.getDate() + 14);
        }
        isExpired = expiryDate < now;
      }
      return { ...t.toObject(), isExpired };
    });

    res.json({ status: true, txns: annotated });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/wallet/credit
// ─────────────────────────────────────────────────────────────────
router.post("/credit", async (req, res) => {
  try {
    const { email, amount, description, source } = req.body;
    if (!email || !amount)
      return res.status(400).json({ status: false, message: "email and amount are required" });

    const txn = await VaultTransaction.create({
      email,
      type: "credit",
      amount,
      metadata: { description: description || "Credits added", source: source || "manual" },
    });
    res.json({ status: true, txn });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/wallet/deduct
// ─────────────────────────────────────────────────────────────────
router.post("/deduct", async (req, res) => {
  try {
    const { email, amount, description, source } = req.body;
    if (!email || !amount)
      return res.status(400).json({ status: false, message: "email and amount are required" });

    const txns    = await VaultTransaction.find({ email });
    const balance = computeBalance(txns); // ✅ uses same shared logic

    if (balance < amount)
      return res.status(400).json({ status: false, message: "Insufficient credits" });

    const txn = await VaultTransaction.create({
      email,
      type: "debit",
      amount,
      metadata: {
        description: description || "Credits used",
        source: source || "manual",
      },
    });

    res.json({ status: true, txn, remainingBalance: balance - amount });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────
// POST /api/wallet/welcome-bonus
// ─────────────────────────────────────────────────────────────────
router.post("/welcome-bonus", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ status: false, message: "email is required" });

    const already = await VaultTransaction.findOne({ email, "metadata.type": "welcome_bonus" });
    if (already)
      return res.status(400).json({ status: false, message: "Welcome bonus already applied" });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    const txn = await VaultTransaction.create({
      email,
      type: "credit",
      amount: WELCOME_BONUS,
      expiresAt,
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