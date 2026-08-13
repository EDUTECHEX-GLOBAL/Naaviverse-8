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

/**
 * Calculates the Bayesian Weighted Average Rating for an item.
 * Formula: Bayesian Average = (v * R + m * C) / (v + m)
 * 
 * @param {number} v - Rating count / volume
 * @param {number} R - Sample average rating (1.0 - 5.0)
 * @param {number} m - Confidence threshold weight (default = 5)
 * @param {number} C - Platform prior global mean (default = 4.0)
 */
function calculateBayesianAverage(v = 0, R = 0, m = 5, C = 4.0) {
  const count = Number(v) || 0;
  const avg = Number(R) || C;
  if (count <= 0) return Math.round(C * 100) / 100;
  const score = (count * avg + m * C) / (count + m);
  return Math.round(score * 100) / 100;
}

/**
 * Calculates 3-Pillars Composite Score (Stage Alignment, Relevance, Prominence)
 */
function calculateThreePillarScore(item = {}, studentContext = {}) {
  const analytics = toPlainAnalytics(item.analytics || item) || {};

  // Pillar 1: Stage Alignment (Proximity) — 35%
  let S_alignment = 80; // default benchmark
  if (studentContext.currentStepOrder && item.step_order) {
    const stepDiff = Math.abs(studentContext.currentStepOrder - item.step_order);
    S_alignment = clamp(100 - stepDiff * 20);
  }

  // Pillar 2: Relevance (Skill & Domain Match) — 35%
  let S_relevance = 85; // default benchmark
  if (studentContext.domain && item.category) {
    const isExactDomain = String(item.category).toLowerCase().includes(String(studentContext.domain).toLowerCase());
    S_relevance = isExactDomain ? 100 : 60;
  }

  // Pillar 3: Prominence (Bayesian Quality & Reliability) — 30%
  const bayesRating = calculateBayesianAverage(analytics.rating_count, analytics.average_rating);
  const bayesPct = clamp((bayesRating / 5) * 100);
  const completionPct = clamp(pct(analytics.completion_count, analytics.purchase_count));
  const conversionPct = clamp(pct(analytics.purchase_count, Math.max(analytics.views, analytics.clicks, 1)));
  const refundPenalty = ((analytics.refund_count || 0) + (analytics.complaint_count || 0)) * 10;

  const S_prominence = clamp((bayesPct * 0.40) + (completionPct * 0.30) + (conversionPct * 0.30) - refundPenalty);

  // Master 3-Pillars Score calculation
  const masterScore = (0.35 * S_alignment) + (0.35 * S_relevance) + (0.30 * S_prominence);

  return {
    master_score: Math.round(clamp(masterScore) * 100) / 100,
    pillars: {
      alignment: Math.round(S_alignment * 100) / 100,
      relevance: Math.round(S_relevance * 100) / 100,
      prominence: Math.round(S_prominence * 100) / 100,
      bayesian_rating: bayesRating,
    }
  };
}

function calculateMarketplaceScore(input = {}) {
  const analytics = toPlainAnalytics(input) || {};
  
  // Calculate Bayesian Rating score component
  const bayesRating = calculateBayesianAverage(analytics.rating_count, analytics.average_rating);
  const ratings = clamp((bayesRating / 5) * 100);

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
    bayesian_rating: bayesRating,
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
  
  // Gather all unique partner emails
  const partnerEmails = [...new Set(items.map(it => it.partner_email?.trim()).filter(Boolean))];
  
  // Query all matching partners in ONE SINGLE QUERY
  const Partner = require("../models/PartnerModel");
  const partners = await Partner.find({ email: { $in: partnerEmails } }).select("email partnerId").lean();
  
  // Create a map for constant-time lookup
  const partnerMap = new Map();
  partners.forEach(p => {
    if (p.email) partnerMap.set(p.email.toLowerCase().trim(), p.partnerId);
  });
  
  const enrichedItems = items.map(item => {
    const enriched = { ...item };
    const emailKey = item.partner_email?.toLowerCase().trim();
    if (emailKey && partnerMap.has(emailKey)) {
      enriched.checkoutType = "external";
      enriched.partnerId = partnerMap.get(emailKey);
    } else {
      enriched.checkoutType = "internal";
    }
    return enriched;
  });

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
  calculateBayesianAverage,
  calculateThreePillarScore,
  calculateMarketplaceScore,
  trackMarketplaceEvent,
  attachAnalyticsToItems,
  getRankedMarketplaceItems,
  recalculateAllMarketplaceScores,
};
