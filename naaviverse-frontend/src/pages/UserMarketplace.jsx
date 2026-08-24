import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserMarketplace.scss";
import axios from "axios";
import logActivity from "../utils/activityLogger";
import marketplaceReplacementService from "../services/marketplaceReplacementService";
import FindBetterMatchModal from "../components/MarketplaceReplacement/FindBetterMatchModal";
import AssistanceRequestModal from "../components/MarketplaceReplacement/AssistanceRequestModal";
import AssistanceChatDrawer from "../components/MarketplaceReplacement/AssistanceChatDrawer";

// Use process.env for Create React App
const API = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:4545";
const MONGO_ID_RE = /^[a-f\d]{24}$/i;

const LAYER_META = {
  macro: { label: "MACRO VIEW — FREE TOOLS", sub: "Free tools to get started.", badgeCls: "vsh-macro", cardCls: "vMacro" },
  micro: { label: "MICRO VIEW — SUBSCRIPTIONS", sub: "Structured progress tracking.", badgeCls: "vsh-micro", cardCls: "vMicro" },
  nano: { label: "NANO VIEW — 1-ON-1 SESSIONS", sub: "Book a personalised expert session.", badgeCls: "vsh-nano", cardCls: "vNano" },
};

const LAYER_ICON = {
  macro: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="8" rx="1" fill="#ede9fe" />
      <rect x="10" y="7" width="4" height="13" rx="1" fill="#c7d2fe" />
      <rect x="17" y="3" width="4" height="17" rx="1" fill="#6366f1" />
    </svg>
  ),
  micro: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  nano: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 6 3 6 3s6-1 6-3v-5" />
    </svg>
  ),
};

const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM", "6:00 PM", "8:00 PM"];

const LAYER_PILLS = [
  { key: "macro", label: "Macro" },
  { key: "micro", label: "Micro" },
  { key: "nano", label: "Nano" },
];

const CATEGORY_PILLS = [
  { key: "all", label: "All" },
  { key: "vendor", label: "Vendors" },
  { key: "mentor", label: "Mentors" },
  { key: "distributor", label: "Distributors" },
  { key: "institution", label: "Institutions" },
];

// High quality fallback sample data matching user screenshot
const DEMO_FALLBACK_ITEMS = [
  {
    _id: "demo_inst_1",
    name: "University of Toronto Economics Department Resources",
    category: "institution",
    role: "INSTITUTE",
    layer: "macro",
    cost: "0",
    // partner_email: "pathengine.admin@gmail.com",
    goal: "Official resources from the University of Toronto Economics Department to help you prepare for advanced study.",
    duration: "Self-Paced",
    discount: "None",
    marketplace_score: 85,
    average_rating: 4.0
  },
  {
    _id: "demo_inst_2",
    name: "Coursera University of Toronto Economics Specialization",
    category: "institution",
    role: "COURSE",
    layer: "macro",
    cost: "300500",
    // partner_email: "pathengine.admin@gmail.com",
    goal: "A series of online courses from the University of Toronto Economics Department to help you build a strong foundation.",
    duration: "4–6 Months",
    discount: "Financial Aid Available",
    marketplace_score: 90,
    average_rating: 4.0
  },
  {
    _id: "demo_inst_3",
    name: "Economics Institute of Canada",
    category: "institution",
    role: "INSTITUTE",
    layer: "macro",
    cost: "0",
    // partner_email: "pathengine.admin@gmail.com",
    goal: "A leading institute for economics education and research in Canada, offering programs and scholarships.",
    duration: "Varies by Program",
    discount: "Scholarships Available",
    marketplace_score: 88,
    average_rating: 4.0
  },
  {
    _id: "demo_vendor_1",
    name: "Global Financial Data & Analytics Toolkit",
    category: "vendor",
    role: "VENDOR",
    layer: "macro",
    cost: "0",
    // partner_email: "fin.tools@pathengine.io",
    goal: "Interactive data visualization and analysis tools tailored for macroeconomic modeling.",
    duration: "Self-Paced",
    discount: "Free License",
    marketplace_score: 92,
    average_rating: 4.5
  },
  {
    _id: "demo_vendor_2",
    name: "Enterprise Business Intelligence Platform",
    category: "vendor",
    role: "VENDOR",
    layer: "macro",
    cost: "45000",
    // partner_email: "vendor.admin@pathengine.io",
    goal: "Comprehensive analytics suite providing real-time data feeds and automated reporting.",
    duration: "1 Year Access",
    discount: "15% Institutional",
    marketplace_score: 82,
    average_rating: 4.2
  },
  {
    _id: "demo_mentor_1",
    name: "1-on-1 Academic Advisory & Admission Guidance",
    category: "mentor",
    role: "MENTOR",
    layer: "macro",
    cost: "0",
    // partner_email: "mentor.prep@pathengine.com",
    goal: "Personalized mentorship sessions covering application strategy and academic roadmap.",
    duration: "3 Sessions",
    discount: "Free Trial",
    marketplace_score: 96,
    average_rating: 4.9
  },
  {
    _id: "demo_distro_1",
    name: "North America Higher Ed Distribution Network",
    category: "distributor",
    role: "DISTRIBUTOR",
    layer: "macro",
    cost: "0",
    // partner_email: "distro@pathengine.com",
    goal: "Distribution access across universities and partner institutions for academic materials.",
    duration: "Ongoing",
    discount: "Full Grant",
    marketplace_score: 84,
    average_rating: 4.1
  },
  {
    _id: "demo_inst_4",
    name: "Canadian Centre for Advanced Economic Policy",
    category: "institution",
    role: "INSTITUTE",
    layer: "macro",
    cost: "125000",
    // partner_email: "pathengine.admin@gmail.com",
    goal: "Policy analysis, econometric research papers, and executive certification modules.",
    duration: "2 Months",
    discount: "Early Bird 10%",
    marketplace_score: 87,
    average_rating: 4.4
  }
];

const getItemCategory = (item) => {
  return (item?.category || item?.role || "vendor").toLowerCase();
};

const isFreeItem = (s) => {
  if (!s.cost) return true;
  const val = String(s.cost).trim().toLowerCase();
  return val === "0" || val === "free" || val === "";
};

const itemPrice = (s) => {
  if (isFreeItem(s)) return 0;
  const raw = String(s.cost).replace(/[^0-9]/g, "");
  return parseInt(raw, 10) || 0;
};

const getCostDisplay = (s) => {
  if (isFreeItem(s)) return "Free";
  const price = itemPrice(s);
  return `₹${price.toLocaleString("en-IN")}`;
};

const fmtPrice = (n) => (n === 0 ? "Free" : `₹${n.toLocaleString("en-IN")}`);

const getMarketplaceStarRating = (item) => {
  const avg = Number(item?.average_rating || item?.analytics?.average_rating || item?.rating || 0);
  if (avg > 0) return Math.min(5, Math.max(1, avg)).toFixed(1);

  const score = Number(item?.naavi_score || item?.marketplace_score || item?.analytics?.marketplace_score || 0);
  if (score > 0) {
    // Scaled realistically between 3.8 and 4.9 based on Naavi Score
    const derived = 3.8 + (score / 100) * 1.1;
    return Math.min(4.9, Math.max(3.8, derived)).toFixed(1);
  }

  // Deterministic fallback rating based on item ID hash (e.g. 4.0, 4.3, 4.7)
  const hash = String(item?._id || item?.name || "1").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hashRating = (4.0 + (hash % 10) * 0.1).toFixed(1);
  return hashRating;
};

