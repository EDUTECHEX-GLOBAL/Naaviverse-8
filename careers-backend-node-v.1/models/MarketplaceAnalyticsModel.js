const mongoose = require("mongoose");

const MarketplaceAnalyticsSchema = new mongoose.Schema(
  {
    service_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "marketplace_items",
      required: true,
      unique: true,
      index: true,
    },
    partner_id: { type: String, default: "" },
    partner_email: { type: String, default: "" },

    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    cart_additions: { type: Number, default: 0 },
    wishlist_count: { type: Number, default: 0 },
    purchase_count: { type: Number, default: 0 },
    completion_count: { type: Number, default: 0 },
    repeat_purchases: { type: Number, default: 0 },

    average_rating: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    helpful_feedback: { type: Number, default: 0 },
    not_relevant_feedback: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    replacement_requests: { type: Number, default: 0 },

    refund_count: { type: Number, default: 0 },
    complaint_count: { type: Number, default: 0 },
    cancellation_count: { type: Number, default: 0 },

    partner_response_time_hours: { type: Number, default: 0 },
    partner_success_rate: { type: Number, default: 0 },
    partner_rating: { type: Number, default: 0 },

    marketplace_score: { type: Number, default: 0, index: true },
    score_breakdown: {
      ratings: { type: Number, default: 0 },
      completion: { type: Number, default: 0 },
      purchaseSuccess: { type: Number, default: 0 },
      feedback: { type: Number, default: 0 },
      repeatPurchases: { type: Number, default: 0 },
      partnerReliability: { type: Number, default: 0 },
      complaintsRefunds: { type: Number, default: 0 },
    },
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("marketplace_analytics", MarketplaceAnalyticsSchema);
