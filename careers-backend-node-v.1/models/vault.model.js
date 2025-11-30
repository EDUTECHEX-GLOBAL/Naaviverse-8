const mongoose = require("mongoose");

const VaultSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    symbol: { type: String, required: true },
    balance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vault", VaultSchema);
