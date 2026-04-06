import React, { useState, useRef, useEffect } from "react";
import "./partnerHome.scss";

// ── Static Data ───────────────────────────────────────────────────────────────
const PARTNER_NAME = "SkillBridge AI";

const MY_PATHS = [
  { id: "p1", name: "Yale — Bachelor's Economics",  category: "Economics",    usersEnrolled: 342, completion: 82, status: "active",   steps: 12, microLessons: 48, revenue: 45600 },
  { id: "p2", name: "MIT Computer Science",          category: "Technology",   usersEnrolled: 218, completion: 65, status: "active",   steps: 10, microLessons: 40, revenue: 32700 },
  { id: "p3", name: "Aerospace Engg · Caltech",      category: "Engineering",  usersEnrolled: 196, completion: 58, status: "active",   steps: 14, microLessons: 56, revenue: 28400 },
  { id: "p4", name: "Pre-Med · Johns Hopkins",       category: "Medical",      usersEnrolled: 164, completion: 49, status: "active",   steps: 8,  microLessons: 32, revenue: 18150 },
  { id: "p5", name: "AI for Finance",                category: "Finance",      usersEnrolled: 284, completion: 73, status: "active",   steps: 9,  microLessons: 36, revenue: 22800 },
  { id: "p6", name: "Blockchain Fundamentals",       category: "Technology",   usersEnrolled: 0,   completion: 0,  status: "pending",  steps: 6,  microLessons: 24, revenue: 0     },
  { id: "p7", name: "Career Readiness Track",        category: "Career",       usersEnrolled: 0,   completion: 0,  status: "inactive", steps: 5,  microLessons: 20, revenue: 0     },
  { id: "p8", name: "Data Analytics Pack",           category: "Data Science", usersEnrolled: 0,   completion: 0,  status: "inactive", steps: 8,  microLessons: 32, revenue: 0     },
];

const LIVE_ACTIVITY = [
  { id: "a1", name: "Anisha R.", initials: "A", color: "#0d9488", action: "Selected Yale Economics path",            time: "2m ago",  type: "path",      typeBg: "rgba(13,148,136,.18)",  typeColor: "#0d9488" },
  { id: "a2", name: "Ravi K.",   initials: "R", color: "#f4845f", action: "Purchased Expert 1:1 Session (₹4,999)",  time: "8m ago",  type: "purchase",  typeBg: "rgba(244,132,95,.18)",  typeColor: "#e55a2b" },
  { id: "a3", name: "Meera S.",  initials: "M", color: "#7c6fcd", action: "Subscribed to Micro View Plan (₹2,999)", time: "22m ago", type: "subscribe", typeBg: "rgba(124,111,205,.18)", typeColor: "#7c6fcd" },
  { id: "a4", name: "Dev P.",    initials: "D", color: "#0d9488", action: "Selected MIT Computer Science path",      time: "45m ago", type: "path",      typeBg: "rgba(13,148,136,.18)",  typeColor: "#0d9488" },
  { id: "a5", name: "Priya T.",  initials: "P", color: "#f4845f", action: "Purchased Full Path Bundle (₹9,999)",    time: "1h ago",  type: "purchase",  typeBg: "rgba(244,132,95,.18)",  typeColor: "#e55a2b" },
  { id: "a6", name: "Arjun N.",  initials: "A", color: "#7c6fcd", action: "Subscribed to Micro View Plan",          time: "2h ago",  type: "subscribe", typeBg: "rgba(124,111,205,.18)", typeColor: "#7c6fcd" },
  { id: "a7", name: "Kavya L.",  initials: "K", color: "#0d9488", action: "Selected Pre-Med Johns Hopkins path",    time: "3h ago",  type: "path",      typeBg: "rgba(13,148,136,.18)",  typeColor: "#0d9488" },
  { id: "a8", name: "Sneha M.",  initials: "S", color: "#f59e0b", action: "Purchased Data Analytics Pack (₹2,499)", time: "4h ago", type: "purchase",  typeBg: "rgba(245,158,11,.18)",  typeColor: "#d97706" },
  { id: "a9", name: "Rohit B.",  initials: "R", color: "#0d9488", action: "Selected AI for Finance path",           time: "5h ago",  type: "path",      typeBg: "rgba(13,148,136,.18)",  typeColor: "#0d9488" },
];

