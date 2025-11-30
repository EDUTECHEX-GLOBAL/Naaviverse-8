const Vault = require("../models/vault.model");

// 🟦 Add currency
exports.addCurrency = async (req, res) => {
  try {
    const { email, symbol, balance } = req.body;

    if (!email || !symbol) {
      return res.status(400).json({ status: false, message: "email & symbol required" });
    }

    const currency = await Vault.create({
      email,
      symbol,
      balance: balance || 0
    });

    return res.json({
      status: true,
      message: "Currency added successfully",
      data: currency,
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};

// 🟩 Get currencies for a user
exports.getCurrencies = async (req, res) => {
  try {
    const { email } = req.params;

    const list = await Vault.find({ email });

    return res.json({
      status: true,
      data: list,
    });

  } catch (err) {
    return res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};
