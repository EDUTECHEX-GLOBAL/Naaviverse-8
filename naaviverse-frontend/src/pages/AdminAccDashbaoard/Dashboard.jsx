import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import "./Dashboard.scss";
import { useNavigate } from "react-router-dom";

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
  }, [isOpen, anchorRef]);

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

// ── Notif Config ─────────────────────────────────────────────────────────────
const NOTIF_CONFIG = {
  path: {
    bg: "#ede9fe",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M4 17L8 7l4 6 4-4 4 8" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: "Path", tagBg: "#ede9fe", tagColor: "#7c3aed",
  },
  purchase: {
    bg: "#dcfce7",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    tag: "Purchase", tagBg: "#dcfce7", tagColor: "#15803d",
  },
  approval: {
    bg: "#fef3c7",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#b45309" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tag: "Approval", tagBg: "#fef3c7", tagColor: "#b45309",
  },
  system: {
    bg: "#f1f5f9",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    tag: "System", tagBg: "#f1f5f9", tagColor: "#475569",
  },
};

// ── NotifItem Component ───────────────────────────────────────────────────────
function NotifItem({ notif, onRead, onView, full = false }) {
  const cfg = NOTIF_CONFIG[notif.type] || NOTIF_CONFIG.system;

  if (full) {
    return (
      <div className={`full-notif-item ${notif.unread ? "unread" : ""}`}>
        <div className="full-notif-icon" style={{ background: cfg.bg }}>{cfg.icon}</div>
        <div className="full-notif-body">
          <div className="full-notif-title">{notif.title}</div>
          <div className="full-notif-desc">{notif.desc}</div>
          <div className="full-notif-meta">
            <span className="full-notif-time">{notif.time}</span>
            <span className="full-notif-tag" style={{ background: cfg.tagBg, color: cfg.tagColor }}>{cfg.tag}</span>
          </div>
        </div>
        <div className="full-notif-right">
          {notif.unread && <div className="full-unread-dot" />}
          <button className="full-view-btn" onClick={(e) => { e.stopPropagation(); onView(); }}>View →</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`notif-dd-item ${notif.unread ? "unread" : ""}`} onClick={onRead}>
      <div className="notif-dd-icon" style={{ background: cfg.bg }}>{cfg.icon}</div>
      <div className="notif-dd-body">
        <div className="notif-dd-item-title">{notif.title}</div>
        <div className="notif-dd-item-desc">{notif.desc}</div>
        <div className="notif-dd-item-time">{notif.time}</div>
      </div>
      <div className="notif-dd-right">
        {notif.unread && <div className="notif-unread-dot" />}
        <button className="notif-item-view-btn" onClick={(e) => { e.stopPropagation(); onView(); }}>View</button>
      </div>
    </div>
  );
}

// REMOVE emoji fields entirely — they're used in activity timeline icons
// Replace: emoji: "🔍" → use SVG in activity-tl-icon directly

