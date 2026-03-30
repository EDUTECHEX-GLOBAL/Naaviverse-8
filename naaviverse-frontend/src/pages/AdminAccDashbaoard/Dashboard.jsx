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
      setPos({ top: rect.bottom + 6, left: rect.right });
    } else {
      setPos(null);
    }
  }, [isOpen]);

  if (!isOpen || !pos) return null;

  return ReactDOM.createPortal(
    <>
      <div onClick={onClose} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998 }} />
      <div
        className="role-dropdown-menu"
        style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-100%)", zIndex: 99999, minWidth: "210px" }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}

// ── Stat Box Card ────────────────────────────────────────────────────────────
function StatBox({ colorClass, icon, title, value, subtitle, badge, badgeLabel, onAction, actionLabel }) {
  return (
    <div className={`stat-box ${colorClass}`}>
      <div className="stat-box-top">
        <div className="stat-box-icon">{icon}</div>
        <div className="stat-box-badge">{badge}</div>
      </div>
      <div className="stat-box-title">{title}</div>
      <div className="stat-box-value">{value}</div>
      <div className="stat-box-subtitle">{subtitle}</div>
      {onAction && (
        <button className="stat-box-btn" onClick={onAction}>
          {actionLabel || "Review"}
        </button>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // view: "home" | "approvals"
  const [view, setView] = useState("home");

  // Approvals state
  const [tab, setTab]                           = useState("pending");
  const [selected, setSelected]                 = useState(null);
  const [roleView, setRoleView]                 = useState("partner");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [partnerData, setPartnerData]           = useState([]);
  const [userData, setUserData]                 = useState([]);
  const [loadingData, setLoadingData]           = useState(false);

  const [fullUserData, setFullUserData]         = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const dropdownRef = useRef(null);

  // ── Fetch approvals ───────────────────────────────────────────────────────
  const fetchApprovals = (role, setter) => {
    setLoadingData(true);
    axios
      .get(`${BASE_URL}/api/approvals/get?role=${role}`)
      .then(res => { if (res.data.status) setter(res.data.data); })
      .catch(err => console.log(`Error fetching ${role} approvals`, err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => {
    if (view === "approvals") {
      fetchApprovals("Partner", setPartnerData);
    }
  }, [view]);

  useEffect(() => {
    if (view === "approvals" && roleView === "user" && userData.length === 0) {
      fetchApprovals("User", setUserData);
    }
  }, [roleView, view]);

  // ── Fetch full user profile ───────────────────────────────────────────────
  useEffect(() => {
    if (!selected) { setFullUserData(null); return; }
    if (selected.role?.toLowerCase() !== "user") { setFullUserData(null); return; }
    setLoadingUserDetail(true);
    axios
      .get(`${BASE_URL}/api/users/get/${selected.email}`)
      .then(res => { if (res.data?.status) setFullUserData(res.data.data); })
      .catch(err => console.log("Error fetching full user data:", err))
      .finally(() => setLoadingUserDetail(false));
  }, [selected]);

  const activeData    = roleView === "partner" ? partnerData : userData;
  const countByStatus = (s) => activeData.filter(a => a.status === s).length;
  const filtered      = activeData.filter(a => a.status === tab);

  const approve = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
          setUserData(prev    => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
          if (selected?._id === id) setSelected(p => ({ ...p, status: "approved" }));
        }
      });
  };

  const reject = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" })
      .then(res => {
        if (res.data.status) {
          setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
          setUserData(prev    => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
          if (selected?._id === id) setSelected(p => ({ ...p, status: "rejected" }));
        }
      });
  };

  // ══════════════════════════════════════════════════════════════════════════
  // HOME VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "home") {
    return (
      <div className="dashboard">
        <div className="home-wrapper">

          {/* Header */}
          <div className="home-header">
            <div className="home-header-left">
              <div className="home-greeting">Welcome back 👋</div>
              <h1 className="home-title">Dashboard</h1>
              <p className="home-sub">Your AI-powered path engine — all key metrics at a glance</p>
            </div>
            <div className="home-date-badge">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* 4 Stat Boxes */}
          <div className="stat-boxes-grid">

            {/* Box 1 — Paths */}
            <div className="stat-box box-violet">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M4 17L8 7l4 6 4-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-box-badge">Active</div>
              </div>
              <div className="stat-box-title">Learning Paths</div>
              <div className="stat-box-value">142</div>
              <div className="stat-box-subtitle">
                <span>Published: 98</span>
                <span>Draft: 44</span>
              </div>
            </div>

            {/* Box 2 — Users */}
            <div className="stat-box box-rose">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M21 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="stat-box-badge">Registered</div>
              </div>
              <div className="stat-box-title">Total Users</div>
              <div className="stat-box-value">3,841</div>
              <div className="stat-box-subtitle">
                <span>Active: 2,910</span>
                <span>Pending: 931</span>
              </div>
            </div>

            {/* Box 3 — Marketplace */}
            <div className="stat-box box-cyan">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-box-badge">Live</div>
              </div>
              <div className="stat-box-title">Marketplace Items</div>
              <div className="stat-box-value">576</div>
              <div className="stat-box-subtitle">
                <span>Courses: 312</span>
                <span>Resources: 264</span>
              </div>
            </div>

            {/* Box 4 — Approvals (REAL data, click → approvals page) */}
            <div className="stat-box box-amber">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="19" cy="5" r="3" fill="currentColor" opacity="0.25"/>
                    <path d="M17.5 5h3M19 3.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="stat-box-badge pending-badge">Pending</div>
              </div>
              <div className="stat-box-title">Pending Approvals</div>
              <div className="stat-box-value">—</div>
              <div className="stat-box-subtitle">
                <span>Partners &amp; Users</span>
                <span>awaiting review</span>
              </div>
              <button
                className="stat-box-btn"
                onClick={() => { setView("approvals"); setSelected(null); setTab("pending"); }}
              >
                Review →
              </button>
            </div>

          </div>

          {/* KPI Section */}
          <div className="kpi-section">
            <div className="kpi-header">
              <h2>Key Performance Indicators</h2>
              <span className="kpi-tag">Live Data</span>
            </div>
            <div className="kpi-grid">

              <div className="kpi-card kpi-engagement">
                <div className="kpi-card-label">Platform Engagement</div>
                <div className="kpi-donut-wrap">
                  <svg className="kpi-donut" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="12"
                      strokeDasharray={`${0.87 * 251.2} ${251.2}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"/>
                    <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">87%</text>
                  </svg>
                </div>
                <div className="kpi-card-sub">Avg. session engagement rate</div>
              </div>

              <div className="kpi-card kpi-activity">
                <div className="kpi-card-label">Recent Activity</div>
                <div className="kpi-activity-list">
                  <div className="kpi-activity-item">
                    <span className="kpi-dot dot-violet"></span>
                    <span>New path created by Admin</span>
                    <span className="kpi-time">2m ago</span>
                  </div>
                  <div className="kpi-activity-item">
                    <span className="kpi-dot dot-rose"></span>
                    <span>User Priya K. registered</span>
                    <span className="kpi-time">14m ago</span>
                  </div>
                  <div className="kpi-activity-item">
                    <span className="kpi-dot dot-amber"></span>
                    <span>Partner Educo Inc. pending</span>
                    <span className="kpi-time">1h ago</span>
                  </div>
                  <div className="kpi-activity-item">
                    <span className="kpi-dot dot-cyan"></span>
                    <span>Marketplace item published</span>
                    <span className="kpi-time">3h ago</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card kpi-actions">
                <div className="kpi-card-label">Quick Actions</div>
                <div className="kpi-actions-grid">
                  <button className="kpi-action-btn" onClick={() => setView("approvals")}>
                    <span className="kpi-action-icon action-amber">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </span>
                    Review Approvals
                  </button>
                  <button className="kpi-action-btn">
                    <span className="kpi-action-icon action-violet">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </span>
                    Add New Path
                  </button>
                  <button className="kpi-action-btn">
                    <span className="kpi-action-icon action-rose">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </span>
                    Manage Users
                  </button>
                  <button className="kpi-action-btn">
                    <span className="kpi-action-icon action-cyan">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    Export Data
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPROVALS — DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "approvals" && selected) {
    const isPartner = selected.role?.toLowerCase() === "partner";
    const isPending = selected.status === "pending";

    return (
      <div className="dashboard">
        <div className="details-card">
          <button className="back-btn" onClick={() => setSelected(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
                  {selected.status === "approved" ? "✓ Verified" : selected.status === "rejected" ? "✗ Rejected" : "⏳ Pending"}
                </span>
              </div>
              <span className={`role-chip ${isPartner ? "partner" : "user"}`}>
                {isPartner ? "🤝 Partner" : "👤 User"}
              </span>
            </div>
          </div>

          {isPartner ? (
            <>
              <div className="details-section-title">Profile Details</div>
              <div className="details-grid">
                <DetailItem label="Business Name" value={selected.businessName} icon="🏢" />
                <DetailItem label="Business Type" value={selected.type} />
                <DetailItem label="Email"         value={selected.email} />
                <DetailItem label="Website"       value={selected.website} isLink />
                <DetailItem label="First Name"    value={selected.firstName} />
                <DetailItem label="Last Name"     value={selected.lastName} />
                <DetailItem label="Position"      value={selected.position} />
                <DetailItem label="Country"       value={selected.country} />
              </div>
            </>
          ) : loadingUserDetail ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>Loading full profile...</div>
          ) : (
            <>
              <SectionTitle>Level 1 — Basic Info</SectionTitle>
              <div className="details-grid">
                <DetailItem label="Full Name"    value={fullUserData?.name    || selected.businessName} icon="👤" />
                <DetailItem label="Email"        value={fullUserData?.email   || selected.email} />
                <DetailItem label="Username"     value={fullUserData?.username} />
                <DetailItem label="Phone"        value={fullUserData?.phoneNumber} />
                <DetailItem label="Account Type" value={fullUserData?.userType || selected.type} />
                <DetailItem label="Country"      value={fullUserData?.country  || selected.country} />
                <DetailItem label="State"        value={fullUserData?.state} />
                <DetailItem label="City"         value={fullUserData?.city} />
                <DetailItem label="Postal Code"  value={fullUserData?.postalCode} />
              </div>
              <SectionTitle>Level 2 — Academic Info</SectionTitle>
              <div className="details-grid">
                <DetailItem label="School"              value={fullUserData?.school} />
                <DetailItem label="Grade"               value={fullUserData?.grade} />
                <DetailItem label="Curriculum"          value={fullUserData?.curriculum} />
                <DetailItem label="Stream"              value={fullUserData?.stream} />
                <DetailItem label="Performance"         value={fullUserData?.performance} />
                <DetailItem label="Financial Situation" value={fullUserData?.financialSituation} />
                <DetailItem label="LinkedIn"            value={fullUserData?.linkedin} isLink />
              </div>
              <SectionTitle>Level 3 — Personality</SectionTitle>
              <div className="details-grid">
                <DetailItem label="Personality Type" icon="🧠"
                  value={fullUserData?.personality ? fullUserData.personality.charAt(0).toUpperCase() + fullUserData.personality.slice(1) : undefined}
                />
              </div>
            </>
          )}

          {isPending && (
            <>
              <div className={`approval-note ${isPartner ? "partner-note" : "user-note"}`}>
                <span>📧 Approval confirmation will be emailed to the {isPartner ? "partner" : "user"}</span>
              </div>
              <div className="action-buttons">
                <button className="btn btn-reject" onClick={() => reject(selected._id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Reject
                </button>
                <button className="btn btn-approve" onClick={() => approve(selected._id)}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
              color: selected.status === "approved" ? "#1E7E34" : "#C0392B",
              fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>{selected.status === "approved" ? "✅" : "❌"}</span>
              This {isPartner ? "partner" : "user"} has already been <strong>{selected.status}</strong>. No further action required.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPROVALS — LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  const pendingCount  = countByStatus("pending");
  const approvedCount = countByStatus("approved");
  const rejectedCount = countByStatus("rejected");
  const isPartnerView = roleView === "partner";

  return (
    <div className="dashboard">
      <div className="approvals-card">

        {/* Back to home */}
        <button className="back-btn" onClick={() => { setView("home"); setSelected(null); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="card-header">
          <div className="header-left">
            <div className={`header-icon ${isPartnerView ? "partner-icon" : "user-icon"}`}>
              {isPartnerView ? "🤝" : "👤"}
            </div>
            <div>
              <h2>{isPartnerView ? "Partner Approvals" : "User Approvals"}</h2>
              <p className="header-subtitle">
                {isPartnerView ? "Manage and review partner onboarding requests" : "Manage and review user registration requests"}
              </p>
            </div>
          </div>

          <div className="dropdown-container" ref={dropdownRef}>
            <button
              type="button"
              className={`role-toggle-btn ${isPartnerView ? "partner-toggle" : "user-toggle"}`}
              onClick={() => setShowRoleDropdown(prev => !prev)}
            >
              <span className="toggle-dot" />
              {isPartnerView ? "Partners" : "Users"}
              <svg className={`arrow ${showRoleDropdown ? "open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <PortalDropdown anchorRef={dropdownRef} isOpen={showRoleDropdown} onClose={() => setShowRoleDropdown(false)}>
              <button className={roleView === "partner" ? "partner-active" : ""} onClick={() => { setRoleView("partner"); setTab("pending"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">🤝</span> Partners
                <span className="menu-count partner-count">{partnerData.length}</span>
              </button>
              <button className={roleView === "user" ? "user-active" : ""} onClick={() => { setRoleView("user"); setTab("pending"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">👤</span> Users
                <span className="menu-count user-count">{userData.length}</span>
              </button>
            </PortalDropdown>
          </div>
        </div>

        {/* Stats Strip */}
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

        {/* Status Tab Dropdown */}
        <div className="tab-dropdown-wrapper">
          <select className="tab-dropdown" value={tab} onChange={(e) => setTab(e.target.value)}>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>

        {/* Table */}
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
                        <button className="view-btn" onClick={() => setSelected(item)}>View</button>
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

// ── Helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="details-section-title" style={{
      marginTop: "24px", marginBottom: "4px", paddingBottom: "8px",
      borderBottom: "1px solid #f0f2f5", fontSize: "13px", fontWeight: "700",
      color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {children}
    </div>
  );
}

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