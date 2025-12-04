const express = require("express");
const router = express.Router();
const VaultTransaction = require("../models/VaultTransaction");

router.post("/txns", async (req, res) => {
  try {
    const { email, coin } = req.body;

    if (!email || !coin) {
      return res.json({
        status: false,
        message: "email and coin are required"
      });
    }

    const txns = await VaultTransaction.find({
      partnerEmail: email,
      coin
    }).sort({ timestamp: -1 });

    return res.json({
      status: true,
      txns
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message
    });
  }
});

router.post("/add", async (req, res) => {
  try {
    const newTxn = await VaultTransaction.create(req.body);
    res.json({ status: true, txn: newTxn });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});


module.exports = router;
