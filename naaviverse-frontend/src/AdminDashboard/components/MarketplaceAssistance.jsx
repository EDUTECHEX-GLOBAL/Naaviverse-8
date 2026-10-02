import React, { useState, useEffect, useMemo } from "react";
import "./MarketplaceAssistance.scss";
import marketplaceReplacementService from "../../services/marketplaceReplacementService";
import AssistanceRequestDetailsModal from "./AssistanceRequestDetailsModal";

// Fallback services catalog for admin recommendations if API empty
const CATALOG_FALLBACK = [
  {
    _id: "srv_rec_01",
    name: "Applied Macroeconomic Modeling & Policy Masterclass",
    category: "institution",
    role: "INSTITUTE",
    cost: "18500",
    goal: "Hands-on weekend live batch with econometric case studies tailored for policy analysts.",
    average_rating: 4.8,
  },
  {
    _id: "srv_rec_02",
    name: "1-on-1 Quantitative Trading & Risk Mentorship",
    category: "mentor",
    role: "MENTOR",
    cost: "24000",
    goal: "Direct 8-week mentorship with proprietary desk trader covering Python and risk models.",
    average_rating: 4.9,
  },
  {
    _id: "srv_rec_03",
    name: "Global Financial Data & Analytics Toolkit",
    category: "vendor",
    role: "VENDOR",
    cost: "0",
    goal: "Interactive data visualization and analysis tools tailored for macroeconomic modeling.",
    average_rating: 4.5,
  },
  {
    _id: "srv_rec_04",
    name: "Enterprise Business Intelligence Platform",
    category: "vendor",
    role: "VENDOR",
    cost: "45000",
    goal: "Comprehensive analytics suite providing real-time data feeds and automated reporting.",
    average_rating: 4.2,
  },
];

