import React from "react";
import { useNavigate } from "react-router-dom";
import "./userHome.scss";

const MENTORS = [
  { id: 1, name: "Dr. Priya Sharma", role: "CS Career Coach", initials: "PS", color: "#3b82f6", date: "Apr 10, 2026", time: "4:00 PM IST", status: "upcoming", rating: 4.9, sessions: 3, speciality: "US CS applications" },
  { id: 2, name: "Arjun Mehta", role: "IIT Alumni Mentor", initials: "AM", color: "#6366f1", date: "Mar 30, 2026", time: "11:00 AM IST", status: "completed", rating: 4.7, sessions: 1, speciality: "STEM pathways" },
];

const Icon = ({ type, size = 16, color = "currentColor" }) => {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: "1.8", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (type) {
    case "arrow-l": return <svg {...p}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "mentor": return <svg {...p}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>;
    default: return null;
  }
};

export default function UserMentorsPage() {
  const navigate = useNavigate();

  return (
    <div className="uh-root" style={{ padding: "24px" }}>
      <div className="uh-card" style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
        <div className="uh-view-all-header" style={{ marginBottom: "20px" }}>
          <button className="uh-view-all-back-btn" onClick={() => navigate("/dashboard/users/home")}>
            <Icon type="arrow-l" size={12} color="var(--uh-blue-mid)" /> Back to Dashboard
          </button>
          <h3 className="uh-view-all-title" style={{ fontSize: "18px" }}>Mentor Sessions</h3>
        </div>

        <div className="uh-section-title" style={{ fontSize: "11px", marginBottom: "14px" }}>All Sessions</div>

        <div className="uh-mentors-full" style={{ gap: "12px", marginBottom: "20px" }}>
          {MENTORS.map(m => (
            <div key={m.id} className={`uh-mentor-full-row s-${m.status}`} style={{ padding: "16px" }}>
              <div className="uh-mentor-av" style={{ background: m.color, width: "40px", height: "40px", fontSize: "14px" }}>{m.initials}</div>
              <div className="uh-mentor-full-info">
                <span className="uh-mentor-name" style={{ fontSize: "14px" }}>{m.name}</span>
                <span className="uh-mentor-role">{m.role}</span>
                <span className="uh-mentor-spec">· {m.speciality}</span>
                <div className="uh-mentor-when">
                  <Icon type="calendar" size={12} color="#94a3b8" />
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

        <button className="uh-book-btn" onClick={() => navigate("/dashboard/users/Marketplace")} style={{ padding: "12px" }}>
          <Icon type="mentor" size={14} color="#fff" /> Book a New Session
        </button>
      </div>
    </div>
  );
}
