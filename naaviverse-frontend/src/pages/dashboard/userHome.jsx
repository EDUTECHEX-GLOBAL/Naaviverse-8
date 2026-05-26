import React, { useState, useEffect, useRef } from "react";
import "./userHome.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { GetWalletBalance, GetWalletTxns } from "../../views/inner-pages/pages/services/wallet";
import pathIcon from "../../assets/images/assets/naavi-icon2.webp";
import stepIcon from "../../assets/images/assets/naavi-icon3.webp";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed;
  } catch { return null; }
};

const mapTxnType = (t) => {
  const src = t.metadata?.source || "";
  const typ = t.metadata?.type || "";
  if (typ === "welcome_bonus") return "bonus";
  if (src === "marketplace") return "purchase";
  if (src === "mentor") return "mentor";
  if (t.type === "credit") return "step";
  return "purchase";
};

const parseDuration = (raw) => {
  try {
    const l = JSON.parse(raw);
    const parts = [];
    if (parseInt(l.years) > 0) parts.push(`${l.years}y`);
    if (parseInt(l.months) > 0) parts.push(`${l.months}m`);
    if (parseInt(l.days) > 0) parts.push(`${l.days}d`);
    return parts.length > 0 ? parts.join(" ") : null;
  } catch { return null; }
};

const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "wallet": return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /><circle cx="18" cy="15" r="1" fill={color} /></svg>;
    case "path": return <svg {...p}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    case "market": return <svg {...p}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" /></svg>;
    case "mentor": return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    case "bell": return <svg {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case "arrow-r": return <svg {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;
    case "check": return <svg {...p}><polyline points="20 6 9 17 4 12" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "activity": return <svg {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case "explore": return <svg {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
    case "credit": return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
    case "steps": return <svg {...p}><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>;
    case "lock": return <svg {...p}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case "map": return <svg {...p}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>;
  }
};

const Ring = ({ pct, size = 52, stroke = 4, color = "#60a5fa", bg = "rgba(96,165,250,0.18)" }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
    </svg>
  );
};

// ── Static data ────────────────────────────────────────────────────────────────
const PURCHASES = [
  { id: 1, name: "AI for Finance", type: "Path", plan: "Premium", credits: 4, date: "Apr 2, 2026", status: "active" },
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

const TABS = [
  { key: "wallet", label: "My Wallet", icon: "wallet" },
  { key: "purchases", label: "Purchases", icon: "market" },
  { key: "mypath", label: "My Path", icon: "steps" },
  { key: "paths", label: "Explore Paths", icon: "map" },
  { key: "mentors", label: "Mentors", icon: "mentor" },
];

// ═══════════════════════════════════════════════════════════════════
export default function UserHome() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const rawName = user?.name || user?.fullName || localStorage.getItem("userName") || "";
  const firstName = rawName.split(" ")[0] || (user?.email || "there").split("@")[0] || "Aparna";

  const [activeTab, setActiveTab] = useState("wallet");
  const [showNotif, setShowNotif] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFS);
  const [credits, setCredits] = useState(null);
  const [activity, setActivity] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const [myPath, setMyPath] = useState(null);
  const [explorePaths, setExplorePaths] = useState([]);
  const [pathLoading, setPathLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const notifRef = useRef(null);
  const detailCardRef = useRef(null); 
  const unread = notifications.filter(n => !n.read).length;
  const creditPct = credits
    ? Math.round((credits.available / (credits.total || 50)) * 100)
    : 0;
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  // ── Close notif panel on outside click ──────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ✅ Correct placement - This useEffect scrolls when activeTab changes
  useEffect(() => {
    if (detailCardRef.current) {
      detailCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeTab]);

  // ✅ Listen for CustomEvent fired by CurrentStep on step completion
  useEffect(() => {
    const handleStepCompleted = () => setRefreshKey(k => k + 1);
    window.addEventListener("naavi:step-completed", handleStepCompleted);
    return () => window.removeEventListener("naavi:step-completed", handleStepCompleted);
  }, []);

  // ── Fetch wallet data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.email) return;

    const fetchWallet = async () => {
      try {
        setWalletLoading(true);

        const [balRes, txnRes] = await Promise.all([
          GetWalletBalance(user.email),
          GetWalletTxns(user.email),
        ]);

        const bal = balRes.data;
        const txns = txnRes.data.txns || [];

        const bonusTxn = txns.find(t => t.metadata?.type === "welcome_bonus");
        let expiresAt = null;
        if (bonusTxn) {
          if (bonusTxn.expiresAt) {
            expiresAt = new Date(bonusTxn.expiresAt);
          } else if (bonusTxn.timestamp) {
            expiresAt = new Date(bonusTxn.timestamp);
            expiresAt.setDate(expiresAt.getDate() + 14);
          }
        }

        const now = new Date();
        const isExpired = expiresAt ? expiresAt < now : false;
        const msLeft = expiresAt ? Math.max(0, expiresAt - now) : 0;
        const daysLeft = msLeft ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;

        let expiryLabel = "—";
        if (expiresAt) {
          const dateStr = expiresAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
          if (isExpired) {
            const daysAgo = Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24));
            expiryLabel = daysAgo === 0 ? "Expired today" : daysAgo === 1 ? "Expired yesterday" : `Expired ${daysAgo}d ago`;
          } else {
            expiryLabel = daysLeft <= 1 ? "Expires today" : daysLeft <= 7 ? `Expires in ${daysLeft} days` : `Expires ${dateStr}`;
          }
        }

        setCredits({
          available: bal.balance,
          used: txns.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0),
          total: txns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0),
          expiry: expiryLabel,
          expiresAt,
          daysLeft: isExpired ? 0 : daysLeft,
          isExpired,
          plan: "Premium",
        });

        const mapped = txns.map(t => ({
          id: t._id,
          action: t.metadata?.description || (t.type === "credit" ? "Credits added" : "Credits used"),
          time: new Date(t.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
          type: mapTxnType(t),
          delta: t.type === "credit" ? +t.amount : -t.amount,
        }));

        setActivity(mapped);
      } catch (err) {
        console.error("Wallet fetch failed:", err);
      } finally {
        setWalletLoading(false);
      }
    };

    fetchWallet();
  }, [user?.email]);

 // ── Fetch path data ──────────────────────────────────────────────────────────
