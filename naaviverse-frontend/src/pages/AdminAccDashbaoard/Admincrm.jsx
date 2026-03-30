import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Admincrm.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ─────────────────────────────────────────────────────────────────
   STATIC ACTIVITY  (popup only — table rows use real API data)
───────────────────────────────────────────────────────────────── */
const USER_ACTIVITY = {
  "lavanyagundapaneni29@gmail.com": {
    lastSeen: "Today, 09:18 AM",
    paths:         ["AI Engineer Path", "Generative AI Explorer", "ML Foundations"],
    subscriptions: ["Premium Annual Plan", "Career Booster"],
    explored:      ["Computer Vision", "LangChain Workshop"],
  },
  "sivasai5211@gmail.com": {
    lastSeen: "Yesterday",
    paths:         ["Data Science Bootcamp", "Python Basics"],
    subscriptions: ["Starter Plan"],
    explored:      ["NLP Essentials"],
  },
  "udaysankar12@gmail.com": {
    lastSeen: "2 days ago",
    paths:         ["Cloud Foundations"],
    subscriptions: [],
    explored:      ["DevOps Intro", "Docker Basics"],
  },
  "lavanya2902@gmail.com": {
    lastSeen: "Today, 09:18 AM",
    paths:         ["AI Engineer Path", "Cloud Foundations", "Cyber Security 101"],
    subscriptions: ["Premium Annual Plan", "Study Pack"],
    explored:      ["Blockchain Basics", "Web3 Workshop"],
  },
  "hgshg@gmail.com": {
    lastSeen: "3 days ago",
    paths:         [],
    subscriptions: [],
    explored:      ["Career Explorer"],
  },
  "anuradhasomisetti1027@gmail.com": {
    lastSeen: "Today, 09:18 AM",
    paths:         ["AI Engineer Path", "Data Science Bootcamp", "ML Foundations", "NLP Deep Dive", "Vision AI"],
    subscriptions: ["Premium Annual Plan", "Research Pack", "Career Booster"],
    explored:      ["Computer Vision", "LangChain Workshop"],
  },
  "somisetti1@gmail.com": {
    lastSeen: "Yesterday",
    paths:         ["Python Basics", "Web Dev Essentials"],
    subscriptions: ["Starter Plan"],
    explored:      ["React Crash Course", "Node.js Basics"],
  },
};

const PARTNER_ACTIVITY = {
  default: {
    lastSeen: "Today, 09:18 AM",
    pathsAdded:    ["Data Science Bootcamp", "Cloud Foundations"],
    listings:      ["AI Tools Suite", "Analytics Pro", "Dev Accelerator", "Study Hub"],
    activeDeals:   ["TechCorp Partnership", "EduFin Deal"],
  },
};

const DEFAULT_USER = {
  lastSeen: "Recently",
  paths: ["Intro to AI"], subscriptions: [], explored: ["Career Explorer"],
};

const getUserAct    = (email) => USER_ACTIVITY[email]    ?? DEFAULT_USER;
const getPartnerAct = (email) => PARTNER_ACTIVITY[email] ?? PARTNER_ACTIVITY.default;

/* helpers */
const initial  = (s) => (s || "?")[0].toUpperCase();
const lvlLabel = (n) => `Level ${parseInt(n) || 1}`;
const lvlCls   = (n) => { const v = parseInt(n)||1; return v >= 3 ? "lvl-high" : v === 2 ? "lvl-mid" : "lvl-low"; };

