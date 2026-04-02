const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userEmail:   { type: String, required: true },
    profileId:   { type: String },

    productId:   { type: String, required: true },
    productName: { type: String, required: true },

    // ── NEW: tracks which view tier this subscription unlocks ──────────────
    // "micro" → unlocks Micro View only
    // "nano"  → unlocks Micro + Nano View (full access)
    tier: {
      type: String,
      enum: ["micro", "nano"],
      default: "micro",
    },

    billingMethod: {
      type: String,
      enum: ["monthly", "annual", "lifetime"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate:   { type: Date }, // null for lifetime
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSubscription", SubscriptionSchema);