useEffect(() => {
  if (!user?.email) return;

  const fetchMyPath = async () => {
    try {
      setPathLoading(true);

      // First fetch user paths to validate selectedPathId
      const userPathRes = await axios.get(`${BASE_URL}/api/userpaths`, {
        params: { email: user.email, status: "active" }
      });

      const userPaths = userPathRes.data?.data || [];
      
      // Validate selectedPathId belongs to THIS user
      let selectedPathId = localStorage.getItem("selectedPathId");
      if (selectedPathId) {
        const belongsToUser = userPaths.some(
          (p) => p.pathId?.toString() === selectedPathId
        );
        if (!belongsToUser) {
          // Stale key from previous user — clear it
          localStorage.removeItem("selectedPathId");
           localStorage.removeItem("selectedPathOwner"); 
          localStorage.removeItem("selectedStepId");
          localStorage.removeItem("selectedStepNumber");
          selectedPathId = null;
        }
      }

      // If still no selectedPathId, try to fetch from API
      if (!selectedPathId) {
        try {
          const selRes = await axios.get(`${BASE_URL}/api/userpaths/selected`, {
            params: { email: user.email },
          });
          if (selRes.data?.status && selRes.data?.pathId) {
            selectedPathId = selRes.data.pathId;
            localStorage.setItem("selectedPathId", selectedPathId);
            localStorage.setItem("selectedPathOwner", user.email);
          }
        } catch (_) {}
      }

      if (!userPaths.length) { 
        setMyPath(null); 
        setPathLoading(false); 
        return; 
      }

      const enrolledPathIds = new Set(userPaths.map(p => p.pathId?.toString()));

      // Prefer the path the user is currently working on
      let activePath = selectedPathId
        ? userPaths.find(p =>
            p.pathId?.toString() === selectedPathId ||
            p.PathDetails?.[0]?._id?.toString() === selectedPathId
          )
        : null;

      // Fallback to most recently enrolled
      if (!activePath) {
        activePath = [...userPaths].sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
      }

      const pathId = activePath?.pathId?.toString() ||
        activePath?.PathDetails?.[0]?._id?.toString();

      if (!pathId) { 
        setMyPath(null); 
        setPathLoading(false); 
        return; 
      }

      // Make a FRESH API call for completedSteps
      const freshPathRes = await axios.get(`${BASE_URL}/api/userpaths`, {
        params: { email: user.email, status: "active", _t: Date.now() }
      });
      const freshPaths = freshPathRes.data?.data || [];
      const rawDoc = freshPaths.find(p => p.pathId?.toString() === pathId);

      console.log("✅ rawDoc completedSteps:", rawDoc?.completedSteps);
      console.log("✅ rawDoc currentStep:", rawDoc?.currentStep);

      const completedStepIds = (rawDoc?.completedSteps || []).map(id => id.toString());
      const currentStep = rawDoc?.currentStep?.toString() || null;

      const stepsRes = await axios.get(`${BASE_URL}/api/userpaths/steps`, {
        params: { pathId }
      });

      const pathData = stepsRes.data?.data;

      const steps = (pathData?.steps || [])
        .sort((a, b) => (a.step_order || 0) - (b.step_order || 0))
        .map(s => ({
          id: s._id,
          title: s.macro_name || s.name || "Step",
          desc: s.macro_description || s.description || "",
          duration: s.macro_length ? parseDuration(s.macro_length) : null,
          status: completedStepIds.includes(s._id.toString())
            ? "done"
            : currentStep === s._id.toString()
              ? "active"
              : "locked",
        }));

      const doneCount = steps.filter(s => s.status === "done").length;
      const progress = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;

   setMyPath({
  name: pathData?.name || pathData?.nameOfPath || "—",
  goal: pathData?.description || "",
  progress,
  steps,
  doneCount,
  totalSteps: steps.length,
  enrolledOn: activePath?.createdAt
    ? new Date(activePath.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric"
      })
    : "—",
  studentInfo: null,
});

// Fetch student profile info
try {
  const profileRes = await axios.get(`${BASE_URL}/api/users/get/${user.email}`);
  const pd = profileRes.data?.data;
  if (pd) {
    setMyPath(prev => ({
      ...prev,
      studentInfo: {
        grade: pd.grade || "",
        curriculum: pd.curriculum || "",
        stream: pd.stream || "",
        school: pd.school || "",
      }
    }));
  }
} catch (_) {}

// Fetch explore paths
try {
  const pathsRes = await axios.get(`${BASE_URL}/api/paths/active`);
  const allPaths = pathsRes.data?.data || [];
  setExplorePaths(allPaths.map(p => ({
    id: p._id,
    icon: p.country ? p.country.slice(0, 2).toUpperCase() : "🌍",
    name: p.nameOfPath || p.name,
    desc: p.description || "",
    steps: p.total_steps || p.the_ids?.length || 0,
    match: Math.floor(Math.random() * 20) + 75,
    enrolled: enrolledPathIds.has(p._id.toString()),
  })));
} catch (e) {
  console.error("Explore paths fetch failed", e);
}

} catch (err) {
  console.error("MyPath fetch failed:", err);
  setMyPath(null);
} finally {
  setPathLoading(false);
}
};

fetchMyPath();
}, [user?.email, refreshKey]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const markRead = (id) => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  const markAll = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

  // ── Panels ──────────────────────────────────────────────────────────────────
  const WalletPanel = () => {
    const bonusTxn = activity.find(a => a.type === "bonus");
    const totalCredits = activity.filter(a => a.delta > 0).reduce((s, a) => s + a.delta, 0);
    const totalDebits = activity.filter(a => a.delta < 0).reduce((s, a) => s + Math.abs(a.delta), 0);

    return (
      <div className="uh-panel">
        {walletLoading ? (
          <div className="uh-loading">Loading wallet…</div>
        ) : (
          <>
            <div className="uh-wallet-summary">
              <div className="uh-ws-card">
                <span className="uh-ws-label">Available</span>
                <span className="uh-ws-num blue">{credits?.available ?? "—"}</span>
                <span className="uh-ws-sub">credits</span>
              </div>
              <div className="uh-ws-card">
                <span className="uh-ws-label">Used</span>
                <span className="uh-ws-num slate">{totalDebits}</span>
                <span className="uh-ws-sub">credits</span>
              </div>
              <div className="uh-ws-card">
                <span className="uh-ws-label">Total Earned</span>
                <span className="uh-ws-num slate">{totalCredits}</span>
                <span className="uh-ws-sub">credits</span>
              </div>
              <div className={`uh-ws-card warn ${credits?.isExpired ? "expired" : ""}`}>
                <span className="uh-ws-label">Expires</span>
                <span className={`uh-ws-num ${credits?.isExpired ? "red" : "amber"}`}>
                  {credits?.isExpired ? "Expired" : credits?.daysLeft ? `${credits.daysLeft}d` : "—"}
                </span>
                <span className="uh-ws-sub">{credits?.expiry ?? "—"}</span>
              </div>
            </div>

            <div className="uh-wallet-bar-wrap" style={{ marginBottom: 18 }}>
              <div className="uh-wallet-bar-track">
                <div className="uh-wallet-bar-fill" style={{ width: `${creditPct}%` }} />
              </div>
              <span className="uh-wallet-bar-pct">{creditPct}% remaining · {credits?.plan ?? ""} Plan</span>
            </div>

            <div className="uh-section-title">Credit Breakdown</div>
            <div className="uh-wallet-analytics">
              {bonusTxn && (
                <div className="uh-analytics-card uh-analytics-bonus">
                 <div className="uh-analytics-icon">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
</div>
                  <div className="uh-analytics-info">
                    <span className="uh-analytics-title">Welcome Bonus</span>
                    <span className="uh-analytics-sub">50 credits · Given on signup</span>
                    <span className="uh-analytics-sub">{bonusTxn.time}</span>
                  </div>
                  <div className="uh-analytics-right">
                    {(credits?.daysLeft ?? 0) <= 0
                      ? <span className="uh-analytics-tag expired">Expired</span>
                      : <span className="uh-analytics-tag active">{credits?.daysLeft}d left</span>
                    }
                    <span className="uh-analytics-cr">+50</span>
                  </div>
                </div>
              )}

              {activity.filter(a => a.type === "step" && a.delta > 0).map(a => (
                <div key={a.id} className="uh-analytics-card uh-analytics-sub">
                  <div className="uh-analytics-icon">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/>
    <circle cx="18" cy="15" r="1" fill="#3b82f6"/>
  </svg>
</div>
                  <div className="uh-analytics-info">
                    <span className="uh-analytics-title">{a.action}</span>
                    <span className="uh-analytics-sub">{a.time}</span>
                    <span className="uh-analytics-sub" style={{ color: "#22c55e", fontWeight: 600 }}>Never expires</span>
                  </div>
                  <div className="uh-analytics-right">
                    <span className="uh-analytics-tag permanent">Permanent</span>
                    <span className="uh-analytics-cr">+{a.delta}</span>
                  </div>
                </div>
              ))}

              <div className="uh-usage-summary">
                <div className="uh-usage-row">
                  <span>Credits Earned</span>
                  <div className="uh-usage-bar-wrap"><div className="uh-usage-bar green" style={{ width: "100%" }} /></div>
                  <span className="uh-usage-val green">+{totalCredits}</span>
                </div>
                <div className="uh-usage-row">
                  <span>Credits Spent</span>
                  <div className="uh-usage-bar-wrap">
                    <div className="uh-usage-bar red" style={{ width: `${totalCredits ? (totalDebits / totalCredits) * 100 : 0}%` }} />
                  </div>
                  <span className="uh-usage-val red">-{totalDebits}</span>
                </div>
                <div className="uh-usage-row">
                  <span>Remaining</span>
                  <div className="uh-usage-bar-wrap"><div className="uh-usage-bar blue" style={{ width: `${creditPct}%` }} /></div>
                  <span className="uh-usage-val blue">{credits?.available}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

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

  const ExplorePanel = () => (
    <div className="uh-panel">
      <div className="uh-section-title">Paths You've Explored</div>
      {explorePaths.length === 0 ? (
        <div className="uh-loading">Loading paths…</div>
      ) : (
        <div className="uh-explore-list">
          {explorePaths.map(p => (
            <div key={p.id} className={`uh-explore-row ${p.enrolled ? "enrolled" : ""}`}>
              <div className="uh-explore-icon">
  <img src={pathIcon} alt="path icon" className="uh-path-icon" />
</div>
              <div className="uh-explore-info">
                <span className="uh-explore-name">{p.name}</span>
                <span className="uh-explore-desc">{p.desc}</span>
                <span className="uh-explore-steps">{p.steps} steps</span>
              </div>
              <div className="uh-explore-right">
                <div className="uh-match-ring">
                  <Ring
                    pct={p.match}
                    size={40}
                    stroke={3}
                    color={p.match >= 85 ? "#22c55e" : p.match >= 75 ? "#3b82f6" : "#94a3b8"}
                    bg="rgba(148,163,184,.15)"
                  />
                  <span className="uh-match-pct">{p.match}%</span>
                </div>
                {p.enrolled
                  ? <span className="uh-enr-tag">Enrolled</span>
                  : <button className="uh-explore-btn" onClick={() => navigate("/dashboard/users/paths")}>Explore</button>
                }
              </div>
            </div>
          ))}
        </div>
      )}
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

  const MyPathPanel = () => {
    if (pathLoading) return <div className="uh-loading">Loading path…</div>;
    if (!myPath) return (
      <div className="uh-panel">
        <div className="uh-no-path">
          <div className="uh-no-path-icon">🗺️</div>
          <div className="uh-no-path-title">No Path Selected Yet</div>
          <p className="uh-no-path-sub">Choose a learning path to start your Naavi journey.</p>
          <button className="uh-no-path-btn" onClick={() => navigate("/dashboard/users/paths")}>
            Go to Paths →
          </button>
        </div>
      </div>
    );

    return (
      <div className="uh-panel">
        <div className="uh-path-header">
    <div className="uh-path-meta">
  <span className="uh-path-tag">Selected Path</span>
  <div className="uh-path-name-row">
    <img src={pathIcon} alt="path icon" className="uh-path-icon" />
    <h3 className="uh-path-name">{myPath.name}</h3>
  </div>
  <p className="uh-path-goal">{myPath.goal}</p>
  {myPath.studentInfo && (
    <div className="uh-student-strip">
      {myPath.studentInfo.grade && (
        <div className="uh-student-chip">
                    <div>
            <span className="uh-student-chip-label">Currently Studying</span>
            <span className="uh-student-chip-val">{myPath.studentInfo.grade}{myPath.studentInfo.curriculum ? ` · ${myPath.studentInfo.curriculum}` : ""}</span>
          </div>
        </div>
      )}
      {myPath.studentInfo.stream && (
        <div className="uh-student-chip">
        
          <div>
            <span className="uh-student-chip-label">Stream</span>
            <span className="uh-student-chip-val">{myPath.studentInfo.stream}</span>
          </div>
        </div>
      )}
      {myPath.studentInfo.school && (
        <div className="uh-student-chip">
          <div>
            <span className="uh-student-chip-label">School</span>
            <span className="uh-student-chip-val">{myPath.studentInfo.school}</span>
          </div>
        </div>
      )}
    </div>
  )}
</div>
          <div className="uh-path-stats">
            <div className="uh-ps-item">
              <span>{myPath.doneCount}/{myPath.totalSteps}</span>
              <span>Steps</span>
            </div>
            <div className="uh-ps-item">
              <span>{myPath.progress}%</span>
              <span>Progress</span>
            </div>
            <div className="uh-ps-item">
              <span>{myPath.enrolledOn}</span>
              <span>Enrolled</span>
            </div>
          </div>
        </div>

        <div className="uh-path-bar-wrap">
          <div className="uh-path-bar-track">
            <div className="uh-path-bar-fill" style={{ width: `${myPath.progress}%` }} />
          </div>
          <span>{myPath.progress}% complete</span>
        </div>

        <div className="uh-section-title" style={{ marginTop: 20 }}>Steps</div>
        <div className="uh-steps-list">
          {myPath.steps.map((s, i) => (
            <div key={s.id} className={`uh-step-row s-${s.status}`}>
              <div className="uh-step-num">
  {s.status === "locked"
    ? <Icon type="lock" size={11} color="#94a3b8" />
    : <img src={stepIcon} alt="step" style={{ width: "14px", height: "14px", objectFit: "contain", opacity: s.status === "done" ? 1 : 0.7 }} />
  }
</div>
              <div className="uh-step-info">
                <span className="uh-step-title">{s.title}</span>
                <span className="uh-step-desc">{s.desc}</span>
              </div>
              {s.duration && <span className="uh-step-dur">{s.duration}</span>}
              <span className={`uh-step-badge sb-${s.status}`}>
                {s.status === "done" ? "Done" : s.status === "active" ? "In Progress" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const panels = {
    wallet: <WalletPanel />,
    purchases: <PurchasesPanel />,
    mypath: <MyPathPanel />,
    paths: <ExplorePanel />,
    mentors: <MentorsPanel />,
  };

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div className="uh-root">

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
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
          {(credits?.daysLeft ?? 0) <= 10 && (
            <span className="uh-expiry-chip">
              <span className="uh-expiry-dot" />
              {credits?.daysLeft ?? 0}d left
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

      {/* ── TOP STRIP ───────────────────────────────────────────────────────── */}
      <div className="uh-top-strip">
        <div className="uh-credits-hero" onClick={() => setActiveTab("wallet")}>
          <div className="uh-ch-left">
            <div className="uh-ch-label">AVAILABLE CREDITS</div>
            <div className="uh-ch-number">{credits?.available ?? "—"}</div>
            <div className="uh-ch-meta">{credits?.used ?? "—"} used · expires {credits?.expiry ?? "—"}</div>
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

      {/* ── MAIN GRID ───────────────────────────────────────────────────────── */}
      <div className="uh-main-grid">

        {/* Recent Activity */}
        <div className="uh-card uh-card-activity">
          <div className="uh-card-head">
            <div className="uh-ch-icon-wrap blue"><Icon type="activity" size={13} color="#3b82f6" /></div>
            <h3>Recent Activity</h3>
          </div>
          <div className="uh-activity-list">
            {activity.slice(0, 6).map(a => (
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

        {/* Detail panel */}
        <div className="uh-card uh-card-detail" ref={detailCardRef}>
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

      {/* ── BOTTOM STRIP ────────────────────────────────────────────────────── */}
      <div className="uh-bottom-strip">
        <div className="uh-bs-item" onClick={() => navigate("/dashboard/users/MyPath")}>
          <span className="uh-bs-num">{myPath ? `${myPath.doneCount}/${myPath.totalSteps}` : "—"}</span>
          <span className="uh-bs-label">Steps done</span>
          <Icon type="arrow-r" size={11} color="#3b82f6" />
        </div>
        <div className="uh-bs-div" />
        <div className="uh-bs-item" onClick={() => setActiveTab("paths")}>
          <span className="uh-bs-num">{explorePaths.length}</span>
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