const TYPE_CONFIG = {
  login:   { bg: "#f1f5f9", color: "#475569", chipClass: "activity-chip-login",
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg> },
  explore: { bg: "#fef3c7", color: "#b45309", chipClass: "activity-chip-explore",
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  path:    { bg: "#ede9fe", color: "#7c3aed", chipClass: "activity-chip-path",
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round"><path d="M4 17L8 7l4 6 4-4 4 8"/></svg> },
  market:  { bg: "#cffafe", color: "#0e7490", chipClass: "activity-chip-market",
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg> },
  step:    { bg: "#dcfce7", color: "#15803d", chipClass: "activity-chip-path",
    svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> },
};

const STATUS_COLORS = {
  active: "#22c55e",
  idle: "#f59e0b",
  offline: "#94a3b8",
};

const AVATAR_PALETTE = [
  { color: "#ede9fe", textColor: "#6d28d9" },
  { color: "#fef3c7", textColor: "#b45309" },
  { color: "#fce7f3", textColor: "#be185d" },
  { color: "#e0f2fe", textColor: "#0369a1" },
  { color: "#dcfce7", textColor: "#15803d" },
  { color: "#fff7ed", textColor: "#c2410c" },
];

const PARTNER_STATUS_COLORS = { active: "#22c55e", idle: "#f59e0b", offline: "#94a3b8" };
const PARTNER_AVATAR_PALETTE = [
  { color: "#d1fae5", textColor: "#065f46" },
  { color: "#a7f3d0", textColor: "#047857" },
  { color: "#6ee7b7", textColor: "#065f46" },
  { color: "#d1fae5", textColor: "#047857" },
  { color: "#ecfdf5", textColor: "#059669" },
];
const PURCHASE_AVATAR_PALETTE = [
  { color: "#e0e7ff", textColor: "#3730a3" },
  { color: "#c7d2fe", textColor: "#4338ca" },
  { color: "#a5b4fc", textColor: "#3730a3" },
  { color: "#e0e7ff", textColor: "#4f46e5" },
  { color: "#ede9fe", textColor: "#4338ca" },
];
const PLAN_BADGE_CLASS = { Micro: "plan-micro", Nano: "plan-nano", Bundle: "plan-bundle", Premium: "plan-premium" };

// ── Main Component ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [view, setView] = useState("home");
  const navigate = useNavigate();

  // ── Notification state ────────────────────────────────────────────────────
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: "path",     title: "New path created",   desc: 'Admin created "AI Fundamentals" path',        time: "2 min ago",  unread: true  },
    { id: 2, type: "purchase", title: "New purchase",       desc: 'Riya Sharma purchased "Data Science Pack"',   time: "18 min ago", unread: true  },
    { id: 3, type: "approval", title: "Approval pending",   desc: "SkillBridge Institute awaiting review",       time: "1 hr ago",   unread: true  },
    { id: 4, type: "path",     title: "Path published",     desc: '"Career Launchpad" is now live',              time: "3 hr ago",   unread: true  },
    { id: 5, type: "purchase", title: "New purchase",       desc: 'Arjun Mehta purchased "Full Stack Bootcamp"', time: "5 hr ago",   unread: true  },
    { id: 6, type: "path",     title: "Path updated",       desc: 'Admin updated steps in "Web Dev Basics"',     time: "Yesterday",  unread: false },
    { id: 7, type: "approval", title: "Partner approved",   desc: "EduTech Solutions was successfully approved", time: "Yesterday",  unread: false },
    { id: 8, type: "system",   title: "System maintenance", desc: "Scheduled downtime on Sunday 2–4 AM IST",     time: "2 days ago", unread: false },
  ]);
  const [notifFilter, setNotifFilter] = useState("all");
  const notifDropdownRef = useRef(null);
  const unreadCount = notifications.filter((n) => n.unread).length;

  const [selectedPartnerUser, setSelectedPartnerUser] = useState(null);
  const [selectedPurchase, setSelectedPurchase]       = useState(null);
  const [partnerActivityTab, setPartnerActivityTab]   = useState("all");
  const [purchaseTab, setPurchaseTab]                 = useState("all");

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  const markOneRead = (id) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  
  useEffect(() => {
    const handler = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target))
        setShowNotifDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const [dashStats, setDashStats] = useState({
    paths:       { total: 0, active: 0, inactive: 0, pending: 0 },
    marketplace: { total: 0, institution: 0, mentor: 0, distributor: 0, vendor: 0 },
    approvals:   { total: 0, approved: 0, pending: 0, rejected: 0 },
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setStatsLoading(true);
    axios
      .get(`${BASE_URL}/api/dashboard/stats`)
      .then(({ data }) => { if (data?.status) setDashStats(data.data); })
      .catch((err) => console.error("Dashboard stats error:", err))
      .finally(() => setStatsLoading(false));
  }, []);

  // ── Activity users ────────────────────────────────────────────────────────
  const [activityUsers, setActivityUsers] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchActivityUsers = () => {
    setActivityLoading(true);
    axios
      .get(`${BASE_URL}/api/activity/users`)
      .then(({ data }) => { if (data?.status) setActivityUsers(data.data); })
      .catch((err) => console.error("Activity users error:", err))
      .finally(() => setActivityLoading(false));
  };

  useEffect(() => { fetchActivityUsers(); }, []);

  // ── Partner activity (from API) ──────────────────────────────────────────
  const [partnerActivityUsers, setPartnerActivityUsers] = useState([]);
  const [partnerActivityLoading, setPartnerActivityLoading] = useState(false);

  const fetchPartnerActivity = () => {
    setPartnerActivityLoading(true);
    axios
      .get(`${BASE_URL}/api/activity/partners`)
      .then(({ data }) => { if (data?.status) setPartnerActivityUsers(data.data); })
      .catch((err) => console.error("Partner activity error:", err))
      .finally(() => setPartnerActivityLoading(false));
  };

  useEffect(() => { fetchPartnerActivity(); }, []);

  // ── Purchases (from API) ─────────────────────────────────────────────────
  const [purchases, setPurchases]           = useState([]);
  const [purchaseStats, setPurchaseStats]   = useState({
    total: 0, today: 0, pending: 0, completed: 0, revenue: "₹0", revenuePaise: 0,
  });
  const [purchasesLoading, setPurchasesLoading] = useState(false);

  const fetchPurchases = () => {
    setPurchasesLoading(true);
    axios
      .get(`${BASE_URL}/api/purchases`)
      .then(({ data }) => {
        if (data?.status) {
          setPurchases(data.data);
          setPurchaseStats(data.stats);
        }
      })
      .catch((err) => console.error("Purchases error:", err))
      .finally(() => setPurchasesLoading(false));
  };

  useEffect(() => { fetchPurchases(); }, []);

  // ── Approvals state ───────────────────────────────────────────────────────
  const [tab, setTab]           = useState("all");
  const [selected, setSelected] = useState(null);
  const [roleView, setRoleView] = useState("partner");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [partnerData, setPartnerData] = useState([]);
  const [userData, setUserData]       = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [fullUserData, setFullUserData]           = useState(null);
  const [loadingUserDetail, setLoadingUserDetail] = useState(false);
  const [selectedActivityUser, setSelectedActivityUser] = useState(null);

  const dropdownRef = useRef(null);

  const fetchApprovals = (role, setter) => {
    setLoadingData(true);
    axios
      .get(`${BASE_URL}/api/approvals/get?role=${role}`)
      .then((res) => { if (res.data.status) setter(res.data.data); })
      .catch((err) => console.error(`Error fetching ${role} approvals`, err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { if (view === "approvals") fetchApprovals("Partner", setPartnerData); }, [view]);
  useEffect(() => {
    if (view === "approvals" && roleView === "user" && userData.length === 0)
      fetchApprovals("User", setUserData);
  }, [roleView, view, userData.length]);

  useEffect(() => {
    if (!selected) { setFullUserData(null); return; }
    if (selected.role?.toLowerCase() !== "user") { setFullUserData(null); return; }
    setLoadingUserDetail(true);
    axios
      .get(`${BASE_URL}/api/users/get/${selected.email}`)
      .then((res) => { if (res.data?.status) setFullUserData(res.data.data); })
      .catch((err) => console.error("Error fetching full user data:", err))
      .finally(() => setLoadingUserDetail(false));
  }, [selected]);

  const activeData    = roleView === "partner" ? partnerData : userData;
  const filtered      = tab === "all" ? activeData : activeData.filter((a) => a.status === tab);

  const approve = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "approved" }).then((res) => {
      if (res.data.status) {
        setPartnerData((prev) => prev.map((i) => (i._id === id ? { ...i, status: "approved" } : i)));
        setUserData((prev) => prev.map((i) => (i._id === id ? { ...i, status: "approved" } : i)));
        if (selected?._id === id) setSelected((p) => ({ ...p, status: "approved" }));
      }
    });
  };

  const reject = (id) => {
    axios.put(`${BASE_URL}/api/approvals/update/${id}`, { status: "rejected" }).then((res) => {
      if (res.data.status) {
        setPartnerData((prev) => prev.map((i) => (i._id === id ? { ...i, status: "rejected" } : i)));
        setUserData((prev) => prev.map((i) => (i._id === id ? { ...i, status: "rejected" } : i)));
        if (selected?._id === id) setSelected((p) => ({ ...p, status: "rejected" }));
      }
    });
  };

  // ── ALL_STAT_CARDS ─────────────────────────────────────────────────────────
  const ALL_STAT_CARDS = [
    {
      colorClass: "box-violet",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M4 17L8 7l4 6 4-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      badge: "Total",
      title: "Learning Paths",
      value: statsLoading ? "—" : dashStats.paths.total,
      subtitleLines: [
        `Active: ${dashStats.paths.active}`,
        `Inactive: ${dashStats.paths.inactive}`,
        `Pending: ${dashStats.paths.pending}`,
      ],
      btnLabel: "View All →",
      onBtn: () => navigate("/admin/dashboard/paths?tab=active"),
    },
    {
      colorClass: "box-rose",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badge: "Live",
      title: "User Activity",
      value: activityLoading ? "—" : activityUsers.length,
      subtitleLines: [
        `Active: ${activityUsers.filter((u) => u.status === "active").length}`,
        `Idle: ${activityUsers.filter((u) => u.status === "idle").length}`,
        `Offline: ${activityUsers.filter((u) => u.status === "offline").length}`,
      ],
      btnLabel: "View All →",
      onBtn: () => { setView("activity"); setSelectedActivityUser(null); },
    },
    {
      colorClass: "box-cyan",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      badge: "All",
      title: "Marketplace Items",
      value: statsLoading ? "—" : dashStats.marketplace.total,
      subtitleLines: [
        `Institutions: ${dashStats.marketplace.institution}`,
        `Mentors: ${dashStats.marketplace.mentor}`,
        `Distributors: ${dashStats.marketplace.distributor}`,
        `Vendors: ${dashStats.marketplace.vendor}`,
      ],
      btnLabel: "View All →",
      onBtn: () => navigate("/admin/dashboard/marketplace"),
    },
    {
      colorClass: "box-amber",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      badge: "Summary",
      title: "Approvals Overview",
      value: statsLoading ? "—" : dashStats.approvals.total,
      subtitleLines: [
        `Approved: ${dashStats.approvals.approved}`,
        `Pending: ${dashStats.approvals.pending}`,
        `Rejected: ${dashStats.approvals.rejected}`,
      ],
      btnLabel: "Review →",
      onBtn: () => { setView("approvals"); setSelected(null); setTab("all"); },
    },
    {
      colorClass: "box-emerald",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      badge: "Live",
      title: "Partner Activity",
      value: partnerActivityLoading ? "—" : partnerActivityUsers.length,
      subtitleLines: [
        `Active: ${partnerActivityUsers.filter((u) => u.status === "active").length}`,
        `Idle: ${partnerActivityUsers.filter((u) => u.status === "idle").length}`,
        `Offline: ${partnerActivityUsers.filter((u) => u.status === "offline").length}`,
      ],
      btnLabel: "View All →",
      onBtn: () => { setView("partnerActivity"); setSelectedPartnerUser(null); },
    },
    {
      colorClass: "box-indigo",
      iconSvg: (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      badge: "All Time",
      title: "Marketplace Purchases",
      value: purchasesLoading ? "—" : purchaseStats.total,
      subtitleLines: [
        `Today: ${purchaseStats.today}`,
        `Pending: ${purchaseStats.pending}`,
        `Revenue: ${purchaseStats.revenue}`,
      ],
      btnLabel: "View All →",
      onBtn: () => { setView("purchaseActivity"); setSelectedPurchase(null); },
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // HOME VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "home") {
    return (
      <div className="dashboard">
        <div className="home-wrapper">

          {/* ── Header ── */}
          <div className="home-header">
            <div className="home-header-left">
              <p className="home-sub">Your AI-powered path engine — all key metrics at a glance</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

              {/* Bell + dropdown */}
              <div ref={notifDropdownRef} style={{ position: "relative" }}>
                <button className="notif-bell-btn" onClick={() => setShowNotifDropdown((p) => !p)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
                      stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount}</span>}
                </button>

                {showNotifDropdown && (
                  <div className="notif-dropdown">
                    <div className="notif-dd-header">
                      <span className="notif-dd-title">Notifications</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {unreadCount > 0 && <span className="notif-dd-count">{unreadCount} new</span>}
                        <button className="notif-mark-all-btn" onClick={markAllRead}>Mark all read</button>
                      </div>
                    </div>
                    <div className="notif-dd-list">
                      {notifications.slice(0, 4).map((n) => (
                        <NotifItem
                          key={n.id} notif={n}
                          onRead={() => markOneRead(n.id)}
                          onView={() => { markOneRead(n.id); setShowNotifDropdown(false); setView("notifications"); setNotifFilter(n.type); }}
                        />
                      ))}
                    </div>
                    <div className="notif-dd-footer">
                      <button className="notif-view-all-btn" onClick={() => { setShowNotifDropdown(false); setView("notifications"); setNotifFilter("all"); }}>
                        View all notifications →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="home-date-badge">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </div>
            </div>
          </div>

          <div className="stat-boxes-carousel">
            <div className="stat-boxes-scroll-track">
              {ALL_STAT_CARDS.map((card, idx) => (
                <div key={idx} className={`stat-box ${card.colorClass}`}>
                  <div className="stat-box-top">
                    <div className="stat-box-icon">{card.iconSvg}</div>
                    <div className="stat-box-badge">{card.badge}</div>
                  </div>
                  <div className="stat-box-title">{card.title}</div>
                  <div className="stat-box-value">{card.value}</div>
                  <div className="stat-box-subtitle">
                    {card.subtitleLines.map((line, i) => (
                      <span key={i}>{line}</span>
                    ))}
                  </div>
                  <button className="stat-box-btn" onClick={card.onBtn}>
                    {card.btnLabel}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── KPI Section ── */}
          <div className="kpi-section">
            <div className="kpi-header">
              <h2>Key Performance Indicators</h2>
              <span className="kpi-tag">Live Data</span>
            </div>

            <div className="kpi-grid-2col">
              <div className="kpi-card kpi-engagement-light">
                <div className="kpi-card-label" style={{ marginBottom: 14 }}>Platform Engagement</div>

                <div className="eng-overall-row">
                  <div className="eng-donut-sm">
                    <svg viewBox="0 0 72 72" fill="none" width="72" height="72">
                      <circle cx="36" cy="36" r="28" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="36" cy="36" r="28" stroke="#7c3aed" strokeWidth="8"
                        strokeDasharray="152.4 175.9" strokeLinecap="round"
                        transform="rotate(-90 36 36)" />
                    </svg>
                    <span className="eng-donut-val">87%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--slate-800)", lineHeight: 1 }}>87%</div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 3 }}>Overall avg. engagement</div>
                    <div style={{ fontSize: 12, color: "#16a34a", marginTop: 6, display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
                      ↑ +4.2% vs last week
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-700)" }}>2,841</span>
                        <div>active sessions</div>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--slate-400)" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-700)" }}>18.4m</span>
                        <div>avg. duration</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="eng-split-row">
                  <div className="eng-entity-card eng-users">
                    <div className="eng-entity-top">
                      <div className="eng-entity-avatar" style={{ background: "#ede9fe", color: "#7c3aed" }}>U</div>
                      <div>
                        <div className="eng-entity-name">Users</div>
                        <div className="eng-entity-sub">1,920 active</div>
                      </div>
                      <div className="eng-entity-pct" style={{ color: "#7c3aed" }}>80%</div>
                    </div>
                    {[["Path completion", 72, "#8b5cf6"], ["Marketplace", 58, "#a78bfa"], ["Repeat logins", 85, "#c4b5fd"]].map(([label, val, color]) => (
                      <div key={label} className="eng-bar-row">
                        <div className="eng-bar-meta"><span>{label}</span><span>{val}%</span></div>
                        <div className="eng-bar-track"><div className="eng-bar-fill" style={{ width: `${val}%`, background: color }} /></div>
                      </div>
                    ))}
                  </div>

                  <div className="eng-entity-card eng-partners">
                    <div className="eng-entity-top">
                      <div className="eng-entity-avatar" style={{ background: "#fce7f3", color: "#e11d48" }}>P</div>
                      <div>
                        <div className="eng-entity-name">Partners</div>
                        <div className="eng-entity-sub">921 active</div>
                      </div>
                      <div className="eng-entity-pct" style={{ color: "#e11d48" }}>95%</div>
                    </div>
                    {[["Content published", 88, "#f43f5e"], ["Approval rate", 91, "#fb7185"], ["Portal revisits", 79, "#fda4af"]].map(([label, val, color]) => (
                      <div key={label} className="eng-bar-row">
                        <div className="eng-bar-meta"><span>{label}</span><span>{val}%</span></div>
                        <div className="eng-bar-track"><div className="eng-bar-fill" style={{ width: `${val}%`, background: color }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="kpi-card kpi-actions-card">
                <div className="kpi-card-label" style={{ marginBottom: 14 }}>Quick Actions</div>
                <div className="kpi-actions-square-grid">
                  <button className="kpi-action-square" onClick={() => setView("approvals")}>
                    <span className="kpi-action-sq-icon action-amber">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">Review Approvals</span>
                  </button>

                  <button className="kpi-action-square">
                    <span className="kpi-action-sq-icon action-violet">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">Add New Path</span>
                  </button>

                  <button className="kpi-action-square" onClick={() => { setView("activity"); setSelectedActivityUser(null); }}>
                    <span className="kpi-action-sq-icon action-rose">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">User Activity</span>
                  </button>

                  <button className="kpi-action-square">
                    <span className="kpi-action-sq-icon action-cyan">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">Export Data</span>
                  </button>

                  <button className="kpi-action-square" onClick={() => { setView("notifications"); setNotifFilter("all"); }}>
                    <span className="kpi-action-sq-icon action-indigo">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">Notifications</span>
                    {unreadCount > 0 && <span className="kpi-action-sq-badge">{unreadCount}</span>}
                  </button>

                  <button className="kpi-action-square">
                    <span className="kpi-action-sq-icon action-green">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="kpi-action-sq-label">Analytics</span>
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
  // NOTIFICATIONS — FULL PAGE
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "notifications") {
    const FILTERS = [
      { key: "all",      label: "All",       dot: "#7c3aed", countBg: "#ede9fe", countColor: "#7c3aed" },
      { key: "path",     label: "Paths",     dot: "#8b5cf6", countBg: "#ede9fe", countColor: "#7c3aed" },
      { key: "purchase", label: "Purchases", dot: "#22c55e", countBg: "#dcfce7", countColor: "#15803d" },
      { key: "approval", label: "Approvals", dot: "#f59e0b", countBg: "#fef3c7", countColor: "#b45309" },
      { key: "system",   label: "System",    dot: "#94a3b8", countBg: "#f1f5f9", countColor: "#475569" },
    ];
    const filteredNotifs = notifFilter === "all"
      ? notifications
      : notifications.filter((n) => n.type === notifFilter);

    return (
      <div className="dashboard">
        <div className="approvals-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 600 }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--slate-100)", display: "flex", alignItems: "center", gap: 14 }}>
            <button className="back-btn" style={{ margin: 0 }} onClick={() => setView("home")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Dashboard
            </button>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--slate-800)", margin: 0 }}>
                Notifications
              </h2>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ fontSize: 12, fontWeight: 600, background: "var(--slate-100)", color: "var(--slate-600)", border: "none", padding: "6px 14px", borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font)" }} onClick={markAllRead}>
                Mark all read
              </button>
              <button style={{ fontSize: 12, fontWeight: 600, background: "var(--rose-50)", color: "var(--rose-600)", border: "1px solid var(--rose-100)", padding: "6px 14px", borderRadius: "var(--radius-full)", cursor: "pointer", fontFamily: "var(--font)" }} onClick={() => setNotifications([])}>
                Clear all
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flex: 1 }}>
            <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid var(--slate-100)", padding: "16px 12px", background: "var(--slate-50)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--slate-400)", marginBottom: 10, padding: "0 6px" }}>
                Filter
              </div>
              {FILTERS.map((f) => {
                const count = f.key === "all" ? notifications.length : notifications.filter((n) => n.type === f.key).length;
                return (
                  <button key={f.key} onClick={() => setNotifFilter(f.key)}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: "var(--radius-md)", marginBottom: 2, border: "none", cursor: "pointer", fontFamily: "var(--font)", fontSize: 13, fontWeight: 600, textAlign: "left", background: notifFilter === f.key ? "var(--violet-100)" : "transparent", color: notifFilter === f.key ? "var(--violet-700)" : "var(--slate-600)", transition: "all .15s" }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: f.dot, flexShrink: 0 }} />
                    {f.label}
                    <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "var(--radius-full)", background: f.countBg, color: f.countColor }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredNotifs.length === 0 ? (
                <div style={{ padding: "60px", textAlign: "center", color: "var(--slate-400)" }}>
                  <div style={{ marginBottom: 8, opacity: 0.3, display:"flex", justifyContent:"center" }}>
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
</div>
                  <p>No notifications here</p>
                </div>
              ) : (
                filteredNotifs.map((n) => (
                  <NotifItem key={n.id} notif={n} full
                    onRead={() => markOneRead(n.id)}
                    onView={() => { markOneRead(n.id); if (n.type === "approval") { setView("approvals"); setSelected(null); setTab("all"); } else setView("home"); }}
                  />
                ))
              )}
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
              <div className="header-icon" style={{ background: "#fce7f3", border: "1px solid #fbcfe8", fontSize: 22 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg></div>
              <div>
                <h2>User Activity</h2>
                <p className="header-subtitle">Live journey overview — login · paths · marketplace</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: 999, border: "1px solid #bbf7d0" }}>● Live</span>
          </div>

          {activityLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Loading activity...</div>
          ) : activityUsers.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: 36, opacity: 0.3 }}>
