const mongoose = require("mongoose");

const MarketplaceAssistanceSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true },
    userId: { type: String },
    userEmail: { type: String, required: true, index: true },
    userName: { type: String, default: "Student" },

    pathId: { type: String },
    pathName: { type: String, default: "" },
    stepId: { type: String, required: true, index: true },
    stepName: { type: String, default: "" },

    originalMarketplaceItemId: { type: String },
    originalItemName: { type: String },

    replacementCount: {
      type: Number,
      default: 3,
    },

    userRequirement: {
      reasons: [{ type: String }],
      message: { type: String, default: "" },
    },

    previousRecommendations: [
      {
        id: { type: String },
        name: { type: String },
        cost: { type: mongoose.Schema.Types.Mixed },
        reasons: [{ type: String }],
      },
    ],

    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "closed"],
      default: "pending",
      index: true,
    },

    assignedAdminId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "marketplace_assistance_requests",
  MarketplaceAssistanceSchema
);