function getInitials(name) {
  if (!name) return "ST";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function MarketplaceAssistance() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await marketplaceReplacementService.getAllAssistanceRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleStatusChange = async (reqId, nextStatus) => {
    await marketplaceReplacementService.updateRequestStatus(reqId, nextStatus);
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: nextStatus, updatedAt: new Date().toISOString() } : r))
    );
    if (selectedRequest && selectedRequest.id === reqId) {
      setSelectedRequest((prev) => ({ ...prev, status: nextStatus }));
    }
  };

  const filteredRequests = useMemo(() => {
    let list = requests;
    if (statusFilter !== "all") {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.userName?.toLowerCase().includes(q) ||
          r.userEmail?.toLowerCase().includes(q) ||
          r.pathName?.toLowerCase().includes(q) ||
          r.stepName?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [requests, statusFilter, search]);

  const metrics = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const reviewing = requests.filter((r) => r.status === "reviewing").length;
    const resolved = requests.filter((r) => r.status === "resolved").length;
    const closed = requests.filter((r) => r.status === "closed").length;
    return { total, pending, reviewing, resolved, closed };
  }, [requests]);

  return (
    <div className="marketplace-assistance-page">
      {/* ── Compact Header (tight, zero extra space below) ── */}
      <div className="map-header">
        <div className="map-header-left">
          <div className="map-title-row">
            <h1 className="map-title">Marketplace Assistance Requests</h1>
            <span className="map-live-pill">
              <span className="map-live-dot" />
              Live Queue
            </span>
          </div>
          <p className="map-subtitle">
            User escalations exceeding standard 3-replacement limit.
          </p>
        </div>

        <button
          className={`btn-refresh ${loading ? "is-loading" : ""}`}
          onClick={loadRequests}
          disabled={loading}
          title="Refresh queue"
        >
          <svg
            className={`refresh-icon ${loading ? "spin" : ""}`}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Enhanced Stat Boxes (Rich, distinct cards, non-overlapping) ── */}
      <div className="map-stat-cards">
        {/* Total */}
        <div
          className={`map-stat-card card-total ${statusFilter === "all" ? "active" : ""}`}
          onClick={() => setStatusFilter("all")}
          role="button"
          tabIndex={0}
          title="Click to view all requests"
        >
          <div className="stat-card-left">
            <span className="stat-card-label">Total Requests</span>
            <span className="stat-card-val">{metrics.total}</span>
          </div>
          <div className="stat-card-icon icon-total">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        </div>

        {/* Pending */}
        <div
          className={`map-stat-card card-pending ${statusFilter === "pending" ? "active" : ""}`}
          onClick={() => setStatusFilter("pending")}
          role="button"
          tabIndex={0}
          title="Click to filter by Pending"
        >
          <div className="stat-card-left">
            <span className="stat-card-label">Pending Review</span>
            <span className="stat-card-val">{metrics.pending}</span>
          </div>
          <div className="stat-card-icon icon-pending">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
        </div>

        {/* In Review */}
        <div
          className={`map-stat-card card-reviewing ${statusFilter === "reviewing" ? "active" : ""}`}
          onClick={() => setStatusFilter("reviewing")}
          role="button"
          tabIndex={0}
          title="Click to filter by In Review"
        >
          <div className="stat-card-left">
            <span className="stat-card-label">In Review / Chat</span>
            <span className="stat-card-val">{metrics.reviewing}</span>
          </div>
          <div className="stat-card-icon icon-reviewing">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </div>
        </div>

        {/* Resolved */}
        <div
          className={`map-stat-card card-resolved ${statusFilter === "resolved" ? "active" : ""}`}
          onClick={() => setStatusFilter("resolved")}
          role="button"
          tabIndex={0}
          title="Click to filter by Resolved"
        >
          <div className="stat-card-left">
            <span className="stat-card-label">Resolved</span>
            <span className="stat-card-val">{metrics.resolved}</span>
          </div>
          <div className="stat-card-icon icon-resolved">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Compact Filter Controls Bar ── */}
      <div className="map-controls-bar">
        <div className="map-search-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search student, path, step, or ticket #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="map-search-clear" onClick={() => setSearch("")} title="Clear search">
              ✕
            </button>
          )}
        </div>

        <div className="map-filter-pills">
          {[
            { id: "all", label: "All Statuses" },
            { id: "pending", label: "Pending" },
            { id: "reviewing", label: "Reviewing" },
            { id: "resolved", label: "Resolved" },
            { id: "closed", label: "Closed" },
          ].map((f) => (
            <button
              key={f.id}
              className={`map-filter-pill ${statusFilter === f.id ? "active" : ""}`}
              onClick={() => setStatusFilter(f.id)}
            >
              <span>{f.label}</span>
              {f.count !== undefined && <span className="pill-count">{f.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── Full Fit Table (No Horizontal Scrolling, No Overlap, Multi-line Text) ── */}
      <div className="map-table-card">
        {loading ? (
          <div className="map-empty-state">
            <div className="map-loader-spinner" />
            <p>Loading assistance requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="map-empty-state">
            <div className="map-empty-icon">🔍</div>
            <p className="map-empty-title">No marketplace assistance requests found</p>
            <p className="map-empty-sub">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "No student escalations are currently pending in this queue."}
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="map-table">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "23%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Path &amp; Step</th>
                  <th>Requirement Snippet</th>
                  <th>Replacements</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r) => {
                  const dateObj = new Date(r.createdAt);
                  const dateStr = isNaN(dateObj.getTime())
                    ? "Recent"
                    : dateObj.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  const timeStr = isNaN(dateObj.getTime())
                    ? ""
                    : dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                  const reqMessage =
                    r.userRequirement?.message ||
                    (r.userRequirement?.reasons?.length
                      ? `Reason: ${r.userRequirement.reasons.join(", ")}`
                      : "Replacement assistance requested.");

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRequest(r)}
                      className="map-table-row"
                    >
                      {/* Date & Time (Clean, avoids ID overlap) */}
                      <td className="col-date" title={`Ticket ID: ${r.id}`}>
                        <div className="t-date-day">{dateStr}</div>
                        {timeStr && <div className="t-date-time">{timeStr}</div>}
                      </td>

                      {/* Student info with multi-line wrapping */}
                      <td className="col-student">
                        <div className="t-user-cell">
                          <div className="t-user-avatar">
                            {getInitials(r.userName)}
                          </div>
                          <div className="t-user-info">
                            <div className="t-user-name" title={r.userName || "Student"}>
                              {r.userName || "Student"}
                            </div>
                            <div className="t-user-email" title={r.userEmail || ""}>
                              {r.userEmail || "—"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Path & Step with multi-line wrapping */}
                      <td className="col-path">
                        <div className="t-path-cell">
                          <div className="t-path-name" title={r.pathName || "General Path"}>
                            {r.pathName || "General Path"}
                          </div>
                          <div className="t-step-name" title={r.stepName || "Step Details"}>
                            <span className="t-step-arrow">↳</span> {r.stepName || "General Step"}
                          </div>
                        </div>
                      </td>

                      {/* Requirement Snippet - 2 lines display */}
                      <td className="col-req">
                        <div className="t-req-snippet" title={reqMessage}>
                          <span className="quote-mark">“</span>
                          <span className="quote-text">{reqMessage}</span>
                        </div>
                      </td>

                      {/* Replacements */}
                      <td className="col-rep">
                        <span className="t-rep-badge" title="Recommendation replacements used by student">
                          {r.replacementCount || 3}/3 Used
                        </span>
                      </td>

                      {/* Status - ample space, no cutoff */}
                      <td className="col-status" style={{ textAlign: "center" }}>
                        <span className={`map-status-pill status-${r.status}`}>
                          <span className={`status-dot dot-${r.status}`} />
                          <span className="status-text">{r.status}</span>
                        </span>
                      </td>

                      {/* Action - ample space, no overlap */}
                      <td className="col-action" style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-view-ticket"
                          onClick={() => setSelectedRequest(r)}
                          title="Open review & chat drawer"
                        >
                          <span>Review</span>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Details Drawer/Modal (existing modal preserved) ── */}
      <AssistanceRequestDetailsModal
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        onStatusChange={handleStatusChange}
        availableServices={CATALOG_FALLBACK}
      />
    </div>
  );
}
