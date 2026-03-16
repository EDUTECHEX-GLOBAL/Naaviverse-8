import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Dashboard.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Dashboard() {

  const [tab, setTab] = useState("pending");
  const [selected, setSelected] = useState(null);
  const [roleView, setRoleView] = useState("partner");
  const [data, setData] = useState([]);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const dropdownRef = useRef(null);

  /* ---------------- FETCH APPROVALS ---------------- */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/approvals/get`)
      .then(res => {
        if (res.data.status) setData(res.data.data);
      })
      .catch(err => console.log("Error fetching approvals", err));
  }, []);

  /* ---------------- CLICK OUTSIDE DROPDOWN ---------------- */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- HELPERS ---------------- */
  const countByRoleAndStatus = (role, status) =>
    data.filter(a =>
      a.role?.toLowerCase() === role.toLowerCase() && a.status === status
    ).length;

  const filtered = data.filter(a => {
    if (a.status !== tab) return false;
    if (a.role?.toLowerCase() !== roleView.toLowerCase()) return false;
    return true;
  });

  /* ---------------- APPROVE ---------------- */
  const approve = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" })
      .then(res => {
        if (res.data.status) {
          setData(prev => prev.map(item =>
            item._id === id ? { ...item, status: "approved" } : item
          ));
          if (selected?._id === id) setSelected(prev => ({ ...prev, status: "approved" }));
        }
      })
      .catch(err => console.log("Approve error", err));
  };

  /* ---------------- REJECT ---------------- */
  const reject = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" })
      .then(res => {
        if (res.data.status) {
          setData(prev => prev.map(item =>
            item._id === id ? { ...item, status: "rejected" } : item
          ));
          if (selected?._id === id) setSelected(prev => ({ ...prev, status: "rejected" }));
        }
      })
      .catch(err => console.log("Reject error", err));
  };

  /* ---------------- DETAILS PAGE ---------------- */
  if (selected) {
    const isPartner = selected.role?.toLowerCase() === "partner";
    return (
      <div className="dashboard">
        <div className="details-card">

          <button className="back-btn" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to {isPartner ? "Partner" : "User"} Approvals
          </button>

          <div className="details-hero">
            <div className={`details-avatar ${isPartner ? "partner-avatar" : "user-avatar"}`}>
              {selected.businessName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{selected.businessName}</h2>
                <span className={`status-pill ${selected.status}`}>
                  {selected.status === "approved" ? " Verified"
                    : selected.status === "rejected" ? " Rejected"
                    : " Pending"}
                </span>
              </div>
              <span className={`role-chip ${isPartner ? "partner" : "user"}`}>
                {isPartner ? " Partner" : " User"}
              </span>
            </div>
          </div>

          <div className="details-section-title">Profile Details</div>

          <div className="details-grid">
            {isPartner ? (
              <>
                <DetailItem label="Business Name" value={selected.businessName} icon="🏢" />
                <DetailItem label="Business Type" value={selected.type} icon="" />
                <DetailItem label="Email" value={selected.email} icon="" />
                <DetailItem label="Website" value={selected.website} icon="" isLink />
                <DetailItem label="First Name" value={selected.firstName} icon="" />
                <DetailItem label="Last Name" value={selected.lastName} icon="" />
                <DetailItem label="Position" value={selected.position} icon="" />
                <DetailItem label="Country" value={selected.country} icon="" />
              </>
            ) : (
              <>
                <DetailItem label="Full Name" value={`${selected.firstName || ""} ${selected.lastName || ""}`.trim() || selected.businessName} icon="👤" />
                <DetailItem label="Email" value={selected.email} icon="" />
                <DetailItem label="Country" value={selected.country} icon="" />
                <DetailItem label="Account Type" value={selected.type} icon="" />
              </>
            )}
          </div>

          <div className={`approval-note ${isPartner ? "partner-note" : "user-note"}`}>
            <span>
              {isPartner
                ? "📧 Approval confirmation will be emailed to the partner"
                : "📧 Approval confirmation will be emailed to the user"}
            </span>
          </div>

          <div className="action-buttons">
            <button className="btn btn-reject" onClick={() => reject(selected._id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Reject
            </button>
            <button className="btn btn-approve" onClick={() => approve(selected._id)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Approve
            </button>
          </div>

        </div>
      </div>
    );
  }

  /* ---------------- LIST PAGE ---------------- */
  const pendingCount  = countByRoleAndStatus(roleView, "pending");
  const approvedCount = countByRoleAndStatus(roleView, "approved");
  const rejectedCount = countByRoleAndStatus(roleView, "rejected");
  const isPartnerView = roleView === "partner";

  return (
    <div className="dashboard">
      <div className="approvals-card">

        {/* ---- HEADER ---- */}
        <div className="card-header">
          <div className="header-left">
            <div className={`header-icon ${isPartnerView ? "partner-icon" : "user-icon"}`}>
              {isPartnerView ? "🤝" : "👤"}
            </div>
            <div>
              <h2>{isPartnerView ? "Partner Approvals" : "User Approvals"}</h2>
              <p className="header-subtitle">
                {isPartnerView
                  ? "Manage and review partner onboarding requests"
                  : "Manage and review user account requests"}
              </p>
            </div>
          </div>

          {/* ---- ROLE DROPDOWN — fixed className, no "..." ---- */}
         <div className="dropdown-container" ref={dropdownRef}>
  <button
    type="button"
    className={`dropdown-toggle ${isPartnerView ? "partner-toggle" : "user-toggle"}`}
    onClick={() => setShowRoleDropdown(prev => !prev)}
  >
    <span className="toggle-dot" />
    {isPartnerView ? "Partners" : "Users"}
  </button>

  {showRoleDropdown && (
    <div className="dropdown-menu">
      <button
        onClick={() => {
          setRoleView("partner");
          setTab("pending");
          setShowRoleDropdown(false);
        }}
      >
        🤝 Partners
      </button>

      <button
        onClick={() => {
          setRoleView("user");
          setTab("pending");
          setShowRoleDropdown(false);
        }}
      >
        👤 Users
      </button>
    </div>
  )}
</div>
        </div>

        {/* ---- STATS STRIP ---- */}
        <div className="stats-strip">
          <div className={`stat-item ${isPartnerView ? "partner-stat" : "user-stat"}`}>
            <span className="stat-num">{pendingCount}</span>
            <span className="stat-lbl">Pending</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item green-stat">
            <span className="stat-num">{approvedCount}</span>
            <span className="stat-lbl">Approved</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item red-stat">
            <span className="stat-num">{rejectedCount}</span>
            <span className="stat-lbl">Rejected</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item total-stat">
            <span className="stat-num">{data.filter(a => a.role?.toLowerCase() === roleView).length}</span>
            <span className="stat-lbl">Total</span>
          </div>
        </div>

        {/* ---- STATUS DROPDOWN ---- */}
        <div className="tab-dropdown-wrapper">
          <select
            className="tab-dropdown"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            <option value="pending"> Pending ({pendingCount})</option>
            <option value="approved"> Approved ({approvedCount})</option>
            <option value="rejected"> Rejected ({rejectedCount})</option>
          </select>
        </div>

        {/* ---- TABLE ---- */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{isPartnerView ? "Business" : "Name"}</th>
                <th>Type</th>
                <th>Email</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item._id} className="table-row">

                    <td>
                      <div className="business-info">
                        <div className={`row-avatar ${isPartnerView ? "partner-row-avatar" : "user-row-avatar"}`}>
                          {item.businessName?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="business-name">{item.businessName}</span>
                      </div>
                    </td>

                    <td>
                      <span className="type-badge">{item.type || "—"}</span>
                    </td>

                    <td className="email-cell">{item.email}</td>

                    <td className="date-cell">{item.date}</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelected(item)}
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">
                    <div className="empty-state">
                      <div className="empty-icon">{isPartnerView ? "🤝" : "👤"}</div>
                      <p>No {tab} {isPartnerView ? "partner" : "user"} approvals found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

/* ---------------- DETAIL ITEM COMPONENT ---------------- */
function DetailItem({ label, value, icon, isLink }) {
  return (
    <div className="detail-row">
      <div className="detail-label">
        <span className="detail-icon">{icon}</span>
        {label}
      </div>
      <div className="detail-value">
        {isLink && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
        ) : (
          value || <span className="empty-val">—</span>
        )}
      </div>
    </div>
  );
}