/* ─────────────────────────────────────────────────────────────────
   SECTION inside popup
───────────────────────────────────────────────────────────────── */
const Section = ({ title, icon, items, chipCls }) => (
  <div className="apop-section">
    <div className="apop-sec-head">
      <span className="apop-sec-bar" />
      <span className="apop-sec-icon">{icon}</span>
      <span className="apop-sec-title">{title}</span>
      <span className="apop-sec-count">{items.length}</span>
    </div>
    <div className="apop-chips-row">
      {items.length === 0
        ? <span className="apop-none">None yet</span>
        : items.map((item, i) => (
            <span className={`apop-chip ${chipCls}`} key={i}>{item}</span>
          ))
      }
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────
   ACTIVITY POPUP
───────────────────────────────────────────────────────────────── */
const ActivityPopup = ({ item, type, onClose }) => {
  if (!item) return null;

  const name = item.name || item.businessName || "—";
  const act  = type === "user" ? getUserAct(item.email) : getPartnerAct(item.email);

  return (
    <>
      <div className="apop-backdrop" onClick={onClose} />
      <div className="apop-box">

        {/* ── Header ── */}
        <div className="apop-header">
          <span className="apop-header-icon">🕐</span>
          <div className="apop-header-text">
            <h3>Activity timeline</h3>
            <p>{name}</p>
          </div>
          <button className="apop-close" onClick={onClose}>✕</button>
        </div>

        <div className="apop-divider" />

        {/* ── Sections ── */}
        <div className="apop-body">
          {type === "user" ? (
            <>
              <Section title="Selected Paths"       icon="🗺️" items={act.paths}         chipCls="chip-blue"   />
              <Section title="Subscriptions"         icon="⭐" items={act.subscriptions}  chipCls="chip-purple" />
              <Section title="Explored / Discovered" icon="🌐" items={act.explored}       chipCls="chip-teal"   />
            </>
          ) : (
            <>
              <Section title="Paths Added"           icon="🗺️" items={act.pathsAdded}   chipCls="chip-blue"   />
              <Section title="Marketplace Listings"  icon="🛒" items={act.listings}      chipCls="chip-purple" />
              <Section title="Active Deals"          icon="🤝" items={act.activeDeals}   chipCls="chip-teal"   />
            </>
          )}
        </div>

        <div className="apop-divider" />

        {/* ── Footer ── */}
        <div className="apop-footer">
          <span>🕐</span>
          <span>Last active: <strong>{act.lastSeen}</strong></span>
        </div>

      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────
   MAIN CRM COMPONENT
───────────────────────────────────────────────────────────────── */
const AdminCRM = () => {
  const [tab, setTab]                       = useState("Users");
  const [userData, setUserData]             = useState([]);
  const [partnerData, setPartnerData]       = useState([]);
  const [userLoading, setUserLoading]       = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [search, setSearch]                 = useState("");
  const [popupItem, setPopupItem]           = useState(null);
  const [popupType, setPopupType]           = useState("user");

  /* real users */
  useEffect(() => {
    setUserLoading(true);
    axios.get(`${BASE_URL}/api/users`)
      .then((res) => {
        const raw = res?.data?.data || [];
        setUserData([...raw].sort((a, b) =>
          a.createdAt && b.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0
        ));
      })
      .catch(() => setUserData([]))
      .finally(() => setUserLoading(false));
  }, []);

  /* real partners */
  useEffect(() => {
    setPartnerLoading(true);
    axios.get(`${BASE_URL}/api/partner/getpartners`)
      .then(({ data }) => {
        const raw = data?.partners || [];
        setPartnerData([...raw].sort((a, b) =>
          a.createdAt && b.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0
        ));
      })
      .catch(() => setPartnerData([]))
      .finally(() => setPartnerLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filteredUsers    = userData.filter((u) =>
    [u?.name, u?.email, u?.country].some((f) => (f || "").toLowerCase().includes(q))
  );
  const filteredPartners = partnerData.filter((p) =>
    [p?.businessName, p?.email, p?.country].some((f) => (f || "").toLowerCase().includes(q))
  );

  const openPopup = (item, type) => { setPopupItem(item); setPopupType(type); };

  return (
    <div className="acrm-root">

      {/* ── Top bar ── */}
      <div className="acrm-topbar">
        <div className="acrm-tabs">
          <button
            className={tab === "Users" ? "active" : ""}
            onClick={() => { setTab("Users"); setSearch(""); }}
          >
            Users <span className="tab-pill">{userData.length}</span>
          </button>
          <button
            className={tab === "Partners" ? "active" : ""}
            onClick={() => { setTab("Partners"); setSearch(""); }}
          >
            Partners <span className="tab-pill">{partnerData.length}</span>
          </button>
        </div>

        <div className="acrm-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "Users" ? "Search users…" : "Search partners…"}
          />
          {search && <button className="srch-x" onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="acrm-table-wrap">

        {/* thead */}
        {tab === "Users" ? (
          <div className="acrm-thead">
            <div style={{ width: "22%" }}>Name</div>
            <div style={{ width: "28%" }}>Email</div>
            <div style={{ width: "14%" }}>Country</div>
            <div style={{ width: "17%" }}>Phone</div>
            <div style={{ width: "11%" }}>Profile Level</div>
            <div style={{ width: "8%", textAlign: "right" }}>Activity</div>
          </div>
        ) : (
          <div className="acrm-thead">
            <div style={{ width: "26%" }}>Business</div>
            <div style={{ width: "25%" }}>Email</div>
            <div style={{ width: "13%" }}>Country</div>
            <div style={{ width: "12%" }}>Type</div>
            <div style={{ width: "16%" }}>POC</div>
            <div style={{ width: "8%", textAlign: "right" }}>Activity</div>
          </div>
        )}

        {/* tbody */}
        <div className="acrm-tbody">

          {tab === "Users" && (
            userLoading
              ? Array(8).fill("").map((_, i) => <SkelRow key={i} />)
              : filteredUsers.length === 0
                ? <Empty label="No users found" />
                : filteredUsers.map((u, i) => (
                    <div className="acrm-row" key={i}>
                      <div className="cell-name" style={{ width: "22%" }}>
                        <div className="row-av">{initial(u.name)}</div>
                        <span className="row-nm">{u.name || "—"}</span>
                      </div>
                      <div className="cell-mono" style={{ width: "28%" }}>{u.email}</div>
                      <div style={{ width: "14%" }}>{u.country || "—"}</div>
                      <div style={{ width: "17%" }}>{u.phoneNumber || "—"}</div>
                      <div style={{ width: "11%" }}>
                        <span className={`lvl-badge ${lvlCls(u.user_level)}`}>
                          {lvlLabel(u.user_level)}
                        </span>
                      </div>
                      <div style={{ width: "8%", textAlign: "right" }}>
                        <button className="act-btn" onClick={() => openPopup(u, "user")}>
                          Activity
                        </button>
                      </div>
                    </div>
                  ))
          )}

          {tab === "Partners" && (
            partnerLoading
              ? Array(6).fill("").map((_, i) => <SkelRow key={i} />)
              : filteredPartners.length === 0
                ? <Empty label="No partners found" />
                : filteredPartners.map((p, i) => (
                    <div className="acrm-row" key={i}>
                      <div className="cell-name" style={{ width: "26%" }}>
                        {p.logo
                          ? <img src={p.logo} alt="" className="row-logo" />
                          : <div className="row-av partner-av">{initial(p.businessName)}</div>}
                        <span className="row-nm">{p.businessName || "—"}</span>
                      </div>
                      <div className="cell-mono" style={{ width: "25%" }}>{p.email}</div>
                      <div style={{ width: "13%" }}>{p.country || "—"}</div>
                      <div style={{ width: "12%" }}>
                        {p.type ? <span className="type-tag">{p.type}</span> : "—"}
                      </div>
                      <div style={{ width: "16%" }}>
                        {`${p.firstName || ""} ${p.lastName || ""}`.trim() || "—"}
                      </div>
                      <div style={{ width: "8%", textAlign: "right" }}>
                        <button className="act-btn" onClick={() => openPopup(p, "partner")}>
                          Activity
                        </button>
                      </div>
                    </div>
                  ))
          )}

        </div>
      </div>

      {/* ── Popup ── */}
      <ActivityPopup
        item={popupItem}
        type={popupType}
        onClose={() => setPopupItem(null)}
      />
    </div>
  );
};

const SkelRow = () => (
  <div className="acrm-row" style={{ gap: 12 }}>
    <Skeleton circle width={30} height={30} style={{ flexShrink: 0 }} />
    <Skeleton width="55%" height={14} />
  </div>
);

const Empty = ({ label }) => <div className="acrm-empty">{label}</div>;

export default AdminCRM;