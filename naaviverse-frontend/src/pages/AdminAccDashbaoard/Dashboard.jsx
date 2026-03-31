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
function StatBox({ colorClass, icon, title, value, subtitle, badge, onAction, actionLabel }) {
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

// ── Static Activity Data ─────────────────────────────────────────────────────
const ACTIVITY_USERS = [
  {
    id: 1, name: "Priya K.", email: "priya.k@gmail.com", initials: "PK",
    color: "#ede9fe", textColor: "#6d28d9", status: "online", joinedDays: "3 days ago",
    events: [
      { type: "login",   time: "Today, 9:14 AM",  title: "Logged in",                   desc: "Session from Chrome · Hyderabad, IN",                              chipLabel: "Session start" },
      { type: "explore", time: "Today, 9:16 AM",  title: "Explored 4 learning paths",   desc: "Browsed: AI Fundamentals, Data Science, Full Stack Dev, UX Design", chipLabel: "Browsing",   pathSteps: ["Login", "Browse", "Explore", "Compare"] },
      { type: "path",    time: "Today, 9:28 AM",  title: "Selected: AI Fundamentals",   desc: "Enrolled in the 12-week AI Fundamentals track",                     chipLabel: "Enrolled" },
      { type: "market",  time: "Today, 9:45 AM",  title: "Purchased from Marketplace",  desc: "Bought: \"AI Mentor Session Pack\" · ₹1,200",                       chipLabel: "Purchase" },
    ],
  },
  {
    id: 2, name: "Arjun M.", email: "arjun.m@outlook.com", initials: "AM",
    color: "#fef3c7", textColor: "#b45309", status: "online", joinedDays: "1 week ago",
    events: [
      { type: "login",   time: "Yesterday, 6:02 PM", title: "Logged in",                  desc: "Session from Mobile · Bangalore, IN",              chipLabel: "Session start" },
      { type: "explore", time: "Yesterday, 6:05 PM", title: "Explored 2 learning paths",  desc: "Browsed: Full Stack Development, Cloud Architecture", chipLabel: "Browsing", pathSteps: ["Login", "Browse", "Enroll", "Start"] },
      { type: "path",    time: "Yesterday, 6:18 PM", title: "Selected: Full Stack Dev",   desc: "Enrolled in the 16-week Full Stack Development track", chipLabel: "Enrolled" },
      { type: "explore", time: "Yesterday, 6:35 PM", title: "Browsed Marketplace",        desc: "Viewed 6 items in Mentors & Institutions section",   chipLabel: "Exploring" },
    ],
  },
  {
    id: 3, name: "Sneha R.", email: "sneha.r@yahoo.com", initials: "SR",
    color: "#fce7f3", textColor: "#be185d", status: "idle", joinedDays: "2 days ago",
    events: [
      { type: "login",   time: "Today, 11:30 AM", title: "Logged in",                   desc: "Session from Firefox · Mumbai, IN",                               chipLabel: "Session start" },
      { type: "explore", time: "Today, 11:33 AM", title: "Explored 7 learning paths",   desc: "Spent 18 min comparing paths across Career & Academic categories", chipLabel: "Browsing",  pathSteps: ["Login", "Deep Explore", "Pick Path", "Checkout"] },
      { type: "path",    time: "Today, 11:51 AM", title: "Selected: Data Science",      desc: "Enrolled in the 20-week Data Science Bootcamp",                   chipLabel: "Enrolled" },
      { type: "market",  time: "Today, 12:04 PM", title: "Purchased from Marketplace",  desc: "Bought: \"Data Mentor Bundle\" + \"GATE Prep Kit\" · ₹3,800",      chipLabel: "Purchase" },
    ],
  },
  {
    id: 4, name: "Rahul D.", email: "rahul.d@icloud.com", initials: "RD",
    color: "#e0f2fe", textColor: "#0369a1", status: "offline", joinedDays: "5 days ago",
    events: [
      { type: "login",   time: "2 days ago, 4:12 PM", title: "Logged in",                    desc: "Session from Safari · Delhi, IN",                  chipLabel: "Session start" },
      { type: "explore", time: "2 days ago, 4:15 PM", title: "Explored 3 learning paths",    desc: "Browsed: Cloud Architecture, DevOps, Cybersecurity", chipLabel: "Browsing", pathSteps: ["Login", "Browse", "Enroll", "Active"] },
      { type: "path",    time: "2 days ago, 4:29 PM", title: "Selected: Cloud Architecture", desc: "Enrolled in the 10-week Cloud track",               chipLabel: "Enrolled" },
    ],
  },
  {
    id: 5, name: "Kavya N.", email: "kavya.n@gmail.com", initials: "KN",
    color: "#dcfce7", textColor: "#15803d", status: "online", joinedDays: "1 day ago",
    events: [
      { type: "login",   time: "Today, 8:00 AM", title: "Logged in",                   desc: "Session from Chrome · Pune, IN",                    chipLabel: "Session start" },
      { type: "explore", time: "Today, 8:04 AM", title: "Explored 5 learning paths",   desc: "Browsed paths in Design, Marketing, and Analytics", chipLabel: "Browsing" },
      { type: "market",  time: "Today, 8:20 AM", title: "Purchased from Marketplace",  desc: "Bought: \"UX Design Mentor Session\" · ₹900",        chipLabel: "Purchase" },
      { type: "path",    time: "Today, 8:32 AM", title: "Selected: UX Design",         desc: "Enrolled in the 8-week UX Design track",            chipLabel: "Enrolled",  pathSteps: ["Login", "Market First", "Enroll", "Active"] },
    ],
  },
];

const TYPE_CONFIG = {
  login:   { bg: "#f1f5f9", color: "#475569", emoji: "🔐", chipClass: "activity-chip-login" },
  explore: { bg: "#fef3c7", color: "#b45309", emoji: "🔍", chipClass: "activity-chip-explore" },
  path:    { bg: "#ede9fe", color: "#7c3aed", emoji: "📈", chipClass: "activity-chip-path" },
  market:  { bg: "#cffafe", color: "#0e7490", emoji: "🛒", chipClass: "activity-chip-market" },
};

const STATUS_COLORS = { online: "#22c55e", idle: "#f59e0b", offline: "#94a3b8" };

// ── Main Component ───────────────────────────────────────────────────────────
export default function Dashboard() {
  // view: "home" | "approvals" | "activity"
  const [view, setView] = useState("home");

  // Approvals state
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [roleView, setRoleView] = useState("partner");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [partnerData, setPartnerData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [fullUserData, setFullUserData] = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);

  const dropdownRef = useRef(null);

  // Activity state
  const [selectedActivityUser, setSelectedActivityUser] = useState(null);

  const [pathCounts, setPathCounts] = useState({ active: 0, inactive: 0, pending: 0 });

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/api/paths/get?status=active`),
      axios.get(`${BASE_URL}/api/paths/get?status=inactive`),
      axios.get(`${BASE_URL}/api/paths/get?status=waitingforapproval`),
    ]).then(([a, b, c]) => {
      setPathCounts({
        active: a.data?.data?.length || 0,
        inactive: b.data?.data?.length || 0,
        pending: c.data?.data?.length || 0,
      });
    });
  }, []);

  const [marketCounts, setMarketCounts] = useState({ total: 0, institution: 0, mentor: 0, distributor: 0, vendor: 0 });

  useEffect(() => {
    axios.get(`${BASE_URL}/api/marketplace/admin/get-all`)
      .then(({ data }) => {
        if (data?.status) {
          const items = data.data || [];
          setMarketCounts({
            total: items.length,
            institution: items.filter(i => i.role?.toLowerCase() === "institution").length,
            mentor: items.filter(i => i.role?.toLowerCase() === "mentor").length,
            distributor: items.filter(i => i.role?.toLowerCase() === "distributor").length,
            vendor: items.filter(i => i.role?.toLowerCase() === "vendor").length,
          });
        }
      });
  }, []);

  const [approvalStats, setApprovalStats] = useState({ totalPending: 0, totalApproved: 0, totalRejected: 0 });

  useEffect(() => {
    const fetchAllApprovals = async () => {
      try {
        const [partnerRes, userRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/approvals/get?role=Partner`),
          axios.get(`${BASE_URL}/api/approvals/get?role=User`),
        ]);
        const partners = partnerRes.data?.data || [];
        const users    = userRes.data?.data || [];
        setApprovalStats({
          totalPending:  [...partners, ...users].filter(a => a.status === "pending").length,
          totalApproved: [...partners, ...users].filter(a => a.status === "approved").length,
          totalRejected: [...partners, ...users].filter(a => a.status === "rejected").length,
        });
      } catch (err) {
        console.log("Error fetching approval stats", err);
      }
    };
    fetchAllApprovals();
  }, []);

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
    if (view === "approvals") fetchApprovals("Partner", setPartnerData);
  }, [view]);

  useEffect(() => {
    if (view === "approvals" && roleView === "user" && userData.length === 0)
      fetchApprovals("User", setUserData);
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
  const countByStatus = (s) => s === "all" ? activeData.length : activeData.filter(a => a.status === s).length;
  const pendingCount  = countByStatus("pending");
  const approvedCount = countByStatus("approved");
  const rejectedCount = countByStatus("rejected");
  const filtered      = tab === "all" ? activeData : activeData.filter(a => a.status === tab);

  const approve = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" }).then(res => {
      if (res.data.status) {
        setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
        setUserData(prev => prev.map(i => i._id === id ? { ...i, status: "approved" } : i));
        if (selected?._id === id) setSelected(p => ({ ...p, status: "approved" }));
      }
    });
  };

  const reject = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" }).then(res => {
      if (res.data.status) {
        setPartnerData(prev => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
        setUserData(prev => prev.map(i => i._id === id ? { ...i, status: "rejected" } : i));
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
                    <path d="M4 17L8 7l4 6 4-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="stat-box-badge">Total</div>
              </div>
              <div className="stat-box-title">Learning Paths</div>
              <div className="stat-box-value">{pathCounts.active + pathCounts.inactive + pathCounts.pending}</div>
              <div className="stat-box-subtitle" style={{ flexDirection: "column", gap: "2px" }}>
                <span>Active: {pathCounts.active}</span>
                <span>Inactive: {pathCounts.inactive}</span>
                <span>Pending: {pathCounts.pending}</span>
              </div>
            </div>

            {/* Box 2 — User Activity (replaces Pending Reviews) */}
            <div className="stat-box box-rose">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="stat-box-badge">Live</div>
              </div>
              <div className="stat-box-title">User Activity</div>
              <div className="stat-box-value">{ACTIVITY_USERS.length}</div>
              <div className="stat-box-subtitle" style={{ flexDirection: "column", gap: "2px" }}>
                <span>Online: {ACTIVITY_USERS.filter(u => u.status === "online").length}</span>
                <span>Idle: {ACTIVITY_USERS.filter(u => u.status === "idle").length}</span>
                <span>Offline: {ACTIVITY_USERS.filter(u => u.status === "offline").length}</span>
              </div>
              <button
                className="stat-box-btn"
                onClick={() => { setView("activity"); setSelectedActivityUser(null); }}
              >
                View All →
              </button>
            </div>

            {/* Box 3 — Marketplace */}
            <div className="stat-box box-cyan">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="stat-box-badge">All</div>
              </div>
              <div className="stat-box-title">Marketplace Items</div>
              <div className="stat-box-value">{marketCounts.total}</div>
              <div className="stat-box-subtitle" style={{ flexDirection: "column", gap: "2px" }}>
                <span>Institutions: {marketCounts.institution}</span>
                <span>Mentors: {marketCounts.mentor}</span>
                <span>Distributors: {marketCounts.distributor}</span>
                <span>Vendors: {marketCounts.vendor}</span>
              </div>
            </div>

            {/* Box 4 — Approvals Overview */}
            <div className="stat-box box-amber">
              <div className="stat-box-top">
                <div className="stat-box-icon">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="stat-box-badge">Summary</div>
              </div>
              <div className="stat-box-title">Approvals Overview</div>
              <div className="stat-box-value">{approvalStats.totalApproved + approvalStats.totalPending + approvalStats.totalRejected}</div>
              <div className="stat-box-subtitle" style={{ flexDirection: "column", gap: "2px" }}>
                <span>Approved: {approvalStats.totalApproved}</span>
                <span>Pending: {approvalStats.totalPending}</span>
                <span>Rejected: {approvalStats.totalRejected}</span>
              </div>
              <button
                className="stat-box-btn"
                onClick={() => { setView("approvals"); setSelected(null); setTab("all"); }}
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
                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="12"
                      strokeDasharray={`${0.87 * 251.2} ${251.2}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)" />
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
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                    Review Approvals
                  </button>
                  <button className="kpi-action-btn">
                    <span className="kpi-action-icon action-violet">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    Add New Path
                  </button>
                  <button className="kpi-action-btn" onClick={() => { setView("activity"); setSelectedActivityUser(null); }}>
                    <span className="kpi-action-icon action-rose">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    User Activity
                  </button>
                  <button className="kpi-action-btn">
                    <span className="kpi-action-icon action-cyan">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  // ACTIVITY — LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "activity" && !selectedActivityUser) {
    return (
      <div className="dashboard">
        <div className="approvals-card">

          <button className="back-btn" onClick={() => setView("home")}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Dashboard
          </button>

          <div className="card-header">
            <div className="header-left">
              <div className="header-icon" style={{ background: "#fce7f3", border: "1px solid #fbcfe8", fontSize: 22 }}>⏱</div>
              <div>
                <h2>User Activity</h2>
                <p className="header-subtitle">Live journey overview — login · paths · marketplace</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: 999, border: "1px solid #bbf7d0" }}>
              ● Live
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Last Event</th>
                  <th>Journey</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_USERS.map(u => {
                  const last = u.events[u.events.length - 1];
                  const cfg  = TYPE_CONFIG[last.type];
                  return (
                    <tr key={u.id} className="table-row">
                      <td>
                        <div className="business-info">
                          <div className="row-avatar" style={{ background: u.color, color: u.textColor }}>{u.initials}</div>
                          <div>
                            <div className="business-name">{u.name}</div>
                            <div style={{ fontSize: 12, color: "var(--slate-400)" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: STATUS_COLORS[u.status], fontWeight: 600 }}>
                          <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[u.status], display: "inline-block" }} />
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ background: cfg.bg, padding: "4px 6px", borderRadius: 6, fontSize: 13 }}>{cfg.emoji}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{last.title}</div>
                            <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{last.time}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                          {["login", "explore", "path", "market"].map(t => {
                            const done = u.events.some(e => e.type === t);
                            return (
                              <span
                                key={t}
                                title={t}
                                style={{
                                  width: 9, height: 9, borderRadius: "50%",
                                  background: done ? TYPE_CONFIG[t].bg : "#e2e8f0",
                                  border: done ? `1.5px solid ${TYPE_CONFIG[t].color}40` : "none",
                                  display: "inline-block",
                                }}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <button className="view-btn" onClick={() => setSelectedActivityUser(u)}>
                          View Journey
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVITY — DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "activity" && selectedActivityUser) {
    const u = selectedActivityUser;
    return (
      <div className="dashboard">
        <div className="details-card" style={{ maxWidth: 760 }}>

          <button className="back-btn" onClick={() => setSelectedActivityUser(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Activity
          </button>

          <div className="details-hero">
            <div className="details-avatar" style={{ background: u.color, color: u.textColor, border: `2px solid ${u.color}` }}>
              {u.initials}
            </div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{u.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[u.status], display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[u.status], display: "inline-block" }} />
                  {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-400)" }}>
                {u.email} · Joined {u.joinedDays}
              </div>
            </div>
          </div>

          <div className="details-section-title" style={{ marginBottom: 20 }}>Journey Timeline</div>

          <div className="activity-timeline">
            {u.events.map((ev, i) => {
              const cfg = TYPE_CONFIG[ev.type];
              return (
                <div key={i} className="activity-tl-item">
                  <div className="activity-tl-left">
                    <div className="activity-tl-icon" style={{ background: cfg.bg }}>
                      <span style={{ fontSize: 14 }}>{cfg.emoji}</span>
                    </div>
                    {i < u.events.length - 1 && <div className="activity-tl-line" />}
                  </div>
                  <div className="activity-tl-body">
                    <div className="activity-tl-time">{ev.time}</div>
                    <div className="activity-tl-title">{ev.title}</div>
                    <div className="activity-tl-desc">{ev.desc}</div>
                    <span className={`activity-chip ${cfg.chipClass}`}>{ev.chipLabel}</span>
                    {ev.pathSteps && (
                      <div className="path-track">
                        {ev.pathSteps.map((s, si) => (
                          <React.Fragment key={si}>
                            <div className="path-step-node">
                              <div className="path-step-circle" style={{ background: u.color, color: u.textColor }}>{si + 1}</div>
                              <div className="path-step-label">{s}</div>
                            </div>
                            {si < ev.pathSteps.length - 1 && <div className="path-step-arrow" />}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
    const isPending  = selected.status === "pending";

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
                <DetailItem label="Full Name"    value={fullUserData?.name || selected.businessName} icon="👤" />
                <DetailItem label="Email"        value={fullUserData?.email || selected.email} />
                <DetailItem label="Username"     value={fullUserData?.username} />
                <DetailItem label="Phone"        value={fullUserData?.phoneNumber} />
                <DetailItem label="Account Type" value={fullUserData?.userType || selected.type} />
                <DetailItem label="Country"      value={fullUserData?.country || selected.country} />
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
                  value={fullUserData?.personality
                    ? fullUserData.personality.charAt(0).toUpperCase() + fullUserData.personality.slice(1)
                    : undefined}
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
  const isPartnerView = roleView === "partner";

  return (
    <div className="dashboard">
      <div className="approvals-card">

        <button className="back-btn" onClick={() => { setView("home"); setSelected(null); }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </button>

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
              <button className={roleView === "partner" ? "partner-active" : ""} onClick={() => { setRoleView("partner"); setTab("all"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">🤝</span> Partners
                <span className="menu-count partner-count">{partnerData.length}</span>
              </button>
              <button className={roleView === "user" ? "user-active" : ""} onClick={() => { setRoleView("user"); setTab("all"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">👤</span> Users
                <span className="menu-count user-count">{userData.length}</span>
              </button>
            </PortalDropdown>
          </div>
        </div>

        <div className="tab-btn-group">
          <button className={`tab-btn tab-btn-all ${tab === "all" ? "active" : ""}`} onClick={() => setTab("all")}>
            <span className="tab-btn-dot" />All<span className="tab-btn-count">{activeData.length}</span>
          </button>
          <button className={`tab-btn tab-btn-pending ${tab === "pending" ? "active" : ""}`} onClick={() => setTab("pending")}>
            <span className="tab-btn-dot" />Pending<span className="tab-btn-count">{pendingCount}</span>
          </button>
          <button className={`tab-btn tab-btn-approved ${tab === "approved" ? "active" : ""}`} onClick={() => setTab("approved")}>
            <span className="tab-btn-dot" />Approved<span className="tab-btn-count">{approvedCount}</span>
          </button>
          <button className={`tab-btn tab-btn-rejected ${tab === "rejected" ? "active" : ""}`} onClick={() => setTab("rejected")}>
            <span className="tab-btn-dot" />Rejected<span className="tab-btn-count">{rejectedCount}</span>
          </button>
        </div>

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
                        <p>No {tab === "all" ? "" : tab} {isPartnerView ? "partner" : "user"} records found</p>
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