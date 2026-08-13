import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./PartnerFeedback.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Status Text Label (No giant pill buttons) ──────────────────────────────
const ActionBadge = ({ action }) => {
  const map = {
    helpful: { label: "Helpful", color: "#16a34a" },
    notRelevant: { label: "Not Relevant", color: "#dc2626" },
    comment: { label: "Comment", color: "#2563eb" },
    skip: { label: "Skipped", color: "#64748b" },
  };
  const info = map[action] || { label: action, color: "#64748b" };
  return (
    <span className="pf-action-text" style={{ color: info.color }}>
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

  // ── Stats (Counts for dropdown options) ──────────────────────────────────
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const helpful = feedbacks.filter(f => f.action === "helpful").length;
    const notRelevant = feedbacks.filter(f => f.action === "notRelevant").length;
    const comments = feedbacks.filter(f => f.action === "comment").length;
    return { total, helpful, notRelevant, comments };
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
      {/* ── Minimal Header (No top boxes, no refresh button) ──────────────── */}
      <div className="pf-header">
        <h1 className="pf-title">Student Feedback</h1>
        <p className="pf-subtitle">Manage and review student feedback on your paths</p>
      </div>

      {/* ── Toolbar: Search Bar + Filter Dropdown ────────────────────────── */}
      <div className="pf-controls">
        <div className="pf-search-wrap">
          <svg className="pf-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            className="pf-search-input"
            type="text"
            placeholder="Search path, student, comment..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="pf-filter-select-wrap">
          <label className="pf-filter-label">Filter:</label>
          <select
            className="pf-filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
            <option value="all">All Feedback ({stats.total})</option>
            <option value="helpful">Helpful ({stats.helpful})</option>
            <option value="notRelevant">Not Relevant ({stats.notRelevant})</option>
            <option value="comment">Comments ({stats.comments})</option>
          </select>
        </div>
      </div>

      {/* ── Clean Content List (No pills, no boxes) ──────────────────────── */}
      <div className="pf-content">
        {loading ? (
          <div className="pf-loading">
            <div className="pf-spinner" />
            <span>Loading feedbacks...</span>
          </div>
        ) : error ? (
          <div className="pf-error">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f04438" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            <p>{error}</p>
            <button onClick={fetchFeedbacks}>Retry</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="pf-empty">
            <h3>No feedbacks found</h3>
            <p>No student feedback matches your current filter or search criteria.</p>
          </div>
        ) : (
          pathGroups.map((group, gi) => (
            <div key={gi} className="pf-path-group">
              {/* Clean Section Header */}
              <div className="pf-path-header">
                <span className="pf-path-title">{group.pathName}</span>
                <span className="pf-path-count">({group.feedbacks.length})</span>
              </div>

              {/* Clean Feedback List */}
              <div className="pf-feedback-list">
                {group.feedbacks.map((fb, fi) => (
                  <div key={fi} className="pf-feedback-row">
                    <div className="pf-fb-avatar">
                      {(fb.studentEmail || "S").charAt(0).toUpperCase()}
                    </div>

                    <div className="pf-fb-main">
                      <div className="pf-fb-top-line">
                        <span className="pf-fb-name">
                          {fb.studentName || fb.studentEmail}
                        </span>
                        {fb.studentEmail && fb.studentName && (
                          <span className="pf-fb-email-sub">({fb.studentEmail})</span>
                        )}
                        {fb.stepName && <span className="pf-fb-step-name">· {fb.stepName}</span>}
                      </div>

                      {/* Comment & Meta Text (NO pill boxes) */}
                      {fb.comment && (
                        <div className="pf-fb-comment">
                          "{fb.comment}"
                        </div>
                      )}

                      <div className="pf-fb-meta-line">
                        {fb.viewType && <span>{fb.viewType.charAt(0).toUpperCase() + fb.viewType.slice(1)} View</span>}
                        {fb.studentPhone && <span>· Phone: {fb.studentPhone}</span>}
                        {fb.studentCountry && <span>· Country: {fb.studentCountry}</span>}
                      </div>
                    </div>

                    <div className="pf-fb-right">
                      <ActionBadge action={fb.action} />
                      <span className="pf-fb-time">{timeAgo(fb.createdAt)}</span>
                    </div>
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