const MARKETPLACE_ITEMS = [
  { id: "m1", name: "Data Science Pack",       type: "Bundle",  plan: "Micro",   purchases: 124, revenue: 186876, status: "active"  },
  { id: "m2", name: "Full Stack Bootcamp",     type: "Course",  plan: "Nano",    purchases: 87,  revenue: 43413,  status: "active"  },
  { id: "m3", name: "AI for Finance",          type: "Path",    plan: "Premium", purchases: 63,  revenue: 188937, status: "active"  },
  { id: "m4", name: "Cloud Computing Bundle",  type: "Bundle",  plan: "Micro",   purchases: 48,  revenue: 62352,  status: "active"  },
  { id: "m5", name: "Expert 1:1 Session",      type: "Session", plan: "Premium", purchases: 32,  revenue: 159968, status: "active"  },
  { id: "m6", name: "Blockchain Fundamentals", type: "Course",  plan: "Bundle",  purchases: 0,   revenue: 0,      status: "pending" },
];

const NOTIFICATIONS = [
  { id: 1, type: "purchase",  title: "New purchase",     desc: "Anisha R. purchased Data Science Pack",          time: "5 min ago",  unread: true  },
  { id: 2, type: "approval",  title: "Path approved",    desc: '"AI for Finance" path is now live',              time: "1 hr ago",   unread: true  },
  { id: 3, type: "subscribe", title: "New subscription", desc: "Meera S. subscribed to Micro View Plan",         time: "2 hr ago",   unread: true  },
  { id: 4, type: "purchase",  title: "Bundle purchase",  desc: "Priya T. purchased Full Path Bundle (₹9,999)",   time: "3 hr ago",   unread: true  },
  { id: 5, type: "path",      title: "Path selected",    desc: "Dev P. selected MIT Computer Science path",      time: "5 hr ago",   unread: true  },
  { id: 6, type: "approval",  title: "Review required",  desc: '"Blockchain Fundamentals" awaiting review',      time: "Yesterday",  unread: false },
  { id: 7, type: "subscribe", title: "New subscription", desc: "Arjun N. subscribed to Micro View Plan",         time: "Yesterday",  unread: false },
  { id: 8, type: "purchase",  title: "Session purchase", desc: "Kavya L. purchased Expert 1:1 Session",          time: "2 days ago", unread: false },
];

const NOTIF_CFG = {
  purchase:  { bg: "#dcfce7", color: "#15803d", icon: "🛒", label: "Purchase"    },
  approval:  { bg: "#fef3c7", color: "#b45309", icon: "✅", label: "Approval"    },
  subscribe: { bg: "#e0e7ff", color: "#4338ca", icon: "⭐", label: "Subscribe"   },
  path:      { bg: "#ccfbf1", color: "#0f766e", icon: "📈", label: "Path"        },
  system:    { bg: "#f1f5f9", color: "#475569", icon: "ℹ️", label: "System"     },
};

const WEEKLY_RETENTION = {
  days: ["M","T","W","T","F","S","S"],
  data: [
    [68,74,88,82,95,42,28],
    [55,70,83,90,92,50,22],
    [72,78,91,85,88,55,35],
    [65,82,87,93,90,48,30],
  ],
};

