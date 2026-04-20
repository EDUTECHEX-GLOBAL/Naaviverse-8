import React, { useState } from "react";

const STATIC_SUBSCRIPTIONS = [
  { id: 1, name: "Arjun Sharma",  email: "arjun@example.com",  plan: "Pro",      layer: "Micro", billing: "Monthly", date: "Mar 1, 2025",  time: "10:30 AM", amount: 4150,  status: "Active" },
  { id: 2, name: "Priya Nair",    email: "priya@example.com",  plan: "Standard", layer: "Micro", billing: "Annual",  date: "Jan 15, 2025", time: "2:15 PM",  amount: 9960,  status: "Active" },
  { id: 3, name: "Rohan Mehta",   email: "rohan@example.com",  plan: "Pro Plus", layer: "Nano",  billing: "Monthly", date: "Apr 10, 2025", time: "9:00 AM",  amount: 8300,  status: "Active" },
  { id: 4, name: "Sneha Reddy",   email: "sneha@example.com",  plan: "Pro",      layer: "Nano",  billing: "Annual",  date: "Dec 20, 2024", time: "5:45 PM",  amount: 49800, status: "Expired" },
  { id: 5, name: "Vikram Das",    email: "vikram@example.com", plan: "Standard", layer: "Micro", billing: "Monthly", date: "Feb 28, 2025", time: "11:00 AM", amount: 830,   status: "Active" },
  { id: 6, name: "Ananya Iyer",   email: "ananya@example.com", plan: "Pro Plus", layer: "Nano",  billing: "Annual",  date: "Mar 22, 2025", time: "3:20 PM",  amount: 99600, status: "Active" },
  { id: 7, name: "Karan Bose",    email: "karan@example.com",  plan: "Pro",      layer: "Micro", billing: "Monthly", date: "Apr 1, 2025",  time: "8:50 AM",  amount: 4150,  status: "Active" },
  { id: 8, name: "Meera Pillai",  email: "meera@example.com",  plan: "Standard", layer: "Micro", billing: "Annual",  date: "Jan 5, 2025",  time: "4:10 PM",  amount: 9960,  status: "Cancelled" },
];

