import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./Dashboard.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Portal Dropdown ──────────────────────────────────────────────────────────
function PortalDropdown({ anchorRef, isOpen, onClose, children }) {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top:  rect.bottom + 6,
        left: rect.right,
      });
    } else {
      setPos(null);
    }
  }, [isOpen]);

  if (!isOpen || !pos) return null;

  return ReactDOM.createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99998,
        }}
      />
      <div
        className="role-dropdown-menu"
        style={{
          position:  "fixed",
          top:       pos.top,
          left:      pos.left,
          transform: "translateX(-100%)",
          zIndex:    99999,
          minWidth:  "210px",
        }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {

  const [tab, setTab]                           = useState("pending");
  const [selected, setSelected]                 = useState(null);
  const [roleView, setRoleView]                 = useState("partner");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [partnerData, setPartnerData] = useState([]);
  const [userData, setUserData]       = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const dropdownRef = useRef(null);

  // ── Fetch helper ─────────────────────────────────────────────────────────
  const fetchApprovals = (role, setter) => {
    setLoadingData(true);
    axios
      .get(`${BASE_URL}/api/approvals/get?role=${role}`)
      .then(res => { if (res.data.status) setter(res.data.data); })
      .catch(err => console.log(`Error fetching ${role} approvals`, err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { fetchApprovals("Partner", setPartnerData); }, []);

  useEffect(() => {
    if (roleView === "user" && userData.length === 0) {
      fetchApprovals("User", setUserData);
    }
  }, [roleView]);

  // ── Active data ───────────────────────────────────────────────────────────
  const activeData    = roleView === "partner" ? partnerData : userData;
  const countByStatus = (s) => activeData.filter(a => a.status === s).length;
  const filtered      = activeData.filter(a => a.status === tab);

  // ── Approve ───────────────────────────────────────────────────────────────
  const approve = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
          setUserData(prev    => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
          if (selected?._id === id) setSelected(p => ({ ...p, status: "approved" }));
        }
      })
      .catch(err => console.log("Approve error", err));
  };

  // ── Reject ────────────────────────────────────────────────────────────────
  const reject = (id) => {
    axios
      .put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
          setUserData(prev    => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
          if (selected?._id === id) setSelected(p => ({ ...p, status: "rejected" }));
        }
      })
      .catch(err => console.log("Reject error", err));
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (selected) {
    const isPartner = selected.role?.toLowerCase() === "partner";
    const isPending = selected.status === "pending";

    return (
      <div className="dashboard">
        <div className="details-card">

          <button className="back-btn" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
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
                <DetailItem label="Full Name"    value={selected.businessName} icon="👤" />
                <DetailItem label="Email"        value={selected.email} />
                <DetailItem label="Country"      value={selected.country} />
                <DetailItem label="Account Type" value={selected.type} />
              </>
            )}
          </div>

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
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Reject
                </button>
                <button className="btn btn-approve" onClick={() => approve(selected._id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-7" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Approve
                </button>
              </div>
            </>
          )}

          {!isPending && (
            <div style={{
              marginTop: "32px", padding: "16px 20px", borderRadius: "12px",
              background: selected.status === "approved" ? "#E6F4EA" : "#FDE8E8",
              color:      selected.status === "approved" ? "#1E7E34" : "#C0392B",
              fontSize: "14px", fontWeight: "500",
              display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>
                {selected.status === "approved" ? "✅" : "❌"}
              </span>
              This {isPartner ? "partner" : "user"} has already been{" "}
              <strong>{selected.status}</strong>. No further action is required.
            </div>
          )}

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const pendingCount  = countByStatus("pending");
  const approvedCount = countByStatus("approved");
  const rejectedCount = countByStatus("rejected");
  const isPartnerView = roleView === "partner";

  return (
    <div className="dashboard">
      <div className="approvals-card">

        {/* ── Header ── */}
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
                  : "Manage and review user registration requests"}
              </p>
            </div>
          </div>

          {/* ── Role Dropdown ── */}
          <div className="dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className={`role-toggle-btn ${isPartnerView ? "partner-toggle" : "user-toggle"}`}
              onClick={() => setShowRoleDropdown(prev => !prev)}
            >
              <span className="toggle-dot" />
              {isPartnerView ? "Partners" : "Users"}
              <svg
                className={`arrow ${showRoleDropdown ? "open" : ""}`}
                width="12" height="12" viewBox="0 0 12 12" fill="none"
              >
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <PortalDropdown
              anchorRef={dropdownRef}
              isOpen={showRoleDropdown}
              onClose={() => setShowRoleDropdown(false)}
            >
              <button
                className={roleView === "partner" ? "partner-active" : ""}
                onClick={() => {
                  setRoleView("partner");
                  setTab("pending");
                  setShowRoleDropdown(false);
                }}
              >
                <span className="menu-icon">🤝</span>
                Partners
                <span className="menu-count partner-count">{partnerData.length}</span>
              </button>
              <button
                className={roleView === "user" ? "user-active" : ""}
                onClick={() => {
                  setRoleView("user");
                  setTab("pending");
                  setShowRoleDropdown(false);
                }}
              >
                <span className="menu-icon">👤</span>
                Users
                <span className="menu-count user-count">{userData.length}</span>
              </button>
            </PortalDropdown>
          </div>
        </div>

        {/* ── Stats Strip ── */}
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

        {/* ── Status Tab Dropdown ── */}
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

        {/* ── Table ── */}
        <div className="table-wrapper">
          {loadingData ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
              Loading {isPartnerView ? "partners" : "users"}...
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
                      <td><span className="type-badge">{item.type || "—"}</span></td>
                      <td className="email-cell">{item.email}</td>
                      <td className="date-cell">{item.date}</td>
                      <td>
                        <button className="view-btn" onClick={() => setSelected(item)}>
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

// ── Detail Item ──────────────────────────────────────────────────────────────
function DetailItem({ label, value, icon, isLink }) {
  return (
    <div className="detail-row">
      <div className="detail-label">
        {icon && <span className="detail-icon">{icon}</span>}
        {label}
      </div>
      <div className="detail-value">
        {isLink && value
          ? <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
          : value || <span className="empty-val">—</span>
        }
      </div>
    </div>
  );
}