const PLAN_BADGE = {
  Micro:   { bg: "#e0e7ff", color: "#4338ca" },
  Nano:    { bg: "#d1fae5", color: "#047857" },
  Bundle:  { bg: "#fef3c7", color: "#b45309" },
  Premium: { bg: "#fce7f3", color: "#be185d" },
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function PartnerHome() {
  const [view,            setView]            = useState("home");
  const [selectedPath,    setSelectedPath]    = useState(null);
  const [selectedItem,    setSelectedItem]    = useState(null);
  const [pathTab,         setPathTab]         = useState("all");
  const [activityTab,     setActivityTab]     = useState("All");
  const [showNotif,       setShowNotif]       = useState(false);
  const [notifFilter,     setNotifFilter]     = useState("all");
  const [notifications,   setNotifications]   = useState(NOTIFICATIONS);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const notifRef = useRef(null);

  const unread     = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread: false })));
  const markRead    = id => setNotifications(p => p.map(n => n.id === id ? { ...n, unread: false } : n));

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── NOTIFICATIONS FULL PAGE ─────────────────────────────────────────────────
  if (view === "notifications") {
    const FILTERS = [
      { key: "all",       label: "All",           dot: "#0d9488" },
      { key: "purchase",  label: "Purchases",     dot: "#15803d" },
      { key: "path",      label: "Paths",         dot: "#0f766e" },
      { key: "subscribe", label: "Subscriptions", dot: "#4338ca" },
      { key: "approval",  label: "Approvals",     dot: "#b45309" },
    ];
    const filtered = notifFilter === "all" ? notifications : notifications.filter(n => n.type === notifFilter);

    return (
      <div className="ph-root">
        <div className="ph-notif-page">
          <div className="ph-notif-topbar">
            <button className="ph-back-btn" onClick={() => setView("home")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back to Dashboard
            </button>
            <div className="ph-notif-page-title">Notifications</div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="ph-mark-all-btn" onClick={markAllRead}>Mark all read</button>
              <button className="ph-clear-btn" onClick={() => setNotifications([])}>Clear all</button>
            </div>
          </div>

          <div className="ph-notif-body">
            <div className="ph-notif-sidebar">
              <div className="ph-notif-sidebar-label">Filter</div>
              {FILTERS.map(f => {
                const cnt = f.key === "all" ? notifications.length : notifications.filter(n => n.type === f.key).length;
                return (
                  <button key={f.key} className={`ph-notif-filter-btn ${notifFilter === f.key ? "active" : ""}`} onClick={() => setNotifFilter(f.key)}>
                    <span className="ph-notif-filter-dot" style={{ background: f.dot }} />
                    {f.label}
                    <span className="ph-notif-filter-count">{cnt}</span>
                  </button>
                );
              })}
            </div>

            <div className="ph-notif-list-full">
              {filtered.length === 0 ? (
                <div className="ph-notif-empty">🔔 No notifications</div>
              ) : filtered.map(n => {
                const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.system;
                return (
                  <div key={n.id} className={`ph-notif-full-item ${n.unread ? "unread" : ""}`} onClick={() => markRead(n.id)}>
                    <div className="ph-notif-full-icon" style={{ background: cfg.bg }}>{cfg.icon}</div>
                    <div className="ph-notif-full-body">
                      <div className="ph-notif-full-title">{n.title}</div>
                      <div className="ph-notif-full-desc">{n.desc}</div>
                      <div className="ph-notif-full-meta">
                        <span className="ph-notif-full-time">{n.time}</span>
                        <span className="ph-notif-full-tag" style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                    {n.unread && <div className="ph-unread-dot" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PATHS LIST ──────────────────────────────────────────────────────────────
  if (view === "paths" && !selectedPath) {
    const filtered = pathTab === "all" ? MY_PATHS : MY_PATHS.filter(p => p.status === pathTab);
    return (
      <div className="ph-root">
        <div className="ph-page-card">
          <div className="ph-page-topbar">
            <button className="ph-back-btn" onClick={() => setView("home")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <div className="ph-page-header">
              <div className="ph-page-icon" style={{ background: "linear-gradient(135deg,#0d9488,#14b8a6)" }}>📈</div>
              <div><h2>My Learning Paths</h2><p>Manage paths · track enrollments · monitor completion</p></div>
            </div>
          </div>
          <div className="ph-tab-group">
            {["all","active","inactive","pending"].map(t => (
              <button key={t} className={`ph-tab-btn ${pathTab === t ? "active" : ""}`} onClick={() => setPathTab(t)}>
                {t.charAt(0).toUpperCase()+t.slice(1)}
                <span className="ph-tab-count">{t==="all"?MY_PATHS.length:MY_PATHS.filter(p=>p.status===t).length}</span>
              </button>
            ))}
          </div>
          <div className="ph-table-wrap">
            <table>
              <thead><tr><th>Path</th><th>Category</th><th>Enrolled</th><th>Completion</th><th>Steps</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map(path => (
                  <tr key={path.id} className="ph-table-row">
                    <td><div className="ph-cell-name">{path.name}</div></td>
                    <td><span className="ph-type-chip">{path.category}</span></td>
                    <td><span style={{ fontWeight:700, color:"#1e293b" }}>{path.usersEnrolled}</span></td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="ph-mini-bar"><div className="ph-mini-fill" style={{ width:`${path.completion}%`, background: path.completion>70?"#0d9488":path.completion>40?"#14b8a6":"#94a3b8" }}/></div>
                        <span style={{ fontSize:12, fontWeight:600, color:"#0d9488" }}>{path.completion}%</span>
                      </div>
                    </td>
                    <td style={{ fontSize:13, color:"#64748b" }}>{path.steps} steps</td>
                    <td><span className={`ph-status-pill ph-status-${path.status}`}>{path.status==="active"?"● Active":path.status==="pending"?"⏳ Pending":"○ Inactive"}</span></td>
                    <td><button className="ph-view-btn" onClick={() => { setSelectedPath(path); setView("pathDetail"); }}>Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── PATH DETAIL ─────────────────────────────────────────────────────────────
  if (view === "pathDetail" && selectedPath) {
    const p = selectedPath;
    return (
      <div className="ph-root">
        <div className="ph-page-card">
          <button className="ph-back-btn" onClick={() => { setSelectedPath(null); setView("paths"); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Paths
          </button>
          <div className="ph-detail-hero">
            <div className="ph-detail-avatar">📈</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <h2 style={{ fontFamily:"var(--ph-display)", fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>{p.name}</h2>
                <span className={`ph-status-pill ph-status-${p.status}`}>{p.status==="active"?"● Active":p.status==="pending"?"⏳ Pending":"○ Inactive"}</span>
              </div>
              <div style={{ fontSize:13, color:"#94a3b8" }}>{p.category}</div>
            </div>
          </div>
          <div className="ph-detail-stats">
            <div className="ph-dsc ph-dsc-teal"><div className="ph-dsc-label">Enrolled</div><div className="ph-dsc-val">{p.usersEnrolled}</div></div>
            <div className="ph-dsc ph-dsc-blue"><div className="ph-dsc-label">Completion</div><div className="ph-dsc-val">{p.completion}%</div></div>
            <div className="ph-dsc ph-dsc-violet"><div className="ph-dsc-label">Steps</div><div className="ph-dsc-val">{p.steps}</div></div>
            <div className="ph-dsc ph-dsc-emerald"><div className="ph-dsc-label">Revenue</div><div className="ph-dsc-val">₹{p.revenue.toLocaleString("en-IN")}</div></div>
          </div>
          <div className="ph-detail-grid">
            {[["Path Name",p.name],["Category",p.category],["Steps",`${p.steps} steps`],["Micro Lessons",`${p.microLessons} lessons`],["Enrolled",p.usersEnrolled],["Revenue",`₹${p.revenue.toLocaleString("en-IN")}`]].map(([l,v])=>(
              <div key={l} className="ph-detail-row"><div className="ph-detail-label">{l}</div><div className="ph-detail-value">{v}</div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── MARKETPLACE LIST ────────────────────────────────────────────────────────
  if (view === "marketplace" && !selectedItem) {
    const totalRev = MARKETPLACE_ITEMS.reduce((s,m) => s+m.revenue, 0);
    return (
      <div className="ph-root">
        <div className="ph-page-card">
          <div className="ph-page-topbar">
            <button className="ph-back-btn" onClick={() => setView("home")}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Back
            </button>
            <div className="ph-page-header">
              <div className="ph-page-icon" style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)" }}>🛒</div>
              <div><h2>My Marketplace</h2><p>Track purchases · monitor revenue · manage listings</p></div>
            </div>
            <div className="ph-rev-badge">₹{totalRev.toLocaleString("en-IN")} revenue</div>
          </div>
          <div className="ph-table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Type</th><th>Plan</th><th>Purchases</th><th>Revenue</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {MARKETPLACE_ITEMS.map(item => (
                  <tr key={item.id} className="ph-table-row">
                    <td><div className="ph-cell-name">{item.name}</div></td>
                    <td><span className="ph-type-chip">{item.type}</span></td>
                    <td><span className="ph-plan-badge" style={{ background:PLAN_BADGE[item.plan]?.bg, color:PLAN_BADGE[item.plan]?.color }}>{item.plan}</span></td>
                    <td style={{ fontWeight:700, color:"#1e293b" }}>{item.purchases}</td>
                    <td style={{ fontWeight:700, color:"#7c3aed" }}>₹{item.revenue.toLocaleString("en-IN")}</td>
                    <td><span className={`ph-status-pill ph-status-${item.status}`}>{item.status==="active"?"● Active":"⏳ Pending"}</span></td>
                    <td><button className="ph-view-btn" onClick={() => { setSelectedItem(item); setView("marketDetail"); }}>Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── MARKETPLACE DETAIL ──────────────────────────────────────────────────────
  if (view === "marketDetail" && selectedItem) {
    const item = selectedItem;
    return (
      <div className="ph-root">
        <div className="ph-page-card">
          <button className="ph-back-btn" onClick={() => { setSelectedItem(null); setView("marketplace"); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Marketplace
          </button>
          <div className="ph-detail-hero">
            <div className="ph-detail-avatar" style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)" }}>🛒</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <h2 style={{ fontFamily:"var(--ph-display)", fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>{item.name}</h2>
                <span className={`ph-status-pill ph-status-${item.status}`}>{item.status==="active"?"● Active":"⏳ Pending"}</span>
              </div>
              <div style={{ fontSize:13, color:"#94a3b8" }}>{item.type} · {item.plan} Plan</div>
            </div>
          </div>
          <div className="ph-detail-stats" style={{ gridTemplateColumns:"1fr 1fr" }}>
            <div className="ph-dsc ph-dsc-violet"><div className="ph-dsc-label">Purchases</div><div className="ph-dsc-val">{item.purchases}</div></div>
            <div className="ph-dsc ph-dsc-emerald"><div className="ph-dsc-label">Revenue</div><div className="ph-dsc-val">₹{item.revenue.toLocaleString("en-IN")}</div></div>
          </div>
          <div className="ph-detail-grid">
            {[["Item Name",item.name],["Type",item.type],["Plan",item.plan],["Purchases",item.purchases],["Revenue",`₹${item.revenue.toLocaleString("en-IN")}`],["Status",item.status]].map(([l,v])=>(
              <div key={l} className="ph-detail-row"><div className="ph-detail-label">{l}</div><div className="ph-detail-value">{v}</div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ────────────────────────────────────────────────────────────────────
  const actFiltered       = activityTab === "All" ? LIVE_ACTIVITY : LIVE_ACTIVITY.filter(a => a.type === activityTab.toLowerCase());
  const displayedActivity = showAllActivity ? actFiltered : actFiltered.slice(0, 4);

  return (
    <div className="ph-root">

      {/* HEADER */}
      <div className="ph-header">
        <div>
          <div className="ph-welcome">Welcome back, <span className="ph-accent">{PARTNER_NAME}</span></div>
          <div className="ph-sub">Partner overview · updated just now</div>
        </div>
        <div className="ph-header-right">
          {/* Bell */}
          <div ref={notifRef} className="ph-notif-wrap">
            <button className="ph-bell-btn" onClick={() => setShowNotif(p => !p)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {unread > 0 && <span className="ph-bell-badge">{unread}</span>}
            </button>

            {showNotif && (
              <div className="ph-notif-dd">
                <div className="ph-notif-dd-head">
                  <span className="ph-notif-dd-title">Notifications</span>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    {unread > 0 && <span className="ph-notif-new-badge">{unread} new</span>}
                    <button className="ph-mark-all-btn" onClick={markAllRead}>Mark all read</button>
                  </div>
                </div>
                <div className="ph-notif-dd-list">
                  {notifications.slice(0,5).map(n => {
                    const cfg = NOTIF_CFG[n.type] || NOTIF_CFG.system;
                    return (
                      <div key={n.id} className={`ph-notif-dd-item ${n.unread?"unread":""}`} onClick={() => markRead(n.id)}>
                        <div className="ph-notif-dd-icon" style={{ background:cfg.bg }}>{cfg.icon}</div>
                        <div className="ph-notif-dd-body">
                          <div className="ph-notif-dd-item-title">{n.title}</div>
                          <div className="ph-notif-dd-item-desc">{n.desc}</div>
                          <div className="ph-notif-dd-item-time">{n.time}</div>
                        </div>
                        {n.unread && <div className="ph-unread-dot" />}
                      </div>
                    );
                  })}
                </div>
                <div className="ph-notif-dd-footer">
                  <button className="ph-view-all-notif-btn" onClick={() => { setShowNotif(false); setView("notifications"); }}>
                    View all notifications →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="ph-date-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
            {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </div>

          <button className="ph-add-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            Add New
          </button>
        </div>
      </div>

      {/* SECTION LABEL */}
      <div className="ph-section-label">OVERVIEW · LAST 30 DAYS <span className="ph-export-link">Export ↗</span></div>

      {/* 3 STAT CARDS */}
      <div className="ph-top-stats">
        <div className="ph-stat-card ph-stat-teal">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 17L8 7l4 6 4-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="ph-stat-badge">↑ 24%</span>
          </div>
          <div className="ph-stat-val">1,204</div>
          <div className="ph-stat-label">Paths Selected by Users</div>
          {/* <div className="ph-stat-bar"><div className="ph-stat-bar-fill" style={{ width:"72%" }}/></div> */}
          <div className="ph-stat-sub">1,204 total · 342 this week</div>
          <button className="ph-stat-btn" onClick={() => setView("paths")}>View All →</button>
        </div>

        <div className="ph-stat-card ph-stat-blue">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="ph-stat-badge">↑ 11%</span>
          </div>
          <div className="ph-stat-val">7,382</div>
          <div className="ph-stat-label">Steps Completed</div>
          {/* <div className="ph-stat-bar"><div className="ph-stat-bar-fill" style={{ width:"58%" }}/></div> */}
          <div className="ph-stat-sub">Across all paths · Avg 6.1 per user</div>
          <button className="ph-stat-btn">View Steps →</button>
        </div>

        <div className="ph-stat-card ph-stat-violet">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="ph-stat-badge">↑ 31%</span>
          </div>
          <div className="ph-stat-val">698</div>
          <div className="ph-stat-label">Subscriptions &amp; Purchases</div>
          {/* <div className="ph-stat-bar"><div className="ph-stat-bar-fill" style={{ width:"85%" }}/></div> */}
          <div className="ph-stat-sub">386 subs · 218 purchases · 94 bundles</div>
          <button className="ph-stat-btn" onClick={() => setView("marketplace")}>View Market →</button>
        </div>
      </div>

      {/* MIDDLE ROW */}
      <div className="ph-mid-row">

        {/* Live Activity */}
        <div className="ph-card ph-activity-card">
          <div className="ph-card-header">
            <span className="ph-card-title">Live Activity</span>
            <div className="ph-act-tabs">
              {["All","Path","Purchase","Subscribe"].map(t => (
                <button key={t} className={`ph-act-tab ${activityTab===t?"active":""}`} onClick={() => { setActivityTab(t); setShowAllActivity(false); }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="ph-activity-list">
            {displayedActivity.map(a => (
              <div key={a.id} className="ph-act-item">
                <div className="ph-act-avatar" style={{ background:a.color }}>{a.initials}</div>
                <div className="ph-act-info">
                  <div className="ph-act-name">{a.name}</div>
                  <div className="ph-act-action">{a.action}</div>
                </div>
                <div className="ph-act-right">
                  <div className="ph-act-time">{a.time}</div>
                  <span className="ph-act-chip" style={{ background:a.typeBg, color:a.typeColor }}>{a.type.charAt(0).toUpperCase()+a.type.slice(1)}</span>
                </div>
              </div>
            ))}
          </div>
          {actFiltered.length > 4 && (
            <button className="ph-show-more-btn" onClick={() => setShowAllActivity(p => !p)}>
              {showAllActivity ? "Show less ↑" : `Show all ${actFiltered.length} →`}
            </button>
          )}
        </div>

        {/* Right col */}
        <div className="ph-right-col">

          {/* Top Paths */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Top Paths This Week</span>
            </div>
            <div className="ph-top-paths-list">
              {MY_PATHS.filter(p => p.status==="active").slice(0,4).map((path,i) => (
                <div key={path.id} className="ph-top-path-row">
                  <span className="ph-path-rank">{i+1}</span>
                  <div className="ph-path-info">
                    <div className="ph-path-name">{path.name}</div>
                    <div className="ph-path-enrolled">{path.usersEnrolled} users</div>
                  </div>
                  <div className="ph-path-bar-wrap">
                    <div className="ph-path-bar"><div className="ph-path-bar-fill" style={{ width:`${path.completion}%` }}/></div>
                    <span className="ph-path-pct">{path.completion}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Retention — vertical bar chart */}
          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Weekly Retention</span>
              <span className="ph-peak-tag">↑ Peak: Friday</span>
            </div>
            <div className="ph-retention-bars">
              {WEEKLY_RETENTION.days.map((day, di) => {
                const avg = Math.round(WEEKLY_RETENTION.data.reduce((s,w) => s+w[di], 0) / WEEKLY_RETENTION.data.length);
                return (
                  <div key={di} className="ph-ret-col">
                    <div className="ph-ret-bar-wrap">
                      <div className="ph-ret-tooltip">{avg}%</div>
                      <div className="ph-ret-bar-fill" style={{
                        height: `${avg}%`,
                        background: avg>85?"#0d9488":avg>65?"#14b8a6":avg>40?"#5eead4":"#99f6e4"
                      }}/>
                    </div>
                    <span className="ph-ret-day">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="ph-bottom-row">

        <div className="ph-card">
          <div className="ph-card-header">
            <span className="ph-card-title">My Paths</span>
            <button className="ph-link-btn" onClick={() => setView("paths")}>View all →</button>
          </div>
          <div className="ph-bottom-list">
            {MY_PATHS.filter(p => p.status==="active").map((path,i) => (
              <div key={path.id} className="ph-bottom-item" onClick={() => { setSelectedPath(path); setView("pathDetail"); }}>
                <span className="ph-bottom-num">{i+1}</span>
                <div className="ph-bottom-info">
                  <div className="ph-bottom-name">{path.name}</div>
                  <div className="ph-bottom-sub">{path.usersEnrolled} users enrolled</div>
                </div>
                <span className="ph-bottom-pct">{path.completion}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="ph-card">
          <div className="ph-card-header">
            <span className="ph-card-title">My Marketplace</span>
            <button className="ph-link-btn" onClick={() => setView("marketplace")}>View all →</button>
          </div>
          <div className="ph-bottom-list">
            {MARKETPLACE_ITEMS.map((item,i) => (
              <div key={item.id} className="ph-bottom-item" onClick={() => { setSelectedItem(item); setView("marketDetail"); }}>
                <div className={`ph-market-icon ph-market-icon-${i%4}`}>{["🛒","📦","🎯","☁️","👤","⛓️"][i]}</div>
                <div className="ph-bottom-info">
                  <div className="ph-bottom-name">{item.name}</div>
                  <div className="ph-bottom-sub">{item.purchases} purchases</div>
                </div>
                <span className="ph-plan-badge" style={{ background:PLAN_BADGE[item.plan]?.bg, color:PLAN_BADGE[item.plan]?.color }}>{item.plan}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}