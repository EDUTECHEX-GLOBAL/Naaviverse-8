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

/* Map partnerType values → clean display labels */
const TYPE_LABELS = {
  distributor: "Distributor",
  vendor: "Vendor",
  mentor: "Mentor",
  institution: "Institution",
};

/* Colour classes per partner type */
const TYPE_COLORS = {
  distributor: "type-blue",
  vendor: "type-green",
  mentor: "type-orange",
  institution: "type-purple",
};

const getTypeLabel = (raw) => {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return TYPE_LABELS[key] || raw;
};

const getTypeColor = (raw) => {
  if (!raw) return "type-default";
  const key = raw.trim().toLowerCase();
  return TYPE_COLORS[key] || "type-default";
};

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
        .get(
          `${BASE_URL}/api/users/activity?email=${encodeURIComponent(
            item.email
          )}`
        )
        .then((res) => {
          if (res.data?.status) {
            const d = res.data.data;
            setActivity({
              lastSeen: d.lastSeen || "Recently",
              paths: (d.selectedPaths || []).map(
                (p) => p?.name || p?.title || p
              ),
              subscriptions: (d.subscriptions || []).map(
                (s) => s?.name || s?.title || s
              ),
              explored: (d.exploredPaths || []).map(
                (e) => e?.name || e?.title || e
              ),
            });
          } else {
            setActivity({
              lastSeen: "Recently",
              paths: [],
              subscriptions: [],
              explored: [],
            });
          }
        })
        .catch(() =>
          setActivity({
            lastSeen: "Recently",
            paths: [],
            subscriptions: [],
            explored: [],
          })
        )
        .finally(() => setLoading(false));
    } else {
      axios
        .get(
          `${BASE_URL}/api/partner/activity?email=${encodeURIComponent(
            item.email
          )}`
        )
        .then((res) => {
          if (res.data?.status) {
            const d = res.data.data;
            setActivity({
              lastSeen: d.lastSeen || "Recently",
              pathsAdded: (d.pathsAdded || []).map(
                (p) => p?.name || p?.title || p
              ),
              listings: (d.listings || []).map((l) => l?.name || l?.title || l),
              activeDeals: (d.activeDeals || []).map(
                (dl) => dl?.name || dl?.title || dl
              ),
            });
          } else {
            setActivity({
              lastSeen: "Recently",
              pathsAdded: [],
              listings: [],
              activeDeals: [],
            });
          }
        })
        .catch(() =>
          setActivity({
            lastSeen: "Recently",
            pathsAdded: [],
            listings: [],
            activeDeals: [],
          })
        )
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
          <span className="apop-header-icon">🕐</span>
          <div className="apop-header-text">
            <h3>Activity timeline</h3>
            <p>{name}</p>
          </div>
          <button className="apop-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="apop-divider" />
        <div className="apop-body">
          {loading ? (
            <div className="apop-loading">
              <Skeleton
                count={3}
                height={60}
                style={{ marginBottom: 12, borderRadius: 10 }}
              />
            </div>
          ) : activity ? (
            type === "user" ? (
              <>
                <Section
                  title="Selected Paths"
                  icon="🗺️"
                  items={activity.paths}
                  chipCls="chip-blue"
                />
                <Section
                  title="Subscriptions"
                  icon="⭐"
                  items={activity.subscriptions}
                  chipCls="chip-purple"
                />
                <Section
                  title="Explored / Discovered"
                  icon="🌐"
                  items={activity.explored}
                  chipCls="chip-teal"
                />
              </>
            ) : (
              <>
                <Section
                  title="Paths Added"
                  icon="🗺️"
                  items={activity.pathsAdded}
                  chipCls="chip-blue"
                />
                <Section
                  title="Marketplace Listings"
                  icon="🛒"
                  items={activity.listings}
                  chipCls="chip-purple"
                />
                <Section
                  title="Active Deals"
                  icon="🤝"
                  items={activity.activeDeals}
                  chipCls="chip-teal"
                />
              </>
            )
          ) : null}
        </div>
        <div className="apop-divider" />
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
        setUserData(
          [...raw].sort((a, b) =>
            a.createdAt && b.createdAt
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : 0
          )
        );
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
        setPartnerData(
          [...raw].sort((a, b) =>
            a.createdAt && b.createdAt
              ? new Date(b.createdAt) - new Date(a.createdAt)
              : 0
          )
        );
      })
      .catch(() => setPartnerData([]))
      .finally(() => setPartnerLoading(false));
  }, []);

  const q = search.toLowerCase();
  const filteredUsers = userData.filter((u) =>
    [u?.name, u?.email, u?.country].some((f) =>
      (f || "").toLowerCase().includes(q)
    )
  );
  const filteredPartners = partnerData.filter((p) =>
    [p?.businessName, p?.email, p?.country, p?.partnerType].some((f) =>
      (f || "").toLowerCase().includes(q)
    )
  );

  const openPopup = (item, type) => {
    setPopupItem(item);
    setPopupType(type);
  };

  return (
    <div className="acrm-root">
      {/* Top bar */}
      <div className="acrm-topbar">
        <div className="acrm-tabs">
          <button
            className={tab === "Users" ? "active" : ""}
            onClick={() => {
              setTab("Users");
              setSearch("");
            }}
          >
            Users
          </button>
          <button
            className={tab === "Partners" ? "active" : ""}
            onClick={() => {
              setTab("Partners");
              setSearch("");
            }}
          >
            Partners
          </button>
        </div>
        <div className="acrm-search">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2.2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              tab === "Users" ? "Search users…" : "Search partners…"
            }
          />
          {search && (
            <button className="srch-x" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="acrm-table-wrap">
        {/* Users thead */}
        {tab === "Users" && (
          <div className="acrm-thead">
            <div style={{ width: "20%" }}>Name</div>
            <div style={{ width: "30%" }}>Email</div>
            <div style={{ width: "14%" }}>Country</div>
            <div style={{ width: "17%" }}>Phone</div>
            <div style={{ width: "10%" }}>Profile Level</div>
            <div style={{ width: "9%", textAlign: "right", paddingRight: "12px" }}>
              Activity
            </div>
          </div>
        )}

        {/* Partners thead */}
        {tab === "Partners" && (
          <div className="acrm-thead">
            <div style={{ width: "24%" }}>Business</div>
            <div style={{ width: "24%" }}>Email</div>
            <div style={{ width: "11%" }}>Country</div>
            <div style={{ width: "16%" }}>Partner Type</div>
            <div style={{ width: "16%" }}>POC</div>
            <div style={{ width: "9%", textAlign: "right", paddingRight: "12px" }}>
              Activity
            </div>
          </div>
        )}

        {/* tbody */}
        <div className="acrm-tbody">
          {/* Users rows */}
          {tab === "Users" &&
            (userLoading ? (
              Array(8)
                .fill("")
                .map((_, i) => <SkelRow key={i} />)
            ) : filteredUsers.length === 0 ? (
              <Empty label="No users found" />
            ) : (
              filteredUsers.map((u, i) => (
                <div className="acrm-row" key={i}>
                  <div className="cell-name" style={{ width: "20%" }}>
                    <span className="row-nm">{u.name || "—"}</span>
                  </div>
                  <div className="cell-mono" style={{ width: "30%" }}>
                    {u.email}
                  </div>
                  <div style={{ width: "14%" }}>{u.country || "—"}</div>
                  <div style={{ width: "17%" }}>{u.phoneNumber || "—"}</div>
                  <div style={{ width: "10%" }}>
                    <span className={`lvl-badge ${lvlCls(u.user_level)}`}>
                      {lvlLabel(u.user_level)}
                    </span>
                  </div>
                  <div style={{ width: "9%", textAlign: "right", paddingRight: "12px" }}>
                    <button
                      className="act-btn"
                      onClick={() => openPopup(u, "user")}
                    >
                      Activity
                    </button>
                  </div>
                </div>
              ))
            ))}

          {/* Partners rows */}
          {tab === "Partners" &&
            (partnerLoading ? (
              Array(6)
                .fill("")
                .map((_, i) => <SkelRow key={i} />)
            ) : filteredPartners.length === 0 ? (
              <Empty label="No partners found" />
            ) : (
              filteredPartners.map((p, i) => (
                <div className="acrm-row" key={i}>
                  {/* Business */}
                  <div className="cell-name" style={{ width: "24%" }}>
                    {p.logo ? (
                      <img src={p.logo} alt="" className="row-logo" />
                    ) : (
                      <div className="row-av partner-av">
                        {initial(p.businessName)}
                      </div>
                    )}
                    <span className="row-nm">{p.businessName || "—"}</span>
                  </div>

                  {/* Email */}
                  <div className="cell-mono" style={{ width: "24%" }}>
                    {p.email}
                  </div>

                  {/* Country */}
                  <div
                    style={{
                      width: "11%",
                      fontSize: "13px",
                      color: "#475569",
                    }}
                  >
                    {p.country || "—"}
                  </div>

                  {/* Partner Type */}
                  <div style={{ width: "16%" }}>
                    {p.partnerType ? (
                      <span
                        className={`type-tag ${getTypeColor(p.partnerType)}`}
                        title={p.partnerType}
                      >
                        {getTypeLabel(p.partnerType)}
                      </span>
                    ) : (
                      <span className="type-empty">—</span>
                    )}
                  </div>

                  {/* POC */}
                  <div
                    style={{
                      width: "16%",
                      fontSize: "13px",
                      color: "#1e293b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {`${p.firstName || ""} ${p.lastName || ""}`.trim() || "—"}
                  </div>

                  {/* Activity */}
                  <div
                    style={{
                      width: "9%",
                      textAlign: "right",
                      paddingRight: "12px",
                    }}
                  >
                    <button
                      className="act-btn"
                      onClick={() => openPopup(p, "partner")}
                    >
                      Activity
                    </button>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>

      {/* Popup */}
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