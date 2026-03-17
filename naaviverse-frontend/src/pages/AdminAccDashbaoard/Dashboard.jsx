import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./Dashboard.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Dashboard() {

  const [tab, setTab]                     = useState("pending");
  const [selected, setSelected]           = useState(null);
  const [roleView, setRoleView]           = useState("partner");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // ── separate data stores for partners vs users ──────────────────────────────
  const [partnerData, setPartnerData]     = useState([]);   // from /api/approvals/get
  const [userData, setUserData]           = useState([]);   // from /api/users
  const [loadingUsers, setLoadingUsers]   = useState(false);

  const dropdownRef = useRef(null);

  /* ── FETCH PARTNER APPROVALS ───────────────────────────────────────────────── */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/approvals/get`)
      .then(res => {
        if (res.data.status) setPartnerData(res.data.data);
      })
      .catch(err => console.log("Error fetching approvals", err));
  }, []);

  /* ── FETCH USERS when switching to user view ──────────────────────────────── */
  useEffect(() => {
    if (roleView === "user" && userData.length === 0) {
      setLoadingUsers(true);
      axios
        .get(`${BASE_URL}/api/users`)
        .then(res => {
          const users = res.data?.data || [];
          // Normalise user objects to match the partner approval shape
          const normalised = users.map(u => ({
            _id:          u._id,
            businessName: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
            email:        u.email,
            type:         u.user_type || u.accountType || "User",
            country:      u.country || "—",
            firstName:    u.firstName || "",
            lastName:     u.lastName  || "",
            status:       u.approvalStatus || "approved",  // users are typically already approved
            role:         "user",
            date:         u.createdAt
              ? new Date(u.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
              : "—",
          }));
          setUserData(normalised);
          setLoadingUsers(false);
        })
        .catch(err => {
          console.log("Error fetching users", err);
          setLoadingUsers(false);
        });
    }
  }, [roleView]);

  /* ── CLOSE DROPDOWN ON OUTSIDE CLICK ─────────────────────────────────────── */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ── ACTIVE DATA SOURCE ───────────────────────────────────────────────────── */
  const activeData = roleView === "partner" ? partnerData : userData;

  /* ── COUNT HELPERS ────────────────────────────────────────────────────────── */
  const countByStatus = (status) =>
    activeData.filter(a => a.status === status).length;

  /* ── FILTERED LIST ────────────────────────────────────────────────────────── */
  const filtered = activeData.filter(a => a.status === tab);

  /* ── APPROVE ──────────────────────────────────────────────────────────────── */
  const approve = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev =>
            prev.map(item => item._id === id ? { ...item, status: "approved" } : item)
          );
          // ✅ update selected so buttons disappear immediately
          if (selected?._id === id) setSelected(prev => ({ ...prev, status: "approved" }));
        }
      })
      .catch(err => console.log("Approve error", err));
  };

  /* ── REJECT ───────────────────────────────────────────────────────────────── */
  const reject = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev =>
            prev.map(item => item._id === id ? { ...item, status: "rejected" } : item)
          );
          // ✅ update selected so buttons disappear immediately
          if (selected?._id === id) setSelected(prev => ({ ...prev, status: "rejected" }));
        }
      })
      .catch(err => console.log("Reject error", err));
  };

  /* ────────────────────────────────────────────────────────────────────────────
     DETAIL VIEW
  ──────────────────────────────────────────────────────────────────────────── */
  if (selected) {
    const isPartner = selected.role?.toLowerCase() === "partner";

    // ✅ FIX 2: Only show Approve / Reject when status is still "pending"
    const isPending = selected.status === "pending";

    return (
      <div className="dashboard">
        <div className="details-card">

          {/* Back button */}
          <button className="back-btn" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to {isPartner ? "Partner" : "User"} Approvals
          </button>

          {/* Hero */}
          <div className="details-hero">
            <div className={`details-avatar ${isPartner ? "partner-avatar" : "user-avatar"}`}>
              {selected.businessName?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{selected.businessName}</h2>
                <span className={`status-pill ${selected.status}`}>
                  {selected.status === "approved" ? "✓ Verified"
                    : selected.status === "rejected" ? "✗ Rejected"
                    : "⏳ Pending"}
                </span>
              </div>
              <span className={`role-chip ${isPartner ? "partner" : "user"}`}>
                {isPartner ? "🤝 Partner" : "👤 User"}
              </span>
            </div>
          </div>

          {/* Profile details */}
          <div className="details-section-title">Profile Details</div>

          <div className="details-grid">
            {isPartner ? (
              <>
                <DetailItem label="Business Name" value={selected.businessName} icon="🏢" />
                <DetailItem label="Business Type" value={selected.type} />
                <DetailItem label="Email"         value={selected.email} />
                <DetailItem label="Website"       value={selected.website} isLink />
                <DetailItem label="First Name"    value={selected.firstName} />
                <DetailItem label="Last Name"     value={selected.lastName} />
                <DetailItem label="Position"      value={selected.position} />
                <DetailItem label="Country"       value={selected.country} />
              </>
            ) : (
              <>
                <DetailItem label="Full Name"     value={selected.businessName} icon="👤" />
                <DetailItem label="Email"         value={selected.email} />
                <DetailItem label="Country"       value={selected.country} />
                <DetailItem label="Account Type"  value={selected.type} />
              </>
            )}
          </div>

          {/* ✅ FIX 2: Approval note + buttons only shown when PENDING */}
          {isPending && (
            <>
              <div className={`approval-note ${isPartner ? "partner-note" : "user-note"}`}>
                <span>
                  📧 Approval confirmation will be emailed to the {isPartner ? "partner" : "user"}
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
            </>
          )}

          {/* ✅ Show read-only status message when already actioned */}
          {!isPending && (
            <div
              style={{
                marginTop: "32px",
                padding: "16px 20px",
                borderRadius: "12px",
                background: selected.status === "approved" ? "#E6F4EA" : "#FDE8E8",
                color:      selected.status === "approved" ? "#1E7E34" : "#C0392B",
                fontSize:   "14px",
                fontWeight: "500",
                display:    "flex",
                alignItems: "center",
                gap:        "10px",
              }}
            >
              <span style={{ fontSize: "18px" }}>
                {selected.status === "approved" ? "✅" : "❌"}
              </span>
              This {isPartner ? "partner" : "user"} has already been{" "}
              <strong>{selected.status}</strong>.
              No further action is required.
            </div>
          )}

        </div>
      </div>
    );
  }

  /* ────────────────────────────────────────────────────────────────────────────
     LIST VIEW
  ──────────────────────────────────────────────────────────────────────────── */
  const pendingCount  = countByStatus("pending");
  const approvedCount = countByStatus("approved");
  const rejectedCount = countByStatus("rejected");
  const isPartnerView = roleView === "partner";

  return (
    <div className="dashboard">
      <div className="approvals-card">

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
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
                  : "Manage and review user accounts"}
              </p>
            </div>
          </div>

          {/* ── ROLE DROPDOWN ────────────────────────────────────────────────
              ✅ FIX 1: Added "Users" option — switches to userData          */}
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className={`dropdown-toggle ${isPartnerView ? "partner-toggle" : "user-toggle"}`}
              onClick={() => setShowRoleDropdown(prev => !prev)}
            >
              <span className="toggle-dot" />
              {isPartnerView ? "Partners" : "Users"}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "4px" }}>
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showRoleDropdown && (
              <div className="dropdown-menu">
                <button
                  className={roleView === "partner" ? "active-option" : ""}
                  onClick={() => {
                    setRoleView("partner");
                    setTab("pending");
                    setShowRoleDropdown(false);
                  }}
                >
                  🤝 Partners
                </button>
                {/* ✅ NEW: Users option */}
                <button
                  className={roleView === "user" ? "active-option" : ""}
                  onClick={() => {
                    setRoleView("user");
                    setTab("approved"); // users default to approved tab since they're already in the system
                    setShowRoleDropdown(false);
                  }}
                >
                  👤 Users
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
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
            <span className="stat-num">{activeData.length}</span>
            <span className="stat-lbl">Total</span>
          </div>
        </div>

        {/* ── STATUS DROPDOWN ───────────────────────────────────────────────── */}
        <div className="tab-dropdown-wrapper">
          <select
            className="tab-dropdown"
            value={tab}
            onChange={(e) => setTab(e.target.value)}
          >
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>

        {/* ── TABLE ─────────────────────────────────────────────────────────── */}
        <div className="table-wrapper">
          {loadingUsers ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
              Loading users...
            </div>
          ) : (
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
                        <p>No {tab} {isPartnerView ? "partner" : "user"} records found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── DETAIL ITEM ─────────────────────────────────────────────────────────────── */
function DetailItem({ label, value, icon, isLink }) {
  return (
    <div className="detail-row">
      <div className="detail-label">
        {icon && <span className="detail-icon">{icon}</span>}
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