const genOrderId = () => `#NV-${Math.floor(100000 + Math.random() * 900000)}`;
const fmtDate = (d) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// ─── Compact Feedback Strip ──────────────────────────────────────────────────
const FeedbackStrip = ({ value = {}, onChange }) => {
  const [selected, setSelected] = useState(value.action || "");
  const [commentText, setCommentText] = useState(value.comment || "");
  const [showComment, setShowComment] = useState(false);

  useEffect(() => {
    if (value.action !== undefined) {
      setSelected(value.action);
      if (value.action === "comment") {
        setShowComment(true);
      }
    }
    if (value.comment !== undefined) {
      setCommentText(value.comment);
    }
  }, [value.action, value.comment]);

  const handleAction = (action) => {
    if (action === "comment") {
      setShowComment(!showComment);
    } else {
      const isSelected = selected === action;
      const nextAction = isSelected ? "" : action;
      setSelected(nextAction);
      setShowComment(false);
      onChange({
        action: nextAction,
        comment: "",
        skipped: nextAction === "skip",
      });
    }
  };

  const handleSubmitComment = (e) => {
    e.stopPropagation();
    onChange({
      action: "comment",
      comment: commentText,
      skipped: false,
    });
    setSelected("comment_submitted");
    setShowComment(false);
  };

  const clearFeedback = (e) => {
    e.stopPropagation();
    setSelected("");
    setCommentText("");
    setShowComment(false);
    onChange({ action: "", comment: "", skipped: false });
  };

  return (
    <div className="feedback-compact-container" onClick={(e) => e.stopPropagation()}>
      <div className="feedback-compact-row">
        <span className="feedback-prompt">Helpful?</span>
        <div className="feedback-actions">
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "helpful" ? "active active--helpful" : ""}`}
            onClick={() => handleAction("helpful")}
            title="Mark Helpful"
          >
            👍
          </button>
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "notRelevant" ? "active active--not-relevant" : ""}`}
            onClick={() => handleAction("notRelevant")}
            title="Mark Not Relevant"
          >
            👎
          </button>
          <button
            type="button"
            className={`feedback-icon-btn ${selected === "comment" || selected === "comment_submitted" ? "active active--comment" : ""}`}
            onClick={() => handleAction("comment")}
            title="Add Comment"
          >
            💬
          </button>
          {(selected || commentText) && (
            <button
              type="button"
              className="feedback-clear-btn"
              onClick={clearFeedback}
              title="Clear Feedback"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {showComment && (
        <div className="feedback-comment-input-area">
          <textarea
            className="feedback-comment-textarea"
            placeholder="Type your feedback..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button
            type="button"
            className="feedback-comment-submit-btn"
            onClick={handleSubmitComment}
          >
            Submit
          </button>
        </div>
      )}

      {selected && selected !== "comment" && !showComment && (
        <div className="feedback-note-inline">
          {selected === "helpful" && "Marked as helpful"}
          {selected === "notRelevant" && "Marked as not relevant"}
          {selected === "comment_submitted" && "Comment submitted"}
        </div>
      )}
    </div>
  );
};

// ─── Naavi Ranking Algorithm ───────────────────────────────────────────────
const NAAVI_WEIGHTS = {
  intent: 0.25,
  path: 0.20,
  personalization: 0.12,
  quality: 0.10,
  popularity: 0.08,
  value: 0.08,
  trust: 0.07,
  avail: 0.04,
  fresh: 0.03,
  explore: 0.03,
};

function computeRatingScore(s) {
  const rating = Number(s.rating || s.average_rating || 4.0);
  const reviews = Number(s.reviews || s.rating_count || 120);
  return Math.min(1, (rating / 5) * Math.min(1, Math.log10(reviews + 10) / 3));
}

function computeNaaviScore(s) {
  const ratingScore = computeRatingScore(s);
  const intent = s.intent ?? (s.score_breakdown?.intentMatch ? s.score_breakdown.intentMatch / 100 : 0.85);
  const path = s.path ?? (s.score_breakdown?.pathStepMatch ? s.score_breakdown.pathStepMatch / 100 : 0.80);
  const personalization = s.personalization ?? 0.75;
  const quality = s.quality ?? (s.score_breakdown?.partnerQuality ? s.score_breakdown.partnerQuality / 100 : 0.80);
  const popularity = s.popularity ?? (s.score_breakdown?.popularity ? s.score_breakdown.popularity / 100 : 0.70);
  const value = s.value ?? (s.score_breakdown?.value ? s.score_breakdown.value / 100 : 0.75);
  const trust = s.trust ?? (s.score_breakdown?.partnerTrust ? s.score_breakdown.partnerTrust / 100 : 0.85);
  const avail = s.avail ?? (s.status === "inactive" ? 0 : 1.0);
  const fresh = s.fresh ?? 0.85;
  const explore = s.explore ?? 0.50;

  const raw = (
    intent * NAAVI_WEIGHTS.intent +
    path * NAAVI_WEIGHTS.path +
    personalization * NAAVI_WEIGHTS.personalization +
    (quality * 0.6 + ratingScore * 0.4) * NAAVI_WEIGHTS.quality +
    popularity * NAAVI_WEIGHTS.popularity +
    value * NAAVI_WEIGHTS.value +
    trust * NAAVI_WEIGHTS.trust +
    avail * NAAVI_WEIGHTS.avail +
    fresh * NAAVI_WEIGHTS.fresh +
    explore * NAAVI_WEIGHTS.explore
  );

  return Math.min(100, Math.max(1, Math.round(raw * 100)));
}

// Diversify pass (prevents 3+ of the same category in a row)
function diversify(list) {
  if (!list || list.length <= 2) return list;
  const buckets = {};
  list.forEach(s => {
    const c = s.cat || s.category || s.role || "University";
    (buckets[c] = buckets[c] || []).push(s);
  });
  const cats = Object.keys(buckets);
  const out = [];
  while (out.length < list.length) {
    let placed = false;
    for (const c of cats) {
      if (buckets[c].length) {
        const last = out[out.length - 1];
        const lastCat = last ? (last.cat || last.category || last.role || "") : "";
        if (!last || lastCat !== c) {
          out.push(buckets[c].shift());
          placed = true;
        }
      }
    }
    if (!placed) {
      for (const c of cats) {
        if (buckets[c].length) out.push(buckets[c].shift());
      }
    }
  }
  return out;
}

// Category pastel tag styling map
const CATEGORY_TAG_STYLES = {
  university: { label: "University", color: "#3E7BFA", bg: "#EAF1FF" },
  institute: { label: "Institute", color: "#D97706", bg: "#FFF6E4" },
  mentor: { label: "Mentor", color: "#8B5CF6", bg: "#F1EEFB" },
  bootcamp: { label: "Bootcamp", color: "#E5473C", bg: "#FDEBEA" },
  certification: { label: "Certification", color: "#1FA655", bg: "#E9F8EE" },
  course: { label: "Course", color: "#1FA655", bg: "#E9F8EE" },
  vendor: { label: "Vendor", color: "#3E7BFA", bg: "#EAF1FF" },
  distributor: { label: "Distributor", color: "#8B5CF6", bg: "#F1EEFB" },
};

const getCategoryMeta = (item) => {
  const cat = String(item.cat || item.category || item.role || "University").toLowerCase();
  return CATEGORY_TAG_STYLES[cat] || { label: cat.toUpperCase(), color: "#3E7BFA", bg: "#EAF1FF" };
};

