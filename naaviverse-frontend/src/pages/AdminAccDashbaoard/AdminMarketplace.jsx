import React, { useState, useEffect, useCallback } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ── Premium SVG Icons ─────────────────────────────────────
const IconInstitution = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMentor = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.65"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconVendor = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 6h18" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round"/>
    <path d="M16 10a4 4 0 0 1-8 0"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDistributor = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 9.4 7.55 4.24M3.29 7 12 12l8.71-5M12 22V12"
      stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 15v6M15 18h6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round"/>
  </svg>
);

const IconEdit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Stat icons ────────────────────────────────────────────
const StatListings = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/>
  </svg>
);
const StatPaid = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9"/>
    <path d="M12 7v1m0 8v1M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1 2-2.5 2.5S9.5 13 9.5 14.5a2.5 2.5 0 0 0 5 0"/>
  </svg>
);
const StatFree = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);
const StatPartners = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// ── Config ────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  institution: { color: "#6C5CE7", colorLight: "#EDEBFF", colorMid: "#B2ABED", Icon: IconInstitution, label: "Institutions" },
  mentor:      { color: "#0EA5E9", colorLight: "#E0F5FF", colorMid: "#7DD3FC", Icon: IconMentor,      label: "Mentors" },
  vendor:      { color: "#F43F5E", colorLight: "#FFE4EA", colorMid: "#FDA4AF", Icon: IconVendor,      label: "Vendors" },
  distributor: { color: "#F59E0B", colorLight: "#FEF3C7", colorMid: "#FCD34D", Icon: IconDistributor, label: "Distributors" },
};

const LAYER_COLORS = {
  NANO:       { bg: "#EEF2FF", color: "#4338CA" },
  MICRO:      { bg: "#F0FDF4", color: "#15803D" },
  MACRO:      { bg: "#FFF7ED", color: "#C2410C" },
  FOUNDATION: { bg: "#F8FAFC", color: "#475569" },
};

const getRoleConf = (role) =>
  CATEGORY_CONFIG[role?.toLowerCase()] || { color: "#94a3b8", colorLight: "#f1f5f9", colorMid: "#e2e8f0", Icon: () => null, label: "Unknown" };

const formatPrice = (cost) => (!cost || cost === "0" || cost === 0 ? "Free" : `$${cost}`);

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  return features.split(/[,;]+/).map((f) => f.trim()).filter(Boolean);
};

