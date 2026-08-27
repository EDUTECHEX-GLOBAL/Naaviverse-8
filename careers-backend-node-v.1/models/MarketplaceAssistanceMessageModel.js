const mongoose = require("mongoose");

const MarketplaceAssistanceMessageSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderRole: {
      type: String,
      enum: ["USER", "SUPER_ADMIN"],
      required: true,
    },
    senderName: { type: String, default: "User" },
    message: { type: String, required: true },
    attachments: [{ type: String }],
    recommendedService: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "marketplace_assistance_messages",
  MarketplaceAssistanceMessageSchema
);