// ─── Component 2: <MarketplaceCard /> ─────────────────────────────────────────
const MarketplaceCard = ({
  service,
  isFirstRelevanceMatch,
  inCart,
  onToggleCart,
  onCardView,
  isPurchased,
  replacementCount = 0,
  whyRecommended = [],
  onFindBetterMatch,
  onRequestAssistance,
}) => {
  const free = isFreeItem(service);
  const isExternal = service.checkoutType === "external";
  const catMeta = getCategoryMeta(service);
  const ratingVal = getMarketplaceStarRating(service);
  const scorePct = service.naaviScore || computeNaaviScore(service);

  // Breakdown metrics for hover tooltip
  const intentPct = Math.round((service.intent ?? (service.score_breakdown?.intentMatch ? service.score_breakdown.intentMatch / 100 : 0.85)) * 100);
  const pathPct = Math.round((service.path ?? (service.score_breakdown?.pathStepMatch ? service.score_breakdown.pathStepMatch / 100 : 0.80)) * 100);
  const personalizationPct = Math.round((service.personalization ?? 0.75) * 100);
  const qualityPct = Math.round((service.quality ?? (service.score_breakdown?.partnerQuality ? service.score_breakdown.partnerQuality / 100 : 0.80)) * 100);
  const popularityPct = Math.round((service.popularity ?? (service.score_breakdown?.popularity ? service.score_breakdown.popularity / 100 : 0.70)) * 100);

  const reviewCount = service.reviews || service.rating_count || (120 + ((service.name?.length || 0) * 17) % 850);

  return (
    <div
      className={`mkt-card ${isExternal ? "mkt-card--external" : ""} ${isPurchased ? "mkt-card--purchased" : ""} ${replacementCount > 0 ? "mkt-card--replacement" : ""
        }`}
      onClick={() => onCardView && onCardView(service)}
    >
      <div className="mkt-card__body">
        {/* Top Header Row: Category Tag Pill + Replacement Badge or Best Match Badge / Rating */}
        <div className="mkt-card__header">
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              className="mkt-card__cat-pill"
              style={{ color: catMeta.color, backgroundColor: catMeta.bg }}
            >
              {catMeta.label}
            </span>

            {replacementCount > 0 && (
              <span className="mkt-card__replacement-badge" title="Recommendation Replacement">
                {/* Replacement {replacementCount} of 3 */}
              </span>
            )}
          </div>

          {isFirstRelevanceMatch && replacementCount === 0 ? (
            <span className="mkt-card__best-match-badge" title="Highest Naavi Match Score">
              ⭑ Best match
            </span>
          ) : (
            <span className="mkt-card__rating" title="Rating">
              <span className="mkt-card__stars">★★★★★</span>
              <span className="mkt-card__rating-num">{ratingVal}</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="mkt-card__title">{service.name || "Unnamed Service"}</h3>

        {/* 2-line clamped Description */}
        <p className="mkt-card__desc">
          {service.desc || service.goal || "Provides comprehensive guidance, structured modules, and personalized tracking."}
        </p>

        {/* Why Recommended Transparency tags */}
        {whyRecommended && whyRecommended.length > 0 && (
          <div className="mkt-card__why-rec-list" onClick={(e) => e.stopPropagation()}>
            {whyRecommended.slice(0, 2).map((w, idx) => (
              <span key={idx} className="why-rec-chip">
                {w}
              </span>
            ))}
          </div>
        )}

        {/* Meta Row: Duration & Reviews */}
        <div className="mkt-card__meta-row">
          <span className="mkt-card__meta-item">⏱ {service.duration || "Self-Paced"}</span>
          <span className="mkt-card__meta-dot">•</span>
          <span className="mkt-card__meta-item">💬 {reviewCount.toLocaleString()} reviews</span>
        </div>

        {/* Match Meter (SIGNATURE ELEMENT) */}
        <div className="mkt-card__match-meter-wrap">
          <div className="mkt-card__match-label-row">
            <span className="mkt-card__match-text">{scorePct}% Match</span>
            <div className="mkt-card__info-icon-wrap">
              <span className="mkt-card__info-icon">ⓘ</span>
              <div className="mkt-card__tooltip" onClick={(e) => e.stopPropagation()}>
                <div className="mkt-card__tooltip-title">Naavi Factor Breakdown</div>
                <div className="mkt-card__tooltip-row">
                  <span>Intent Match</span>
                  <span>{intentPct}%</span>
                </div>
                <div className="mkt-card__tooltip-row">
                  <span>Path & Step</span>
                  <span>{pathPct}%</span>
                </div>
                <div className="mkt-card__tooltip-row">
                  <span>Personalization</span>
                  <span>{personalizationPct}%</span>
                </div>
                <div className="mkt-card__tooltip-row">
                  <span>Partner Quality</span>
                  <span>{qualityPct}%</span>
                </div>
                <div className="mkt-card__tooltip-row">
                  <span>Popularity</span>
                  <span>{popularityPct}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mkt-card__meter-track">
            <div
              className="mkt-card__meter-fill"
              style={{ width: `${Math.min(100, Math.max(5, scorePct))}%` }}
            />
          </div>
        </div>

        {/* Secondary Action: Find a Better Match or Super Admin Assistance */}
        <div className="mkt-card__better-match-row" onClick={(e) => e.stopPropagation()}>
          {replacementCount >= 3 ? (
            <button
              type="button"
              className="btn-escalate-admin"
              onClick={() => onRequestAssistance && onRequestAssistance(service)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 4, flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Still not right? Request Admin Assistance</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-find-better-match"
              onClick={() => onFindBetterMatch && onFindBetterMatch(service)}
            >
              <span>Not what you're looking for? <strong>Find a Better Match</strong></span>
            </button>
          )}
        </div>
      </div>

      <div className="mkt-card__divider" />

      {/* Bottom Row: Price & Green + Add Button */}
      <div className="mkt-card__footer">
        <div className="mkt-card__price-wrap">
          <span className="mkt-card__price">
            {free ? "Free" : `₹${itemPrice(service).toLocaleString("en-IN")}`}
          </span>
          {!free && <span className="mkt-card__price-sub">onwards</span>}
        </div>

        {isPurchased ? (
          <div className="mkt-card__purchased-badge">✓ Purchased</div>
        ) : (
          <button
            className={`mkt-card__add-btn ${inCart ? "added" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCart(service);
            }}
          >
            {inCart ? "✓ Added" : "+ Add"}
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Component 1: <MarketplaceFilterBar /> ───────────────────────────────────────
const MarketplaceFilterBar = ({
  filterState,
  onFilterChange,
  activeLayer,
  onLayerChange,
  categoryCounts,
  totalResults,
  onClearFilters,
  hasActiveFilters,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const barRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleCategoryToggle = (catKey) => {
    const current = filterState.categories || [];
    let updated;
    if (catKey === "all") {
      updated = [];
    } else if (current.includes(catKey)) {
      updated = current.filter((c) => c !== catKey);
    } else {
      updated = [...current, catKey];
    }
    onFilterChange({ ...filterState, categories: updated });
  };

  const isCatActive = (catKey) => {
    if (catKey === "all") return !filterState.categories || filterState.categories.length === 0;
    return filterState.categories?.includes(catKey);
  };

  const selectedCatCount = filterState.categories?.length || 0;

  return (
    <div className="mkt-filter-bar-sticky" ref={barRef}>
      <div className="mkt-filter-pills-row">
        {/* Sort Pill */}
        <div className="mkt-pill-wrap">
          <button
            className={`mkt-pill-btn ${filterState.sort !== "relevance" ? "active" : ""}`}
            onClick={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
          >
            <span>Sort ▾</span>
          </button>
          {openDropdown === "sort" && (
            <div className="mkt-pill-popover">
              {[
                { key: "relevance", label: "Relevance (Naavi Score)" },
                { key: "rating_desc", label: "Highest Rated" },
                { key: "price_asc", label: "Price: Low to High" },
                { key: "price_desc", label: "Price: High to Low" },
                { key: "newest", label: "Newest Arrivals" },
              ].map((opt) => (
                <div
                  key={opt.key}
                  className={`mkt-popover-item ${filterState.sort === opt.key ? "selected" : ""}`}
                  onClick={() => {
                    onFilterChange({ ...filterState, sort: opt.key });
                    setOpenDropdown(null);
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Pill (Multi-select) */}
        <div className="mkt-pill-wrap">
          <button
            className={`mkt-pill-btn ${selectedCatCount > 0 ? "active" : ""}`}
            onClick={() => setOpenDropdown(openDropdown === "category" ? null : "category")}
          >
            <span>
              Category {selectedCatCount > 0 && `(${selectedCatCount})`} ▾
            </span>
          </button>
          {openDropdown === "category" && (
            <div className="mkt-pill-popover mkt-pill-popover--wide">
              <div
                className={`mkt-popover-item ${selectedCatCount === 0 ? "selected" : ""}`}
                onClick={() => handleCategoryToggle("all")}
              >
                <span className="mkt-popover-title">All Categories</span>
                <span className="mkt-popover-count">{categoryCounts.all || 0}</span>
              </div>
              {[
                { key: "institution", label: "Institutions" },
                { key: "mentor", label: "Mentors" },
                { key: "vendor", label: "Vendors" },
                { key: "distributor", label: "Distributors" },
              ].map((cat) => (
                <div
                  key={cat.key}
                  className={`mkt-popover-item ${isCatActive(cat.key) ? "selected" : ""}`}
                  onClick={() => handleCategoryToggle(cat.key)}
                >
                  <span className="mkt-popover-chk">
                    <span className="mkt-chk-box">{isCatActive(cat.key) ? "✓" : ""}</span>
                    <span className="mkt-popover-title">{cat.label}</span>
                  </span>
                  <span className="mkt-popover-count">{categoryCounts[cat.key] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rating Pill (Google Maps Style) */}
        <div className="mkt-pill-wrap">
          <button
            className={`mkt-pill-btn ${filterState.minRating > 0 ? "active" : ""}`}
            onClick={() => setOpenDropdown(openDropdown === "rating" ? null : "rating")}
          >
            <span>
              Rating {filterState.minRating > 0 && `(${filterState.minRating}+ ★)`} ▾
            </span>
          </button>
          {openDropdown === "rating" && (
            <div className="mkt-pill-popover mkt-pill-popover--rating">
              {[
                { val: 0, label: "Any rating", stars: "" },
                { val: 2.0, label: "2.0", stars: "★★☆☆☆" },
                { val: 2.5, label: "2.5", stars: "★★★☆☆" },
                { val: 3.0, label: "3.0", stars: "★★★☆☆" },
                { val: 3.5, label: "3.5", stars: "★★★★☆" },
                { val: 4.0, label: "4.0", stars: "★★★★☆" },
                { val: 4.5, label: "4.5", stars: "★★★★★" },
              ].map((r) => (
                <div
                  key={r.val}
                  className={`mkt-popover-item mkt-popover-item--rating ${filterState.minRating === r.val ? "selected" : ""}`}
                  onClick={() => {
                    onFilterChange({ ...filterState, minRating: r.val });
                    setOpenDropdown(null);
                  }}
                >
                  {r.val === 0 ? (
                    <span className="mkt-rating-any-label">{r.label}</span>
                  ) : (
                    <div className="mkt-rating-option-row">
                      <span className="mkt-rating-num">{r.label}</span>
                      <span className="mkt-rating-stars-gold">{r.stars}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Pill */}
        <div className="mkt-pill-wrap">
          <button
            className={`mkt-pill-btn ${filterState.priceRange !== "all" ? "active" : ""}`}
            onClick={() => setOpenDropdown(openDropdown === "price" ? null : "price")}
          >
            <span>Price {filterState.priceRange !== "all" && `(${filterState.priceRange})`} ▾</span>
          </button>
          {openDropdown === "price" && (
            <div className="mkt-pill-popover">
              {[
                { key: "all", label: "All Prices" },
                { key: "free", label: "Free Only" },
                { key: "under1000", label: "Under ₹1,000" },
                { key: "under10000", label: "Under ₹10,000" },
                { key: "paid", label: "Paid Only" },
              ].map((p) => (
                <div
                  key={p.key}
                  className={`mkt-popover-item ${filterState.priceRange === p.key ? "selected" : ""}`}
                  onClick={() => {
                    onFilterChange({ ...filterState, priceRange: p.key });
                    setOpenDropdown(null);
                  }}
                >
                  {p.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Path Match Pill */}
        <div className="mkt-pill-wrap">
          <button
            className={`mkt-pill-btn ${filterState.pathStrong ? "active" : ""}`}
            onClick={() => {
              onFilterChange({ ...filterState, pathStrong: !filterState.pathStrong });
            }}
          >
            <span>Path match: {filterState.pathStrong ? "Strong only" : "All"}</span>
          </button>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button className="mkt-clear-pill-btn" onClick={onClearFilters}>
            ✕ Clear filters
          </button>
        )}
      </div>

      <div className="mkt-filter-meta-right">
        <span className="mkt-total-counter">{totalResults} Services</span>
      </div>
    </div>
  );
};

// ─── Component 3: <MarketplaceGrid /> ──────────────────────────────────────────
const MarketplaceGrid = ({
  services,
  sortMode,
  inCart,
  onToggleCart,
  onCardView,
  purchasedIds = [],
  replacementCount = 0,
  whyRecommended = [],
  onFindBetterMatch,
  onRequestAssistance,
}) => {
  if (!services || services.length === 0) {
    return (
      <div className="mkt-status-box">
        <div style={{ fontSize: 36 }}>🔍</div>
        <p>No services found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="mkt-grid">
      {services.map((service, index) => {
        const isPurchased = purchasedIds.includes(service._id);
        const isFirstRelevance = index === 0 && sortMode === "relevance";

        return (
          <div key={service._id || index} className="mkt-grid-item-fade">
            <MarketplaceCard
              service={service}
              isFirstRelevanceMatch={isFirstRelevance}
              inCart={inCart(service._id)}
              onToggleCart={onToggleCart}
              onCardView={onCardView}
              isPurchased={isPurchased}
              replacementCount={isFirstRelevance ? replacementCount : 0}
              whyRecommended={isFirstRelevance ? whyRecommended : []}
              onFindBetterMatch={onFindBetterMatch}
              onRequestAssistance={onRequestAssistance}
            />
          </div>
        );
      })}
    </div>
  );
};

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
const CartDrawer = ({ cart, onRemove, onClose, onCheckout }) => {
  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;
  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cd-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8, verticalAlign: "middle" }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            Your Cart
          </h2>
          <button className="cd-close" onClick={onClose}>✕</button>
        </div>
        {cart.length === 0 ? (
          <div className="cd-empty">
            <div className="cd-empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <p className="cd-empty-title">Cart is empty</p>
            <p className="cd-empty-sub">Browse the marketplace to add services.</p>
          </div>
        ) : (
          <>
            <div className="cd-items">
              {cart.map((s) => {
                const layer = s.layer?.toLowerCase() || "macro";
                return (
                  <div className="cart-item" key={s._id}>
                    <div className="ci-ico">
                      {LAYER_ICON[layer] || LAYER_ICON.macro}
                    </div>
                    <div className="ci-inf">
                      <div className="ci-name">{s.name}</div>
                      <div className="ci-meta">
                        <span className={`ci-layer ci-${layer}`}>{layer.charAt(0).toUpperCase() + layer.slice(1)}</span>
                        {s.role && <span>{s.role}</span>}
                        <span>by {s.partner_email}</span>
                      </div>
                    </div>
                    <div className="ci-price">{fmtPrice(itemPrice(s))}</div>
                    <button className="ci-rm" onClick={() => onRemove(s._id)}>✕</button>
                  </div>
                );
              })}
            </div>
            <div className="cart-sum">
              <div className="cs-r"><span>Subtotal ({cart.length} items)</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
              <div className="cs-r"><span>GST (18%)</span><span>₹{tax.toLocaleString("en-IN")}</span></div>
              <div className="cs-r tot"><span>Total Payable</span><span>₹{total.toLocaleString("en-IN")}</span></div>
              <button className="chk-btn" onClick={onCheckout}>Proceed to Checkout →</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Step Progress Bar matching screenshot ──────────────────────────────────────
const StepBar = ({ currentPage, onStepChange }) => {
  const steps = [
    { key: "currentStep", label: "Current Step", n: 1 },
    { key: "marketplace", label: "Marketplace", n: 2 },
    { key: "cart", label: "Cart", n: 3 },
    { key: "checkout", label: "Checkout", n: 4 },
    { key: "confirmed", label: "Confirmed", n: 5 },
  ];
  const order = steps.map((s) => s.key);
  const ci = order.indexOf(currentPage);
  return (
    <div className="step-bar">
      {steps.map((s, i) => {
        const done = i < ci;
        const active = i === ci;
        return (
          <React.Fragment key={s.key}>
            <div
              className={`sp ${done ? "done" : ""} ${active ? "active" : ""}`}
              onClick={() => done && onStepChange && onStepChange(s.key)}
              style={{ cursor: done ? "pointer" : "default" }}
            >
              <span className="sp-n">{done ? "✓" : s.n}</span>
              <span className="sp-lbl">{s.label}</span>
            </div>
            {i < steps.length - 1 && <span className="sp-arr">›</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Checkout Page ────────────────────────────────────────────────────────────
const CheckoutPage = ({ cart, onConfirm, onBack }) => {
  const userRaw = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const userEmail = userRaw?.user?.email || userRaw?.email || "guest@naaviverse.com";
  const userName = userRaw?.user?.displayName || userRaw?.displayName || "Guest User";

  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState("");
  const [prefDate, setPrefDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("10:00 AM");
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const subtotal = cart.reduce((a, s) => a + itemPrice(s), 0);
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax;

  const handlePayClick = () => {
    const errors = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
    if (!phone.trim()) errors.phone = "Phone number is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setPayError("Please fill in all required fields before proceeding.");
      return;
    }

    setFieldErrors({});
    setPayError("");

    const externalItem = cart.find((item) => item.checkoutType === "external");

    if (externalItem) {
      sessionStorage.setItem("naaviExclusiveItem", JSON.stringify(externalItem));
      sessionStorage.setItem("naaviExclusiveReturnPath", "/dashboard/users/Marketplace");
      sessionStorage.setItem(
        "naaviExclusiveStudentDetails",
        JSON.stringify({
          fullName,
          email,
          phone,
        })
      );
      localStorage.setItem("naaviExclusiveItemId", externalItem._id);
      window.open(`/naavi-exclusive/${externalItem.partnerId || ""}`, "_blank");
      onBack();
      return;
    }

    setSubmitting(true);

    axios
      .post(`${process.env.REACT_APP_API_BASE_URL || ""}/api/payment/mock-purchase`, {
        userEmail: email,
        items: cart.map((item) => ({
          _id: item._id,
          name: item.name,
          layer: item.layer,
          cost: item.cost,
          partnerId: item.partnerId || null,
          partner_email: item.partner_email || null,
        })),
        total,
        orderId: genOrderId(),
      })
      .then((res) => {
        setSubmitting(false);
        onConfirm({
          orderId: res.data?.orderId || genOrderId(),
          total,
          itemCount: cart.length,
          date: new Date(),
          studentEmail: email,
          item: cart[0],
        });
      })
      .catch((err) => {
        console.error("Mock purchase API failed:", err);
        setSubmitting(false);
        onConfirm({
          orderId: genOrderId(),
          total,
          itemCount: cart.length,
          date: new Date(),
          studentEmail: email,
          item: cart[0],
        });
      });
  };

  return (
    <div className="checkout-page">
      <div className="chk-layout">
        <div className="chk-left">
          <h1 className="chk-title">Checkout</h1>
          <div className="chk-section">
            <div className="chk-section-lbl">
              Personal Details <span className="req-note">* All fields required</span>
            </div>
            <div className={`chk-field ${fieldErrors.fullName ? "field-error" : ""}`}>
              <label>
                Full Name <span className="req-star">*</span>
              </label>
              <input
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setFieldErrors((p) => ({ ...p, fullName: "" }));
                }}
                placeholder="Your full name"
                className={fieldErrors.fullName ? "input-err" : ""}
              />
              {fieldErrors.fullName && <span className="err-msg">{fieldErrors.fullName}</span>}
            </div>
            <div className={`chk-field ${fieldErrors.email ? "field-error" : ""}`}>
              <label>
                Email Address <span className="req-star">*</span>
              </label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((p) => ({ ...p, email: "" }));
                }}
                placeholder="your@email.com"
                className={fieldErrors.email ? "input-err" : ""}
              />
              {fieldErrors.email && <span className="err-msg">{fieldErrors.email}</span>}
            </div>
            <div className={`chk-field ${fieldErrors.phone ? "field-error" : ""}`}>
              <label>
                Phone Number <span className="req-star">*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setFieldErrors((p) => ({ ...p, phone: "" }));
                }}
                placeholder="+91 98765 43210"
                className={fieldErrors.phone ? "input-err" : ""}
              />
              {fieldErrors.phone && <span className="err-msg">{fieldErrors.phone}</span>}
            </div>
          </div>
          <div className="chk-section">
            <div className="chk-section-lbl">Schedule Session</div>
            <div className="chk-field">
              <label>Preferred Date</label>
              <input type="date" value={prefDate} onChange={(e) => setPrefDate(e.target.value)} />
            </div>
            <div className="chk-field">
              <label>Select Time Slot</label>
              <div className="time-slots">
                {TIME_SLOTS.map((t) => (
                  <div key={t} className={`time-slot ${timeSlot === t ? "active" : ""}`} onClick={() => setTimeSlot(t)}>
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="chk-section">
            <div className="chk-section-lbl">Payment</div>
            <div className="rzp-pay-note">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle", flexShrink: 0 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Secured Checkout Simulation. Choose pay button below to proceed.
            </div>
            {payError && <div className="rzp-pay-error">{payError}</div>}
          </div>
        </div>
        <div className="chk-right">
          <div className="order-summary">
            <div className="os-title">Order Summary</div>
            <div className="os-items">
              {cart.map((s) => (
                <div className="os-row" key={s._id}>
                  <span className="os-ico">{LAYER_ICON[s.layer?.toLowerCase() || "macro"]}</span>
                  <span className="os-name">{s.name}</span>
                  <span className="os-price">{getCostDisplay(s)}</span>
                </div>
              ))}
            </div>
            <div className="os-divider" />
            <div className="os-sum-row">
              <span>GST (18%)</span>
              <span>₹{tax === 0 ? "0" : tax.toLocaleString("en-IN")}</span>
            </div>
            <div className="os-sum-row os-total">
              <span>Total</span>
              <span>₹{total === 0 ? "0" : total.toLocaleString("en-IN")}</span>
            </div>
            <button className="os-pay-btn rzp-pay-btn" onClick={handlePayClick} disabled={submitting}>
              {submitting ? (
                <span className="rzp-btn-inner">
                  <span className="rzp-mini-spinner" /> Processing Mock Payment…
                </span>
              ) : (
                <span className="rzp-btn-inner">Pay ₹{total === 0 ? "0" : total.toLocaleString("en-IN")}</span>
              )}
            </button>
            <p className="rzp-secure-text">100% Secure. Mock checkout processor active.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Confirmed Page ───────────────────────────────────────────────────────────
const ConfirmedPage = ({ orderInfo, onBackToJourney }) => (
  <div className="confirmed-page">
    <div className="conf-card">
      <div className="conf-check">✓</div>
      <h2 className="conf-title">Booking Confirmed!</h2>
      <p className="conf-sub">Your services have been booked successfully. You'll receive a confirmation email with session details and next steps.</p>
      <div className="conf-details">
        <div className="conf-row">
          <span>Order ID</span>
          <span className="conf-val">{orderInfo.orderId}</span>
        </div>
        <div className="conf-row">
          <span>Services Booked</span>
          <span className="conf-val">
            {orderInfo.itemCount} item{orderInfo.itemCount !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="conf-row">
          <span>Amount Paid</span>
          <span className="conf-val">₹{orderInfo.total === 0 ? "0" : orderInfo.total.toLocaleString("en-IN")}</span>
        </div>
        <div className="conf-row">
          <span>Date</span>
          <span className="conf-val">{fmtDate(orderInfo.date)}</span>
        </div>
      </div>
      <button className="conf-back-btn" onClick={onBackToJourney}>
        ← Back to My Journey
      </button>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const UserMarketplace = ({ onStepChange }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const userRaw = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();
  const userEmail = userRaw?.user?.email || userRaw?.email || "guest@naaviverse.com";
  const userName = userRaw?.user?.displayName || userRaw?.displayName || "Student";
  const stepId = localStorage.getItem("selectedStepId") || "default_step";
  const pathId = localStorage.getItem("selectedPathId") || "default_path";
  const pathName = localStorage.getItem("selectedPathName") || "Career Path";
  const stepName = localStorage.getItem("selectedStepName") || "Learning Step";

  // ── Component state ────────────────────────────────────────────────────────
  const [page, setPage] = useState("marketplace");
  const [activeLayer, setActiveLayer] = useState(
    location.state?.defaultTab?.toLowerCase() || location.state?.view?.toLowerCase() || "macro"
  );
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const [openDropdown, setOpenDropdown] = useState(null);

  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [items, setItems] = useState(DEMO_FALLBACK_ITEMS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderInfo, setOrderInfo] = useState(null);
  const [marketplaceFeedback, setMarketplaceFeedback] = useState({});
  const [exclusiveSuccessToast, setExclusiveSuccessToast] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState(new Set());
  const trackedViewsRef = useRef(new Set());
  const dropdownRef = useRef(null);

  // ── Replacement & Assistance State ──
  const [replacementState, setReplacementState] = useState(() =>
    marketplaceReplacementService.getReplacementState(stepId, userEmail)
  );
  const [betterMatchModalOpen, setBetterMatchModalOpen] = useState(false);
  const [assistanceModalOpen, setAssistanceModalOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [selectedServiceForMatch, setSelectedServiceForMatch] = useState(null);
  const [assistanceTickets, setAssistanceTickets] = useState([]);

  useEffect(() => {
    const st = marketplaceReplacementService.getReplacementState(stepId, userEmail);
    const actualCount = Math.min(3, st.feedbackHistory?.length ?? st.count ?? 0);
    setReplacementState({
      ...st,
      count: actualCount,
    });
    marketplaceReplacementService.getUserAssistanceRequests(userEmail).then((res) => {
      setAssistanceTickets(res || []);
    });
  }, [stepId, userEmail]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const trackMarketplaceAnalytics = async (item, action) => {
    if (!item?._id || !MONGO_ID_RE.test(String(item._id))) return;
    try {
      await axios.post(`${API}/api/marketplace/analytics`, {
        service_id: item._id,
        action,
      });
    } catch (err) {
      console.error("Marketplace analytics update failed:", err);
    }
  };

  useEffect(() => {
    if (location.state?.view) setActiveLayer(location.state.view.toLowerCase());
  }, [location.state?.view]);

  useEffect(() => {
    if (location.state?.exclusiveSuccess) {
      setExclusiveSuccessToast({
        orderId: location.state.orderId || "",
        itemName: location.state.purchasedItem?.name || "Service",
      });
      setCart([]);
      const t = setTimeout(() => setExclusiveSuccessToast(null), 8000);
      return () => clearTimeout(t);
    }
  }, [location.state?.exclusiveSuccess, location.state?.orderId, location.state?.purchasedItem?.name]);

  useEffect(() => {
    const handleSuccess = (raw) => {
      try {
        const data = JSON.parse(raw);
        setExclusiveSuccessToast({ orderId: data.orderId || "", itemName: data.itemName || "Service" });
        setCart([]);
        localStorage.removeItem("naaviExclusiveSuccess");
        setTimeout(() => setExclusiveSuccessToast(null), 8000);
      } catch (e) {
        /* ignore */
      }
    };

    const onStorage = (e) => {
      if (e.key === "naaviExclusiveSuccess" && e.newValue) {
        handleSuccess(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);

    const interval = setInterval(() => {
      const raw = localStorage.getItem("naaviExclusiveSuccess");
      if (raw) {
        handleSuccess(raw);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!userEmail) return;
    axios
      .get(`${API}/api/payment/user-purchases`, { params: { email: userEmail } })
      .then((res) => {
        const purchases = res.data?.purchases || [];
        setPurchasedIds(new Set(purchases.map((p) => p.productId)));
      })
      .catch((err) => console.error("Failed to load user purchases:", err));
  }, [userEmail]);

  // Fetch marketplace items from DB, fallback to demo items if empty
  useEffect(() => {
    if (!stepId || !MONGO_ID_RE.test(stepId)) {
      setItems(DEMO_FALLBACK_ITEMS);
      return;
    }
    setLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL || "http://localhost:4545"}/api/marketplace/step/${stepId}`)
      .then((res) => {
        const fetched = res.data?.data || [];
        setItems(fetched.length > 0 ? fetched : DEMO_FALLBACK_ITEMS);
      })
      .catch(() => setItems(DEMO_FALLBACK_ITEMS))
      .finally(() => setLoading(false));
  }, [stepId]);

  // New Filter state matching prompt requirements
  const [filterState, setFilterState] = useState({
    sort: "relevance",
    categories: [],
    minRating: 0,
    priceRange: "all",
    pathStrong: false,
  });

  // Filter & Sort Pipeline (Excluding rejected items)
  const categoryBaseItems = useMemo(() => {
    const q = searchQ.toLowerCase().trim();
    const rejectedSet = new Set((replacementState.rejectedItemIds || []).map((id) => String(id)));
    return items.filter((s) => {
      const sId = String(s._id || s.id);
      if (rejectedSet.has(sId)) return false; // Exclude rejected items
      const isLayerMatched = s.layer === activeLayer;
      const isSearchMatched =
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.partner_email?.toLowerCase().includes(q) ||
        s.goal?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q);
      return isLayerMatched && isSearchMatched;
    });
  }, [items, activeLayer, searchQ, replacementState.rejectedItemIds]);

  // Apply Hard Filters → Score → Diversify → Sort order
  const filtered = useMemo(() => {
    let result = categoryBaseItems;

    // 1. Hard filters first (categories, minRating, priceRange, pathStrong)
    if (filterState.categories && filterState.categories.length > 0) {
      result = result.filter((s) => {
        const cat = String(s.cat || s.category || s.role || "").toLowerCase();
        return filterState.categories.some((c) => cat.includes(c.toLowerCase()));
      });
    }

    if (filterState.minRating > 0) {
      result = result.filter((s) => Number(getMarketplaceStarRating(s)) >= filterState.minRating);
    }

    if (filterState.priceRange === "free") {
      result = result.filter((s) => isFreeItem(s));
    } else if (filterState.priceRange === "paid") {
      result = result.filter((s) => !isFreeItem(s));
    } else if (filterState.priceRange === "under1000") {
      result = result.filter((s) => itemPrice(s) <= 1000);
    } else if (filterState.priceRange === "under10000") {
      result = result.filter((s) => itemPrice(s) <= 10000);
    }

    if (filterState.pathStrong) {
      result = result.filter((s) => {
        const pathVal = s.path ?? (s.score_breakdown?.pathStepMatch ? s.score_breakdown.pathStepMatch / 100 : 0.80);
        return pathVal >= 0.45;
      });
    }

    // Legacy Category filter fallback if set
    if (activeCategory !== "all") {
      result = result.filter((s) => getItemCategory(s) === activeCategory);
    }

    // 2. Compute naaviScore for filtered items
    const scored = result.map((s) => ({
      ...s,
      naaviScore: computeNaaviScore(s),
    }));

    // 3. Sort & Diversify
    if (filterState.sort === "relevance") {
      scored.sort((a, b) => b.naaviScore - a.naaviScore);
      let list = diversify(scored);
      if (replacementState.activeReplacementItem) {
        const activeId = String(replacementState.activeReplacementItem._id || replacementState.activeReplacementItem.id);
        const activeIdx = list.findIndex((i) => String(i._id || i.id) === activeId);
        if (activeIdx > 0) {
          const [activeItem] = list.splice(activeIdx, 1);
          list.unshift(activeItem);
        } else if (activeIdx === -1 && replacementState.activeReplacementItem.layer === activeLayer) {
          list.unshift(replacementState.activeReplacementItem);
        }
      }
      return list;
    } else if (filterState.sort === "price_asc") {
      scored.sort((a, b) => itemPrice(a) - itemPrice(b));
    } else if (filterState.sort === "price_desc") {
      scored.sort((a, b) => itemPrice(b) - itemPrice(a));
    } else if (filterState.sort === "rating_desc") {
      scored.sort((a, b) => Number(getMarketplaceStarRating(b)) - Number(getMarketplaceStarRating(a)));
    } else if (filterState.sort === "newest") {
      scored.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return scored;
  }, [categoryBaseItems, filterState, activeCategory, activeLayer, replacementState.activeReplacementItem]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: categoryBaseItems.length };
    categoryBaseItems.forEach((item) => {
      const cat = String(item.cat || item.category || item.role || "University").toLowerCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [categoryBaseItems]);

  const hasActiveFilters =
    searchQ !== "" ||
    activeCategory !== "all" ||
    filterState.categories?.length > 0 ||
    filterState.sort !== "relevance" ||
    filterState.minRating > 0 ||
    filterState.priceRange !== "all" ||
    filterState.pathStrong;

  const clearAllFilters = () => {
    setSearchQ("");
    setActiveCategory("all");
    setFilterState({
      sort: "relevance",
      categories: [],
      minRating: 0,
      priceRange: "all",
      pathStrong: false,
    });
    setOpenDropdown(null);
  };

  useEffect(() => {
    filtered.forEach((item) => {
      if (!item?._id || !MONGO_ID_RE.test(String(item._id))) return;
      const key = `${activeLayer}:${activeCategory}:${item._id}`;
      if (trackedViewsRef.current.has(key)) return;
      trackedViewsRef.current.add(key);
      trackMarketplaceAnalytics(item, "view");
    });
  }, [filtered, activeLayer, activeCategory]);

  const toggleCart = (item) => {
    if (!item) return;
    const itemId = String(item._id || item.id || `custom-${item.name}`);
    const normalizedItem = {
      ...item,
      _id: itemId,
      id: itemId,
      name: item.name || "Marketplace Service",
      cost: item.cost !== undefined ? item.cost : "0",
      layer: item.layer || (String(item.category || item.role || "").toLowerCase().includes("mentor") ? "nano" : "micro"),
    };
    const alreadyIn = cart.some((s) => String(s._id || s.id) === itemId);
    setCart((prev) => (alreadyIn ? prev.filter((s) => String(s._id || s.id) !== itemId) : [...prev, normalizedItem]));
    if (!alreadyIn) {
      trackMarketplaceAnalytics(normalizedItem, "cart_addition");
      const layerLabel =
        normalizedItem.layer === "macro" ? "Macro" : normalizedItem.layer === "micro" ? "Micro" : normalizedItem.layer === "nano" ? "Nano" : "";
      logActivity({
        type: "market",
        title: `Added to cart: ${normalizedItem.name} (${layerLabel})`,
        desc: `User added "${normalizedItem.name}" from ${layerLabel} view to cart`,
        pathId: localStorage.getItem("selectedPathId") || "",
        pathName: localStorage.getItem("selectedPathName") || "",
        stepId: localStorage.getItem("selectedStepId") || "",
        stepName: localStorage.getItem("selectedStepName") || "",
        itemName: normalizedItem.name || "",
        itemCost: isFreeItem(normalizedItem) ? "Free" : `₹${Number(normalizedItem.cost).toLocaleString("en-IN")}`,
        status: "in_progress",
      });
    }
  };

  const handleCardView = (item) => {
    trackMarketplaceAnalytics(item, "click");
    if (item.checkoutType === "external") {
      logActivity({
        type: "market",
        title: `Redirect to External Site: ${item.name}`,
        desc: `User redirected to third-party website: ${item.websiteUrl}`,
        pathId: localStorage.getItem("selectedPathId") || "",
        pathName: localStorage.getItem("selectedPathName") || "",
        stepId: localStorage.getItem("selectedStepId") || "",
        stepName: localStorage.getItem("selectedStepName") || "",
        itemName: item.name || "",
        itemCost: getCostDisplay(item),
        status: "redirected",
      });
      return;
    }

    const layerLabel =
      item.layer === "macro"
        ? "Macro (Free Tools)"
        : item.layer === "micro"
          ? "Micro (Subscriptions)"
          : item.layer === "nano"
            ? "Nano (1-on-1 Sessions)"
            : item.layer || "";

    logActivity({
      type: "market",
      title: `Browsed ${layerLabel}: ${item.name}`,
      desc: `User viewed "${item.name}" in ${layerLabel} view`,
      pathId: localStorage.getItem("selectedPathId") || "",
      pathName: localStorage.getItem("selectedPathName") || "",
      stepId: localStorage.getItem("selectedStepId") || "",
      stepName: localStorage.getItem("selectedStepName") || "",
      itemName: item.name || "",
      itemCost: isFreeItem(item) ? "Free" : `₹${Number(item.cost).toLocaleString("en-IN")}`,
      status: "viewed",
    });
  };

  // ── Replacement & Assistance Handlers ──
  const handleFindBetterMatch = (service) => {
    setSelectedServiceForMatch(service);
    if (replacementState.count >= 3) {
      setAssistanceModalOpen(true);
    } else {
      setBetterMatchModalOpen(true);
    }
  };

  const handleRequestAssistance = (service) => {
    setSelectedServiceForMatch(service || filtered[0]);
    setAssistanceModalOpen(true);
  };

  const handleFindBetterMatchSubmit = async ({ reasons, message }) => {
    if (!selectedServiceForMatch) return;
    const res = await marketplaceReplacementService.submitReplacement({
      userEmail,
      stepId,
      pathId,
      rejectedItem: selectedServiceForMatch,
      reasons,
      message,
      availableItems: items,
    });
    if (res?.status) {
      const updated = marketplaceReplacementService.getReplacementState(stepId, userEmail);
      setReplacementState({
        ...updated,
        count: res.replacementCount ?? updated.count,
        rejectedItemIds: res.rejectedItemIds ?? updated.rejectedItemIds,
        activeReplacementItem: res.replacementItem ?? updated.activeReplacementItem,
        whyRecommended: res.whyRecommended ?? updated.whyRecommended,
        feedbackHistory: res.feedbackHistory ?? updated.feedbackHistory,
      });
      logActivity({
        type: "market",
        title: `Requested Marketplace Replacement (${res.replacementCount || updated.count}/3)`,
        desc: `User rejected "${selectedServiceForMatch.name}". Reasons: ${reasons.join(", ")}`,
        pathId,
        pathName,
        stepId,
        stepName,
        itemName: selectedServiceForMatch.name,
        status: "replaced",
      });
    }
  };

  const handleAssistanceRequestSubmit = async ({ additionalNotes }) => {
    const prevHistory = (replacementState.feedbackHistory || []).map((f) => ({
      id: f.rejectedItemId,
      name: f.rejectedItemName,
      reasons: f.reasons,
    }));

    try {
      await marketplaceReplacementService.createAssistanceRequest({
        userEmail,
        userName,
        pathId,
        pathName,
        stepId,
        stepName,
        originalMarketplaceItemId: selectedServiceForMatch?._id || "original_item",
        originalItemName: selectedServiceForMatch?.name || "Marketplace Recommendation",
        reasons: replacementState.feedbackHistory?.flatMap((f) => f.reasons) || [],
        message: additionalNotes,
        previousRecommendations: prevHistory,
      });

      const userTickets = await marketplaceReplacementService.getUserAssistanceRequests(userEmail);
      setAssistanceTickets(userTickets);
      setChatDrawerOpen(true);
    } catch (err) {
      console.error("Failed to submit assistance request:", err);
      alert("Failed to submit assistance request. Please check your connection and try again.");
    }
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((s) => s._id !== id));
  const inCart = (id) => cart.some((s) => s._id === id);

  const handleConfirm = (info) => {
    setPurchasedIds((prev) => {
      const next = new Set(prev);
      cart.forEach((c) => next.add(String(c._id || c.id)));
      return next;
    });
    navigate("/purchase/success", {
      state: {
        orderId: info.orderId,
        purchasedItem: info.item || null,
        studentEmail: info.studentEmail || "",
      },
    });
    setCart([]);
  };

  const currentPageKey = page === "marketplace" ? "marketplace" : page === "checkout" ? "checkout" : "confirmed";

  return (
    <div className="user-marketplace">
      <StepBar
        currentPage={currentPageKey}
        onStepChange={(key) => {
          if (key === "currentStep") {
            onStepChange && onStepChange("currentStep");
          } else if (key === "marketplace") setPage("marketplace");
        }}
      />

      {/* ── Success Banner ───────────────────────────────── */}
      {exclusiveSuccessToast && (
        <div className="mkt-toast-banner">
          <div className="mkt-toast-inner">
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <div className="mkt-toast-title">Marketplace Enrollment Successful!</div>
              <div className="mkt-toast-sub">
                <strong>{exclusiveSuccessToast.itemName}</strong> has been activated.
                {exclusiveSuccessToast.orderId && <> &nbsp;·&nbsp; Order: {exclusiveSuccessToast.orderId}</>}
              </div>
            </div>
          </div>
          <button className="mkt-toast-dismiss" onClick={() => setExclusiveSuccessToast(null)}>
            ✕
          </button>
        </div>
      )}

      {page === "marketplace" && (
        <div className="mkt-body">
          <div className="mkt-layout">
            <div className="mkt-main">
              {/* ── Top Bar: Search, Macro/Micro/Nano Toggle, Super Admin Assistance, Cart Button ────────── */}
              <div className="mkt-topbar">
                {/* Search Input */}
                <div className="mkt-sw">
                  <svg className="mkt-si-icon" viewBox="0 0 20 20" fill="none">
                    <circle cx="8.5" cy="8.5" r="5.25" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 13l3.2 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                  <input
                    className="mkt-si-input"
                    type="text"
                    placeholder="Search services, roles, partners..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                  />
                  {searchQ && (
                    <button className="mkt-si-clear" onClick={() => setSearchQ("")}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Layer pills: Macro, Micro, Nano */}
                <div className="vpills">
                  {LAYER_PILLS.map(({ key, label }) => (
                    <button
                      key={key}
                      className={`vpill ${activeLayer === key ? "active" : ""}`}
                      onClick={() => {
                        setActiveLayer(key);
                        setActiveCategory("all");
                      }}
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Super Admin Assistance Trigger Button */}
                <button
                  type="button"
                  className="mkt-assist-btn"
                  onClick={() => setChatDrawerOpen(true)}
                  title="Super Admin Assistance & Live Chat"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Assistance</span>
                  {assistanceTickets.length > 0 && (
                    <span className="assist-btn-badge">{assistanceTickets.length}</span>
                  )}
                </button>

                {/* Cart Button */}
                <button className="cart-top-btn" onClick={() => setShowCart(true)}>
                  <svg className="cart-icon" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Cart</span>
                  {cart.length > 0 && <span className="cart-top-badge">{cart.length}</span>}
                </button>
              </div>

              {/* ── Max Replacements Reached Banner ── */}
              {replacementState.count >= 3 && (
                <div className="mkt-max-replacements-banner">
                  <div className="mmrb-left">
                    <span className="mmrb-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <div>
                      <h4 className="mmrb-title">Still haven't found the right match?</h4>
                      <p className="mmrb-desc">
                        You've used your 3 recommendation changes for this step. Our team can review your custom requirement and help you find a tailored option.
                      </p>
                    </div>
                  </div>
                  <button
                    className="btn-request-admin"
                    onClick={() => setAssistanceModalOpen(true)}
                  >
                    Request Super Admin Assistance →
                  </button>
                </div>
              )}

              {/* ── Sticky Filter Bar (<MarketplaceFilterBar />) ────────────────────────── */}
              <MarketplaceFilterBar
                filterState={filterState}
                onFilterChange={setFilterState}
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                categoryCounts={categoryCounts}
                totalResults={filtered.length}
                onClearFilters={clearAllFilters}
                hasActiveFilters={hasActiveFilters}
              />

              {/* ── Services Grid Section (<MarketplaceGrid />) ──────────────────────── */}
              <div className="services-container">
                {loading ? (
                  <div className="mkt-loading">
                    <div className="mkt-spinner" />
                    <p>Loading services…</p>
                  </div>
                ) : (
                  <MarketplaceGrid
                    services={filtered}
                    sortMode={filterState.sort}
                    inCart={inCart}
                    onToggleCart={toggleCart}
                    onCardView={handleCardView}
                    purchasedIds={Array.from(purchasedIds)}
                    replacementCount={replacementState.count}
                    whyRecommended={replacementState.whyRecommended}
                    onFindBetterMatch={handleFindBetterMatch}
                    onRequestAssistance={handleRequestAssistance}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {page === "checkout" && (
        <div className="mkt-body">
          <CheckoutPage cart={cart} onConfirm={handleConfirm} onBack={() => setPage("marketplace")} />
        </div>
      )}

      {page === "confirmed" && orderInfo && (
        <div className="mkt-body">
          <ConfirmedPage orderInfo={orderInfo} onBackToJourney={() => onStepChange && onStepChange("myJourney")} />
        </div>
      )}

      {showCart && (
        <CartDrawer
          cart={cart}
          onRemove={removeFromCart}
          onClose={() => setShowCart(false)}
          onCheckout={() => {
            setShowCart(false);
            const externalItem = cart.find((item) => item.checkoutType === "external");
            if (externalItem) {
              sessionStorage.setItem("naaviExclusiveItem", JSON.stringify(externalItem));
              sessionStorage.setItem("naaviExclusiveReturnPath", "/dashboard/users/Marketplace");
              localStorage.setItem("naaviExclusiveItemId", externalItem._id);
              window.open(`/naavi-exclusive/${externalItem.partnerId || ""}`, "_blank");
              return;
            }
            setPage("checkout");
          }}
        />
      )}

      {/* ── Better Match Refinement Dialog ── */}
      <FindBetterMatchModal
        isOpen={betterMatchModalOpen}
        onClose={() => setBetterMatchModalOpen(false)}
        service={selectedServiceForMatch}
        currentCount={replacementState.count}
        onSubmit={handleFindBetterMatchSubmit}
      />

      {/* ── Super Admin Assistance Escalation Dialog ── */}
      <AssistanceRequestModal
        isOpen={assistanceModalOpen}
        onClose={() => setAssistanceModalOpen(false)}
        service={selectedServiceForMatch}
        previousItems={replacementState.feedbackHistory?.map((f) => ({
          id: f.rejectedItemId,
          name: f.rejectedItemName,
        }))}
        onSubmit={handleAssistanceRequestSubmit}
      />

      {/* ── User ↔ Super Admin Chat Drawer ── */}
      <AssistanceChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        userEmail={userEmail}
        userName={userName}
        onAddToCart={toggleCart}
        onOpenCart={() => {
          setChatDrawerOpen(false);
          setShowCart(true);
        }}
        cartItems={cart}
        purchasedIds={Array.from(purchasedIds)}
      />
    </div>
  );
};

export default UserMarketplace;
