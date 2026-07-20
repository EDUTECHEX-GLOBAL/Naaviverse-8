const mongoose = require("mongoose");
const MarketplaceItem = require("../models/MarketplaceModel");
const MarketplaceAnalytics = require("../models/MarketplaceAnalyticsModel");

const SCORE_WEIGHTS = {
  ratings: 0.30,
  completion: 0.20,
  purchaseSuccess: 0.15,
  feedback: 0.10,
  repeatPurchases: 0.10,
  partnerReliability: 0.10,
  complaintsRefunds: 0.05,
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const pct = (part, total) => (total > 0 ? (part / total) * 100 : 0);

const toPlainAnalytics = (analytics) => {
  if (!analytics) return null;
  if (typeof analytics.toObject === "function") return analytics.toObject();
  return analytics;
};

function calculateMarketplaceScore(input = {}) {
  const analytics = toPlainAnalytics(input) || {};
  const ratings = analytics.rating_count > 0
    ? clamp((analytics.average_rating / 5) * 100)
    : 0;
  const completion = clamp(pct(analytics.completion_count, analytics.purchase_count));
  const purchaseSuccess = clamp(pct(analytics.purchase_count, Math.max(analytics.views, analytics.clicks, 1)));
  const feedbackTotal = (analytics.helpful_feedback || 0) + (analytics.not_relevant_feedback || 0);
  const feedback = feedbackTotal > 0 ? clamp(pct(analytics.helpful_feedback, feedbackTotal)) : 0;
  const repeatPurchases = clamp(pct(analytics.repeat_purchases, analytics.purchase_count));

  const complaintPenalty = ((analytics.complaint_count || 0) + (analytics.cancellation_count || 0)) * 8;
  const responsePenalty = analytics.partner_response_time_hours > 0
    ? Math.min(30, analytics.partner_response_time_hours)
    : 0;
  const partnerSignals = [
    analytics.partner_success_rate || 0,
    analytics.partner_rating ? clamp((analytics.partner_rating / 5) * 100) : 0,
  ].filter(Boolean);
  const partnerBase = partnerSignals.length
    ? partnerSignals.reduce((sum, val) => sum + val, 0) / partnerSignals.length
    : 75;
  const partnerReliability = clamp(partnerBase - complaintPenalty - responsePenalty);

  const negativeRate = pct(
    (analytics.refund_count || 0) + (analytics.complaint_count || 0) + (analytics.replacement_requests || 0),
    Math.max(analytics.purchase_count || 0, analytics.views || 0, 1)
  );
  const complaintsRefunds = clamp(100 - negativeRate * 4);

  const breakdown = {
    ratings,
    completion,
    purchaseSuccess,
    feedback,
    repeatPurchases,
    partnerReliability,
    complaintsRefunds,
  };

  const score = Object.entries(SCORE_WEIGHTS).reduce((total, [key, weight]) => {
    return total + (breakdown[key] || 0) * weight;
  }, 0);

  return {
    marketplace_score: Math.round(clamp(score) * 100) / 100,
    score_breakdown: breakdown,
  };
}

function normalizeAction(action = "") {
  const key = String(action).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    view: "views",
    viewed: "views",
    click: "clicks",
    clicked: "clicks",
    card_click: "clicks",
    cart: "cart_additions",
    add_to_cart: "cart_additions",
    cart_addition: "cart_additions",
    wishlist: "wishlist_count",
    saved: "wishlist_count",
    purchase: "purchase_count",
    purchased: "purchase_count",
    completion: "completion_count",
    completed: "completion_count",
    helpful: "helpful_feedback",
    not_relevant: "not_relevant_feedback",
    notrelevant: "not_relevant_feedback",
    comment: "comments",
    replacement: "replacement_requests",
    replacement_request: "replacement_requests",
    refund: "refund_count",
    complaint: "complaint_count",
    cancellation: "cancellation_count",
    repeat_purchase: "repeat_purchases",
  };

  return aliases[key] || key;
}

async function ensureAnalyticsForItem(item) {
  if (!item?._id || !mongoose.Types.ObjectId.isValid(item._id)) return null;
  let analytics = await MarketplaceAnalytics.findOne({ service_id: item._id });
  if (!analytics) {
    analytics = await MarketplaceAnalytics.create({
      service_id: item._id,
      partner_email: item.partner_email || "",
      partner_id: item.partner_email || "",
    });
  }
  return analytics;
}

