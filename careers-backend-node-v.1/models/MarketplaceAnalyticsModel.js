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
    naavi_score: { type: Number, default: 0, index: true },
    intent_score: { type: Number, default: 0 },
    path_match_score: { type: Number, default: 0 },
    step_match_score: { type: Number, default: 0 },
    personalization_score: { type: Number, default: 0 },
    rating_score: { type: Number, default: 0 },
    review_confidence_score: { type: Number, default: 0 },
    popularity_score: { type: Number, default: 0 },
    value_score: { type: Number, default: 0 },
    partner_trust_score: { type: Number, default: 0 },
    availability_score: { type: Number, default: 100 },
    freshness_score: { type: Number, default: 0 },
    exploration_score: { type: Number, default: 0 },
    score_breakdown: {
      intentMatch: { type: Number, default: 0 },
      pathStepMatch: { type: Number, default: 0 },
      personalization: { type: Number, default: 0 },
      partnerQuality: { type: Number, default: 0 },
      popularity: { type: Number, default: 0 },
      value: { type: Number, default: 0 },
      partnerTrust: { type: Number, default: 0 },
      availability: { type: Number, default: 100 },
      freshness: { type: Number, default: 0 },
      exploration: { type: Number, default: 0 },
    },
    last_updated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("marketplace_analytics", MarketplaceAnalyticsSchema);
