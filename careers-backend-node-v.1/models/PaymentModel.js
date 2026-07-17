const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    profileId: { type: String },
    productId: { type: String, required: true },
    productName: { type: String, required: true },

    billingMethod: {
      type: String,
      enum: ["monthly", "annual", "lifetime"],
      required: true,
    },

    // tier: always "micro" for subscriptions
    // nano is a per-step credit unlock, not a subscription tier
    tier: {
      type: String,
      enum: ["micro", "nano"],
      default: "micro",
    },

    // planTier: matches frontend plan keys exactly
    planTier: {
      type: String,
      enum: ["standard", "pro", "proplus"],
      default: null,
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);