const PLAN_COLORS = {
  Standard:   { bg: "#f0f4ff", color: "#4361ee", border: "#c7d2fe" },
  Pro:        { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  "Pro Plus": { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
};

const STATUS_META = {
  Active:    { dot: "#22c55e", color: "#15803d", bg: "rgba(22,163,74,0.08)" },
  Expired:   { dot: "#f87171", color: "#b91c1c", bg: "rgba(239,68,68,0.08)" },
  Cancelled: { dot: "#94a3b8", color: "#64748b", bg: "rgba(148,163,184,0.1)" },
};

const BILLING_META = {
  Monthly: { bg: "#fef9c3", color: "#a16207" },
  Annual:  { bg: "#ede9fe", color: "#6d28d9" },
};

const AVATAR_COLORS = [
  ["#fbbf24", "#92400e"],
  ["#34d399", "#065f46"],
  ["#60a5fa", "#1e3a8a"],
  ["#f472b6", "#831843"],
  ["#a78bfa", "#4c1d95"],
  ["#fb923c", "#7c2d12"],
  ["#38bdf8", "#0c4a6e"],
  ["#4ade80", "#14532d"],
];

const getInitials = (name) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const fmt = (n) => "₹" + n.toLocaleString("en-IN");

// ── Compact stat card ──────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, accent, bg }) => (
  <div style={{
    background: "#fff",
    border: "1px solid #f1f5f9",
    borderRadius: "12px",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    minWidth: "140px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: "36px", height: "36px", borderRadius: "10px",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", flexShrink: 0, fontSize: "16px",
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: accent, lineHeight: 1 }}>{value}</div>
    </div>
  </div>
);

export default function Subscriptions() {
  const [search, setSearch]           = useState("");
  const [planFilter, setPlanFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = STATIC_SUBSCRIPTIONS.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) &&
      (planFilter   === "All" || s.plan   === planFilter) &&
      (statusFilter === "All" || s.status === statusFilter)
    );
  });

  const totalRevenue = STATIC_SUBSCRIPTIONS.reduce((a, s) => a + s.amount, 0);
  const activeCount  = STATIC_SUBSCRIPTIONS.filter((s) => s.status === "Active").length;
  const expiredCount = STATIC_SUBSCRIPTIONS.filter((s) => s.status === "Expired").length;
  const cancelCount  = STATIC_SUBSCRIPTIONS.filter((s) => s.status === "Cancelled").length;

  return (
    <div style={{ padding: "20px 28px", minHeight: "100vh", background: "#f8fafc", fontFamily: "inherit" }}>

      {/* ── Page title ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Subscriptions
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "12px", marginTop: "3px" }}>
          All user plan data · {STATIC_SUBSCRIPTIONS.length} total
        </p>
      </div>

      {/* ── Stat strip ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
        <StatCard icon="💰" label="Revenue"   value={fmt(totalRevenue)} accent="#0f172a"  bg="#f0fdf4" />
        <StatCard icon="✅" label="Active"    value={activeCount}       accent="#16a34a"  bg="#dcfce7" />
        <StatCard icon="⏳" label="Expired"   value={expiredCount}      accent="#dc2626"  bg="#fee2e2" />
        <StatCard icon="✕"  label="Cancelled" value={cancelCount}       accent="#64748b"  bg="#f1f5f9" />
        <StatCard icon="👥" label="Total"     value={STATIC_SUBSCRIPTIONS.length} accent="#4361ee" bg="#e0e7ff" />
      </div>

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", gap: "8px", marginBottom: "12px",
        alignItems: "center", flexWrap: "wrap",
      }}>
        {/* Status tabs */}
        <div style={{ display: "flex", gap: "6px" }}>
          {[
            { label: `All (${STATIC_SUBSCRIPTIONS.length})`, value: "All" },
            { label: `Active (${activeCount})`,   value: "Active" },
            { label: `Expired (${expiredCount})`, value: "Expired" },
            { label: `Cancelled (${cancelCount})`,value: "Cancelled" },
          ].map((t) => (
            <button key={t.value} onClick={() => setStatusFilter(t.value)} style={{
              padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 500,
              cursor: "pointer", border: "1.5px solid",
              background:  statusFilter === t.value ? "#0f172a" : "#fff",
              color:       statusFilter === t.value ? "#fff"    : "#64748b",
              borderColor: statusFilter === t.value ? "#0f172a" : "#e2e8f0",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search */}
        <input
          type="text" placeholder="Search name or email…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "6px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
            fontSize: "12px", outline: "none", background: "#fff", width: "190px",
          }}
        />

        {/* Plan filter */}
        <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={{
          padding: "6px 10px", border: "1.5px solid #e2e8f0", borderRadius: "8px",
          fontSize: "12px", outline: "none", background: "#fff", cursor: "pointer",
        }}>
          {["All", "Standard", "Pro", "Pro Plus"].map((p) => (
            <option key={p} value={p}>{p === "All" ? "All Plans" : p}</option>
          ))}
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div style={{
        background: "#fff", borderRadius: "12px",
        border: "1px solid #e8edf5", overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e8edf5" }}>
              {["User", "Plan", "Layer", "Amount", "Billing", "Date", "Status"].map((h) => (
                <th key={h} style={{
                  padding: "10px 16px", textAlign: "left", fontSize: "10px",
                  fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em",
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "36px", textAlign: "center", color: "#cbd5e1", fontSize: "13px" }}>
                  No subscriptions found.
                </td>
              </tr>
            ) : filtered.map((s, i) => {
              const [av1, av2] = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const pm = PLAN_COLORS[s.plan]   || {};
              const sm = STATUS_META[s.status] || {};
              const bm = BILLING_META[s.billing] || {};
              return (
                <tr key={s.id}
                  style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.12s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#fafbfc"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  {/* User */}
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                        background: `linear-gradient(135deg, ${av1}, ${av2})`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "10px", fontWeight: 700, color: "#fff", letterSpacing: "0.03em",
                      }}>{getInitials(s.name)}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{s.name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{s.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: pm.bg, color: pm.color, border: `1px solid ${pm.border}`,
                    }}>{s.plan}</span>
                  </td>

                  {/* Layer */}
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px",
                      background: s.layer === "Nano" ? "#f5f3ff" : "#e0f2fe",
                      color:      s.layer === "Nano" ? "#6d28d9" : "#0369a1",
                    }}>● {s.layer}</span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "11px 16px", fontWeight: 700, color: "#0f172a", fontSize: "13px" }}>
                    {fmt(s.amount)}
                  </td>

                  {/* Billing */}
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: bm.bg, color: bm.color,
                    }}>{s.billing}</span>
                  </td>

                  {/* Date */}
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontSize: "12px", color: "#475569", fontWeight: 500 }}>{s.date}</div>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "1px" }}>{s.time}</div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "5px",
                      padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600,
                      background: sm.bg, color: sm.color,
                    }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: sm.dot, flexShrink: 0 }} />
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
      <div style={{ marginTop: "10px", fontSize: "11px", color: "#94a3b8", textAlign: "right" }}>
        Showing {filtered.length} of {STATIC_SUBSCRIPTIONS.length} subscriptions
      </div>
    </div>
  );
}