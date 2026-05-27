import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import "./partnerHome.scss";

const PARTNER_NAME = "SkillBridge AI";
const BASE_URL     = process.env.REACT_APP_API_BASE_URL || "";

function getPartnerEmail() {
  try {
    const raw = localStorage.getItem("partnerData") || localStorage.getItem("partner");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email || null;
  } catch { return null; }
}

const LIVE_ACTIVITY = [
  { id:"a1",  name:"Anisha R.", initials:"A", color:"#0d9488", action:"Selected Yale Economics path",             time:"2m ago",  type:"path",     typeBg:"rgba(13,148,136,.18)",  typeColor:"#0d9488" },
  { id:"a2",  name:"Ravi K.",   initials:"R", color:"#f4845f", action:"Purchased Expert 1:1 Session (₹4,999)",   time:"8m ago",  type:"purchase", typeBg:"rgba(244,132,95,.18)",  typeColor:"#e55a2b" },
  { id:"a4",  name:"Dev P.",    initials:"D", color:"#0d9488", action:"Selected MIT Computer Science path",       time:"45m ago", type:"path",     typeBg:"rgba(13,148,136,.18)",  typeColor:"#0d9488" },
  { id:"a5",  name:"Priya T.",  initials:"P", color:"#f4845f", action:"Purchased Full Path Bundle (₹9,999)",     time:"1h ago",  type:"purchase", typeBg:"rgba(244,132,95,.18)",  typeColor:"#e55a2b" },
  { id:"a7",  name:"Kavya L.",  initials:"K", color:"#0d9488", action:"Selected Pre-Med Johns Hopkins path",     time:"3h ago",  type:"path",     typeBg:"rgba(13,148,136,.18)",  typeColor:"#0d9488" },
  { id:"a8",  name:"Sneha M.",  initials:"S", color:"#f59e0b", action:"Purchased Data Analytics Pack (₹2,499)", time:"4h ago",  type:"purchase", typeBg:"rgba(245,158,11,.18)",  typeColor:"#d97706" },
  { id:"a9",  name:"Rohit B.",  initials:"R", color:"#0d9488", action:"Selected AI for Finance path",            time:"5h ago",  type:"path",     typeBg:"rgba(13,148,136,.18)",  typeColor:"#0d9488" },
  { id:"a10", name:"Neha G.",   initials:"N", color:"#f4845f", action:"Purchased Cloud Computing Bundle (₹5,499)", time:"6h ago", type:"purchase", typeBg:"rgba(244,132,95,.18)", typeColor:"#e55a2b" },
  { id:"a11", name:"Arun S.",   initials:"A", color:"#0d9488", action:"Selected Blockchain Fundamentals path",   time:"7h ago",  type:"path",     typeBg:"rgba(13,148,136,.18)",  typeColor:"#0d9488" },
  { id:"a12", name:"Pooja M.",  initials:"P", color:"#f59e0b", action:"Purchased Full Stack Bootcamp (₹3,999)", time:"8h ago",  type:"purchase", typeBg:"rgba(245,158,11,.18)",  typeColor:"#d97706" },
];

const MARKETPLACE_ITEMS = [
  { id:"m1", name:"Data Science Pack",       type:"Bundle",  plan:"Micro",   purchases:124, revenue:186876, status:"active"  },
  { id:"m2", name:"Full Stack Bootcamp",     type:"Course",  plan:"Nano",    purchases:87,  revenue:43413,  status:"active"  },
  { id:"m3", name:"AI for Finance",          type:"Path",    plan:"Premium", purchases:63,  revenue:188937, status:"active"  },
  { id:"m4", name:"Cloud Computing Bundle",  type:"Bundle",  plan:"Micro",   purchases:48,  revenue:62352,  status:"active"  },
  { id:"m5", name:"Expert 1:1 Session",      type:"Session", plan:"Premium", purchases:32,  revenue:159968, status:"active"  },
  { id:"m6", name:"Blockchain Fundamentals", type:"Course",  plan:"Bundle",  purchases:0,   revenue:0,      status:"pending" },
];

const NOTIFICATIONS = [
  { id:1, type:"purchase", title:"New purchase",     desc:"Anisha R. purchased Data Science Pack",        time:"5 min ago",  unread:true  },
  { id:2, type:"approval", title:"Path approved",    desc:'"AI for Finance" path is now live',            time:"1 hr ago",   unread:true  },
  { id:4, type:"purchase", title:"Bundle purchase",  desc:"Priya T. purchased Full Path Bundle (₹9,999)", time:"3 hr ago",   unread:true  },
  { id:5, type:"path",     title:"Path selected",    desc:"Dev P. selected MIT Computer Science path",    time:"5 hr ago",   unread:true  },
  { id:6, type:"approval", title:"Review required",  desc:'"Blockchain Fundamentals" awaiting review',    time:"Yesterday",  unread:false },
  { id:8, type:"purchase", title:"Session purchase", desc:"Kavya L. purchased Expert 1:1 Session",        time:"2 days ago", unread:false },
];

const NOTIF_CFG = {
  purchase: { bg:"#dcfce7", color:"#15803d", icon:"🛒", label:"Purchase" },
  approval: { bg:"#fef3c7", color:"#b45309", icon:"✅", label:"Approval" },
  path:     { bg:"#ccfbf1", color:"#0f766e", icon:"📈", label:"Path"     },
  system:   { bg:"#f1f5f9", color:"#475569", icon:"ℹ️",  label:"System"  },
};

const PENDING_ACTIONS = [
  { id:"p1", label:"Awaiting approval",     desc:"Blockchain Fundamentals",     urgency:"high",   nav:"paths"       },
  { id:"p2", label:"Unread messages",       desc:"3 users sent queries",        urgency:"high",   nav:"home"        },
  { id:"p3", label:"Steps need review",     desc:"2 steps flagged by users",    urgency:"medium", nav:"paths"       },
  { id:"p4", label:"Upgrade available",     desc:"Move to Premium plan",        urgency:"low",    nav:"marketplace" },
  { id:"p5", label:"Draft path incomplete", desc:"AI for Designers — 40% done", urgency:"medium", nav:"paths"       },
];

