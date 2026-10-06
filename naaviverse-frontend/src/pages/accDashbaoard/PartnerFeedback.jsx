import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./PartnerFeedback.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, #93c5fd, #3b82f6)",
  "linear-gradient(135deg, #6ee7b7, #10b981)",
  "linear-gradient(135deg, #c4b5fd, #8b5cf6)",
  "linear-gradient(135deg, #f9a8d4, #ec4899)",
  "linear-gradient(135deg, #fdba74, #f97316)",
  "linear-gradient(135deg, #7dd3fc, #0284c7)",
];

const getAvatarGradient = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

// ── Action Badge with SVG Only (No Emojis) ───────────────────────────────────
const ActionBadge = ({ action }) => {
  const map = {
    helpful: {
      label: "Helpful",
      bg: "#f0fdf4",
      border: "#bbf7d0",
      color: "#166534",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
      ),
    },
    notRelevant: {
      label: "Not Relevant",
      bg: "#fff1f2",
      border: "#fecdd3",
      color: "#be123c",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      ),
    },
    comment: {
      label: "Comment",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      color: "#6b21a8",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    skip: {
      label: "Skipped",
      bg: "#f8fafc",
      border: "#e2e8f0",
      color: "#64748b",
      icon: (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="5 4 15 12 5 20" /><line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      ),
    },
  };
  const info = map[action] || {
    label: action,
    bg: "#f8fafc",
    border: "#e2e8f0",
    color: "#64748b",
    icon: null,
  };
  return (
    <span
      className={`pf-action-badge pf-action-badge--${action}`}
      style={{ background: info.bg, borderColor: info.border, color: info.color }}
    >
      {info.icon && <span className="pf-badge-icon">{info.icon}</span>}
      <span>{info.label}</span>
    </span>
  );
};

