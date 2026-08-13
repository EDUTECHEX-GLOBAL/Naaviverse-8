import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./AdminFeedback.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Action indicator — a colored dot + label instead of a pill ─────────────
const ActionTag = ({ action }) => {
  const map = {
    helpful: { label: "Helpful", color: "#1f9d55" },
    notRelevant: { label: "Not Relevant", color: "#d64545" },
    comment: { label: "Comment", color: "#3538cd" },
    skip: { label: "Skipped", color: "#8891a5" },
  };
  const info = map[action] || { label: action, color: "#6b7386" };
  return (
    <span className="af-tag">
      <span className="af-tag-dot" style={{ background: info.color }} />
      {info.label}
    </span>
  );
};

// ── Source indicator ─────────────────────────────────────────────────────
const SourceTag = ({ source }) => {
  const isAI = source === "AI";
  return (
    <span className={`af-source-tag ${isAI ? "ai" : "partner"}`}>
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
  const [openPaths, setOpenPaths] = useState({});

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
      if (!map[key]) map[key] = { id: key, pathName: f.pathName || "Unknown Path", source: f.path_source, feedbacks: [] };
      map[key].feedbacks.push(f);
    });
    return Object.values(map).sort((a, b) => {
      const latestA = Math.max(...a.feedbacks.map(f => new Date(f.createdAt || 0).getTime()));
      const latestB = Math.max(...b.feedbacks.map(f => new Date(f.createdAt || 0).getTime()));
      return latestB - latestA;
    });
  }, [filtered]);

  const togglePath = (pathId) => {
    setOpenPaths(prev => ({ ...prev, [pathId]: !prev[pathId] }));
  };

  return (
    <div className="af-root">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="af-header">
        <div className="af-header-top">
          <h1 className="af-title">Platform Feedback</h1>
          <button className="af-refresh-btn" onClick={fetchFeedbacks} disabled={loading}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Refresh
          </button>
        </div>
        <p className="af-subtitle">All student feedback across AI and Partner paths</p>
      </div>

      {/* ── KPI ledger — one bordered strip, not four floating cards ──────── */}
      <div className="af-ledger">
        <div className="af-ledger-cell">
          <span className="af-ledger-label">Total</span>
          <span className="af-ledger-value">{stats.total}</span>
        </div>
        <div className="af-ledger-cell accent-ai">
          <span className="af-ledger-label">AI Paths</span>
          <span className="af-ledger-value">{stats.ai}</span>
        </div>
        <div className="af-ledger-cell accent-partner">
          <span className="af-ledger-label">Partner Paths</span>
          <span className="af-ledger-value">{stats.partner}</span>
        </div>
        <div className="af-ledger-cell accent-good">
          <span className="af-ledger-label">Helpful Rate</span>
          <span className="af-ledger-value">{stats.helpfulRate}%</span>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="af-controls">
        <div className="af-filter-pills">
          {[
            { key: "all", label: "All Sources" },
            { key: "AI", label: "AI Paths" },
            { key: "PARTNER", label: "Partner Paths" },
          ].map(f => (
            <button key={f.key} className={`af-pill ${sourceFilter === f.key ? "active" : ""}`} onClick={() => setSourceFilter(f.key)}>
              {f.label}
            </button>
          ))}
          <span className="af-pill-divider" />
          {[
            { key: "all", label: "All Actions" },
            { key: "helpful", label: "Helpful" },
            { key: "notRelevant", label: "Not Relevant" },
            { key: "comment", label: "Comments" },
          ].map(f => (
            <button key={f.key} className={`af-pill ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="af-search-wrap">
          <svg className="af-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="af-search-input"
            type="text"
            placeholder="Search by path, step, student, creator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="af-content">
        {loading ? (
          <div className="af-loading"><div className="af-spinner" /><span>Loading feedbacks...</span></div>
        ) : error ? (
          <div className="af-error">
            <p>{error}</p>
            <button onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="af-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            <h3>No feedbacks found</h3>
            <p>No feedback matches your current filters.</p>
          </div>
        ) : (
          pathGroups.map((group) => {
            const isOpen = !!openPaths[group.id];
            const latestFeedback = group.feedbacks.reduce((latest, fb) => {
              if (!latest) return fb;
              return new Date(fb.createdAt || 0) > new Date(latest.createdAt || 0) ? fb : latest;
            }, null);

            return (
              <div key={group.id} className={`af-group ${isOpen ? "is-open" : ""}`}>
                <button className="af-group-bar" type="button" onClick={() => togglePath(group.id)}>
                  <span className="af-group-chevron" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                  <span className="af-group-main">
                    <span className="af-group-name">{group.pathName}</span>
                    <span className="af-group-meta">
                      Latest {timeAgo(latestFeedback?.createdAt)} {latestFeedback?.stepName ? `- ${latestFeedback.stepName}` : ""}
                    </span>
                  </span>
                  <SourceTag source={group.source} />
                  <span className="af-group-count">{group.feedbacks.length} feedback{group.feedbacks.length !== 1 ? "s" : ""}</span>
                </button>

                {isOpen && (
                  <div className="af-table-responsive">
                    <div className="af-table">
                      {group.feedbacks.map((fb, fi) => (
                        <div key={fi} className="af-row">
                          <div className="af-row-id">{(fb.studentEmail || "S").charAt(0).toUpperCase()}</div>

                          <div className="af-row-main">
                            <div className="af-row-line1">
                              <span className="af-row-user">
                                {fb.studentName ? `${fb.studentName} (${fb.studentEmail})` : fb.studentEmail}
                              </span>
                              <span className="af-row-step">{fb.stepName || "Step"}</span>
                            </div>

                            <div className="af-row-line2">
                              {fb.viewType && (
                                <span className="af-meta-tag">{fb.viewType.charAt(0).toUpperCase() + fb.viewType.slice(1)} View</span>
                              )}
                              {fb.owner_id && fb.owner_id !== "path_engine_admin" && (
                                <span className="af-meta-tag warn">Owner: {fb.owner_id}</span>
                              )}
                              {fb.studentPhone && (
                                <span className="af-meta-tag">{fb.studentPhone}</span>
                              )}
                              {fb.studentCountry && (
                                <span className="af-meta-tag">{fb.studentCountry}</span>
                              )}
                              {fb.comment && <span className="af-row-comment">"{fb.comment}"</span>}
                            </div>
                          </div>

                          <div className="af-row-right">
                            <span className="af-row-time">{timeAgo(fb.createdAt)}</span>
                            <ActionTag action={fb.action} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
