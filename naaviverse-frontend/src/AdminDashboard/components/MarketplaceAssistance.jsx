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
    return { total, pending, reviewing, resolved };
  }, [requests]);

  return (
    <div className="marketplace-assistance-page">
      {/* Top Banner / Heading */}
      <div className="map-header">
        <div>
          <h1 className="map-title">Marketplace Assistance Requests</h1>
          <p className="map-subtitle">
            Manage user escalations when standard recommendations reach the 3-replacement limit.
          </p>
        </div>
        <button className="btn-refresh" onClick={loadRequests}>
          ↻ Refresh Requests
        </button>
      </div>

      {/* Metrics Row */}
      <div className="map-metrics-grid">
        <div className="metric-card">
          <div className="metric-lbl">Total Requests</div>
          <div className="metric-val">{metrics.total}</div>
        </div>
        <div className="metric-card metric-pending">
          <div className="metric-lbl">Pending Review</div>
          <div className="metric-val">{metrics.pending}</div>
        </div>
        <div className="metric-card metric-reviewing">
          <div className="metric-lbl">In Review / Chat</div>
          <div className="metric-val">{metrics.reviewing}</div>
        </div>
        <div className="metric-card metric-resolved">
          <div className="metric-lbl">Resolved</div>
          <div className="metric-val">{metrics.resolved}</div>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="map-controls-bar">
        <div className="map-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search by student name, email, path, step, or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="map-search-clear" onClick={() => setSearch("")}>✕</button>
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
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table */}
      <div className="map-table-card">
        {loading ? (
          <div className="map-empty-state">Loading assistance requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="map-empty-state">
            <span style={{ fontSize: 32 }}>🔍</span>
            <p>No marketplace assistance requests found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="map-table">
              <thead>
                <tr>
                  <th>Ticket ID / Date</th>
                  <th>Student</th>
                  <th>Path & Step</th>
                  <th>Requirement Snippet</th>
                  <th>Replacements</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r) => {
                  const dateStr = new Date(r.createdAt).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <tr key={r.id} onClick={() => setSelectedRequest(r)} className="map-table-row">
                      <td>
                        <div className="t-id">{r.id}</div>
                        <div className="t-date">{dateStr}</div>
                      </td>
                      <td>
                        <div className="t-user-name">{r.userName || "Student"}</div>
                        <div className="t-user-email">{r.userEmail}</div>
                      </td>
                      <td>
                        <div className="t-path">{r.pathName}</div>
                        <div className="t-step">{r.stepName}</div>
                      </td>
                      <td>
                        <div className="t-req-snippet">
                          {r.userRequirement?.message || "Custom replacement requested."}
                        </div>
                      </td>
                      <td>
                        <span className="t-rep-badge">
                          {r.replacementCount || 3} / 3 Used
                        </span>
                      </td>
                      <td>
                        <span className={`map-status-pill status-${r.status}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-view-ticket"
                          onClick={() => setSelectedRequest(r)}
                        >
                          Review &amp; Chat →
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

      {/* Details Drawer/Modal */}
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
