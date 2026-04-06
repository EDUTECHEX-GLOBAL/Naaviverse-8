import React, { useState, useEffect } from "react";
import "./userHome.scss";
import { useNavigate } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import axios from "axios";

// ── Static / mock data helpers (replace with real API calls) ─────────────────
const getUserFromStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user || parsed;
  } catch { return null; }
};

// ── Small SVG icon set ───────────────────────────────────────────────────────
const Icon = ({ type, size = 18, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "credits":   return <svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    case "path":      return <svg {...p}><polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2"/><line x1="12" y1="22" x2="12" y2="12"/><line x1="22" y1="7" x2="12" y2="12"/><line x1="2" y1="7" x2="12" y2="12"/></svg>;
    case "step":      return <svg {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
    case "market":    return <svg {...p}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>;
    case "mentor":    return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>;
    case "wallet":    return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/><circle cx="18" cy="15" r="1" fill={color}/></svg>;
    case "arrow-r":   return <svg {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
    case "check":     return <svg {...p}><polyline points="20 6 9 17 4 12"/></svg>;
    case "clock":     return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
    case "up":        return <svg {...p}><polyline points="18 15 12 9 6 15"/></svg>;
    case "down":      return <svg {...p}><polyline points="6 9 12 15 18 9"/></svg>;
    case "explore":   return <svg {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
    case "calendar":  return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "star":      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    default:          return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
  }
};

// ── Mini progress bar ────────────────────────────────────────────────────────
const Bar = ({ pct, color = "#0d9488", bg = "#e2e8f0", h = 6 }) => (
  <div style={{ height: h, background: bg, borderRadius: 999, overflow: "hidden" }}>
    <div style={{ height: h, width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 999, transition: "width .5s ease" }} />
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
export default function UserHome() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const rawName = user?.name || user?.fullName || localStorage.getItem("userName") || "";
  const firstName = rawName.split(" ")[0] || (user?.email || "there").split("@")[0];

  // ── State (wire to real APIs as needed) ──────────────────────────────────
  const [credits, setCredits] = useState({ available: 32, used: 18, total: 50, expiry: "Apr 13, 2026", daysLeft: 8 });
  const [myPath, setMyPath] = useState({
    name: "High School to Top University Computer Science Pathway – USA",
    totalSteps: 2,
    inProgress: 1,
    completed: 0,
    overallPct: 50,
    status: "active",
  });
  const [currentStep, setCurrentStep] = useState({
    number: 1,
    title: "Technology Awareness & Career Exploration",
    desc: "Explores CS fields and identifies your interest areas through real-world examples.",
    macroFree: true,
    microCredits: 2,
    premiumCredits: 4,
  });
  const [profileComplete, setProfileComplete] = useState({ done: 3, total: 3, pct: 100 });
  const [upcomingSteps, setUpcomingSteps] = useState([
    { title: "Academic Planning & University Prep", sub: "Step 2 — top-uni requirements" },
    { title: "Browse Marketplace", sub: "Mentors & institutions for your path" },
  ]);
  const [walletActivity, setWalletActivity] = useState([
    { label: "Welcome bonus applied", sub: "Today · signup", delta: +50, up: true },
    { label: "Micro view unlocked", sub: "Today · step 1", delta: -2, up: false },
    { label: "Path selection", sub: "Today · paths", delta: -16, up: false },
  ]);
  const [exploredPaths, setExploredPaths] = useState([
    { name: "MIT Computer Science", category: "Technology", viewed: "2 days ago" },
    { name: "Yale — Bachelor's Economics", category: "Economics", viewed: "3 days ago" },
    { name: "Pre-Med · Johns Hopkins", category: "Medical", viewed: "5 days ago" },
  ]);
  const [marketPurchases, setMarketPurchases] = useState([
    { icon: "🎯", name: "AI for Finance", type: "Path", plan: "Premium", credits: 4, date: "Apr 2, 2026" },
    { icon: "☁️", name: "Cloud Computing Bundle", type: "Bundle", plan: "Micro", credits: 2, date: "Mar 28, 2026" },
  ]);
  const [mentorSessions, setMentorSessions] = useState([
    { name: "Dr. Priya Sharma", role: "CS Career Coach", initials: "PS", color: "#0d9488", date: "Apr 10, 2026", time: "4:00 PM IST", status: "upcoming" },
    { name: "Arjun Mehta", role: "IIT Alumni Mentor", initials: "AM", color: "#7c3aed", date: "Mar 30, 2026", time: "11:00 AM IST", status: "completed" },
  ]);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const creditPct = Math.round((credits.available / credits.total) * 100);

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="uh-root">

      {/* HEADER */}
      <div className="uh-header">
        <div>
          <div className="uh-greeting">Hi, <span className="uh-accent">{firstName}!</span></div>
          <div className="uh-sub">Let's continue your Naavi journey — you're doing great.</div>
        </div>
        <div className="uh-header-right">
          <div className="uh-date-pill">
            <Icon type="calendar" size={13} />
            {today}
          </div>
          {credits.daysLeft <= 10 && (
            <div className="uh-expiry-pill">
              <Icon type="clock" size={12} />
              Credits expire in {credits.daysLeft} days
            </div>
          )}
        </div>
      </div>

      {/* ── TOP STAT CARDS ─────────────────────────────────────────────────── */}
      <div className="uh-section-label">YOUR OVERVIEW</div>
      <div className="uh-top-stats">

        {/* Credits */}
        <div className="uh-stat uh-stat-teal" onClick={() => navigate("/dashboard/users/wallet")}>
          <div className="uh-stat-top">
            <div className="uh-stat-icon"><Icon type="credits" size={20} color="white" /></div>
            <span className="uh-stat-badge">{creditPct}% left</span>
          </div>
          <div className="uh-stat-val">{credits.available}</div>
          <div className="uh-stat-label">AVAILABLE CREDITS</div>
          <Bar pct={creditPct} color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.25)" />
          <div className="uh-stat-sub">{credits.used} used · expires {credits.expiry}</div>
          <button className="uh-stat-btn">View Wallet →</button>
        </div>

        {/* Profile */}
        <div className="uh-stat uh-stat-blue">
          <div className="uh-stat-top">
            <div className="uh-stat-icon"><Icon type="mentor" size={20} color="white" /></div>
            <span className="uh-stat-badge">{profileComplete.pct}%</span>
          </div>
          <div className="uh-stat-val">{profileComplete.done}/{profileComplete.total}</div>
          <div className="uh-stat-label">PROFILE COMPLETE</div>
          <Bar pct={profileComplete.pct} color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.25)" />
          <div className="uh-stat-sub">All levels done · profile ready</div>
          <button className="uh-stat-btn" onClick={(e) => { e.stopPropagation(); navigate("/dashboard/users/profile"); }}>View Profile →</button>
        </div>

        {/* Step progress */}
        <div className="uh-stat uh-stat-violet" onClick={() => navigate("/dashboard/users/current-step")}>
          <div className="uh-stat-top">
            <div className="uh-stat-icon"><Icon type="step" size={20} color="white" /></div>
            <span className="uh-stat-badge">{myPath.overallPct}% done</span>
          </div>
          <div className="uh-stat-val">{myPath.inProgress}/{myPath.totalSteps}</div>
          <div className="uh-stat-label">CURRENT STEP</div>
          <Bar pct={myPath.overallPct} color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.25)" />
          <div className="uh-stat-sub">{myPath.completed} completed · {myPath.totalSteps - myPath.completed} remaining</div>
          <button className="uh-stat-btn">View Step →</button>
        </div>

        {/* Transactions */}
        <div className="uh-stat uh-stat-amber" onClick={() => navigate("/dashboard/users/transactions")}>
          <div className="uh-stat-top">
            <div className="uh-stat-icon"><Icon type="market" size={20} color="white" /></div>
            <span className="uh-stat-badge">{marketPurchases.length} items</span>
          </div>
          <div className="uh-stat-val">{walletActivity.filter(w => !w.up).length}</div>
          <div className="uh-stat-label">TRANSACTIONS</div>
          <Bar pct={walletActivity.filter(w => !w.up).length * 20} color="rgba(255,255,255,.9)" bg="rgba(255,255,255,.25)" />
          <div className="uh-stat-sub">purchases made · credits spent</div>
          <button className="uh-stat-btn">View All →</button>
        </div>

      </div>

      {/* ── MID ROW ────────────────────────────────────────────────────────── */}
      <div className="uh-mid-row">

        {/* My Progress (left) */}
        <div className="uh-card uh-progress-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="path" size={16} color="#0d9488" />
              <span className="uh-card-title">My Progress</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/my-journey")}>Know more →</button>
          </div>

          {/* Profile items */}
          <div className="uh-progress-section">
            <div className="uh-progress-label">PROFILE</div>
            {[
              { label: "Basic info", sub: "Personal & contact", done: true },
              { label: "Academic info", sub: "School, grade & finance", done: profileComplete.done >= 2 },
              { label: "Personality info", sub: "Interests & type", done: profileComplete.done >= 3 },
            ].map((item, i) => (
              <div key={i} className="uh-progress-row">
                <div className={`uh-check-circle ${item.done ? "done" : ""}`}>
                  {item.done && <Icon type="check" size={11} color="white" />}
                </div>
                <div className="uh-progress-info">
                  <div className="uh-progress-name">{item.label}</div>
                  <div className="uh-progress-sub">{item.sub}</div>
                </div>
                {item.done && <span className="uh-done-pill">Done</span>}
              </div>
            ))}
            <div className="uh-pct-row">
              <span className="uh-pct-label">Profile completion</span>
              <span className="uh-pct-val">{profileComplete.pct}%</span>
            </div>
            <Bar pct={profileComplete.pct} color="#0d9488" />
          </div>
        </div>

        {/* Ongoing Step (centre) */}
        <div className="uh-card uh-ongoing-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="step" size={16} color="#2563eb" />
              <span className="uh-card-title">Ongoing</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/current-step")}>View step →</button>
          </div>

          <div className="uh-step-badge">{currentStep.number}</div>
          <div className="uh-step-title">{currentStep.title}</div>
          <div className="uh-step-desc">{currentStep.desc}</div>

          <div className="uh-step-tags">
            {currentStep.macroFree && <span className="uh-tag uh-tag-green">Macro — free</span>}
            <span className="uh-tag uh-tag-blue">Micro — {currentStep.microCredits} credits</span>
            <span className="uh-tag uh-tag-amber">Premium — {currentStep.premiumCredits} credits</span>
          </div>

          <button className="uh-continue-btn" onClick={() => navigate("/dashboard/users/current-step")}>
            Continue step →
          </button>
        </div>

        {/* Coming Up Next (right) */}
        <div className="uh-card uh-next-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="clock" size={16} color="#7c3aed" />
              <span className="uh-card-title">Coming Up Next</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/my-journey")}>View all →</button>
          </div>

          <div className="uh-next-list">
            {upcomingSteps.map((s, i) => (
              <div key={i} className="uh-next-item">
                <div className="uh-next-icon">
                  <Icon type={i === 0 ? "step" : "market"} size={14} color="#7c3aed" />
                </div>
                <div>
                  <div className="uh-next-title">{s.title}</div>
                  <div className="uh-next-sub">{s.sub}</div>
                  <button className="uh-small-link" onClick={() => navigate(i === 0 ? "/dashboard/users/current-step" : "/dashboard/users/Marketplace")}>
                    {i === 0 ? "Start when ready" : "Explore"} →
                  </button>
                </div>
              </div>
            ))}

            <div className="uh-next-item">
              <div className="uh-next-icon"><Icon type="wallet" size={14} color="#7c3aed" /></div>
              <div>
                <div className="uh-next-title">Top up credits</div>
                <div className="uh-next-sub">{credits.available} left · expires {credits.expiry}</div>
                <button className="uh-small-link" onClick={() => navigate("/dashboard/users/wallet")}>See plans →</button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW ─────────────────────────────────────────────────────── */}
      <div className="uh-bottom-row">

        {/* My Path */}
        <div className="uh-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="path" size={15} color="#0d9488" />
              <span className="uh-card-title">My Path</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/my-journey")}>View journey →</button>
          </div>

          <div className="uh-path-name">{myPath.name}</div>

          <div className="uh-path-stats">
            {[
              { val: myPath.totalSteps, label: "Total steps" },
              { val: myPath.inProgress, label: "In progress" },
              { val: myPath.completed, label: "Completed" },
            ].map((s, i) => (
              <div key={i} className="uh-path-stat">
                <div className="uh-path-stat-val">{s.val}</div>
                <div className="uh-path-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="uh-path-pct-row">
            <span className="uh-pct-label">Overall progress</span>
            <span className="uh-pct-val">{myPath.overallPct}%</span>
          </div>
          <Bar pct={myPath.overallPct} color="#0d9488" h={7} />

          <div className="uh-wallet-section">
            <div className="uh-ws-label">RECENT WALLET ACTIVITY</div>
            {walletActivity.map((w, i) => (
              <div key={i} className="uh-wallet-row">
                <div className={`uh-wallet-dot ${w.up ? "up" : "down"}`}>
                  <Icon type={w.up ? "up" : "down"} size={11} color="white" />
                </div>
                <div className="uh-wallet-info">
                  <div className="uh-wallet-label">{w.label}</div>
                  <div className="uh-wallet-sub">{w.sub}</div>
                </div>
                <span className={`uh-wallet-delta ${w.up ? "up" : "down"}`}>{w.up ? "+" : ""}{w.delta}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right col */}
        <div className="uh-right-col">

          {/* My Wallet */}
          <div className="uh-card uh-wallet-card">
            <div className="uh-card-header">
              <div className="uh-card-title-row">
                <Icon type="wallet" size={15} color="#7c3aed" />
                <span className="uh-card-title">My Wallet</span>
              </div>
              <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/wallet")}>View details →</button>
            </div>

            <div className="uh-wallet-big">
              <span className="uh-wallet-credits">{credits.available}</span>
              <span className="uh-wallet-unit"> credits</span>
            </div>
            <div className="uh-expiry-tag">Expires in {credits.daysLeft} days · {credits.expiry}</div>
            <div className="uh-wallet-note">
              <span className="uh-dot-green" /> {credits.total} welcome credits received on signup
            </div>

            <div className="uh-divider" />
            <div className="uh-credit-label">Credit usage breakdown</div>
            <div className="uh-credit-row">
              <span>Used</span><span>{credits.used} credits</span>
            </div>
            <Bar pct={Math.round((credits.used / credits.total) * 100)} color="#b45309" bg="#fef3c7" h={5} />
            <div className="uh-credit-row" style={{ marginTop: 8 }}>
              <span>Remaining</span><span style={{ color: "#0d9488" }}>{credits.available} credits</span>
            </div>
            <Bar pct={creditPct} color="#0d9488" h={5} />

            <div className="uh-divider" />
            <div className="uh-credit-label">PROFILE COORDINATES</div>
            {[
              ["Grade", "11"],
              ["Curriculum", "CBSE"],
              ["Stream", "MEC"],
              ["Performance", "86%–95%"],
            ].map(([k, v]) => (
              <div key={k} className="uh-coord-row">
                <span className="uh-coord-key">{k}</span>
                <span className="uh-coord-val">{v}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── THIRD ROW — Explored Paths + Marketplace + Mentor ─────────────── */}
      <div className="uh-third-row">

        {/* Explored Paths */}
        <div className="uh-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="explore" size={15} color="#2563eb" />
              <span className="uh-card-title">Paths Explored</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/paths")}>Browse all →</button>
          </div>
          <div className="uh-explored-list">
            {exploredPaths.map((p, i) => (
              <div key={i} className="uh-explored-item">
                <div className="uh-explored-rank">{i + 1}</div>
                <div className="uh-explored-info">
                  <div className="uh-explored-name">{p.name}</div>
                  <div className="uh-explored-sub">{p.category} · viewed {p.viewed}</div>
                </div>
                <button className="uh-icon-btn" onClick={() => navigate("/dashboard/users/paths")}>
                  <Icon type="arrow-r" size={14} color="#0d9488" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Marketplace Purchases */}
        <div className="uh-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="market" size={15} color="#7c3aed" />
              <span className="uh-card-title">Marketplace Purchases</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/Marketplace")}>View all →</button>
          </div>
          {marketPurchases.length === 0 ? (
            <div className="uh-empty-state">
              <div className="uh-empty-icon">🛒</div>
              <div className="uh-empty-text">No purchases yet</div>
              <button className="uh-empty-btn" onClick={() => navigate("/dashboard/users/Marketplace")}>Browse Marketplace →</button>
            </div>
          ) : (
            <div className="uh-market-list">
              {marketPurchases.map((m, i) => (
                <div key={i} className="uh-market-item">
                  <div className="uh-market-icon-box">{m.icon}</div>
                  <div className="uh-market-info">
                    <div className="uh-market-name">{m.name}</div>
                    <div className="uh-market-sub">{m.type} · {m.date}</div>
                  </div>
                  <div className="uh-market-right">
                    <span className={`uh-plan-badge uh-plan-${m.plan.toLowerCase()}`}>{m.plan}</span>
                    <span className="uh-credit-cost">{m.credits} cr</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mentor Sessions */}
        <div className="uh-card">
          <div className="uh-card-header">
            <div className="uh-card-title-row">
              <Icon type="mentor" size={15} color="#0d9488" />
              <span className="uh-card-title">Mentor Sessions</span>
            </div>
            <button className="uh-link-btn" onClick={() => navigate("/dashboard/users/Marketplace")}>Find mentors →</button>
          </div>
          {mentorSessions.length === 0 ? (
            <div className="uh-empty-state">
              <div className="uh-empty-icon">👨‍🏫</div>
              <div className="uh-empty-text">No sessions scheduled</div>
              <button className="uh-empty-btn" onClick={() => navigate("/dashboard/users/Marketplace")}>Book a mentor →</button>
            </div>
          ) : (
            <div className="uh-mentor-list">
              {mentorSessions.map((m, i) => (
                <div key={i} className="uh-mentor-item">
                  <div className="uh-mentor-avatar" style={{ background: m.color }}>{m.initials}</div>
                  <div className="uh-mentor-info">
                    <div className="uh-mentor-name">{m.name}</div>
                    <div className="uh-mentor-role">{m.role}</div>
                    <div className="uh-mentor-time">
                      <Icon type="calendar" size={11} color="#94a3b8" />
                      {m.date} · {m.time}
                    </div>
                  </div>
                  <span className={`uh-session-status uh-session-${m.status}`}>
                    {m.status === "upcoming" ? "Upcoming" : "Done"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}