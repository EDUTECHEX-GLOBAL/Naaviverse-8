import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./PartnerFeedback.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Action Badge ─────────────────────────────────────────────────────────────
const ActionBadge = ({ action }) => {
  const map = {
    helpful: { label: "Helpful", color: "#12b76a", bg: "#e7f9f1" },
    notRelevant: { label: "Not Relevant", color: "#f04438", bg: "#fdecea" },
    comment: { label: "Comment", color: "#4f6ef7", bg: "#eef1ff" },
    skip: { label: "Skipped", color: "#94a3b8", bg: "#f1f5f9" },
  };
  const info = map[action] || { label: action, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span
      className="pf-action-badge"
      style={{ color: info.color, background: info.bg }}
    >
      {info.label}
    </span>
  );
};

// ── Small inline icons (replaces emoji) ────────────────────────────────────
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);

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
        <div className="pf-header-top">
          <h1 className="pf-title">Student Feedback</h1>
          <button className="pf-refresh-btn" onClick={fetchFeedbacks} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>
        <p className="pf-subtitle">See what students are saying about your paths</p>
      </div>

      {/* ── Stats Row ────────────────────────────────────────────────────── */}
      <div className="pf-stats-row">
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "#eef1ff", color: "#4f6ef7" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.total}</span>
            <span className="pf-stat-label">Total Feedbacks</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "#e7f9f1", color: "#12b76a" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.helpful}</span>
            <span className="pf-stat-label">Helpful</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "#fdecea", color: "#f04438" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 15V19a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.notRelevant}</span>
            <span className="pf-stat-label">Not Relevant</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "#fff6e5", color: "#f59e0b" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
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
          <svg className="pf-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
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
            <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#f04438" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>{error}</p>
            <button onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pf-empty">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <h3>No feedbacks yet</h3>
            <p>When students interact with your paths, their feedback will appear here.</p>
          </div>
        ) : (
          pathGroups.map((group, gi) => (
            <div key={gi} className="pf-path-group">
              <div className="pf-path-group-header">
                <div className="pf-path-group-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4f6ef7" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </div>
                <span className="pf-path-group-name">{group.pathName}</span>
                <span className="pf-path-group-count">{group.feedbacks.length} feedback{group.feedbacks.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Compact notification-style rows with mobile horizontal scroll */}
              <div className="pf-table-responsive">
                <div className="pf-feedback-list">
                  {group.feedbacks.map((fb, fi) => (
                    <div key={fi} className="pf-feedback-row">
                      <div className="pf-fb-avatar">
                        {(fb.studentEmail || "S").charAt(0).toUpperCase()}
                      </div>

                      <div className="pf-fb-main">
                        <div className="pf-fb-line1">
                          <span className="pf-fb-email">
                            {fb.studentName ? `${fb.studentName} (${fb.studentEmail})` : fb.studentEmail}
                          </span>
                          {fb.stepName && <span className="pf-fb-step-inline">{fb.stepName}</span>}
                        </div>

                        <div className="pf-fb-line2">
                          {fb.viewType && (
                            <span className="pf-fb-chip">{fb.viewType.charAt(0).toUpperCase() + fb.viewType.slice(1)} View</span>
                          )}
                          {fb.studentPhone && (
                            <span className="pf-fb-chip"><PhoneIcon /> {fb.studentPhone}</span>
                          )}
                          {fb.studentCountry && (
                            <span className="pf-fb-chip"><PinIcon /> {fb.studentCountry}</span>
                          )}
                          {fb.comment && (
                            <span className="pf-fb-comment-inline">"{fb.comment}"</span>
                          )}
                        </div>
                      </div>

                      <div className="pf-fb-right">
                        <span className="pf-fb-time">{timeAgo(fb.createdAt)}</span>
                        <ActionBadge action={fb.action} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}