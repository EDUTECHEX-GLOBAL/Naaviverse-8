const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userEmail:   { type: String, required: true },
    profileId:   { type: String },

    productId:   { type: String, required: true },
    productName: { type: String, required: true },

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
    endDate:   { type: Date },

    // ── NEW: credit-based per-step unlocks ────────────────────────────────
    // Stored directly here — no new collection needed.
    // Each entry = one permanently unlocked layer for one step.
    // e.g. [{ step_id: "abc", layer: "micro", credits_spent: 2, unlocked_at: Date }]
    unlockedSteps: [
      {
        step_id:       { type: String, required: true },
        layer:         { type: String, enum: ["micro", "nano"], required: true },
        credits_spent: { type: Number, required: true },
        unlocked_at:   { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSubscription", SubscriptionSchema);