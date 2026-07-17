import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../accDashbaoard/PartnerFeedback.scss"; // reuse same styles

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ActionBadge = ({ action }) => {
  const map = {
    helpful:     { label: "Helpful",      color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    notRelevant: { label: "Not Relevant", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
    comment:     { label: "Comment",      color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
    skip:        { label: "Skipped",      color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  };
  const info = map[action] || { label: action, color: "#64748b", bg: "rgba(100,116,139,0.1)" };
  return (
    <span className="pf-action-badge" style={{ color: info.color, background: info.bg }}>
      {info.label}
    </span>
  );
};

const SourceBadge = ({ source }) => {
  const isAI = source === "AI";
  return (
    <span
      className="pf-action-badge"
      style={{
        color: isAI ? "#2273E6" : "#f59e0b",
        background: isAI ? "rgba(34,115,230,0.08)" : "rgba(245,158,11,0.08)",
        marginLeft: 6,
      }}
    >
      {isAI ? "AI Path" : "Partner Path"}
    </span>
  );
};

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

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all"); // all, AI, PARTNER
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/feedbacks`);
      setFeedbacks(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching admin feedbacks:", err);
      setError("Failed to load feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = feedbacks.length;
    const ai = feedbacks.filter(f => f.path_source === "AI").length;
    const partner = feedbacks.filter(f => f.path_source === "PARTNER").length;
    const helpful = feedbacks.filter(f => f.action === "helpful").length;
    const helpfulRate = total > 0 ? Math.round((helpful / total) * 100) : 0;
    return { total, ai, partner, helpful, helpfulRate };
  }, [feedbacks]);

  const filtered = useMemo(() => {
    let list = feedbacks;
    if (sourceFilter !== "all") list = list.filter(f => f.path_source === sourceFilter);
    if (filter !== "all") list = list.filter(f => f.action === filter);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(f =>
        (f.pathName || "").toLowerCase().includes(q) ||
        (f.stepName || "").toLowerCase().includes(q) ||
        (f.comment || "").toLowerCase().includes(q) ||
        (f.studentEmail || "").toLowerCase().includes(q) ||
        (f.pathCreatorEmail || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [feedbacks, filter, sourceFilter, searchTerm]);

  const pathGroups = useMemo(() => {
    const map = {};
    filtered.forEach(f => {
      const key = f.pathId || "unknown";
      if (!map[key]) map[key] = { pathName: f.pathName || "Unknown Path", source: f.path_source, feedbacks: [] };
      map[key].feedbacks.push(f);
    });
    return Object.values(map);
  }, [filtered]);

  return (
    <div className="pf-root">
      <div className="pf-header">
        <div className="pf-header-left">
          <h1 className="pf-title">Platform Feedback</h1>
          <p className="pf-subtitle">All student feedback across AI and Partner paths</p>
        </div>
        <button className="pf-refresh-btn" onClick={fetchFeedbacks} disabled={loading}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="pf-stats-row">
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #818cf8)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.total}</span>
            <span className="pf-stat-label">Total</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #2273E6, #60a5fa)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.ai}</span>
            <span className="pf-stat-label">AI Paths</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.partner}</span>
            <span className="pf-stat-label">Partner Paths</span>
          </div>
        </div>
        <div className="pf-stat-card">
          <div className="pf-stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
          </div>
          <div className="pf-stat-info">
            <span className="pf-stat-value">{stats.helpfulRate}%</span>
            <span className="pf-stat-label">Helpful Rate</span>
          </div>
        </div>
      </div>

      <div className="pf-controls">
        <div className="pf-filter-pills">
          {[
            { key: "all", label: "All Sources" },
            { key: "AI", label: "AI Paths" },
            { key: "PARTNER", label: "Partner Paths" },
          ].map(f => (
            <button key={f.key} className={`pf-pill ${sourceFilter === f.key ? "active" : ""}`} onClick={() => setSourceFilter(f.key)}>
              {f.label}
            </button>
          ))}
          <span style={{ width: 1, height: 20, background: "#e2e8f0", margin: "0 4px" }} />
          {[
            { key: "all", label: "All Actions" },
            { key: "helpful", label: "Helpful" },
            { key: "notRelevant", label: "Not Relevant" },
            { key: "comment", label: "Comments" },
          ].map(f => (
            <button key={f.key} className={`pf-pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="pf-search-wrap">
          <svg className="pf-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="pf-search-input"
            type="text"
            placeholder="Search by path, step, student, creator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="pf-content">
        {loading ? (
          <div className="pf-loading"><div className="pf-spinner" /><span>Loading feedbacks...</span></div>
        ) : error ? (
          <div className="pf-error">
            <p>{error}</p>
            <button onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pf-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <h3>No feedbacks found</h3>
            <p>No feedback matches your current filters.</p>
          </div>
        ) : (
          pathGroups.map((group, gi) => (
            <div key={gi} className="pf-path-group">
              <div className="pf-path-group-header">
                <div className="pf-path-group-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                </div>
                <span className="pf-path-group-name">{group.pathName}</span>
                <SourceBadge source={group.source} />
                <span className="pf-path-group-count">{group.feedbacks.length} feedback{group.feedbacks.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="pf-feedback-list">
                {group.feedbacks.map((fb, fi) => (
                  <div key={fi} className="pf-feedback-card">
                    <div className="pf-fb-top">
                      <div className="pf-fb-user">
                        <div className="pf-fb-avatar">{(fb.studentEmail || "S").charAt(0).toUpperCase()}</div>
                        <div className="pf-fb-user-info">
                          <span className="pf-fb-email">{fb.studentName ? `${fb.studentName} (${fb.studentEmail})` : fb.studentEmail}</span>
                          <span className="pf-fb-time">{timeAgo(fb.createdAt)}</span>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <ActionBadge action={fb.action} />
                      </div>
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
                      {fb.owner_id && fb.owner_id !== "path_engine_admin" && (
                        <span className="pf-fb-step-tag" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.06)" }}>
                          Owner: {fb.owner_id}
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
