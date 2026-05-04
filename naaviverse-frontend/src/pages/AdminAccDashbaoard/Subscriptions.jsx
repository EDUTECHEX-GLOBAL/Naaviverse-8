import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ── Normalizers ────────────────────────────────────────────────── */
const normalizePlan = (planTier) => {
  if (!planTier) return "Standard";
  const map = { gold: "Standard", silver: "Pro", platinum: "Pro Plus" };
  return map[planTier.toLowerCase()] || planTier;
};
const normalizeLayer = (tier) => {
  if (!tier) return "Micro";
  return tier.charAt(0).toUpperCase() + tier.slice(1).replace("_only", "");
};
const normalizeBilling = (billingMethod) => {
  if (!billingMethod) return "Monthly";
  const map = { monthly: "Monthly", annual: "Annual", lifetime: "Lifetime" };
  return map[billingMethod.toLowerCase()] || billingMethod;
};
const normalizeStatus = (status) => {
  if (!status) return "Active";
  return status.charAt(0).toUpperCase() + status.slice(1);
};
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  });
};
const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN");

/* ── Colors ─────────────────────────────────────────────────────── */
const STATUS_META = {
  Active:    { dot: "#22c55e", color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
  Expired:   { dot: "#f87171", color: "#b91c1c", bg: "#fef2f2", border: "#fecaca" },
  Cancelled: { dot: "#94a3b8", color: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
};
const BILLING_META = {
  Monthly:  { bg: "#fefce8", color: "#a16207" },
  Annual:   { bg: "#faf5ff", color: "#7c3aed" },
  Lifetime: { bg: "#f0fdf4", color: "#15803d" },
};
const PLAN_META = {
  Standard:   { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  Pro:        { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Pro Plus": { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
};
const AVATAR_GRADIENTS = [
  ["#fbbf24","#d97706"],["#34d399","#059669"],
  ["#60a5fa","#2563eb"],["#f472b6","#db2777"],
  ["#a78bfa","#7c3aed"],["#fb923c","#ea580c"],
  ["#38bdf8","#0284c7"],["#4ade80","#16a34a"],
];
const getInitials = (name) => name.split("@")[0].slice(0, 2).toUpperCase();

/* ── Icons ───────────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const IconChevron = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── Stat Card ───────────────────────────────────────────────────── */
const StatCard = ({ label, value, accent, bg, iconPath }) => (
  <div style={{
    background: bg,
    borderRadius: "14px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: "1 1 calc(25% - 8px)",
    minWidth: "70px",
  }}>
    <div style={{
      width: "40px", height: "40px", borderRadius: "10px",
      background: accent, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {iconPath}
      </svg>
    </div>
    <div>
      <div style={{ fontSize: "10px", fontWeight: 700, color: accent,
        textTransform: "uppercase", letterSpacing: "0.06em",
        opacity: 0.8, marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "1.25rem", fontWeight: 500,
        color: accent, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);
/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
export default function Subscriptions() {
  const [search, setSearch]               = useState("");
  const [planFilter, setPlanFilter]       = useState("All");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [statusDropOpen, setStatusDropOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/subscriptions/all?limit=100`);
        if (res.data?.success) setSubscriptions(res.data.subscriptions || []);
      } catch {
        setError("Failed to load subscriptions.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const normalized = subscriptions.map((s, i) => ({
    id:      s._id || i,
    name:    s.userEmail?.split("@")[0] || "Unknown",
    email:   s.userEmail || "—",
    plan:    normalizePlan(s.planTier),
    layer:   normalizeLayer(s.tier),
    billing: normalizeBilling(s.billingMethod),
    date:    formatDate(s.startDate || s.createdAt),
    time:    formatTime(s.startDate || s.createdAt),
    amount:  s.amount || 0,
    status:  normalizeStatus(s.status),
    _idx:    i,
  }));

  const filtered = normalized.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchPlan   = planFilter === "All" || s.plan.toLowerCase() === planFilter.toLowerCase();
    const matchStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchPlan && matchStatus;
  });

  const activeCount  = normalized.filter(s => s.status === "Active").length;
  const expiredCount = normalized.filter(s => s.status === "Expired").length;
  const cancelCount  = normalized.filter(s => s.status === "Cancelled").length;

  const statusLabel = statusFilter === "All"
    ? `All (${normalized.length})`
    : `${statusFilter} (${normalized.filter(s => s.status === statusFilter).length})`;

  if (loading) return (
    <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>
      Loading subscriptions…
    </div>
  );
  if (error) return (
    <div style={{ padding: "60px", textAlign: "center", color: "#dc2626", fontSize: "14px" }}>
      {error}
    </div>
  );

  return (
    <div
      style={{
        padding: "16px",
        minHeight: "100vh",
        background: "#f5f7fb",
        fontFamily: "'DM Sans', sans-serif",
        boxSizing: "border-box",
      }}
      onClick={() => setStatusDropOpen(false)}
    >

      {/* ── Header ── */}
      <div style={{ marginBottom: "14px" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Subscriptions
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "2px", fontWeight: 500 }}>
          All user plan data · {normalized.length} total
        </p>
      </div>

      {/* ── Stat strip — always 1 row, 4 equal cards ── */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "14px",
        flexWrap: "nowrap",   /* force single row */
      }}>
       <StatCard label="Active"    value={activeCount}       accent="#2563eb" bg="#dbeafe"
  iconPath={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />
<StatCard label="Expired"   value={expiredCount}      accent="#ef4444" bg="#fee2e2"
  iconPath={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>} />
<StatCard label="Cancelled" value={cancelCount}       accent="#64748b" bg="#e2e8f0"
  iconPath={<><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>} />
<StatCard label="Total"     value={normalized.length} accent="#7c3aed" bg="#ede9fe"
  iconPath={<><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>} />
      </div>

      {/* ── Filter bar ── */}
      <div style={{ marginBottom: "12px" }}>

        {/* Row 1: Plan pills — single scrollable row */}
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "4px",
          marginBottom: "8px",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}>
          {["All", "Standard", "Pro", "Pro Plus"].map((p) => {
            const active = planFilter === p;
            const meta   = PLAN_META[p] || {};
            return (
              <button
                key={p}
                onClick={() => setPlanFilter(p)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1.5px solid",
                  whiteSpace: "nowrap",   /* never wrap */
                  flexShrink: 0,
                  transition: "all 0.15s",
                  background:   active ? (meta.bg     || "#e2e8f0") : "#fff",
                  color:        active ? (meta.color  || "#475569") : "#64748b",
                  borderColor:  active ? (meta.border || "#e2e8f0") : "#e2e8f0",
                }}
              >{p}</button>
            );
          })}
        </div>

        {/* Row 2: Status dropdown + Search */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

          {/* Status dropdown */}
          <div style={{ position: "relative", flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setStatusDropOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 12px", borderRadius: "9px",
                border: "1.5px solid #e2e8f0", background: "#fff",
                fontSize: "11px", fontWeight: 600, color: "#475569",
                cursor: "pointer", fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {statusLabel} <IconChevron />
            </button>
            {statusDropOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 4px)", left: 0,
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                zIndex: 50, minWidth: "160px", overflow: "hidden",
              }}>
                {[
                  { label: `All (${normalized.length})`, value: "All" },
                  { label: `Active (${activeCount})`,    value: "Active" },
                  { label: `Expired (${expiredCount})`,  value: "Expired" },
                  { label: `Cancelled (${cancelCount})`, value: "Cancelled" },
                ].map((t) => (
                  <div key={t.value}
                    onClick={() => { setStatusFilter(t.value); setStatusDropOpen(false); }}
                    style={{
                      padding: "9px 14px", fontSize: "12px", fontWeight: 500,
                      cursor: "pointer",
                      color:      statusFilter === t.value ? "#2563eb" : "#475569",
                      background: statusFilter === t.value ? "#eff6ff" : "transparent",
                    }}
                    onMouseEnter={e => { if (statusFilter !== t.value) e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={e => { if (statusFilter !== t.value) e.currentTarget.style.background = "transparent"; }}
                  >
                    {t.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search — takes remaining space */}
          <div style={{
            display: "flex", alignItems: "center", gap: "7px",
            background: "#fff", border: "1.5px solid #e2e8f0",
            padding: "6px 10px", borderRadius: "9px", flex: 1,
            minWidth: 0,
          }}>
            <IconSearch />
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: "12px", color: "#1e293b", width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Table — horizontal scroll wrapper ── */}
      <div style={{
        background: "#fff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        overflowX: "auto",              /* horizontal scroll on mobile */
        WebkitOverflowScrolling: "touch",
        /* thin scrollbar */
        scrollbarWidth: "thin",
        scrollbarColor: "#cbd5e1 transparent",
      }}>
        <table style={{
          width: "100%",
          minWidth: "680px",            /* forces scroll before squish */
          borderCollapse: "collapse",
          fontSize: "13px",
        }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["User", "Plan", "Layer", "Amount", "Billing", "Date", "Status"].map(h => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontSize: "10px", fontWeight: 700,
                  color: "#94a3b8", textTransform: "uppercase",
                  letterSpacing: "0.06em", fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{
                  padding: "48px", textAlign: "center",
                  color: "#cbd5e1", fontSize: "13px",
                }}>
                  No subscriptions found.
                </td>
              </tr>
            ) : filtered.map((s, i) => {
              const [g1, g2] = AVATAR_GRADIENTS[s._idx % AVATAR_GRADIENTS.length];
              const sm = STATUS_META[s.status]   || STATUS_META.Active;
              const bm = BILLING_META[s.billing] || BILLING_META.Monthly;
              const pm = PLAN_META[s.plan]       || PLAN_META.Standard;
              return (
                <tr key={s.id}
                  style={{
                    borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* User */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "8px",
                        background: `linear-gradient(135deg, ${g1}, ${g2})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 700, color: "#fff", flexShrink: 0,
                      }}>{getInitials(s.email)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "12px" }}>{s.name}</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      padding: "3px 9px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: 600,
                      background: pm.bg, color: pm.color,
                      border: `1px solid ${pm.border}`,
                    }}>{s.plan}</span>
                  </td>

                  {/* Layer */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      padding: "3px 9px", borderRadius: "7px",
                      background: s.layer === "Nano" ? "#faf5ff" : "#eff6ff",
                      color:      s.layer === "Nano" ? "#7c3aed" : "#2563eb",
                      border:     s.layer === "Nano" ? "1px solid #e9d5ff" : "1px solid #bfdbfe",
                    }}>
                      <span style={{
                        display: "inline-block", width: "5px", height: "5px",
                        borderRadius: "50%", marginRight: "4px", verticalAlign: "middle",
                        background: s.layer === "Nano" ? "#a78bfa" : "#60a5fa",
                      }} />
                      {s.layer}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#0f172a", fontSize: "12px", whiteSpace: "nowrap" }}>
                    {fmt(s.amount)}
                  </td>

                  {/* Billing */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      padding: "3px 9px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: 600,
                      background: bm.bg, color: bm.color,
                    }}>{s.billing}</span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: "11px", color: "#475569", fontWeight: 600 }}>{s.date}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>{s.time}</div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 9px", borderRadius: "20px",
                      fontSize: "10px", fontWeight: 700,
                      background: sm.bg, color: sm.color,
                      border: `1px solid ${sm.border}`,
                    }}>
                      <span style={{
                        width: "5px", height: "5px", borderRadius: "50%",
                        background: sm.dot, flexShrink: 0,
                      }} />
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "10px", fontSize: "11px", color: "#94a3b8", textAlign: "right", fontWeight: 500 }}>
        Showing {filtered.length} of {normalized.length} subscriptions
      </div>
    </div>
  );
}