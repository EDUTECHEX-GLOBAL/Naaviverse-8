import React, { useState, useEffect } from "react";
import "./Analytics.scss";

// ── SVG Icon components (no emojis) ─────────────────────────────────────────
function IconTrendUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function IconRoute() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="3" />
      <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export default function Analytics() {
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const [hoveredGoal, setHoveredGoal] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");
        const res = await fetch(`${apiUrl}/api/admin/analytics`);
        if (!res.ok) throw new Error("fetch failed");
        setStats(await res.json());
      } catch (e) {
        console.warn("[Naavi Analytics] using defaults:", e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* ── real data (fallback to demo if API unavailable) ── */
  const totalGenerated = stats?.total_generated ?? 284;
  const pendingCount   = stats?.pending_count   ?? 47;
  const publishedCount = stats?.published_count ?? 211;
  const thisWeek       = stats?.this_week       ?? 18;
  const avgReviewTime  = stats?.avg_review_time ?? "2.4d";
  const publishRate    = Math.round((publishedCount / (totalGenerated || 1)) * 100);

  const months = stats?.line_chart_months ?? [
    { name: "Jan", generated: 35, published: 28 },
    { name: "Feb", generated: 42, published: 34 },
    { name: "Mar", generated: 48, published: 38 },
    { name: "Apr", generated: 55, published: 42 },
    { name: "May", generated: 64, published: 49 },
    { name: "Jun", generated: 72, published: 55 },
  ];

  const statusData = stats?.status_slices ?? [
    { label: "Published", value: 211, pct: 74, color: "#2CA852" },
    { label: "Pending",   value: 47,  pct: 17, color: "#F9B000" },
    { label: "Draft",     value: 26,  pct: 9,  color: "#80868B" },
  ];

  const recentPathways = stats?.recent_pathways ?? [
    { student: "Arjun S.",  goal: "CS · Oxford",        status: "Published", steps: 6, date: "Today"     },
    { student: "Priya M.",  goal: "Medicine · AIIMS",   status: "Pending",   steps: 8, date: "Today"     },
    { student: "Karan R.",  goal: "MBA · IIM",          status: "Pending",   steps: 7, date: "Yesterday" },
    { student: "Sneha T.",  goal: "Design · NID",       status: "Published", steps: 5, date: "Yesterday" },
    { student: "Rohan V.",  goal: "Law · NLU",          status: "Draft",     steps: 6, date: "2d ago"    },
  ];

  const goalColors = ["#1D72F2", "#2CA852", "#F9B000", "#8B5CF6", "#EB4335", "#EC4899"];
  const topGoals = (stats?.top_goals ?? [
    { label: "Computer Science", value: 88 },
    { label: "Medicine · MBBS",  value: 54 },
    { label: "MBA / Management", value: 43 },
    { label: "Engineering · IIT",value: 33 },
    { label: "Law · NLU",        value: 23 },
    { label: "Design · NID",     value: 15 },
  ]).map((g, i) => ({ ...g, color: g.color || goalColors[i % goalColors.length] }));

  const maxGoal = Math.max(...topGoals.map(g => g.value), 1);

  /* ── SVG line chart ── */
  const W = 560, H = 200, PX = 44, PY = 24;
  const gW = W - PX * 2, gH = H - PY * 2;
  const allVals = months.flatMap(m => [m.generated, m.published]);
  const yMin = Math.max(0, Math.floor(Math.min(...allVals) * 0.85));
  const yMax = Math.ceil(Math.max(...allVals) * 1.12);
  const gx = i   => PX + (i / Math.max(months.length - 1, 1)) * gW;
  const gy = val => H - PY - ((val - yMin) / Math.max(yMax - yMin, 1)) * gH;

  const genPath = months.map((m, i) => `${i === 0 ? "M" : "L"} ${gx(i)} ${gy(m.generated)}`).join(" ");
  const pubPath = months.map((m, i) => `${i === 0 ? "M" : "L"} ${gx(i)} ${gy(m.published)}`).join(" ");
  const genFill = `${genPath} L ${gx(months.length - 1)} ${H - PY} L ${gx(0)} ${H - PY} Z`;
  const pubFill = `${pubPath} L ${gx(months.length - 1)} ${H - PY} L ${gx(0)} ${H - PY} Z`;

  const yGridLines = [
    yMin + Math.round((yMax - yMin) * 0.25),
    yMin + Math.round((yMax - yMin) * 0.5),
    yMin + Math.round((yMax - yMin) * 0.75),
    yMax
  ];

  if (loading) {
    return (
      <div className="an-page an-in">
        <div className="an-loading">
          <div className="an-spinner" />
          <p>Loading analytics…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`an-page page${mounted ? " an-in" : ""}`}>

      {/* ── HEADER ── */}
      <div className="an-header">
        <div className="an-header__left">
          <p className="an-header__eyebrow">Admin Dashboard</p>
          <h1 className="an-header__title">Pathway Analytics</h1>
        </div>
        <div className="an-header__right">
          <span className="an-live-badge">
            <span className="an-live-dot" />
            Live
          </span>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="an-kpis">
        <div className="an-kpi an-kpi--primary">
          <div className="an-kpi__icon"><IconRoute /></div>
          <div className="an-kpi__body">
            <span className="an-kpi__num">{totalGenerated}</span>
            <span className="an-kpi__lbl">Total Pathways</span>
          </div>
          <div className="an-kpi__badge">{publishRate}% published</div>
        </div>

        <div className="an-kpi an-kpi--green">
          <div className="an-kpi__icon"><IconCheck /></div>
          <div className="an-kpi__body">
            <span className="an-kpi__num">{publishedCount}</span>
            <span className="an-kpi__lbl">Published</span>
          </div>
        </div>

        <div className="an-kpi an-kpi--amber">
          <div className="an-kpi__icon"><IconTarget /></div>
          <div className="an-kpi__body">
            <span className="an-kpi__num">{pendingCount}</span>
            <span className="an-kpi__lbl">Pending Review</span>
          </div>
        </div>

        <div className="an-kpi an-kpi--blue">
          <div className="an-kpi__icon"><IconCalendar /></div>
          <div className="an-kpi__body">
            <span className="an-kpi__num">+{thisWeek}</span>
            <span className="an-kpi__lbl">This Week</span>
          </div>
        </div>

        <div className="an-kpi an-kpi--purple">
          <div className="an-kpi__icon"><IconClock /></div>
          <div className="an-kpi__body">
            <span className="an-kpi__num">{avgReviewTime}</span>
            <span className="an-kpi__lbl">Avg Review</span>
          </div>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div className="an-body">

        {/* LEFT ── line chart + goals */}
        <div className="an-col-left">

          {/* Line chart */}
          <div className="an-card an-card--chart">
            <div className="an-card__head">
              <div>
                <p className="an-card__title">Pathway Volume</p>
                <p className="an-card__sub">Generated vs Published — last 6 months</p>
              </div>
              <div className="an-legend">
                <span className="an-legend__item">
                  <span className="an-legend__dot" style={{ background: "#2CA852" }} />
                  Published
                </span>
                <span className="an-legend__item">
                  <span className="an-legend__dot an-legend__dot--dashed" style={{ borderColor: "#1D72F2" }} />
                  Generated
                </span>
              </div>
            </div>

            <div className="an-chart-wrap">
              <svg viewBox={`0 0 ${W} ${H}`} className="an-svg">
                <defs>
                  <linearGradient id="gfGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1D72F2" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#1D72F2" stopOpacity="0"    />
                  </linearGradient>
                  <linearGradient id="gfPub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#2CA852" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#2CA852" stopOpacity="0"    />
                  </linearGradient>
                </defs>

                {yGridLines.map(v => (
                  <g key={v}>
                    <line x1={PX} y1={gy(v)} x2={W - PX} y2={gy(v)} className="an-grid" />
                    <text x={PX - 6} y={gy(v) + 4} textAnchor="end" className="an-axis">{v}</text>
                  </g>
                ))}
                {months.map((m, i) => (
                  <text key={m.name} x={gx(i)} y={H - 4} textAnchor="middle" className="an-axis">{m.name}</text>
                ))}

                <path d={genFill} fill="url(#gfGen)" />
                <path d={pubFill} fill="url(#gfPub)" />
                <path d={genPath} className="an-line an-line--gen" />
                <path d={pubPath} className="an-line an-line--pub" />

                {hoveredMonth !== null && (
                  <line x1={gx(hoveredMonth)} y1={PY} x2={gx(hoveredMonth)} y2={H - PY} className="an-hover-rule" />
                )}

                {months.map((m, i) => (
                  <g key={i}>
                    <circle cx={gx(i)} cy={gy(m.generated)} r={hoveredMonth === i ? 5.5 : 3.5}
                      className="an-dot an-dot--gen"
                      onMouseEnter={() => setHoveredMonth(i)} onMouseLeave={() => setHoveredMonth(null)} />
                    <circle cx={gx(i)} cy={gy(m.published)} r={hoveredMonth === i ? 5.5 : 3.5}
                      className="an-dot an-dot--pub"
                      onMouseEnter={() => setHoveredMonth(i)} onMouseLeave={() => setHoveredMonth(null)} />
                  </g>
                ))}
              </svg>

              {hoveredMonth !== null && (
                <div className="an-tt" style={{
                  left: `${(gx(hoveredMonth) / W) * 100}%`,
                  top:  `${(gy(months[hoveredMonth].generated) / H) * 76}%`,
                }}>
                  <p className="an-tt__month">{months[hoveredMonth].name} 2025</p>
                  <div className="an-tt__row an-tt__row--gen">
                    <span>Generated</span><strong>{months[hoveredMonth].generated}</strong>
                  </div>
                  <div className="an-tt__row an-tt__row--pub">
                    <span>Published</span><strong>{months[hoveredMonth].published}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="an-card an-card--status">
            <div className="an-card__head">
              <div>
                <p className="an-card__title">Status Breakdown</p>
                <p className="an-card__sub">Current distribution</p>
              </div>
            </div>
            <div className="an-status-list">
              {statusData.map((s) => (
                <div key={s.label} className="an-status__row">
                  <div className="an-status__meta">
                    <span className="an-status__dot" style={{ background: s.color }} />
                    <span className="an-status__name">{s.label}</span>
                    <span className="an-status__count">{s.value}</span>
                  </div>
                  <div className="an-status__track">
                    <div
                      className="an-status__fill"
                      style={{ width: mounted ? `${s.pct}%` : "0%", background: s.color }}
                    />
                  </div>
                  <span className="an-status__pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Goals bar chart */}
          <div className="an-card an-card--goals">
            <div className="an-card__head">
              <div>
                <p className="an-card__title">Top Goals</p>
                <p className="an-card__sub">By pathway count</p>
              </div>
            </div>
            <div className="an-goals">
              {topGoals.map((g, i) => (
                <div
                  key={g.label}
                  className={`an-goal${hoveredGoal === i ? " an-goal--hover" : ""}`}
                  onMouseEnter={() => setHoveredGoal(i)}
                  onMouseLeave={() => setHoveredGoal(null)}
                >
                  <div className="an-goal__bar-wrap">
                    <div className="an-goal__fill" style={{
                      height:     mounted ? `${(g.value / maxGoal) * 100}%` : "0%",
                      background: g.color,
                      transition: `height 0.9s cubic-bezier(0.4,0,0.2,1) ${i * 60 + 300}ms`,
                    }} />
                  </div>
                  <div className="an-goal__foot">
                    <span className="an-goal__name">{g.label}</span>
                    <span className="an-goal__val" style={{ color: g.color }}>{g.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT ── recent pathways */}
        <div className="an-col-right">
          <div className="an-card an-card--paths">
            <div className="an-card__head">
              <div>
                <p className="an-card__title">Recent Pathways</p>
                <p className="an-card__sub">Latest activity</p>
              </div>
              <span className="an-badge-count">{recentPathways.length}</span>
            </div>

            <div className="an-paths">
              {recentPathways.map((p, i) => (
                <div key={i} className="an-path">
                  <div className="an-path__top">
                    <div className="an-path__avatar">
                      {(p.student || "?")[0]}
                    </div>
                    <div className="an-path__info">
                      <span className="an-path__name">{p.student}</span>
                      <span className="an-path__goal">{p.goal}</span>
                    </div>
                    <span className={`an-chip an-chip--${p.status.toLowerCase()}`}>{p.status}</span>
                  </div>
                  <div className="an-path__foot">
                    <span className="an-path__meta">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                      {p.steps} steps
                    </span>
                    <span className="an-path__date">{p.date || "—"}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini summary footer */}
            <div className="an-summary">
              <div className="an-sum__item">
                <span className="an-sum__num" style={{ color: "#2CA852" }}>{publishedCount}</span>
                <span className="an-sum__lbl">Published</span>
              </div>
              <div className="an-sum__divider" />
              <div className="an-sum__item">
                <span className="an-sum__num" style={{ color: "#F9B000" }}>{pendingCount}</span>
                <span className="an-sum__lbl">Pending</span>
              </div>
              <div className="an-sum__divider" />
              <div className="an-sum__item">
                <span className="an-sum__num" style={{ color: "#80868B" }}>{totalGenerated - publishedCount - pendingCount}</span>
                <span className="an-sum__lbl">Draft</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}