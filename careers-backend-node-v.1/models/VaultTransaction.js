// models/VaultTransaction.js — add expiresAt field
const mongoose = require("mongoose");

const VaultTransactionSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null },   // ← ADD THIS — null means never expires
  metadata: {
    type: { type: String },
    description: { type: String },
    source: { type: String },
  },
});

module.exports = mongoose.model("VaultTransaction", VaultTransactionSchema);