async function recalculateAnalytics(analytics) {
  if (!analytics) return null;
  const nextScore = calculateMarketplaceScore(analytics);
  analytics.marketplace_score = nextScore.marketplace_score;
  analytics.score_breakdown = nextScore.score_breakdown;
  analytics.last_updated = new Date();
  return analytics.save();
}

async function trackMarketplaceEvent({ serviceId, action, value = 1, rating, partnerEmail }) {
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return null;
  }

  const item = await MarketplaceItem.findById(serviceId).select("partner_email").lean();
  if (!item) return null;

  const analytics = await ensureAnalyticsForItem({
    _id: serviceId,
    partner_email: partnerEmail || item.partner_email,
  });
  const field = normalizeAction(action);
  const amount = Number(value) || 1;

  if (rating !== undefined && rating !== null && Number(rating) > 0) {
    const boundedRating = Math.min(5, Math.max(1, Number(rating)));
    const totalRating = (analytics.average_rating || 0) * (analytics.rating_count || 0) + boundedRating;
    analytics.rating_count = (analytics.rating_count || 0) + 1;
    analytics.average_rating = Math.round((totalRating / analytics.rating_count) * 100) / 100;
  }

  if (Object.prototype.hasOwnProperty.call(analytics.toObject(), field) && typeof analytics[field] === "number") {
    analytics[field] = Math.max(0, (analytics[field] || 0) + amount);
  }

  analytics.partner_email = partnerEmail || item.partner_email || analytics.partner_email || "";
  analytics.partner_id = analytics.partner_id || analytics.partner_email || "";

  return recalculateAnalytics(analytics);
}

async function attachAnalyticsToItems(items = []) {
  const ids = items.map((item) => item._id).filter(Boolean);
  const analyticsRows = await MarketplaceAnalytics.find({ service_id: { $in: ids } }).lean();
  const analyticsByService = new Map(analyticsRows.map((row) => [String(row.service_id), row]));

  return items.map((item) => {
    const plain = typeof item.toObject === "function" ? item.toObject() : item;
    const analytics = analyticsByService.get(String(plain._id)) || null;
    return {
      ...plain,
      analytics,
      marketplace_score: analytics?.marketplace_score || 0,
      average_rating: analytics?.average_rating || 0,
      rating_count: analytics?.rating_count || 0,
      purchase_count: analytics?.purchase_count || 0,
      completion_rate: analytics?.purchase_count
        ? Math.round(pct(analytics.completion_count, analytics.purchase_count))
        : 0,
    };
  });
}

async function getRankedMarketplaceItems(filter = {}) {
  const items = await MarketplaceItem.find(filter).lean();
  
  // Enrich items with dynamic checkoutType based on whether the partner email is registered in partners collection
  const Partner = require("../models/PartnerModel");
  const enrichedItems = [];
  for (const item of items) {
    const enriched = { ...item };
    if (item.partner_email) {
      const partner = await Partner.findOne({ email: item.partner_email.trim() }).select("partnerId").lean();
      if (partner) {
        enriched.checkoutType = "external";
        enriched.partnerId = partner.partnerId;
      } else {
        enriched.checkoutType = "internal";
      }
    } else {
      enriched.checkoutType = "internal";
    }
    enrichedItems.push(enriched);
  }

  const withAnalytics = await attachAnalyticsToItems(enrichedItems);
  return withAnalytics.sort((a, b) => {
    if ((b.marketplace_score || 0) !== (a.marketplace_score || 0)) {
      return (b.marketplace_score || 0) - (a.marketplace_score || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });
}

async function recalculateAllMarketplaceScores() {
  const items = await MarketplaceItem.find({ status: "active" }).lean();
  for (const item of items) {
    const analytics = await ensureAnalyticsForItem(item);
    await recalculateAnalytics(analytics);
  }
  return getRankedMarketplaceItems({ status: "active" });
}

module.exports = {
  SCORE_WEIGHTS,
  calculateMarketplaceScore,
  trackMarketplaceEvent,
  attachAnalyticsToItems,
  getRankedMarketplaceItems,
  recalculateAllMarketplaceScores,
};
