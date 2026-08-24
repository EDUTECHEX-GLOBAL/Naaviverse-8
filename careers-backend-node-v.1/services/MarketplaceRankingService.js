const mongoose = require("mongoose");
const MarketplaceItem = require("../models/MarketplaceModel");
const MarketplaceAnalytics = require("../models/MarketplaceAnalyticsModel");

// ── 10-Factor Weights matching marketplace_review.md (Total = 100%) ─────────────
const SCORE_WEIGHTS = {
  intentMatch: 0.25,
  pathStepMatch: 0.20,
  personalization: 0.12,
  partnerQuality: 0.10,
  popularity: 0.08,
  value: 0.08,
  partnerTrust: 0.07,
  availability: 0.04,
  freshness: 0.03,
  exploration: 0.03,
};

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const pct = (part, total) => (total > 0 ? (part / total) * 100 : 0);

const toPlainAnalytics = (analytics) => {
  if (!analytics) return null;
  if (typeof analytics.toObject === "function") return analytics.toObject();
  return analytics;
};

// ── 10 Individual Factor Scoring Functions ──────────────────────────────────

function computeIntentScore(item, query = "") {
  if (!query || !query.trim()) return 75; // Default standard intent match
  const q = query.toLowerCase().trim();
  const nameMatch = (item.name || "").toLowerCase().includes(q);
  const goalMatch = (item.goal || "").toLowerCase().includes(q);
  const roleMatch = (item.role || "").toLowerCase().includes(q);
  const categoryMatch = (item.category || "").toLowerCase().includes(q);

  if (nameMatch && (roleMatch || categoryMatch)) return 100;
  if (nameMatch) return 92;
  if (roleMatch || categoryMatch) return 85;
  if (goalMatch) return 78;
  return 40;
}

function computePathStepMatch(item, userPathId, userStepId) {
  const itemStep = String(item.step_id || "");
  const itemPath = String(item.path_id || "");
  const reqStep = String(userStepId || "");
  const reqPath = String(userPathId || "");

  if (reqStep && itemStep === reqStep && reqPath && itemPath === reqPath) return 100;
  if (reqStep && itemStep === reqStep) return 90;
  if (reqPath && itemPath === reqPath) return 75;
  return 55;
}

function computePersonalization(item, analytics, userContext = {}) {
  let score = 60;
  if (analytics?.purchase_count > 0) score += 20;
  if (analytics?.cart_additions > 0) score += 10;
  if (analytics?.wishlist_count > 0) score += 5;
  return clamp(score);
}

function computePartnerQuality(analytics) {
  if (!analytics || analytics.rating_count === 0) return 65;
  const ratingPart = (analytics.average_rating / 5) * 75;
  const confidencePart = Math.min(25, Math.log10(analytics.rating_count + 1) * 12.5);
  return clamp(ratingPart + confidencePart);
}

function computePopularity(analytics) {
  if (!analytics) return 30;
  const views = analytics.views || 0;
  const clicks = analytics.clicks || 0;
  const saves = analytics.wishlist_count || 0;
  const cart = analytics.cart_additions || 0;
  const purchases = analytics.purchase_count || 0;

  const raw = views * 1 + clicks * 2 + saves * 4 + cart * 7 + purchases * 12;
  return clamp(Math.min(100, Math.log10(raw + 1) * 35));
}

function computeValueScore(item) {
  const isFree = item.cost === 0 || item.access === "free" || (item.discount && String(item.discount).toLowerCase() === "free");
  if (isFree) return 95;

  const cost = Number(item.cost) || 0;
  if (cost <= 1000) return 85;
  if (cost <= 5000) return 75;
  if (cost <= 25000) return 65;
  return 55;
}

function computePartnerTrust(analytics) {
  if (!analytics) return 75;
  const base = analytics.partner_success_rate || 80;
  const refundPenalty = (analytics.refund_count || 0) * 6;
  const complaintPenalty = (analytics.complaint_count || 0) * 10;
  return clamp(base - refundPenalty - complaintPenalty);
}