// ── Time Ago Helper ──────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function PartnerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const partnerEmail = (() => {
    try {
      const raw = localStorage.getItem("partner");
      return raw ? JSON.parse(raw)?.email || "" : "";
    } catch { return ""; }
  })();

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/partner/feedbacks`, {
        params: { email: partnerEmail }
      });
      setFeedbacks(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching partner feedbacks:", err);
      setError("Failed to load feedbacks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [partnerEmail]);

  useEffect(() => {
    if (!partnerEmail) {
      setLoading(false);
      setError("Partner email not found. Please log in again.");
      return;
    }
    fetchFeedbacks();
  }, [partnerEmail, fetchFeedbacks]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const helpful = feedbacks.filter(f => f.action === "helpful").length;
    const notRelevant = feedbacks.filter(f => f.action === "notRelevant").length;
    const comments = feedbacks.filter(f => f.action === "comment").length;
    return { total, helpful, notRelevant, comments };
  }, [feedbacks]);

  // ── Filtered Feedbacks ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = feedbacks;
    if (filter !== "all") {
      list = list.filter(f => f.action === filter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(f =>
        (f.pathName || "").toLowerCase().includes(q) ||
        (f.stepName || "").toLowerCase().includes(q) ||
        (f.comment || "").toLowerCase().includes(q) ||
        (f.studentEmail || "").toLowerCase().includes(q) ||
        (f.studentName || "").toLowerCase().includes(q) ||
        (f.studentCountry || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedbacks, filter, searchTerm]);

  // ── Group by Path ──────────────────────────────────────────────────────────
  const pathGroups = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      const key = f.pathId || "unknown";
      if (!map[key]) map[key] = { pathName: f.pathName || "General Path Feedback", feedbacks: [] };
      map[key].feedbacks.push(f);
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div className="pf-root">
      {/* ── Minimal Header (No harsh bold) ──────────────────────────────────── */}
      <div className="pf-header">
        <div className="pf-header-text">
          <h1 className="pf-title">Student Feedback</h1>
          <p className="pf-subtitle">Manage and review student feedback on your learning paths</p>
        </div>
        <div className="pf-header-right">
          <button
            type="button"
            className="pf-refresh-btn"
            onClick={fetchFeedbacks}
            disabled={loading}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? "spinning" : ""}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── Minimal Small Stat Boxes (SVG Only, No Emojis, No Dark Bold) ─────── */}
      <div className="pf-stats-grid">
        <div
          className={`pf-stat-card pf-stat-card--total ${filter === "all" ? "pf-stat-card--active" : ""}`}
          onClick={() => setFilter("all")}
          role="button"
          tabIndex={0}
        >
          <div className="pf-stat-top">
            <span className="pf-stat-label">Total Responses</span>
            <div className="pf-stat-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
          </div>
          <div className="pf-stat-val">{stats.total}</div>
          <div className="pf-stat-sub">Across all paths</div>
        </div>

        <div
          className={`pf-stat-card pf-stat-card--helpful ${filter === "helpful" ? "pf-stat-card--active" : ""}`}
          onClick={() => setFilter("helpful")}
          role="button"
          tabIndex={0}
        >
          <div className="pf-stat-top">
            <span className="pf-stat-label">Helpful Votes</span>
            <div className="pf-stat-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            </div>
          </div>
          <div className="pf-stat-val">{stats.helpful}</div>
          <div className="pf-stat-sub">Positive responses</div>
        </div>

        <div
          className={`pf-stat-card pf-stat-card--comment ${filter === "comment" ? "pf-stat-card--active" : ""}`}
          onClick={() => setFilter("comment")}
          role="button"
          tabIndex={0}
        >
          <div className="pf-stat-top">
            <span className="pf-stat-label">Comments</span>
            <div className="pf-stat-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>
          <div className="pf-stat-val">{stats.comments}</div>
          <div className="pf-stat-sub">Student notes</div>
        </div>

        <div
          className={`pf-stat-card pf-stat-card--needsReview ${filter === "notRelevant" ? "pf-stat-card--active" : ""}`}
          onClick={() => setFilter("notRelevant")}
          role="button"
          tabIndex={0}
        >
          <div className="pf-stat-top">
            <span className="pf-stat-label">Needs Review</span>
            <div className="pf-stat-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
          </div>
          <div className="pf-stat-val">{stats.notRelevant}</div>
          <div className="pf-stat-sub">Not relevant</div>
        </div>
      </div>

      {/* ── Filter Pills & Search (NO brackets with counts, NO emojis, SVG only) ── */}
      <div className="pf-controls-bar">
        <div className="pf-filter-pills">
          <button
            type="button"
            className={`pf-pill ${filter === "all" ? "pf-pill--active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Feedback
          </button>
          <button
            type="button"
            className={`pf-pill pf-pill--helpful ${filter === "helpful" ? "pf-pill--active" : ""}`}
            onClick={() => setFilter("helpful")}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
            <span>Helpful</span>
          </button>
          <button
            type="button"
            className={`pf-pill pf-pill--comment ${filter === "comment" ? "pf-pill--active" : ""}`}
            onClick={() => setFilter("comment")}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Comments</span>
          </button>
          <button
            type="button"
            className={`pf-pill pf-pill--needsReview ${filter === "notRelevant" ? "pf-pill--active" : ""}`}
            onClick={() => setFilter("notRelevant")}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Needs Review</span>
          </button>
        </div>

        <div className="pf-search-wrap">
          <svg className="pf-search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="pf-search-input"
            type="text"
            placeholder="Search student, path, step..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="pf-search-clear" onClick={() => setSearchTerm("")} title="Clear">×</button>
          )}
        </div>
      </div>

      {/* ── Content List ─────────────────────────────────────────────────────── */}
      <div className="pf-content">
        {loading ? (
          <div className="pf-loading-card">
            <div className="pf-spinner" />
            <span className="pf-loading-text">Loading feedback...</span>
          </div>
        ) : error ? (
          <div className="pf-error-card">
            <p className="pf-error-msg">{error}</p>
            <button className="pf-retry-btn" onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pf-empty-card">
            <h3 className="pf-empty-title">No feedback found</h3>
            <p className="pf-empty-desc">
              {searchTerm || filter !== "all"
                ? "No reviews match your selected filter or search."
                : "No student feedback has been submitted yet."}
            </p>
            {(searchTerm || filter !== "all") && (
              <button
                type="button"
                className="pf-reset-btn"
                onClick={() => { setFilter("all"); setSearchTerm(""); }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          pathGroups.map((group, gi) => (
            <div key={gi} className="pf-path-section">
              {/* Minimal Path Section Bar */}
              <div className="pf-path-header-card">
                <div className="pf-path-header-left">
                  <div className="pf-path-badge-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
                    </svg>
                  </div>
                  <h2 className="pf-path-name">{group.pathName}</h2>
                </div>
                <span className="pf-path-count-badge">
                  {group.feedbacks.length} {group.feedbacks.length === 1 ? "response" : "responses"}
                </span>
              </div>

              {/* Minimal Small Cards */}
              <div className="pf-cards-list">
                {group.feedbacks.map((fb, fi) => {
                  const initial = (fb.studentName || fb.studentEmail || "S").charAt(0).toUpperCase();
                  const avatarBg = getAvatarGradient(fb.studentEmail || fb.studentName || `${fi}`);
                  const formattedDate = fb.createdAt
                    ? new Date(fb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "";

                  return (
                    <div key={fi} className={`pf-card pf-card--${fb.action || "default"}`}>
                      {/* Top Header of Card */}
                      <div className="pf-card-head">
                        <div className="pf-card-student">
                          <div className="pf-avatar" style={{ background: avatarBg }}>
                            {initial}
                          </div>
                          <div className="pf-student-details">
                            <div className="pf-name-row">
                              <span className="pf-student-name">{fb.studentName || fb.studentEmail}</span>
                              {fb.studentEmail && fb.studentName && (
                                <span className="pf-student-email">({fb.studentEmail})</span>
                              )}
                            </div>
                            {fb.stepName && (
                              <div className="pf-step-pill">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                <span className="pf-step-title">{fb.stepName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pf-card-badges">
                          <ActionBadge action={fb.action} />
                          {formattedDate && (
                            <span className="pf-date-tag">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                              <span>{formattedDate}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Comment Box */}
                      {fb.comment && (
                        <div className="pf-comment-box">
                          <p className="pf-comment-content">"{fb.comment}"</p>
                        </div>
                      )}

                      {/* Bottom Metadata Pills (SVG Icons Only, No Emojis) */}
                      <div className="pf-meta-row">
                        {fb.viewType && (
                          <span className="pf-chip pf-chip--view">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>{fb.viewType.charAt(0).toUpperCase() + fb.viewType.slice(1)} View</span>
                          </span>
                        )}
                        {fb.studentPhone && (
                          <span className="pf-chip pf-chip--phone">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            <span>{fb.studentPhone}</span>
                          </span>
                        )}
                        {fb.studentCountry && (
                          <span className="pf-chip pf-chip--country">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                            <span>{fb.studentCountry}</span>
                          </span>
                        )}
                        {fb.createdAt && (
                          <span className="pf-chip pf-chip--time">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>{timeAgo(fb.createdAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}