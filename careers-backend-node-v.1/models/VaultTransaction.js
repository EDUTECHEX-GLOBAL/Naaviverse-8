const mongoose = require("mongoose");

const VaultTransactionSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    type: { type: String },   // "welcome_bonus" | "top_up" | "path_unlock"
    description: { type: String },   // label shown in UI
    source: { type: String },   // "signup" | "manual" | "path" | "session"
  },
});

module.exports = mongoose.model("VaultTransaction", VaultTransactionSchema);