function computeFreshness(item) {
  const created = new Date(item.createdAt || item.updatedAt || Date.now());
  const diffDays = Math.max(0, (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  return clamp(100 - diffDays * 0.4, 20, 100);
}

function computeExploration(item) {
  const hash = String(item._id || "").split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const created = new Date(item.createdAt || Date.now());
  const isNew = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24) <= 14;
  return clamp((hash % 40) + (isNew ? 60 : 30));
}

// ── 10-Factor Naavi Score Calculator ───────────────────────────────────────
function calculateMarketplaceScore(item = {}, inputAnalytics = {}, userContext = {}) {
  const analytics = toPlainAnalytics(inputAnalytics) || {};

  const intentMatch = computeIntentScore(item, userContext.searchQuery || userContext.intent);
  const pathStepMatch = computePathStepMatch(item, userContext.pathId, userContext.stepId);
  const personalization = computePersonalization(item, analytics, userContext);
  const partnerQuality = computePartnerQuality(analytics);
  const popularity = computePopularity(analytics);
  const value = computeValueScore(item);
  const partnerTrust = computePartnerTrust(analytics);
  const availability = item.status === "inactive" ? 0 : 100;
  const freshness = computeFreshness(item);
  const exploration = computeExploration(item);

  const breakdown = {
    intentMatch: Math.round(intentMatch),
    pathStepMatch: Math.round(pathStepMatch),
    personalization: Math.round(personalization),
    partnerQuality: Math.round(partnerQuality),
    popularity: Math.round(popularity),
    value: Math.round(value),
    partnerTrust: Math.round(partnerTrust),
    availability: Math.round(availability),
    freshness: Math.round(freshness),
    exploration: Math.round(exploration),
  };

  const rawScore = Object.entries(SCORE_WEIGHTS).reduce((total, [key, weight]) => {
    return total + (breakdown[key] || 0) * weight;
  }, 0);

  const naaviScore = Math.round(clamp(rawScore) * 10) / 10;

  return {
    marketplace_score: naaviScore,
    naavi_score: naaviScore,
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

async function recalculateAnalytics(item, analytics) {
  if (!analytics) return null;
  const nextScore = calculateMarketplaceScore(item, analytics);
  analytics.marketplace_score = nextScore.marketplace_score;
  analytics.naavi_score = nextScore.naavi_score;
  analytics.intent_score = nextScore.score_breakdown.intentMatch;
  analytics.path_match_score = nextScore.score_breakdown.pathStepMatch;
  analytics.step_match_score = nextScore.score_breakdown.pathStepMatch;
  analytics.personalization_score = nextScore.score_breakdown.personalization;
  analytics.rating_score = nextScore.score_breakdown.partnerQuality;
  analytics.review_confidence_score = nextScore.score_breakdown.partnerQuality;
  analytics.popularity_score = nextScore.score_breakdown.popularity;
  analytics.value_score = nextScore.score_breakdown.value;
  analytics.partner_trust_score = nextScore.score_breakdown.partnerTrust;
  analytics.availability_score = nextScore.score_breakdown.availability;
  analytics.freshness_score = nextScore.score_breakdown.freshness;
  analytics.exploration_score = nextScore.score_breakdown.exploration;
  analytics.score_breakdown = nextScore.score_breakdown;
  analytics.last_updated = new Date();
  return analytics.save();
}

async function trackMarketplaceEvent({ serviceId, action, value = 1, rating, partnerEmail }) {
  if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
    return null;
  }

  const item = await MarketplaceItem.findById(serviceId).lean();
  if (!item) return null;

  const analytics = await ensureAnalyticsForItem(item);
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

  return recalculateAnalytics(item, analytics);
}

async function attachAnalyticsToItems(items = [], userContext = {}) {
  const ids = items.map((item) => item._id).filter(Boolean);
  const analyticsRows = await MarketplaceAnalytics.find({ service_id: { $in: ids } }).lean();
  const analyticsByService = new Map(analyticsRows.map((row) => [String(row.service_id), row]));

  return items.map((item) => {
    const plain = typeof item.toObject === "function" ? item.toObject() : item;
    const analytics = analyticsByService.get(String(plain._id)) || null;
    const scoreObj = calculateMarketplaceScore(plain, analytics, userContext);

    return {
      ...plain,
      analytics,
      marketplace_score: scoreObj.naavi_score,
      naavi_score: scoreObj.naavi_score,
      score_breakdown: scoreObj.score_breakdown,
      average_rating: analytics?.average_rating || 4.0,
      rating_count: analytics?.rating_count || 0,
      purchase_count: analytics?.purchase_count || 0,
      completion_rate: analytics?.purchase_count
        ? Math.round(pct(analytics.completion_count, analytics.purchase_count))
        : 0,
    };
  });
}

// ── Diversity Rule: Prevent consecutive items with identical category/role ─
function applyDiversityRule(items = []) {
  if (items.length <= 2) return items;

  const result = [];
  const pool = [...items];

  while (pool.length > 0) {
    let nextIdx = 0;
    if (result.length >= 2) {
      const prev1Category = (result[result.length - 1].category || result[result.length - 1].role || "").toLowerCase();
      const prev2Category = (result[result.length - 2].category || result[result.length - 2].role || "").toLowerCase();

      if (prev1Category && prev1Category === prev2Category) {
        const altIdx = pool.findIndex((item) => {
          const cat = (item.category || item.role || "").toLowerCase();
          return cat !== prev1Category;
        });
        if (altIdx !== -1) {
          nextIdx = altIdx;
        }
      }
    }

    result.push(pool[nextIdx]);
    pool.splice(nextIdx, 1);
  }

  return result;
}

async function getRankedMarketplaceItems(filter = {}, userContext = {}) {
  const items = await MarketplaceItem.find(filter).lean();

  const partnerEmails = [...new Set(items.map((it) => it.partner_email?.trim()).filter(Boolean))];
  const Partner = require("../models/PartnerModel");
  const partners = await Partner.find({ email: { $in: partnerEmails } }).select("email partnerId").lean();

  const partnerMap = new Map();
  partners.forEach((p) => {
    if (p.email) partnerMap.set(p.email.toLowerCase().trim(), p.partnerId);
  });

  const enrichedItems = items.map((item) => {
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

  const withAnalytics = await attachAnalyticsToItems(enrichedItems, userContext);
  
  // Sort descending by Naavi Score
  const sorted = withAnalytics.sort((a, b) => {
    if ((b.naavi_score || 0) !== (a.naavi_score || 0)) {
      return (b.naavi_score || 0) - (a.naavi_score || 0);
    }
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  // Apply Diversity Rule to avoid repeated card types in a row
  return applyDiversityRule(sorted);
}

async function recalculateAllMarketplaceScores() {
  const items = await MarketplaceItem.find({ status: "active" }).lean();
  for (const item of items) {
    const analytics = await ensureAnalyticsForItem(item);
    await recalculateAnalytics(item, analytics);
  }
  return getRankedMarketplaceItems({ status: "active" });
}

module.exports = {
  SCORE_WEIGHTS,
  calculateMarketplaceScore,
  trackMarketplaceEvent,
  attachAnalyticsToItems,
  applyDiversityRule,
  getRankedMarketplaceItems,
  recalculateAllMarketplaceScores,
};