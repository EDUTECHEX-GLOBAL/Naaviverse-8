import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./PartnerFeedback.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Star Rating Display ─────────────────────────────────────────────────────
const ActionBadge = ({ action }) => {
  const map = {
    helpful:     { label: "Helpful",      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    notRelevant: { label: "Not Relevant", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    comment:     { label: "Comment",      color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    skip:        { label: "Skipped",      color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  };
  const info = map[action] || { label: action, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
  return (
    <span
      className="pf-action-badge"
      style={{ color: info.color, background: info.bg }}
    >
      {info.label}
    </span>
  );
};

// ── Time Ago Helper ─────────────────────────────────────────────────────────
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

// ── Main Component ──────────────────────────────────────────────────────────
export default function PartnerFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, helpful, notRelevant, comment
  const [searchTerm, setSearchTerm] = useState("");

  const partnerEmail = (() => {
    try {
      const raw = localStorage.getItem("partner");
      return raw ? JSON.parse(raw)?.email || "" : "";
    } catch { return ""; }
  })();

  useEffect(() => {
    if (!partnerEmail) {
      setLoading(false);
      setError("Partner email not found. Please log in again.");
      return;
    }
    fetchFeedbacks();
  }, [partnerEmail]);

  const fetchFeedbacks = async () => {
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
  };

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const helpful = feedbacks.filter(f => f.action === "helpful").length;
    const notRelevant = feedbacks.filter(f => f.action === "notRelevant").length;
    const comments = feedbacks.filter(f => f.action === "comment").length;
    const helpfulRate = total > 0 ? Math.round((helpful / total) * 100) : 0;
    return { total, helpful, notRelevant, comments, helpfulRate };
  }, [feedbacks]);

  // ── Filtered feedbacks ──────────────────────────────────────────────────
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
        (f.studentEmail || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedbacks, filter, searchTerm]);

  // ── Unique paths for grouping ───────────────────────────────────────────
  const pathGroups = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      const key = f.pathId || "unknown";
      if (!map[key]) map[key] = { pathName: f.pathName || "Unknown Path", feedbacks: [] };
      map[key].feedbacks.push(f);
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div className="pf-root">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="pf-header">
        <div className="pf-header-left">
          <h1 className="pf-title">Student Feedback</h1>
          <p className="pf-subtitle">See what students are saying about your paths</p>
        </div>
        <button className="pf-refresh-btn" onClick={fetchFeedbacks} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stats Cards ────────────────────────────────────────────────── */}
      <div className="pf-stats-row">
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.total}</span>
            <span className="pf-stat-label">Total Feedbacks</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.helpful}</span>
            <span className="pf-stat-label">Helpful</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #ef4444, #f87171)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M10 15V19a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.notRelevant}</span>
            <span className="pf-stat-label">Not Relevant</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.helpfulRate}%</span>
            <span className="pf-stat-label">Helpful Rate</span>
          </div>
        </div>
      </div>

      {/* ── Filter + Search ────────────────────────────────────────────── */}
      <div className="pf-controls">
        <div className="pf-filter-pills">
          {[
            { key: "all", label: "All" },
            { key: "helpful", label: "Helpful" },
            { key: "notRelevant", label: "Not Relevant" },
            { key: "comment", label: "Comments" },
          ].map(f => (
            <button
              key={f.key}
              className={`pf-pill ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="pf-search-wrap">
          <svg className="pf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="pf-search-input"
            type="text"
            placeholder="Search by path, step, student..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="pf-content">
        {loading ? (
          <div className="pf-loading">
            <div className="pf-spinner" />
            <span>Loading feedbacks...</span>
          </div>
        ) : error ? (
          <div className="pf-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>{error}</p>
            <button onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pf-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <h3>No feedbacks yet</h3>
            <p>When students interact with your paths, their feedback will appear here.</p>
          </div>
        ) : (
          pathGroups.map((group, gi) => (
            <div key={gi} className="pf-path-group">
              <div className="pf-path-group-header">
                <div className="pf-path-group-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </div>
                <span className="pf-path-group-name">{group.pathName}</span>
                <span className="pf-path-group-count">{group.feedbacks.length} feedback{group.feedbacks.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="pf-feedback-list">
                {group.feedbacks.map((fb, fi) => (
                  <div key={fi} className="pf-feedback-card">
                    <div className="pf-fb-top">
                      <div className="pf-fb-user">
                        <div className="pf-fb-avatar">
                          {(fb.studentEmail || "S").charAt(0).toUpperCase()}
                        </div>
                        <div className="pf-fb-user-info">
                          <span className="pf-fb-email">{fb.studentName ? `${fb.studentName} (${fb.studentEmail})` : fb.studentEmail}</span>
                          <span className="pf-fb-time">{timeAgo(fb.createdAt)}</span>
                        </div>
                      </div>
                      <ActionBadge action={fb.action} />
                    </div>

                    <div className="pf-fb-meta">
                      <span className="pf-fb-step-tag">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        {fb.stepName || "Step"}
                      </span>
                      {fb.viewType && (
                        <span className="pf-fb-view-tag">
                          {fb.viewType.charAt(0).toUpperCase() + fb.viewType.slice(1)} View
                        </span>
                      )}
                      {fb.studentPhone && (
                        <span className="pf-fb-step-tag" style={{ color: "#059669", background: "rgba(5,150,105,0.06)" }}>
                          📞 {fb.studentPhone}
                        </span>
                      )}
                      {fb.studentCountry && (
                        <span className="pf-fb-step-tag" style={{ color: "#3b82f6", background: "rgba(59,130,246,0.06)" }}>
                          📍 {fb.studentCountry}
                        </span>
                      )}
                    </div>

                    {fb.comment && (
                      <div className="pf-fb-comment">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                        <p>"{fb.comment}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