// ── Main Component ────────────────────────────────────────
const AdminMarketplace = () => {
  const [items,          setItems]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [activeCategory, setActiveCategory] = useState("institution");
  const [emailSearch,    setEmailSearch]    = useState("");
  const [nameSearch,     setNameSearch]     = useState("");
  const [selectedItem,   setSelectedItem]   = useState(null);
  const [isEditing,      setIsEditing]      = useState(false);
  const [tableKey,       setTableKey]       = useState(0);
  const [editFormData,   setEditFormData]   = useState({
    name: "", access: "", cost: "", discount: "", layer: "",
    duration: "", goal: "", features: "", outcomes: "", iterations: "", partner_email: "",
  });

  const fetchMarketplaceItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/marketplace/admin/get-all`);
      if (res.data?.status) setItems(res.data.data || []);
      else { setItems([]); toast.error(res.data?.message || "Failed to load items"); }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error loading items");
      setItems([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMarketplaceItems(); }, [fetchMarketplaceItems]);

  const handleCategoryClick = (cat) => {
    if (cat === activeCategory) return;
    setTableKey((k) => k + 1);
    setActiveCategory(cat);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      name:          selectedItem.name          || "",
      access:        selectedItem.access        || "",
      cost:          selectedItem.cost          || "",
      discount:      selectedItem.discount      || "",
      layer:         selectedItem.layer         || "",
      duration:      selectedItem.duration      || "",
      goal:          selectedItem.goal          || "",
      features:      selectedItem.features      || "",
      outcomes:      selectedItem.outcomes      || "",
      iterations:    selectedItem.iterations    || "",
      partner_email: selectedItem.partner_email || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `${BASE_URL}/api/marketplace/admin/update/${selectedItem._id}`,
        editFormData
      );
      if (res.data?.status) {
        toast.success("Item updated!");
        const updated = res.data.data;
        setItems((prev) => prev.map((i) => (i._id === selectedItem._id ? updated : i)));
        setSelectedItem(updated);
        setIsEditing(false);
      } else toast.error(res.data?.message || "Failed to update");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating item.");
    }
  };

  const handleCancel    = () => { setIsEditing(false); setEditFormData({}); };
  const handleCloseModal = () => { setSelectedItem(null); setIsEditing(false); };

  // Counts per category (no email/name filter for summary cards)
  const categoryCounts = Object.keys(CATEGORY_CONFIG).reduce((acc, cat) => {
    acc[cat] = items.filter((i) => i.role?.toLowerCase() === cat).length;
    return acc;
  }, {});

  // Filtered items for the active table view
  const filteredItems = items.filter((item) => {
    const roleMatch  = item.role?.toLowerCase() === activeCategory;
    const emailMatch = !emailSearch || item.partner_email?.toLowerCase().includes(emailSearch.toLowerCase());
    const nameMatch  = !nameSearch  || item.name?.toLowerCase().includes(nameSearch.toLowerCase());
    return roleMatch && emailMatch && nameMatch;
  });

  // Stats (across all categories, respecting email/name filters)
  const allFiltered    = items.filter((i) => (!emailSearch || i.partner_email?.toLowerCase().includes(emailSearch.toLowerCase())) && (!nameSearch || i.name?.toLowerCase().includes(nameSearch.toLowerCase())));
  const totalItems     = allFiltered.length;
  const freeItems      = allFiltered.filter((i) => !i.cost || i.cost === "0" || i.cost === 0).length;
  const paidItems      = totalItems - freeItems;
  const uniquePartners = new Set(allFiltered.map((i) => i.partner_email).filter(Boolean)).size;

  const ac = CATEGORY_CONFIG[activeCategory];

  return (
    <div className="adm-root">

      {/* Header */}
      <div className="adm-header">
        <h1 className="adm-header__title">Marketplace</h1>
        {!loading && <span className="adm-header__badge">{items.length} Total Items</span>}
      </div>

      {/* Stat Cards */}
      <div className="adm-stats">
        {[
          { label: "Total Listings", value: totalItems,     Icon: StatListings, cls: "adm-stat--teal"   },
          { label: "Paid Items",     value: paidItems,      Icon: StatPaid,     cls: "adm-stat--purple" },
          { label: "Free Items",     value: freeItems,      Icon: StatFree,     cls: "adm-stat--green"  },
          { label: "Partners",       value: uniquePartners, Icon: StatPartners, cls: "adm-stat--amber"  },
        ].map(({ label, value, Icon, cls }) => (
          <div className={`adm-stat ${cls}`} key={label}>
            <div className="adm-stat__icon"><Icon /></div>
            <div className="adm-stat__body">
              <span className="adm-stat__label">{label}</span>
              <span className="adm-stat__val">{loading ? "—" : value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Cards */}
      <div className="adm-cat-grid">
        {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => {
          const { Icon } = conf;
          return (
            <div
              key={key}
              className={`adm-cat-card ${activeCategory === key ? "adm-cat-card--active" : ""}`}
              style={{ "--cc": conf.color, "--cl": conf.colorLight, "--cm": conf.colorMid }}
              onClick={() => handleCategoryClick(key)}
            >
              <div className="adm-cat-card__top">
                <div className="adm-cat-card__icon-wrap"><Icon /></div>
                <span className="adm-cat-card__count">
                  {loading ? "—" : (categoryCounts[key] || 0)}
                </span>
              </div>
              <div className="adm-cat-card__label">{conf.label}</div>
              <div className="adm-cat-card__glow" />
            </div>
          );
        })}
      </div>

      {/* Table Panel */}
      <div className="adm-panel">
        <div className="adm-panel__bar">
          <div className="adm-panel__bar-left">
           
            <span className="adm-panel__title">{ac.label}</span>
           
          </div>
          <div className="adm-panel__bar-right">
            <div className="adm-search">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="11" cy="11" r="8"/><path d="M21 21L16.65 16.65" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="Search name..." value={nameSearch}
                onChange={(e) => setNameSearch(e.target.value)} className="adm-search__input" />
            </div>
            <div className="adm-search">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input type="text" placeholder="Search email..." value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)} className="adm-search__input" />
            </div>
          </div>
        </div>

        <div className="adm-table-wrap" key={tableKey}>
          {loading ? (
            <div className="adm-skeletons">
              {Array(5).fill(0).map((_, i) => (
                <div className="adm-skel-row" key={i}>
                  <Skeleton circle width={24} height={24} />
                  <Skeleton height={11} width={130} />
                  <Skeleton height={11} width={150} />
                  <Skeleton height={11} width={90} />
                  <Skeleton height={18} width={40} borderRadius={20} />
                  <Skeleton height={22} width={60} borderRadius={20} />
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="adm-empty">
              <div className="adm-empty__icon" style={{ color: ac.color }}><ac.Icon /></div>
              <p className="adm-empty__text">No {ac.label.toLowerCase()} found</p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Partner Email</th>
                  <th>Goal</th>
                  <th>Access</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className="adm-row" onClick={() => setSelectedItem(item)}>
                    <td className="adm-row__name-td">
                      <span className="adm-row__icon" style={{ background: ac.colorLight, color: ac.color }}>
                        <ac.Icon />
                      </span>
                      <span className="adm-row__name">{item.name || "Untitled"}</span>
                    </td>
                    <td className="adm-row__email">{item.partner_email || <span className="adm-nil">—</span>}</td>
                    <td className="adm-row__goal">{item.goal || <span className="adm-nil">—</span>}</td>
                    <td>
                      <span className={`adm-access ${!item.cost || item.cost === "0" || item.cost === 0 ? "adm-access--free" : "adm-access--paid"}`}>
                        {!item.cost || item.cost === "0" || item.cost === 0 ? "Free" : "Paid"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="adm-view-btn"
                        style={{ "--bc": ac.color, "--bl": ac.colorLight }}
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail / Edit Modal */}
      {selectedItem && (() => {
        const rc = getRoleConf(selectedItem.role);
        const RcIcon = rc.Icon;
        const layer  = selectedItem.layer?.toUpperCase();
        const ls     = LAYER_COLORS[layer] || { bg: "#f1f5f9", color: "#475569" };
        const featureList = parseFeatures(selectedItem.features);

        return (
          <div className="adm-overlay" onClick={handleCloseModal}>
            <div className="adm-modal" onClick={(e) => e.stopPropagation()}>

              {/* Close button */}
              <button className="adm-modal__x" onClick={handleCloseModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>

              {/* Head */}
              <div className="adm-modal__head" style={{ "--rc": rc.color, "--rl": rc.colorLight }}>
                <div className="adm-modal__avatar"><RcIcon /></div>
                <div className="adm-modal__head-text">
                  {!isEditing ? (
                    <>
                      <h2 className="adm-modal__name">{selectedItem.name || "Item Details"}</h2>
                      <div className="adm-modal__meta">
                        <span>{selectedItem.partner_email || "—"}</span>
                        {selectedItem.createdAt && (
                          <>
                            <span className="adm-modal__meta-dot">·</span>
                            <span>{new Date(selectedItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </>
                        )}
                      </div>
                    </>
                  ) : (
                    <input
                      type="text" name="name" value={editFormData.name}
                      onChange={handleInputChange} className="adm-edit-title"
                      placeholder="Item Name"
                    />
                  )}
                </div>
                <div className="adm-modal__head-right">
                  <span className="adm-modal__role-tag" style={{ background: rc.colorLight, color: rc.color }}>
                    {rc.label}
                  </span>
                  {!isEditing ? (
                    <button className="adm-modal__edit-btn" onClick={handleEditClick} title="Edit">
                      <IconEdit />
                    </button>
                  ) : (
                    <div className="adm-modal__edit-actions">
                      <button className="adm-modal__save-btn" onClick={handleSave}>Save</button>
                      <button className="adm-modal__cancel-btn" onClick={handleCancel}>Cancel</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="adm-modal__body">

                {/* Chip row */}
                <div className="adm-chips">
                  <div className="adm-chip">
                    <span className="adm-chip__label">Access</span>
                    {!isEditing ? (
                      <span className="adm-chip__val"
                        style={{ color: (!selectedItem.cost || selectedItem.cost === "0") ? "#059669" : "#E11D48" }}>
                        {selectedItem.access || "Free"}
                      </span>
                    ) : (
                      <input name="access" value={editFormData.access} onChange={handleInputChange} className="adm-chip__input" />
                    )}
                  </div>
                  <div className="adm-chip">
                    <span className="adm-chip__label">Price</span>
                    {!isEditing ? (
                      <span className="adm-chip__val">{formatPrice(selectedItem.cost)}</span>
                    ) : (
                      <input name="cost" value={editFormData.cost} onChange={handleInputChange} className="adm-chip__input" />
                    )}
                  </div>
                  {(selectedItem.discount || isEditing) && (
                    <div className="adm-chip">
                      <span className="adm-chip__label">Discount</span>
                      {!isEditing ? (
                        <span className="adm-chip__val" style={{ color: "#E11D48" }}>{selectedItem.discount}</span>
                      ) : (
                        <input name="discount" value={editFormData.discount} onChange={handleInputChange} className="adm-chip__input" />
                      )}
                    </div>
                  )}
                  {(layer || isEditing) && (
                    <div className="adm-chip">
                      <span className="adm-chip__label">Layer</span>
                      {!isEditing ? (
                        <span className="adm-layer-pill" style={{ background: ls.bg, color: ls.color }}>{layer}</span>
                      ) : (
                        <select name="layer" value={editFormData.layer} onChange={handleInputChange} className="adm-chip__input">
                          <option value="">—</option>
                          <option value="Foundation">Foundation</option>
                          <option value="macro">Macro</option>
                          <option value="micro">Micro</option>
                          <option value="nano">Nano</option>
                        </select>
                      )}
                    </div>
                  )}
                  {(selectedItem.duration || isEditing) && (
                    <div className="adm-chip">
                      <span className="adm-chip__label">Duration</span>
                      {!isEditing ? (
                        <span className="adm-chip__val">{selectedItem.duration}</span>
                      ) : (
                        <input name="duration" value={editFormData.duration} onChange={handleInputChange} className="adm-chip__input" />
                      )}
                    </div>
                  )}
                  {(selectedItem.iterations || isEditing) && (
                    <div className="adm-chip">
                      <span className="adm-chip__label">Iterations</span>
                      {!isEditing ? (
                        <span className="adm-chip__val">{selectedItem.iterations}</span>
                      ) : (
                        <input name="iterations" value={editFormData.iterations} onChange={handleInputChange} className="adm-chip__input" />
                      )}
                    </div>
                  )}
                </div>

                {/* Text fields */}
                {(selectedItem.goal || isEditing) && (
                  <div className="adm-mfield">
                    <span className="adm-mfield__label">Goal</span>
                    {!isEditing ? (
                      <p className="adm-mfield__text">{selectedItem.goal}</p>
                    ) : (
                      <textarea name="goal" value={editFormData.goal} onChange={handleInputChange}
                        className="adm-mfield__textarea" rows="3" />
                    )}
                  </div>
                )}
                {(selectedItem.outcomes || isEditing) && (
                  <div className="adm-mfield">
                    <span className="adm-mfield__label">Outcomes</span>
                    {!isEditing ? (
                      <p className="adm-mfield__text">{selectedItem.outcomes}</p>
                    ) : (
                      <textarea name="outcomes" value={editFormData.outcomes} onChange={handleInputChange}
                        className="adm-mfield__textarea" rows="3" />
                    )}
                  </div>
                )}
                {(selectedItem.features || isEditing) && (
                  <div className="adm-mfield">
                    <span className="adm-mfield__label">Features</span>
                    {!isEditing ? (
                      featureList.length > 0 ? (
                        <div className="adm-feature-chips">
                          {featureList.map((f, i) => (
                            <span key={i} className="adm-feature-chip"
                              style={{ background: rc.colorLight, color: rc.color }}>{f}</span>
                          ))}
                        </div>
                      ) : (
                        <p className="adm-mfield__text">{selectedItem.features}</p>
                      )
                    ) : (
                      <textarea name="features" value={editFormData.features} onChange={handleInputChange}
                        className="adm-mfield__textarea" rows="3"
                        placeholder="Live Sessions, Mentorship, Certification" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminMarketplace;