import React, { useState, useEffect, useRef } from "react";
import "./userHome.scss";
import { useNavigate } from "react-router-dom";

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed;
  } catch { return null; }
};

const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "wallet":   return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="18" cy="15" r="1" fill={color}/></svg>;
    case "path":     return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "market":   return <svg {...p}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
    case "mentor":   return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "bell":     return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case "arrow-r":  return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "check":    return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "activity": return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
    case "explore":  return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case "credit":   return <svg {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
    case "steps":    return <svg {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>;
    case "lock":     return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
    case "map":      return <svg {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
    default:         return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
  }
};

const Ring = ({ pct, size = 52, stroke = 4, color = "#60a5fa", bg = "rgba(96,165,250,0.18)" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
    </svg>
  );
};

// ── Static data ───────────────────────────────────────────────────────────────
const CREDITS = { available: 32, used: 18, total: 50, expiry: "Apr 13, 2026", daysLeft: 8, plan: "Premium" };

const ACTIVITY = [
  { id: 1, action: "Completed Step 1: Tech Awareness", time: "2 days ago", type: "step", delta: null },
  { id: 2, action: "Purchased AI for Finance path", time: "5 days ago", type: "purchase", delta: -4 },
  { id: 3, action: "Booked mentor: Dr. Priya Sharma", time: "1 week ago", type: "mentor", delta: -6 },
  { id: 4, action: "Welcome bonus applied", time: "Apr 1, 2026", type: "bonus", delta: +50 },
  { id: 5, action: "Path selection: CS Pathway USA", time: "Apr 1, 2026", type: "purchase", delta: -16 },
  { id: 6, action: "Completed Quiz: Introduction", time: "Mar 30, 2026", type: "step", delta: null },
  { id: 7, action: "Explored: Data Science path", time: "Mar 28, 2026", type: "explore", delta: null },
  { id: 8, action: "Enrolled in Cloud Computing Bundle", time: "Mar 28, 2026", type: "purchase", delta: -2 },
];

const PURCHASES = [
  { id: 1, icon: "🎯", name: "AI for Finance", type: "Path", plan: "Premium", credits: 4, date: "Apr 2, 2026", status: "active" },
  { id: 2, icon: "☁️", name: "Cloud Computing Bundle", type: "Bundle", plan: "Micro", credits: 2, date: "Mar 28, 2026", status: "active" },
  { id: 3, icon: "📊", name: "Data Science Essentials", type: "Path", plan: "Micro", credits: 2, date: "Mar 15, 2026", status: "completed" },
  { id: 4, icon: "🤖", name: "ML Fundamentals", type: "Bundle", plan: "Micro", credits: 3, date: "Feb 20, 2026", status: "completed" },
];

const MY_PATH = {
  name: "CS Pathway USA",
  goal: "Computer Science degree in USA",
  progress: 35,
  creditsUsed: 16,
  enrolledOn: "Apr 1, 2026",
  steps: [
    { id: 1, title: "Tech Awareness", desc: "Basics of CS, tools, and industry overview", status: "done", duration: "2 weeks" },
    { id: 2, title: "Foundations of Programming", desc: "Python, data structures, algorithms intro", status: "active", duration: "4 weeks" },
    { id: 3, title: "Macroeconomics & US Education", desc: "Understanding the US education landscape", status: "locked", duration: "2 weeks" },
    { id: 4, title: "SAT / ACT Preparation", desc: "Test strategy, mock tests, scoring", status: "locked", duration: "6 weeks" },
    { id: 5, title: "University Shortlisting", desc: "Profile matching with top CS programs", status: "locked", duration: "3 weeks" },
    { id: 6, title: "Application & Essays", desc: "SOP, LOR, applications submission", status: "locked", duration: "5 weeks" },
  ],
  marketplace: [
    { name: "AI for Finance", type: "Add-on Path", credits: 4 },
    { name: "Cloud Computing Bundle", type: "Bundle", credits: 2 },
  ],
};

const EXPLORED_PATHS = [
  { id: 1, icon: "🇺🇸", name: "CS Pathway USA", desc: "Top US universities for Computer Science", match: 92, enrolled: true, steps: 6 },
  { id: 2, icon: "🇬🇧", name: "Engineering UK", desc: "Premier engineering programs in the UK", match: 78, enrolled: false, steps: 5 },
  { id: 3, icon: "🇩🇪", name: "Tech Masters Germany", desc: "Tuition-free tech programs in Germany", match: 71, enrolled: false, steps: 7 },
  { id: 4, icon: "🇨🇦", name: "CS Canada Stream", desc: "Canadian universities with co-op programs", match: 85, enrolled: false, steps: 6 },
];

const MENTORS = [
  { id: 1, name: "Dr. Priya Sharma", role: "CS Career Coach", initials: "PS", color: "#3b82f6", date: "Apr 10, 2026", time: "4:00 PM IST", status: "upcoming", rating: 4.9, sessions: 3, speciality: "US CS applications" },
  { id: 2, name: "Arjun Mehta", role: "IIT Alumni Mentor", initials: "AM", color: "#6366f1", date: "Mar 30, 2026", time: "11:00 AM IST", status: "completed", rating: 4.7, sessions: 1, speciality: "STEM pathways" },
];

const NOTIFS = [
  { id: 1, text: "Your credits expire in 8 days!", time: "2h ago", read: false, type: "warning" },
  { id: 2, text: "New mentor session available", time: "1d ago", read: false, type: "info" },
  { id: 3, text: "Step 3: Macroeconomics unlocked", time: "2d ago", read: true, type: "success" },
];

// ── TABS config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: "wallet",    label: "My Wallet",     icon: "wallet" },
  { key: "purchases", label: "Purchases",     icon: "market" },
  { key: "mypath",    label: "My Path",       icon: "steps"  },
  { key: "paths",     label: "Explore Paths", icon: "map"    },
  { key: "mentors",   label: "Mentors",       icon: "mentor" },
];