<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>


              </div>
              <p style={{ color: "#94a3b8", marginTop: 8 }}>No activity recorded yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Status</th><th>Last Event</th><th>Journey</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activityUsers.map((u, idx) => {
                    const palette = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
                    const last    = u.lastEvent || u.events?.[u.events.length - 1];
                    const cfg     = TYPE_CONFIG[last?.type] || TYPE_CONFIG.login;
                    return (
                      <tr key={u.id} className="table-row">
                        <td>
                          <div className="business-info">
                            <div className="row-avatar" style={{ background: palette.color, color: palette.textColor }}>
                              {u.initials || (u.name?.trim() ? u.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : null) || u.email?.slice(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <div className="business-name">{u.name}</div>
                              <div style={{ fontSize: 12, color: "var(--slate-400)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: STATUS_COLORS[u.status] || STATUS_COLORS.offline, fontWeight: 600 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[u.status] || STATUS_COLORS.offline, display: "inline-block" }} />
                            {u.status?.charAt(0).toUpperCase() + u.status?.slice(1) || "Offline"}
                          </span>
                        </td>
                        <td>
                          {last ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ background: cfg.bg, padding: "4px 6px", borderRadius: 6, fontSize: 13 }}>{cfg.emoji}</span>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{last.title}</div>
                                <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{last.time}</div>
                              </div>
                            </div>
                          ) : <span style={{ color: "var(--slate-300)" }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {["login", "explore", "path", "market"].map((t) => {
                              const done = u.events?.some((e) => e.type === t);
                              return (
                                <span key={t} title={t} style={{ width: 9, height: 9, borderRadius: "50%", background: done ? TYPE_CONFIG[t]?.bg : "#e2e8f0", border: done ? `1.5px solid ${TYPE_CONFIG[t]?.color}40` : "none", display: "inline-block" }} />
                              );
                            })}
                          </div>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => setSelectedActivityUser({ ...u, palette })}>View Journey</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVITY — DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "activity" && selectedActivityUser) {
    const u       = selectedActivityUser;
    const palette = u.palette || AVATAR_PALETTE[0];
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
            <div className="details-avatar" style={{ background: palette.color, color: palette.textColor, border: `2px solid ${palette.color}` }}>
              {u.initials || (u.name?.trim() ? u.name.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() : null) || u.email?.slice(0, 2).toUpperCase() || "??"}
            </div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{u.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: STATUS_COLORS[u.status] || "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[u.status] || "#94a3b8", display: "inline-block" }} />
                  {u.status?.charAt(0).toUpperCase() + u.status?.slice(1) || "Offline"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-400)" }}>{u.email} · Joined {u.joinedDays}</div>
            </div>
          </div>

          <div className="details-section-title" style={{ marginBottom: 20 }}>Journey Timeline</div>

          {!u.events || u.events.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No events recorded yet</div>
          ) : (
            <div className="activity-timeline">
              {u.events.map((ev, i) => {
                const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.login;
                return (
                  <div key={i} className="activity-tl-item">
                    <div className="activity-tl-left">
                      <div className="activity-tl-icon" style={{ background: cfg.bg }}>
                        {cfg.svg}
                      </div>
                      {i < u.events.length - 1 && <div className="activity-tl-line" />}
                    </div>
                    <div className="activity-tl-body">
                      <div className="activity-tl-time">{ev.time}</div>
                      <div className="activity-tl-title">{ev.title}</div>
                      {ev.type === "step" && ev.pathName && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, margin: "4px 0" }}>
                          <div style={{ fontSize: 12, color: "var(--violet-600)", fontWeight: 600 }}>📍 {ev.pathName}</div>
                          {ev.stepName  && <div style={{ fontSize: 12, color: "var(--slate-500)" }}>Step: {ev.stepName}</div>}
                          {ev.microStep && <div style={{ fontSize: 12, color: "var(--slate-400)" }}>Micro: {ev.microStep}</div>}
                        </div>
                      )}
                      <div className="activity-tl-desc">{ev.desc}</div>
                      <span className={`activity-chip ${cfg.chipClass}`}>{ev.chipLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARTNER ACTIVITY — LIST VIEW (UPDATED WITH API DATA)
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "partnerActivity" && !selectedPartnerUser) {
    const filteredPartners = partnerActivityLoading
      ? []
      : partnerActivityTab === "all"
      ? partnerActivityUsers
      : partnerActivityUsers.filter((u) => u.status === partnerActivityTab);

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
              <div className="header-icon" style={{ background: "#d1fae5", border: "1px solid #a7f3d0", fontSize: 22 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>

              </div>
              <div>
                <h2>Partner Activity</h2>
                <p className="header-subtitle">Live portal activity — logins · listings · content · messages</p>
              </div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d", padding: "4px 12px", borderRadius: 999, border: "1px solid #bbf7d0" }}>● Live</span>
          </div>

          <div className="tab-btn-group">
            {["all", "active", "idle", "offline"].map((t) => (
              <button key={t} className={`tab-btn ${partnerActivityTab === t ? "active" : ""}`} onClick={() => setPartnerActivityTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {partnerActivityLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
              Loading partner activity...
            </div>
          ) : filteredPartners.length === 0 ? (
            <div style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: 36, opacity: 0.3 }}>
<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>


              </div>
              <p style={{ color: "#94a3b8", marginTop: 8 }}>No partner activity recorded yet</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Partner</th><th>Type</th><th>Status</th><th>Last Event</th><th>Journey</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredPartners.map((u, idx) => {
                    const pal  = PARTNER_AVATAR_PALETTE[idx % PARTNER_AVATAR_PALETTE.length];
                    const last = u.events?.[u.events.length - 1];
                    return (
                      <tr key={u.id} className="table-row">
                        <td>
                          <div className="business-info">
                            <div className="row-avatar" style={{ background: pal.color, color: pal.textColor }}>{u.initials}</div>
                            <div>
                              <div className="business-name">{u.name}</div>
                              <div style={{ fontSize: 12, color: "var(--slate-400)" }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="type-badge">{u.type}</span></td>
                        <td>
                          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: PARTNER_STATUS_COLORS[u.status] || "#94a3b8" }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: PARTNER_STATUS_COLORS[u.status] || "#94a3b8", display: "inline-block" }} />
                            {u.status?.charAt(0).toUpperCase() + u.status?.slice(1) || "Offline"}
                          </span>
                        </td>
                        <td>
                          {last ? (
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500 }}>{last.title}</div>
                              <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{last.time}</div>
                            </div>
                          ) : <span style={{ color: "var(--slate-300)" }}>—</span>}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 5 }}>
                            {["login", "publish", "listing", "approval", "invite", "message"].map((t) => {
                              const done = u.events?.some((e) => e.type === t);
                              return <span key={t} title={t} style={{ width: 9, height: 9, borderRadius: "50%", background: done ? "#10b981" : "#e2e8f0", border: done ? "1.5px solid #05966940" : "none", display: "inline-block" }} />;
                            })}
                          </div>
                        </td>
                        <td>
                          <button className="view-btn" onClick={() => setSelectedPartnerUser({ ...u, palette: pal })}>View Journey</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PARTNER ACTIVITY — DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "partnerActivity" && selectedPartnerUser) {
    const u   = selectedPartnerUser;
    const pal = u.palette || PARTNER_AVATAR_PALETTE[0];
    const PARTNER_TYPE_ICONS = {
  login:    { bg: "#f1f5f9", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg> },
  publish:  { bg: "#dcfce7", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg> },
  listing:  { bg: "#d1fae5", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
  approval: { bg: "#fef3c7", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  invite:   { bg: "#cffafe", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0e7490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
  message:  { bg: "#e0e7ff", svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
};
    return (
      <div className="dashboard">
        <div className="details-card" style={{ maxWidth: 760 }}>
          <button className="back-btn" onClick={() => setSelectedPartnerUser(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Partner Activity
          </button>
          <div className="details-hero">
            <div className="details-avatar" style={{ background: pal.color, color: pal.textColor, border: `2px solid ${pal.color}` }}>{u.initials}</div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{u.name}</h2>
                <span style={{ fontSize: 12, fontWeight: 600, color: PARTNER_STATUS_COLORS[u.status] || "#94a3b8", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: PARTNER_STATUS_COLORS[u.status] || "#94a3b8", display: "inline-block" }} />
                  {u.status?.charAt(0).toUpperCase() + u.status?.slice(1) || "Offline"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-400)" }}>
                {u.email} · Joined {u.joinedDays} · <span style={{ color: "var(--slate-600)", fontWeight: 600 }}>{u.type}</span>
              </div>
            </div>
          </div>
          <div className="details-section-title" style={{ marginBottom: 20 }}>Journey Timeline</div>
          {!u.events || u.events.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>No events recorded yet</div>
          ) : (
            <div className="activity-timeline">
              {u.events.map((ev, i) => {
                const cfg = PARTNER_TYPE_ICONS[ev.type] || PARTNER_TYPE_ICONS.login;
                return (
                  <div key={i} className="activity-tl-item">
                    <div className="activity-tl-left">
                      <div className="activity-tl-icon" style={{ background: cfg.bg }}>{cfg.svg}</div>
                      {i < u.events.length - 1 && <div className="activity-tl-line" />}
                    </div>
                    <div className="activity-tl-body">
                      <div className="activity-tl-time">{ev.time}</div>
                      <div className="activity-tl-title">{ev.title}</div>
                      <div className="activity-tl-desc">{ev.desc}</div>
                      <span className={`activity-chip ${ev.chipClass}`}>{ev.chipLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PURCHASE ACTIVITY — LIST VIEW (UPDATED WITH API DATA)
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "purchaseActivity" && !selectedPurchase) {
    const filteredPurchases = purchasesLoading
      ? []
      : purchaseTab === "all"      ? purchases
      : purchaseTab === "today"    ? purchases.filter((p) => p.date?.startsWith("Today"))
      : purchaseTab === "pending"  ? purchases.filter((p) => p.status === "pending")
      : purchases.filter((p) => p.status === "completed");

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
              <div className="header-icon" style={{ background: "#e0e7ff", border: "1px solid #c7d2fe", fontSize: 22 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>

              </div>
              <div>
                <h2>Marketplace Purchases</h2>
                <p className="header-subtitle">All user purchases — micro · nano · bundle · premium plans</p>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, background: "#e0e7ff", color: "#4338ca", padding: "6px 16px", borderRadius: 999, border: "1px solid #c7d2fe" }}>
              Revenue: {purchaseStats.revenue}
            </div>
          </div>
          <div className="tab-btn-group">
            {[
              { key: "all",       label: `All (${purchases.length})` },
              { key: "today",     label: "Today" },
              { key: "completed", label: "Completed" },
              { key: "pending",   label: "Pending" },
            ].map(({ key, label }) => (
              <button key={key} className={`tab-btn ${purchaseTab === key ? "active" : ""}`} onClick={() => setPurchaseTab(key)}>
                {label}
              </button>
            ))}
          </div>
          {purchasesLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>
              Loading purchases...
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>User</th><th>Item</th><th>Plan</th><th>Marketplace</th><th>Amount</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((p, idx) => {
                    const pal = PURCHASE_AVATAR_PALETTE[idx % PURCHASE_AVATAR_PALETTE.length];
                    return (
                      <tr key={p.id} className="table-row">
                        <td>
                          <div className="business-info">
                            <div className="row-avatar" style={{ background: pal.color, color: pal.textColor }}>{p.initials}</div>
                            <div>
                              <div className="business-name">{p.user}</div>
                              <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{p.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--slate-800)" }}>{p.item}</div>
                          <div style={{ fontSize: 11, color: "var(--slate-400)" }}>{p.type}</div>
                        </td>
                        <td><span className={`plan-badge ${PLAN_BADGE_CLASS[p.plan]}`}>{p.plan}</span></td>
                        <td style={{ fontSize: 12.5, color: "var(--slate-600)" }}>{p.marketplace}</td>
                        <td style={{ fontSize: 14, fontWeight: 700, color: "#4f46e5" }}>{p.amount}</td>
                        <td className="date-cell">{p.date}</td>
                        <td>
                          <span className={`status-pill ${p.status === "completed" ? "approved" : "pending"}`}>
                           {p.status === "completed" ? "✓ Done" : "Pending"}

                          </span>
                        </td>
                        <td><button className="view-btn" onClick={() => setSelectedPurchase(p)}>Details</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PURCHASE ACTIVITY — DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "purchaseActivity" && selectedPurchase) {
    const p = selectedPurchase;
    return (
      <div className="dashboard">
        <div className="details-card" style={{ maxWidth: 760 }}>
          <button className="back-btn" onClick={() => setSelectedPurchase(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Purchases
          </button>
          <div className="details-hero">
            <div className="details-avatar" style={{ background: "#e0e7ff", color: "#4338ca", border: "2px solid #c7d2fe" }}>{p.initials}</div>
            <div className="details-hero-info">
              <div className="details-hero-top">
                <h2>{p.user}</h2>
                <span className={`status-pill ${p.status === "completed" ? "approved" : "pending"}`}>
                  {p.status === "completed" ? "✓ Completed" : "Pending"}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--slate-400)" }}>{p.email}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            <div className="purchase-summary-card purchase-summary-indigo">
              <div className="purchase-summary-label">Amount Paid</div>
              <div className="purchase-summary-value">{p.amount}</div>
              <div className="purchase-summary-sub">{p.plan} Plan · {p.type}</div>
            </div>
            <div className="purchase-summary-card purchase-summary-emerald">
              <div className="purchase-summary-label">Content Access</div>
              <div className="purchase-summary-value">{p.microLessons}</div>
              <div className="purchase-summary-sub">{p.steps} Steps · {p.duration}</div>
            </div>
          </div>
          <div className="details-section-title">Item Details</div>
          <div className="details-grid">
            <DetailItem label="Item Name"         value={p.item}    icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>} />
            <DetailItem label="Item Type"         value={p.type} />
            <DetailItem label="Subscription Plan" value={p.plan} />
            <DetailItem label="Marketplace"       value={p.marketplace} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
            <DetailItem label="Duration"          value={p.duration} />
            <DetailItem label="Total Steps"       value={`${p.steps} steps`} />
            <DetailItem label="Micro Lessons"     value={`${p.microLessons} lessons`} />
            <DetailItem label="Purchase Date"     value={p.date} />
            <DetailItem label="Status"            value={p.status === "completed" ? "✓ Completed" : "⏳ Pending"} />
          </div>
          <div className="details-section-title">Buyer Details</div>
          <div className="details-grid">
            <DetailItem label="Full Name" value={p.user}  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
            <DetailItem label="Email"     value={p.email} />
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
               {isPartner ? (
  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg> Partner</>
) : (
  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> User</>
)}
              </span>
            </div>
          </div>

          {isPartner ? (
            <>
              <div className="details-section-title">Profile Details</div>
              <div className="details-grid">
                <DetailItem label="Business Name" value={selected.businessName} icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>} />
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
                <DetailItem label="Full Name"    value={fullUserData?.name || selected.businessName}  icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
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
                <DetailItem label="Personality Type" icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 014 4 4 4 0 01-1.2 2.8A4 4 0 0116 12a4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 011.2-3.2A4 4 0 018 6a4 4 0 014-4z"/></svg>}
                  value={fullUserData?.personality ? fullUserData.personality.charAt(0).toUpperCase() + fullUserData.personality.slice(1) : undefined}
                />
              </div>
            </>
          )}

          {isPending && (
            <>
              <div className={`approval-note ${isPartner ? "partner-note" : "user-note"}`}>
                <span style={{display:"flex",alignItems:"center",gap:8}}>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  Approval confirmation will be emailed to the {isPartner ? "partner" : "user"}
</span>
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
            <div style={{ marginTop: "32px", padding: "16px 20px", borderRadius: "12px", background: selected.status === "approved" ? "#E6F4EA" : "#FDE8E8", color: selected.status === "approved" ? "#1E7E34" : "#C0392B", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "10px" }}>
           {selected.status === "approved" ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1E7E34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
)}
              This {isPartner ? "partner" : "user"} has already been <strong>{selected.status}</strong>. No further action required.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // APPROVALS — LIST VIEW (default fallback return)
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
  {isPartnerView ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )}
</div>
            <div>
              <h2>{isPartnerView ? "Partner Approvals" : "User Approvals"}</h2>
              <p className="header-subtitle">
                {isPartnerView ? "Manage and review partner onboarding requests" : "Manage and review user registration requests"}
              </p>
            </div>
          </div>

          <div className="dropdown-container" ref={dropdownRef}>
            <button type="button" className={`role-toggle-btn ${isPartnerView ? "partner-toggle" : "user-toggle"}`} onClick={() => setShowRoleDropdown((prev) => !prev)}>
              {isPartnerView ? "Partners" : "Users"}
              <svg className={`arrow ${showRoleDropdown ? "open" : ""}`} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <PortalDropdown anchorRef={dropdownRef} isOpen={showRoleDropdown} onClose={() => setShowRoleDropdown(false)}>
              <button className={roleView === "partner" ? "partner-active" : ""} onClick={() => { setRoleView("partner"); setTab("all"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>

                  </span> Partners
                <span className="menu-count partner-count">{partnerData.length}</span>
              </button>
              <button className={roleView === "user" ? "user-active" : ""} onClick={() => { setRoleView("user"); setTab("all"); setShowRoleDropdown(false); }}>
                <span className="menu-icon">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
</span> Users
                <span className="menu-count user-count">{userData.length}</span>
              </button>
            </PortalDropdown>
          </div>
        </div>

        <div className="tab-btn-group">
          <button className={`tab-btn ${tab === "all"      ? "active" : ""}`} onClick={() => setTab("all")}>All</button>
          <button className={`tab-btn ${tab === "pending"  ? "active" : ""}`} onClick={() => setTab("pending")}>Pending</button>
          <button className={`tab-btn ${tab === "approved" ? "active" : ""}`} onClick={() => setTab("approved")}>Approved</button>
          <button className={`tab-btn ${tab === "rejected" ? "active" : ""}`} onClick={() => setTab("rejected")}>Rejected</button>
        </div>

        <div className="table-wrapper">
          {loadingData ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>Loading {isPartnerView ? "partners" : "users"}...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{isPartnerView ? "Business" : "Name"}</th>
                  <th>Type</th><th>Email</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
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
                      <td><button className="view-btn" onClick={() => setSelected(item)}>View</button></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-results">
                      <div className="empty-state">
<div className="empty-icon">
  {isPartnerView ? (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
  ) : (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  )}
</div>                        <p>No {tab === "all" ? "" : tab} {isPartnerView ? "partner" : "user"} records found</p>
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

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <div className="details-section-title" style={{ marginTop: "24px", marginBottom: "4px", paddingBottom: "8px", borderBottom: "1px solid #f0f2f5", fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
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