const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    profileId: { type: String },
    productId: { type: String, required: true },
    productName: { type: String, required: true },

    // Which VIEW LAYER they subscribed to
    tier: {
      type: String,
      enum: ["micro", "nano", "credit_only"],
      required: true,
      default: "micro",      // ← add default
    },

    planTier: {
      type: String,
      enum: ["gold", "silver", "platinum"],
      default: "gold",       // ← already there, confirm it's present
    },

    billingMethod: {
      type: String,
      enum: ["monthly", "annual", "lifetime", "credit_only"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },

    unlockedSteps: [
      {
        step_id: { type: String, required: true },
        layer: { type: String, enum: ["micro", "nano"], required: true },
        credits_spent: { type: Number, required: true },
        unlocked_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSubscription", SubscriptionSchema);