// ═══════════════════════════════════════════════════════════════════
export default function UserHome() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const rawName = user?.name || user?.fullName || localStorage.getItem("userName") || "";
  const firstName = rawName.split(" ")[0] || (user?.email || "there").split("@")[0] || "Aparna";

  const [activeTab, setActiveTab] = useState("wallet");
  const [showNotif, setShowNotif]  = useState(false);
  const [notifications, setNotifications] = useState(NOTIFS);
  const notifRef = useRef(null);
  const unread = notifications.filter(n => !n.read).length;
  const creditPct = Math.round((CREDITS.available / CREDITS.total) * 100);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll  = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

  // ── Tab panels ─────────────────────────────────────────────────────
  const WalletPanel = () => (
    <div className="uh-panel">
      <div className="uh-panel-top">
        <div className="uh-wallet-summary">
          <div className="uh-ws-card">
            <span className="uh-ws-label">Available</span>
            <span className="uh-ws-num blue">{CREDITS.available}</span>
            <span className="uh-ws-sub">credits</span>
          </div>
          <div className="uh-ws-card">
            <span className="uh-ws-label">Used</span>
            <span className="uh-ws-num slate">{CREDITS.used}</span>
            <span className="uh-ws-sub">credits</span>
          </div>
          <div className="uh-ws-card">
            <span className="uh-ws-label">Total</span>
            <span className="uh-ws-num slate">{CREDITS.total}</span>
            <span className="uh-ws-sub">credits</span>
          </div>
          <div className="uh-ws-card warn">
            <span className="uh-ws-label">Expires</span>
            <span className="uh-ws-num amber">{CREDITS.daysLeft}d</span>
            <span className="uh-ws-sub">{CREDITS.expiry}</span>
          </div>
        </div>
        <div className="uh-wallet-bar-wrap">
          <div className="uh-wallet-bar-track">
            <div className="uh-wallet-bar-fill" style={{ width: `${creditPct}%` }} />
          </div>
          <span className="uh-wallet-bar-pct">{creditPct}% remaining · {CREDITS.plan} Plan</span>
        </div>
      </div>

      <div className="uh-section-title">Transaction History</div>
      <div className="uh-txn-list">
        {ACTIVITY.map(a => (
          <div key={a.id} className="uh-txn-row">
            <div className={`uh-txn-dot t-${a.type}`} />
            <div className="uh-txn-body">
              <span className="uh-txn-label">{a.action}</span>
              <span className="uh-txn-time">{a.time}</span>
            </div>
            {a.delta !== null && (
              <span className={`uh-txn-delta ${a.delta > 0 ? "pos" : "neg"}`}>
                {a.delta > 0 ? "+" : ""}{a.delta} cr
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const PurchasesPanel = () => (
    <div className="uh-panel">
      <div className="uh-section-title">All Marketplace Purchases</div>
      <div className="uh-purchases-list">
        {PURCHASES.map(m => (
          <div key={m.id} className="uh-purchase-row">
            <div className="uh-purchase-emoji">{m.icon}</div>
            <div className="uh-purchase-info">
              <span className="uh-purchase-name">{m.name}</span>
              <span className="uh-purchase-meta">{m.type} · Purchased {m.date}</span>
            </div>
            <div className="uh-purchase-right">
              <span className={`uh-plan-tag p-${m.plan.toLowerCase()}`}>{m.plan}</span>
              <span className="uh-purchase-cr">{m.credits} cr</span>
            </div>
            <span className={`uh-status-dot s-${m.status}`}>{m.status === "active" ? "Active" : "Done"}</span>
          </div>
        ))}
      </div>
      <div className="uh-purchases-total">
        <span>Total spent</span>
        <strong>{PURCHASES.reduce((s, p) => s + p.credits, 0)} credits</strong>
      </div>
    </div>
  );

  const MyPathPanel = () => (
    <div className="uh-panel">
      <div className="uh-path-header">
        <div className="uh-path-meta">
          <span className="uh-path-tag">Current Path</span>
          <h3 className="uh-path-name">{MY_PATH.name}</h3>
          <p className="uh-path-goal">{MY_PATH.goal}</p>
        </div>
        <div className="uh-path-stats">
          <div className="uh-ps-item">
            <span>{MY_PATH.creditsUsed} cr</span>
            <span>Used</span>
          </div>
          <div className="uh-ps-item">
            <span>{MY_PATH.progress}%</span>
            <span>Progress</span>
          </div>
          <div className="uh-ps-item">
            <span>{MY_PATH.enrolledOn}</span>
            <span>Enrolled</span>
          </div>
        </div>
      </div>

      <div className="uh-path-bar-wrap">
        <div className="uh-path-bar-track">
          <div className="uh-path-bar-fill" style={{ width: `${MY_PATH.progress}%` }} />
        </div>
        <span>{MY_PATH.progress}% complete</span>
      </div>

      <div className="uh-section-title" style={{ marginTop: 20 }}>Steps</div>
      <div className="uh-steps-list">
        {MY_PATH.steps.map((s, i) => (
          <div key={s.id} className={`uh-step-row s-${s.status}`}>
            <div className="uh-step-num">
              {s.status === "done" ? <Icon type="check" size={12} color="#22c55e" /> :
               s.status === "active" ? <span>{i + 1}</span> :
               <Icon type="lock" size={11} color="#94a3b8" />}
            </div>
            <div className="uh-step-info">
              <span className="uh-step-title">{s.title}</span>
              <span className="uh-step-desc">{s.desc}</span>
            </div>
            <span className="uh-step-dur">{s.duration}</span>
            <span className={`uh-step-badge sb-${s.status}`}>
              {s.status === "done" ? "Done" : s.status === "active" ? "In Progress" : "Locked"}
            </span>
          </div>
        ))}
      </div>

      {MY_PATH.marketplace.length > 0 && (
        <>
          <div className="uh-section-title" style={{ marginTop: 20 }}>Add-ons from Marketplace</div>
          <div className="uh-addons-list">
            {MY_PATH.marketplace.map((a, i) => (
              <div key={i} className="uh-addon-row">
                <Icon type="market" size={13} color="#3b82f6" />
                <span className="uh-addon-name">{a.name}</span>
                <span className="uh-addon-type">{a.type}</span>
                <span className="uh-addon-cr">{a.credits} cr</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const ExplorePanel = () => (
    <div className="uh-panel">
      <div className="uh-section-title">Paths You've Explored</div>
      <div className="uh-explore-list">
        {EXPLORED_PATHS.map(p => (
          <div key={p.id} className={`uh-explore-row ${p.enrolled ? "enrolled" : ""}`}>
            <div className="uh-explore-icon">{p.icon}</div>
            <div className="uh-explore-info">
              <span className="uh-explore-name">{p.name}</span>
              <span className="uh-explore-desc">{p.desc}</span>
              <span className="uh-explore-steps">{p.steps} steps</span>
            </div>
            <div className="uh-explore-right">
              <div className="uh-match-ring">
                <Ring pct={p.match} size={40} stroke={3} color={p.match >= 85 ? "#22c55e" : p.match >= 75 ? "#3b82f6" : "#94a3b8"} bg="rgba(148,163,184,.15)" />
                <span className="uh-match-pct">{p.match}%</span>
              </div>
              {p.enrolled
                ? <span className="uh-enr-tag">Enrolled</span>
: <button
  className="uh-explore-btn"
  onClick={() =>
    navigate("/dashboard/users/Marketplace", {
      state: { defaultTab: "marketplace" }
    })
  }
>Explore</button>
              }
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const MentorsPanel = () => (
    <div className="uh-panel">
      <div className="uh-section-title">Your Mentor Sessions</div>
      <div className="uh-mentors-full">
        {MENTORS.map(m => (
          <div key={m.id} className={`uh-mentor-full-row s-${m.status}`}>
            <div className="uh-mentor-av" style={{ background: m.color }}>{m.initials}</div>
            <div className="uh-mentor-full-info">
              <span className="uh-mentor-name">{m.name}</span>
              <span className="uh-mentor-role">{m.role}</span>
              <span className="uh-mentor-spec">· {m.speciality}</span>
              <div className="uh-mentor-when">
                <Icon type="calendar" size={10} color="#94a3b8" />
                {m.date} · {m.time}
              </div>
            </div>
            <div className="uh-mentor-full-right">
              <div className="uh-mentor-rating">★ {m.rating}</div>
              <span className="uh-mentor-sessions">{m.sessions} session{m.sessions > 1 ? "s" : ""}</span>
              <span className={`uh-session-tag st-${m.status}`}>
                {m.status === "upcoming" ? "Upcoming" : "Completed"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <button className="uh-book-btn" onClick={() => navigate("/dashboard/users/Marketplace")}>
        <Icon type="mentor" size={13} color="#fff" /> Book a New Session
      </button>
    </div>
  );

  const panels = { wallet: <WalletPanel />, purchases: <PurchasesPanel />, mypath: <MyPathPanel />, paths: <ExplorePanel />, mentors: <MentorsPanel /> };

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="uh-root">

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="uh-header">
        <div className="uh-header-left">
          <span className="uh-journey-text">Your Naavi Journey</span>
          <span className="uh-journey-name">— {firstName}</span>
        </div>
        <div className="uh-header-right">
          <span className="uh-date-chip">
            <Icon type="calendar" size={11} color="#3b82f6" />
            {today}
          </span>
          {CREDITS.daysLeft <= 10 && (
            <span className="uh-expiry-chip">
              <span className="uh-expiry-dot" />
              {CREDITS.daysLeft}d left
            </span>
          )}
          <div className="uh-notif-wrap" ref={notifRef}>
            <button className={`uh-bell ${unread > 0 ? "active" : ""}`} onClick={() => setShowNotif(v => !v)}>
              <Icon type="bell" size={14} color={unread > 0 ? "#3b82f6" : "#64748b"} />
              {unread > 0 && <span className="uh-badge">{unread}</span>}
            </button>
            {showNotif && (
              <div className="uh-notif-panel">
                <div className="uh-notif-top">
                  <span>Notifications</span>
                  <button onClick={markAll}>Mark all read</button>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`uh-notif-item ${!n.read ? "unread" : ""} type-${n.type}`} onClick={() => markRead(n.id)}>
                    <div className="uh-notif-dot" />
                    <div>
                      <p>{n.text}</p>
                      <span>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── TOP STRIP — wallet card + quick tiles ─────────────────── */}
      <div className="uh-top-strip">
        <div className="uh-credits-hero" onClick={() => setActiveTab("wallet")}>
          <div className="uh-ch-left">
            <div className="uh-ch-label">AVAILABLE CREDITS</div>
            <div className="uh-ch-number">{CREDITS.available}</div>
            <div className="uh-ch-meta">{CREDITS.used} used · expires {CREDITS.expiry}</div>
            <div className="uh-ch-bar-wrap">
              <div className="uh-ch-bar" style={{ width: `${creditPct}%` }} />
            </div>
            <div className="uh-ch-pct">{creditPct}% remaining</div>
          </div>
          <div className="uh-ch-right">
            <Ring pct={creditPct} size={60} stroke={5} />
            <button className="uh-ch-btn" onClick={(e) => { e.stopPropagation(); setActiveTab("wallet"); }}>
              View Wallet <Icon type="arrow-r" size={11} />
            </button>
          </div>
          <div className="uh-ch-glow" />
        </div>

        <div className="uh-quick-tiles">
          {TABS.map(t => (
            <button key={t.key} className={`uh-quick-tile ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
              <div className="uh-qt-icon"><Icon type={t.icon} size={16} color={activeTab === t.key ? "#2563eb" : "#64748b"} /></div>
              <span>{t.label}</span>
              <Icon type="arrow-r" size={11} color={activeTab === t.key ? "#2563eb" : "#94a3b8"} />
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID — activity + detail panel ───────────────────── */}
      <div className="uh-main-grid">

        {/* Recent Activity — narrow */}
        <div className="uh-card uh-card-activity">
          <div className="uh-card-head">
            <div className="uh-ch-icon-wrap blue"><Icon type="activity" size={13} color="#3b82f6" /></div>
            <h3>Recent Activity</h3>
          </div>
          <div className="uh-activity-list">
            {ACTIVITY.slice(0, 6).map(a => (
              <div key={a.id} className="uh-act-row">
                <div className={`uh-act-dot t-${a.type}`} />
                <div className="uh-act-body">
                  <span className="uh-act-label">{a.action}</span>
                  <span className="uh-act-time">{a.time}</span>
                </div>
                {a.delta !== null && (
                  <span className={`uh-act-delta ${a.delta > 0 ? "pos" : "neg"}`}>
                    {a.delta > 0 ? "+" : ""}{a.delta}
                  </span>
                )}
              </div>
            ))}
          </div>
          <button className="uh-card-cta" onClick={() => setActiveTab("wallet")}>View all →</button>
        </div>

        {/* Detail panel — tabs */}
        <div className="uh-card uh-card-detail">
          <div className="uh-tab-bar">
            {TABS.map(t => (
              <button key={t.key} className={`uh-tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                <Icon type={t.icon} size={13} color={activeTab === t.key ? "#2563eb" : "#94a3b8"} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="uh-tab-content">
            {panels[activeTab]}
          </div>
        </div>

      </div>

      {/* ── BOTTOM STRIP ──────────────────────────────────────────── */}
      <div className="uh-bottom-strip">
        <div className="uh-bs-item" onClick={() => setActiveTab("mypath")}>
          <span className="uh-bs-num">1/6</span>
          <span className="uh-bs-label">Steps done</span>
          <Icon type="arrow-r" size={11} color="#3b82f6" />
        </div>
        <div className="uh-bs-div" />
        <div className="uh-bs-item" onClick={() => setActiveTab("paths")}>
          <span className="uh-bs-num">{EXPLORED_PATHS.length}</span>
          <span className="uh-bs-label">Paths explored</span>
          <Icon type="arrow-r" size={11} color="#3b82f6" />
        </div>
        <div className="uh-bs-div" />
        <div className="uh-bs-item" onClick={() => setActiveTab("purchases")}>
          <span className="uh-bs-num">{PURCHASES.length}</span>
          <span className="uh-bs-label">Purchases</span>
          <Icon type="arrow-r" size={11} color="#3b82f6" />
        </div>
        <div className="uh-bs-div" />
        <div className="uh-bs-item" onClick={() => setActiveTab("mentors")}>
          <span className="uh-bs-num">{MENTORS.length}</span>
          <span className="uh-bs-label">Mentor sessions</span>
          <Icon type="arrow-r" size={11} color="#3b82f6" />
        </div>
      </div>

    </div>
  );
}