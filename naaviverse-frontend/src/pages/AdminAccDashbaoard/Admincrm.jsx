import React, { useState, useEffect } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./Admincrm.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* helpers */
const initial = (s) => (s || "?")[0].toUpperCase();
const lvlLabel = (n) => `Level ${parseInt(n) || 1}`;
const lvlCls = (n) => {
  const v = parseInt(n) || 1;
  return v >= 3 ? "lvl-high" : v === 2 ? "lvl-mid" : "lvl-low";
};

const TYPE_LABELS = {
  distributor: "Distributor",
  vendor: "Vendor",
  mentor: "Mentor",
  institution: "Institution",
};

const TYPE_COLORS = {
  distributor: "type-blue",
  vendor: "type-green",
  mentor: "type-orange",
  institution: "type-purple",
};

const getTypeLabel = (raw) => {
  if (!raw) return null;
  return TYPE_LABELS[raw.trim().toLowerCase()] || raw;
};

const getTypeColor = (raw) => {
  if (!raw) return "type-blue";
  return TYPE_COLORS[raw.trim().toLowerCase()] || "type-blue";
};

/* Avatar gradient palette */
const USER_GRADIENTS = [
  "linear-gradient(135deg,#818cf8,#6366f1)",
  "linear-gradient(135deg,#f472b6,#ec4899)",
  "linear-gradient(135deg,#34d399,#059669)",
  "linear-gradient(135deg,#fb923c,#f97316)",
  "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  "linear-gradient(135deg,#a78bfa,#7c3aed)",
];

/* SVG Icons */
const ClockIcon = ({ size = 16, color = "white" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
);

const StarIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const GlobeIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ShopIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const HandshakeIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l1.06 1.06L12 21.23l7.36-7.94 1.06-1.06a5.4 5.4 0 000-7.65z" />
  </svg>
);

/* Arrow icon for the activity trigger button */
const ArrowIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* SECTION inside popup */
const Section = ({ title, icon, items = [], chipCls }) => {
  const safeItems = Array.isArray(items) ? items : [];
  return (
    <div className="apop-section">
      <div className="apop-sec-head">
        <span className="apop-sec-bar" />
        <span className="apop-sec-icon">{icon}</span>
        <span className="apop-sec-title">{title}</span>
        <span className="apop-sec-count">{safeItems.length}</span>
      </div>
      <div className="apop-chips-row">
        {safeItems.length === 0 ? (
          <span className="apop-none">None yet</span>
        ) : (
          safeItems.map((item, i) => (
            <span className={`apop-chip ${chipCls}`} key={i}>
              {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
};

/* ACTIVITY POPUP */
const ActivityPopup = ({ item, type, onClose }) => {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!item) return;
    setActivity(null);
    setLoading(true);

    if (type === "user") {
      axios
        .get(`${BASE_URL}/api/users/activity?email=${encodeURIComponent(item.email)}`)
        .then((res) => {
          if (res.data?.status) {
            const d = res.data.data;
            setActivity({
              lastSeen: d.lastSeen || "Recently",
              paths: (d.selectedPaths || []).map((p) => p?.name || p?.title || p),
              subscriptions: (d.subscriptions || []).map((s) => s?.name || s?.title || s),
              explored: (d.exploredPaths || []).map((e) => e?.name || e?.title || e),
            });
          } else {
            setActivity({ lastSeen: "Recently", paths: [], subscriptions: [], explored: [] });
          }
        })
        .catch(() => setActivity({ lastSeen: "Recently", paths: [], subscriptions: [], explored: [] }))
        .finally(() => setLoading(false));
    } else {
      axios
        .get(`${BASE_URL}/api/partner/activity?email=${encodeURIComponent(item.email)}`)
        .then((res) => {
          if (res.data?.status) {
            const d = res.data.data;
            setActivity({
              lastSeen: d.lastSeen || "Recently",
              pathsAdded: (d.pathsAdded || []).map((p) => p?.name || p?.title || p),
              listings: (d.listings || []).map((l) => l?.name || l?.title || l),
              activeDeals: (d.activeDeals || []).map((dl) => dl?.name || dl?.title || dl),
            });
          } else {
            setActivity({ lastSeen: "Recently", pathsAdded: [], listings: [], activeDeals: [] });
          }
        })
        .catch(() => setActivity({ lastSeen: "Recently", pathsAdded: [], listings: [], activeDeals: [] }))
        .finally(() => setLoading(false));
    }
  }, [item, type]);

  if (!item) return null;
  const name = item.name || item.businessName || "—";

  return (
    <>
      <div className="apop-backdrop" onClick={onClose} />
      <div className="apop-box">
        <div className="apop-header">
          <div className="apop-header-icon-wrap">
            <ClockIcon size={18} color="white" />
          </div>
          <div className="apop-header-text">
            <h3>Activity Timeline</h3>
            <p>{name}</p>
          </div>
          <button className="apop-close" onClick={onClose}>✕</button>
        </div>

        <div className="apop-body">
          {loading ? (
            <div className="apop-loading">
              <Skeleton count={3} height={72} style={{ marginBottom: 10, borderRadius: 12 }} />
            </div>
          ) : activity ? (
            type === "user" ? (
              <>
                <Section title="Selected Paths"       icon={<MapIcon />}   items={activity.paths}         chipCls="chip-blue"   />
                <Section title="Subscriptions"        icon={<StarIcon />}  items={activity.subscriptions} chipCls="chip-purple" />
                <Section title="Marketplace Purchase" icon={<GlobeIcon />} items={activity.explored}      chipCls="chip-teal"   />
              </>
            ) : (
              <>
                <Section title="Paths Added"          icon={<MapIcon />}       items={activity.pathsAdded}  chipCls="chip-blue"   />
                <Section title="Marketplace Listings" icon={<ShopIcon />}      items={activity.listings}    chipCls="chip-purple" />
                <Section title="Active Deals"         icon={<HandshakeIcon />} items={activity.activeDeals} chipCls="chip-teal"   />
              </>
            )
          ) : null}
        </div>
      </div>
    </>
  );
};

/* MAIN CRM COMPONENT */
const AdminCRM = () => {
  const [tab, setTab] = useState("Users");
  const [userData, setUserData] = useState([]);
  const [partnerData, setPartnerData] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [popupItem, setPopupItem] = useState(null);
  const [popupType, setPopupType] = useState("user");

  useEffect(() => {
    setUserLoading(true);
    axios
      .get(`${BASE_URL}/api/users`)
      .then((res) => {
        const raw = res?.data?.data || [];
        setUserData([...raw].sort((a, b) =>
          a.createdAt && b.createdAt ? new Date(b.createdAt) - new Date(a.createdAt) : 0
        ));
      })
      .catch(() => setUserData([]))
      .finally(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    setPartnerLoading(true);
    axios
      .get(`${BASE_URL}/api/partner/getpartners`)
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
  const filteredUsers = userData.filter((u) =>
    [u?.name, u?.email, u?.country].some((f) => (f || "").toLowerCase().includes(q))
  );
  const filteredPartners = partnerData.filter((p) =>
    [p?.businessName, p?.email, p?.country, p?.partnerType].some((f) =>
      (f || "").toLowerCase().includes(q)
    )
  );

  const openPopup = (item, type) => { setPopupItem(item); setPopupType(type); };

  return (
    <div className="acrm-root">

      {/* Top bar */}
      <div className="acrm-topbar">
        <div className="acrm-tabs">
          <button className={tab === "Users" ? "active" : ""} onClick={() => { setTab("Users"); setSearch(""); }}>
            Users
          </button>
          <button className={tab === "Partners" ? "active" : ""} onClick={() => { setTab("Partners"); setSearch(""); }}>
            Partners
          </button>
        </div>

        <div className="acrm-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "Users" ? "Search users…" : "Search partners…"}
          />
          {search && (
            <button className="srch-x" onClick={() => setSearch("")}>✕</button>
          )}
        </div>
      </div>

    {/* Table */}
      <div className="acrm-table-wrap">
        <div className="acrm-scroll-inner">

          {/* Users */}
          {tab === "Users" && (
            <>
              <div className="acrm-thead acrm-thead--users">
                <div className="col-name">Name</div>
                <div className="col-email">Email</div>
                <div className="col-country">Country</div>
                <div className="col-phone">Phone</div>
                <div className="col-level">Profile Level</div>
                <div className="col-activity">Activity</div>
              </div>

              <div className="acrm-tbody">
                {userLoading
                  ? Array(8).fill("").map((_, i) => <SkelRow key={i} />)
                  : filteredUsers.length === 0
                    ? <div className="acrm-empty">No users found</div>
                    : filteredUsers.map((u, i) => (
                      <div className="acrm-row acrm-row--users" key={i}>
                        <div className="col-name cell-name">
                          <div className="row-av" style={{ background: USER_GRADIENTS[i % USER_GRADIENTS.length] }}>
                            {initial(u.name)}
                          </div>
                          <span className="row-nm">{u.name || "—"}</span>
                        </div>
                        <div className="col-email cell-mono">{u.email}</div>
                        <div className="col-country cell-txt">{u.country || "—"}</div>
                        <div className="col-phone cell-txt">{u.phoneNumber || "—"}</div>
                        <div className="col-level">
                          <span className={`lvl-badge ${lvlCls(u.user_level)}`}>{lvlLabel(u.user_level)}</span>
                        </div>
                        <div className="col-activity">
                          <button className="act-btn" title="View Activity" onClick={() => openPopup(u, "user")}>
                            View <ArrowIcon size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                }
              </div>
            </>
          )}

          {/* Partners */}
          {tab === "Partners" && (
            <>
              <div className="acrm-thead acrm-thead--partners">
                <div className="col-business">Business</div>
                <div className="col-email">Email</div>
                <div className="col-country">Country</div>
                <div className="col-partner-type">Partner Type</div>
                <div className="col-poc">POC</div>
                <div className="col-activity">Activity</div>
              </div>

              <div className="acrm-tbody">
                {partnerLoading
                  ? Array(6).fill("").map((_, i) => <SkelRow key={i} />)
                  : filteredPartners.length === 0
                    ? <div className="acrm-empty">No partners found</div>
                    : filteredPartners.map((p, i) => (
                      <div className="acrm-row acrm-row--partners" key={i}>
                        <div className="col-business cell-name">
                          {p.logo
                            ? <img src={p.logo} alt="" className="row-logo" />
                            : <div className="row-av partner-av">{initial(p.businessName)}</div>
                          }
                          <span className="row-nm">{p.businessName || "—"}</span>
                        </div>
                        <div className="col-email cell-mono">{p.email}</div>
                        <div className="col-country cell-txt">{p.country || "—"}</div>
                        <div className="col-partner-type">
                          {p.partnerType
                            ? <span className={`type-tag ${getTypeColor(p.partnerType)}`}>{getTypeLabel(p.partnerType)}</span>
                            : <span className="cell-txt">—</span>
                          }
                        </div>
                        <div className="col-poc cell-txt">
                          {`${p.firstName || ""} ${p.lastName || ""}`.trim() || "—"}
                        </div>
                        <div className="col-activity">
                          <button className="act-btn" title="View Activity" onClick={() => openPopup(p, "partner")}>
                            View <ArrowIcon size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                }
              </div>
            </>
          )}

        </div>{/* end acrm-scroll-inner */}
      </div>

      {/* Popup */}
      <ActivityPopup item={popupItem} type={popupType} onClose={() => setPopupItem(null)} />
    </div>
  );
};

const SkelRow = () => (
  <div className="acrm-row" style={{ gap: 10 }}>
    <Skeleton circle width={30} height={30} style={{ flexShrink: 0 }} />
    <Skeleton width="60%" height={13} />
  </div>
);

export default AdminCRM;