const mongoose = require("mongoose");

const MarketplaceReplacementSchema = new mongoose.Schema(
  {
    userId: { type: String },
    userEmail: { type: String, required: true, index: true },
    pathId: { type: String },
    stepId: { type: String, required: true, index: true },
    originalMarketplaceItemId: { type: String, required: true },

    replacementCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 3,
    },

    feedback: {
      reasons: [{ type: String }],
      message: { type: String, default: "" },
    },

    previousRecommendations: [
      {
        marketplaceItemId: { type: String },
        itemName: { type: String },
        replacementNumber: { type: Number },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    whyRecommended: [{ type: String }],

    status: {
      type: String,
      enum: [
        "replacement_active",
        "max_replacements_reached",
        "admin_requested",
        "resolved",
        "closed",
      ],
      default: "replacement_active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "marketplace_replacement_requests",
  MarketplaceReplacementSchema
);