const urgencyOrder  = { high:0, medium:1, low:2 };
const sortedActions = [...PENDING_ACTIONS].sort((a,b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
const highCount     = PENDING_ACTIONS.filter(a => a.urgency==="high").length;

const WEEKLY_RETENTION = {
  days: ["M","T","W","T","F","S","S"],
  data: [[68,74,88,82,95,42,28],[55,70,83,90,92,50,22],[72,78,91,85,88,55,35],[65,82,87,93,90,48,30]],
};

const PLAN_BADGE = {
  Micro:   { bg:"#e0e7ff", color:"#4338ca" },
  Nano:    { bg:"#d1fae5", color:"#047857" },
  Bundle:  { bg:"#fef3c7", color:"#b45309" },
  Premium: { bg:"#fce7f3", color:"#be185d" },
};

const Skeleton = ({ width="100%", height=16, radius=6, style={} }) => (
  <div style={{ width, height, borderRadius:radius, background:"linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%)", backgroundSize:"200% 100%", animation:"ph-shimmer 1.4s infinite", ...style }} />
);

export default function PartnerHome({ setispopular }) {
  const [view,             setView]            = useState("home");
  const [selectedPath,     setSelectedPath]    = useState(null);
  const [selectedItem,     setSelectedItem]    = useState(null);
  const [pathTab,          setPathTab]         = useState("all");
  const [activityTab,      setActivityTab]     = useState("All");
  const [showNotif,        setShowNotif]       = useState(false);
  const [notifFilter,      setNotifFilter]     = useState("all");
  const [notifications,    setNotifications]   = useState(NOTIFICATIONS);
  const [showAllActivity,  setShowAllActivity] = useState(false);
  const [dashStats,        setDashStats]       = useState(null);
  const [statsLoading,     setStatsLoading]    = useState(true);
  const [statsError,       setStatsError]      = useState(null);
  const [pathUsers,        setPathUsers]       = useState([]);
  const [pathUsersLoading, setPathUsersLoading]= useState(false);

  const notifRef = useRef(null);
  const unread      = notifications.filter(n => n.unread).length;
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, unread:false })));
  const markRead    = id => setNotifications(p => p.map(n => n.id===id ? { ...n, unread:false } : n));

  useEffect(() => {
    const h = e => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fetchStats = useCallback(async () => {
    const email = getPartnerEmail();
    if (!email) { setStatsError("Partner email not found."); setStatsLoading(false); return; }
    try {
      setStatsLoading(true); setStatsError(null);
      const res = await axios.get(`${BASE_URL}/api/partner-dashboard/stats`, { params:{ email } });
      if (res.data?.status) setDashStats(res.data.data);
      else setStatsError(res.data?.message || "Failed to load stats");
    } catch { setStatsError("Could not load dashboard data."); }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchPathUsers = useCallback(async (pathId) => {
    const partnerEmail = getPartnerEmail();
    if (!pathId || !partnerEmail) return;
    try {
      setPathUsersLoading(true);
      const res = await axios.get(`${BASE_URL}/api/partner-dashboard/path-users`, { params:{ pathId, partnerEmail } });
      setPathUsers(res.data?.status ? (res.data.data || []) : []);
    } catch { setPathUsers([]); }
    finally { setPathUsersLoading(false); }
  }, []);

  const MY_PATHS       = dashStats?.paths || [];
  const totalSelected  = dashStats?.totalSelected ?? 0;
  const thisWeek       = dashStats?.thisWeek      ?? 0;
  const percentChange  = dashStats?.percentChange ?? 0;
  const totalPurchases = MARKETPLACE_ITEMS.reduce((s,m) => s+m.purchases, 0);
  const totalBundles   = MARKETPLACE_ITEMS.filter(m => m.type==="Bundle").reduce((s,m) => s+m.purchases, 0);
  const actFiltered       = activityTab==="All" ? LIVE_ACTIVITY : LIVE_ACTIVITY.filter(a => a.type===activityTab.toLowerCase());
  const displayedActivity = showAllActivity ? actFiltered : actFiltered.slice(0,4);

  // ── NOTIFICATIONS PAGE ──────────────────────────────────────────────────
  if (view==="notifications") {
    const FILTERS = [
      { key:"all",      label:"All",       dot:"#0d9488" },
      { key:"purchase", label:"Purchases", dot:"#15803d" },
      { key:"path",     label:"Paths",     dot:"#0f766e" },
      { key:"approval", label:"Approvals", dot:"#b45309" },
    ];
    const filtered = notifFilter==="all" ? notifications : notifications.filter(n => n.type===notifFilter);
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
                const cnt = f.key==="all" ? notifications.length : notifications.filter(n => n.type===f.key).length;
                return (
                  <button key={f.key} className={`ph-notif-filter-btn ${notifFilter===f.key?"active":""}`} onClick={() => setNotifFilter(f.key)}>
                    <span className="ph-notif-filter-dot" style={{ background:f.dot }}/>{f.label}
                    <span className="ph-notif-filter-count">{cnt}</span>
                  </button>
                );
              })}
            </div>
            <div className="ph-notif-list-full">
              {filtered.length===0 ? <div className="ph-notif-empty">No notifications</div>
              : filtered.map(n => {
                const cfg = NOTIF_CFG[n.type]||NOTIF_CFG.system;
                return (
                  <div key={n.id} className={`ph-notif-full-item ${n.unread?"unread":""}`} onClick={() => markRead(n.id)}>
                    <div className="ph-notif-full-icon" style={{ background:cfg.bg }}>{cfg.icon}</div>
                    <div className="ph-notif-full-body">
                      <div className="ph-notif-full-title">{n.title}</div>
                      <div className="ph-notif-full-desc">{n.desc}</div>
                      <div className="ph-notif-full-meta">
                        <span className="ph-notif-full-time">{n.time}</span>
                        <span className="ph-notif-full-tag" style={{ background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                      </div>
                    </div>
                    {n.unread && <div className="ph-unread-dot"/>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

 // ── ACTIONS PAGE ────────────────────────────────────────────────────────
if (view==="actions") {
  return (
    <div className="ph-root">
      <div className="ph-page-card">
        <div className="ph-page-topbar">
          <button className="ph-back-btn-icon" onClick={() => setView("home")}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
          <div className="ph-page-header-left">
            <div className="ph-page-header-content">
              <h2>Pending Actions</h2>
              <p>{highCount} urgent · {PENDING_ACTIONS.length} total items need attention</p>
            </div>
          </div>
        </div>
        
        <div className="ph-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Details</th>
                <th>Priority</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedActions.map(action => (
                <tr key={action.id} className="ph-table-row">
                  <td><div className="ph-cell-name">{action.label}</div></td>
                  <td style={{ fontSize:12, color:"#64748b" }}>{action.desc}</td>
                  <td>
                    <span className={`ph-status-pill ${action.urgency==="high"?"ph-status-pending":action.urgency==="medium"?"ph-status-inactive":"ph-status-active"}`}>
                      {action.urgency==="high"?"Urgent":action.urgency==="medium"?"Medium":"Low"}
                    </span>
                  </td>
                  <td>
                    <button className="ph-view-btn" onClick={() => setView(action.nav)}>
                      Go <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M6 12L10 8 6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
 // ── PATHS LIST PAGE ──────────────────────────────────────────────────────
if (view==="paths" && !selectedPath) {
  const filtered = pathTab==="all" ? MY_PATHS : MY_PATHS.filter(p => (p.status||"active")===pathTab);
  return (
    <div className="ph-root">
      <div className="ph-page-card">
        <div className="ph-page-topbar">
          <button className="ph-back-btn-icon" onClick={() => setView("home")}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
          <div className="ph-page-header-left">
            <div className="ph-page-header-content">
              <h2>My Learning Paths</h2>
              <p>Manage paths · track enrollments · monitor completion</p>
            </div>
          </div>
          <button className="ph-refresh-btn" onClick={fetchStats} disabled={statsLoading}>
            {statsLoading?"Refreshing…":"↻ Refresh"}
          </button>
        </div>
        
        <div className="ph-tab-group">
          <button className={`ph-tab-btn ${pathTab==="all" ? "active" : ""}`} onClick={() => setPathTab("all")}>
            All
          </button>
          <button className={`ph-tab-btn ${pathTab==="active" ? "active" : ""}`} onClick={() => setPathTab("active")}>
            Active
          </button>
          <button className={`ph-tab-btn ${pathTab==="inactive" ? "active" : ""}`} onClick={() => setPathTab("inactive")}>
            Inactive
          </button>
          <button className={`ph-tab-btn ${pathTab==="pending" ? "active" : ""}`} onClick={() => setPathTab("pending")}>
            Pending
          </button>
          <button className="ph-add-new-btn" onClick={() => setispopular && setispopular(true)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Add New
          </button>
        </div>
        
        {statsLoading ? (
          <div style={{ padding:"24px 0" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display:"flex", gap:16, padding:"12px 0", borderBottom:"1px solid #f1f5f9" }}>
                <Skeleton width={200} height={14}/><Skeleton width={80} height={14}/><Skeleton width={50} height={14}/><Skeleton width={100} height={14}/>
              </div>
            ))}
          </div>
        ) : statsError ? (
          <div style={{ padding:24, textAlign:"center", color:"#e55a2b" }}>
            {statsError} <button className="ph-refresh-btn" onClick={fetchStats} style={{ marginLeft:12 }}>Retry</button>
          </div>
        ) : (
          <div className="ph-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Path</th>
                  <th>Category</th>
                  <th>Enrolled</th>
                  <th>This Week</th>
                  <th>Completion</th>
                  <th>Steps</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={8} style={{ textAlign:"center", color:"#94a3b8", padding:32 }}>No paths found.</td></tr>
                ) : (
                  filtered.map(path => (
                    <tr key={path._id} className="ph-table-row">
                      <td><div className="ph-cell-name">{path.nameOfPath}</div></td>
                      <td><span className="ph-type-chip">{path.category}</span></td>
                      <td><span style={{ fontWeight:700, color:"#1e293b" }}>{path.usersEnrolled}</span></td>
                      <td><span style={{ fontSize:11, fontWeight:600, color:path.thisWeek>0?"#0d9488":"#94a3b8" }}>{path.thisWeek>0?`+${path.thisWeek}`:"—"}</span></td>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div className="ph-mini-bar"><div className="ph-mini-fill" style={{ width:`${path.completion}%`, background:path.completion>70?"#0d9488":path.completion>40?"#14b8a6":"#94a3b8" }}/></div>
                          <span style={{ fontSize:12, fontWeight:600, color:"#0d9488" }}>{path.completion}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13, color:"#64748b" }}>{path.steps} steps</td>
                      <td><span className="ph-status-pill ph-status-active">Active</span></td>
                      <td><button className="ph-view-btn" onClick={() => { setSelectedPath(path); fetchPathUsers(path._id); setView("pathDetail"); }}>Details</button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

  // ── PATH DETAIL PAGE ─────────────────────────────────────────────────────
  if (view==="pathDetail" && selectedPath) {
    const p = selectedPath;
    return (
      <div className="ph-root">
        <div className="ph-page-card">
          <button className="ph-back-btn" onClick={() => { setSelectedPath(null); setPathUsers([]); setView("paths"); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back to Paths
          </button>
          <div className="ph-detail-hero">
            <div className="ph-detail-avatar">📈</div>
            <div>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <h2 style={{ fontFamily:"var(--ph-display)", fontSize:22, fontWeight:700, color:"#1e293b", margin:0 }}>{p.nameOfPath}</h2>
                <span className="ph-status-pill ph-status-active">● Active</span>
              </div>
              <div style={{ fontSize:13, color:"#94a3b8" }}>{p.category}</div>
            </div>
          </div>
          <div className="ph-detail-stats">
            <div className="ph-dsc ph-dsc-teal"><div className="ph-dsc-label">Enrolled</div><div className="ph-dsc-val">{p.usersEnrolled}</div></div>
            <div className="ph-dsc ph-dsc-blue"><div className="ph-dsc-label">Completion</div><div className="ph-dsc-val">{p.completion}%</div></div>
            <div className="ph-dsc ph-dsc-violet"><div className="ph-dsc-label">Steps</div><div className="ph-dsc-val">{p.steps}</div></div>
            <div className="ph-dsc ph-dsc-emerald"><div className="ph-dsc-label">This Week</div><div className="ph-dsc-val">{p.thisWeek>0?`+${p.thisWeek}`:"0"}</div></div>
          </div>
          <div className="ph-detail-grid">
            {[["Path Name",p.nameOfPath],["Category",p.category],["Steps",`${p.steps} steps`],["Micro Lessons",`${p.microLessons||p.steps*4} lessons`],["Enrolled",p.usersEnrolled],["This Week",p.thisWeek>0?`+${p.thisWeek} new`:"No new this week"]].map(([l,v]) => (
              <div key={l} className="ph-detail-row"><div className="ph-detail-label">{l}</div><div className="ph-detail-value">{v}</div></div>
            ))}
          </div>
          <div style={{ marginTop:24 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1e293b", fontFamily:"var(--ph-display)", marginBottom:12 }}>
              Enrolled Users {!pathUsersLoading && <span style={{ fontSize:11, fontWeight:500, color:"#94a3b8", marginLeft:8 }}>({pathUsers.length} total)</span>}
            </div>
            {pathUsersLoading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{[1,2,3].map(i => <Skeleton key={i} height={40} radius={8}/>)}</div>
            ) : pathUsers.length===0 ? (
              <div style={{ padding:"24px 0", textAlign:"center", color:"#94a3b8", fontSize:13 }}>No users enrolled yet.</div>
            ) : (
              <div className="ph-table-wrap">
                <table>
                  <thead><tr><th>User</th><th>Email</th><th>Enrolled</th><th>Progress</th><th>Steps Done</th><th>Status</th></tr></thead>
                  <tbody>
                    {pathUsers.map((u,i) => (
                      <tr key={u.email+i} className="ph-table-row">
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:8, background:"#0d9488", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:11, fontWeight:700, flexShrink:0 }}>
                              {(u.name||u.email||"U").charAt(0).toUpperCase()}
                            </div>
                            <span className="ph-cell-name">{u.name||"—"}</span>
                          </div>
                        </td>
                        <td style={{ fontSize:12, color:"#64748b" }}>{u.email}</td>
                        <td style={{ fontSize:11, color:"#94a3b8" }}>{u.enrolledAt?new Date(u.enrolledAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"}):"—"}</td>
                        <td>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div className="ph-mini-bar" style={{ width:70 }}><div className="ph-mini-fill" style={{ width:`${u.completion}%`, background:u.completion>=100?"#0d9488":u.completion>40?"#14b8a6":"#94a3b8" }}/></div>
                            <span style={{ fontSize:11, fontWeight:600, color:"#0d9488" }}>{u.completion}%</span>
                          </div>
                        </td>
                        <td style={{ fontSize:12, color:"#64748b" }}>{u.completedSteps}/{u.totalSteps}</td>
                        <td>
                          <span className={`ph-status-pill ${u.status==="completed"?"ph-status-active":u.status==="in-progress"?"ph-status-pending":"ph-status-inactive"}`}>
                            {u.status==="completed"?"● Done":u.status==="in-progress"?"⏳ Active":"○ Not Started"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── MARKETPLACE LIST PAGE ────────────────────────────────────────────────
if (view==="marketplace" && !selectedItem) {
  const totalRev = MARKETPLACE_ITEMS.reduce((s,m) => s+m.revenue, 0);
  return (
    <div className="ph-root">
      <div className="ph-page-card">
        <div className="ph-page-topbar">
          <button className="ph-back-btn-icon" onClick={() => setView("home")}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back</span>
          </button>
          <div className="ph-page-header-left">
            <div className="ph-page-header-content">
              <h2>My Marketplace</h2>
              <p>Track purchases · monitor revenue · manage listings</p>
            </div>
          </div>
          <div className="ph-rev-badge">₹{totalRev.toLocaleString("en-IN")} revenue</div>
        </div>
        
        <div className="ph-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Plan</th>
                <th>Purchases</th>
                <th>Revenue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {MARKETPLACE_ITEMS.map(item => (
                <tr key={item.id} className="ph-table-row">
                  <td><div className="ph-cell-name">{item.name}</div></td>
                  <td><span className="ph-type-chip">{item.type}</span></td>
                  <td><span className="ph-plan-badge" style={{ background:PLAN_BADGE[item.plan]?.bg, color:PLAN_BADGE[item.plan]?.color }}>{item.plan}</span></td>
                  <td style={{ fontWeight:700, color:"#1e293b" }}>{item.purchases}</td>
                  <td style={{ fontWeight:700, color:"#7c3aed" }}>₹{item.revenue.toLocaleString("en-IN")}</td>
                  <td><span className={`ph-status-pill ph-status-${item.status}`}>{item.status==="active"?"Active":"Pending"}</span></td>
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
  // ── MARKETPLACE DETAIL PAGE ──────────────────────────────────────────────
  if (view==="marketDetail" && selectedItem) {
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
            {[["Item Name",item.name],["Type",item.type],["Plan",item.plan],["Purchases",item.purchases],["Revenue",`₹${item.revenue.toLocaleString("en-IN")}`],["Status",item.status]].map(([l,v]) => (
              <div key={l} className="ph-detail-row"><div className="ph-detail-label">{l}</div><div className="ph-detail-value">{v}</div></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME PAGE ────────────────────────────────────────────────────────────
  return (
    <div className="ph-root">
      <style>{`@keyframes ph-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
<div className="ph-header">
        <div>
          <div className="ph-welcome" style={{ display:"flex", alignItems:"center", gap:8 }}>
            Welcome back, <span className="ph-accent">{PARTNER_NAME}</span>
            <div ref={notifRef} className="ph-notif-wrap">
              <button className="ph-bell-btn" onClick={() => setShowNotif(p => !p)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unread>0 && <span className="ph-bell-badge">{unread}</span>}
              </button>
              {showNotif && (
                <div className="ph-notif-dd">
                  <div className="ph-notif-dd-head">
                    <span className="ph-notif-dd-title">Notifications</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      {unread>0 && <span className="ph-notif-new-badge">{unread} new</span>}
                      <button className="ph-mark-all-btn" onClick={markAllRead}>Mark all read</button>
                    </div>
                  </div>
                  <div className="ph-notif-dd-list">
                    {notifications.slice(0,5).map(n => {
                      const cfg = NOTIF_CFG[n.type]||NOTIF_CFG.system;
                      return (
                        <div key={n.id} className={`ph-notif-dd-item ${n.unread?"unread":""}`} onClick={() => markRead(n.id)}>
                          <div className="ph-notif-dd-icon" style={{ background:cfg.bg }}>{cfg.icon}</div>
                          <div className="ph-notif-dd-body">
                            <div className="ph-notif-dd-item-title">{n.title}</div>
                            <div className="ph-notif-dd-item-desc">{n.desc}</div>
                            <div className="ph-notif-dd-item-time">{n.time}</div>
                          </div>
                          {n.unread && <div className="ph-unread-dot"/>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="ph-notif-dd-footer">
                    <button className="ph-view-all-notif-btn" onClick={() => { setShowNotif(false); setView("notifications"); }}>View all notifications →</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="ph-sub">Partner overview · updated just now</div>
        </div>
        <div className="ph-header-right">
          <div className="ph-date-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
            {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
          </div>
          <button className="ph-add-btn" onClick={() => setispopular && setispopular(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            Add New
          </button>
        </div>
      </div>

      <div className="ph-section-label">
        OVERVIEW · LAST 30 DAYS
        <span className="ph-export-link" onClick={fetchStats} style={{ cursor:"pointer" }}>{statsLoading?"Loading…":"↻ Refresh"}</span>
      </div>

      {/* ── 3 STAT CARDS ── */}
      <div className="ph-top-stats">

        {/* Card 1 */}
        <div className="ph-stat-card ph-stat-teal">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 17L8 7l4 6 4-4 4 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="ph-stat-badge">{statsLoading?"…":`${percentChange>=0?"↑":"↓"} ${Math.abs(percentChange)}%`}</span>
          </div>
          {statsLoading ? (
            <><Skeleton height={28} width={100} style={{ marginBottom:6 }}/><Skeleton height={12} width={180} style={{ marginBottom:8 }}/><Skeleton height={10} width={140}/></>
          ) : statsError ? (
            <div style={{ color:"rgba(255,255,255,.8)", fontSize:12 }}>
              <div style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>—</div>
              <div style={{ fontSize:10, opacity:.8 }}>{statsError}</div>
            </div>
          ) : (
            <>
              <div className="ph-stat-val">{totalSelected.toLocaleString("en-IN")}</div>
              <div className="ph-stat-label">Paths Selected by Users</div>
              <div className="ph-stat-sub">{totalSelected.toLocaleString("en-IN")} total · {thisWeek} this week</div>
            </>
          )}
          <button className="ph-stat-btn" onClick={() => setView("paths")}>View All →</button>
        </div>

        {/* Card 2 — same structure as card 1 & 3, no extra rows */}
        <div className="ph-stat-card ph-stat-blue">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="ph-stat-badge">{highCount>0?`${highCount} urgent`:"All clear"}</span>
          </div>
          <div className="ph-stat-val">{PENDING_ACTIONS.length}</div>
          <div className="ph-stat-label">Pending Actions</div>
          <div className="ph-stat-sub">
            {sortedActions.slice(0,2).map(a => a.label).join(" · ")}
          </div>
          <button className="ph-stat-btn" onClick={() => setView("actions")}>View All →</button>
        </div>

        {/* Card 3 */}
        <div className="ph-stat-card ph-stat-violet">
          <div className="ph-stat-top">
            <div className="ph-stat-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-10 2a2 2 0 100 4 2 2 0 000-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="ph-stat-badge">↑ 31%</span>
          </div>
          <div className="ph-stat-val">{totalPurchases.toLocaleString("en-IN")}</div>
          <div className="ph-stat-label">Marketplace Purchases</div>
          <div className="ph-stat-sub">{totalPurchases-totalBundles} courses &amp; sessions · {totalBundles} bundles</div>
          <button className="ph-stat-btn" onClick={() => setView("marketplace")}>View Market →</button>
        </div>

      </div>

      {/* ── MID ROW ── */}
      <div className="ph-mid-row">
        <div className="ph-card ph-activity-card">
          <div className="ph-card-header">
            <span className="ph-card-title">Live Activity</span>
            <div className="ph-act-tabs">
              {["All","Path","Purchase"].map(t => (
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
          {actFiltered.length>4 && (
            <button className="ph-show-more-btn" onClick={() => setShowAllActivity(p => !p)}>
              {showAllActivity?"Show less ↑":`View all ${actFiltered.length} →`}
            </button>
          )}
        </div>

        <div className="ph-right-col">
          <div className="ph-card">
            <div className="ph-card-header"><span className="ph-card-title">Top Paths This Week</span></div>
            <div className="ph-top-paths-list">
              {statsLoading ? (
                [1,2,3,4].map(i => (
                  <div key={i} style={{ display:"flex", gap:10, padding:"8px 0" }}>
                    <Skeleton width={20} height={20} radius={5}/>
                    <div style={{ flex:1 }}><Skeleton height={12} width="70%" style={{ marginBottom:4 }}/><Skeleton height={10} width="40%"/></div>
                    <Skeleton width={80} height={12}/>
                  </div>
                ))
              ) : MY_PATHS.length===0 ? (
                <div style={{ padding:"16px 0", textAlign:"center", color:"#94a3b8", fontSize:12 }}>No active paths yet.</div>
              ) : MY_PATHS.slice(0,4).map((path,i) => (
                <div key={path._id} className="ph-top-path-row">
                  <span className="ph-path-rank">{i+1}</span>
                  <div className="ph-path-info">
                    <div className="ph-path-name">{path.nameOfPath}</div>
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

          <div className="ph-card">
            <div className="ph-card-header">
              <span className="ph-card-title">Weekly Retention</span>
              <span className="ph-peak-tag">↑ Peak: Friday</span>
            </div>
            <div className="ph-retention-bars">
              {WEEKLY_RETENTION.days.map((day,di) => {
                const avg = Math.round(WEEKLY_RETENTION.data.reduce((s,w) => s+w[di],0)/WEEKLY_RETENTION.data.length);
                return (
                  <div key={di} className="ph-ret-col">
                    <div className="ph-ret-bar-wrap">
                      <div className="ph-ret-tooltip">{avg}%</div>
                      <div className="ph-ret-bar-fill" style={{ height:`${avg}%`, background:avg>85?"#0d9488":avg>65?"#14b8a6":avg>40?"#5eead4":"#99f6e4" }}/>
                    </div>
                    <span className="ph-ret-day">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}