import React, { useState, useEffect } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PARTNER_ICONS = {
  institution: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V13H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  mentor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M12 15C14.7614 15 17 12.7614 17 10C17 7.23858 14.7614 5 12 5C9.23858 5 7 7.23858 7 10C7 12.7614 9.23858 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 20.5C4.5 17.5 7.5 16 12 16C16.5 16 19.5 17.5 21 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  distributor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 6L12 3L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="8" y="15" width="2" height="2" fill="currentColor"/>
      <rect x="14" y="15" width="2" height="2" fill="currentColor"/>
    </svg>
  ),
  vendor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M6 7L3 12L6 17H18L21 12L18 7H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
};

const THEMES = {
  institution: {
    color: "#0d6b6e",
    bg: "#e6f7f5",
    gradient: "linear-gradient(135deg, #f0f9f6, #e6f2ef)",
    icon: PARTNER_ICONS.institution,
  },
  mentor: {
    color: "#b45309",
    bg: "#fffbeb",
    gradient: "linear-gradient(135deg, #fef7e8, #f5ede0)",
    icon: PARTNER_ICONS.mentor,
  },
  distributor: {
    color: "#1d4ed8",
    bg: "#eff6ff",
    gradient: "linear-gradient(135deg, #eff5fa, #e5edf5)",
    icon: PARTNER_ICONS.distributor,
  },
  vendor: {
    color: "#7c3aed",
    bg: "#f5f3ff",
    gradient: "linear-gradient(135deg, #fdf2f7, #f5eaf0)",
    icon: PARTNER_ICONS.vendor,
  },
};

const formatPrice = (cost) => (!cost || cost === "0" ? "Free" : `$${cost}`);

const parseFeatures = (features) => {
  if (!features) return [];
  return features.split(/[,;]+/).map((f) => f.trim()).filter(Boolean);
};

const EmailIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const AdminMarketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerType, setPartnerType] = useState("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "", access: "", cost: "", discount: "", layer: "",
    duration: "", goal: "", features: "", outcomes: "",
    iterations: "", partner_email: "",
  });

  useEffect(() => { fetchMarketplaceItems(); }, []);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/marketplace/admin/get-all`);
      if (response.data?.status) {
        setItems(response.data.data || []);
      } else {
        setItems([]);
        toast.error("Failed to load marketplace items");
      }
    } catch (error) {
      console.error("Error fetching marketplace:", error);
      toast.error("Error loading marketplace items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item) => {
    setIsEditing(true);
    setEditFormData({
      name: item.name || "", access: item.access || "", cost: item.cost || "",
      discount: item.discount || "", layer: item.layer || "",
      duration: item.duration || "", goal: item.goal || "",
      features: item.features || "", outcomes: item.outcomes || "",
      iterations: item.iterations || "", partner_email: item.partner_email || "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/marketplace/admin/update/${selectedItem._id}`,
        editFormData
      );
      if (response.data?.status) {
        toast.success("Item updated successfully!");
        const updatedItem = response.data.data;
        setItems((prev) => prev.map((item) => item._id === selectedItem._id ? updatedItem : item));
        setSelectedItem(updatedItem);
        setIsEditing(false);
      } else {
        toast.error(response.data?.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.response?.data?.message || "Error updating item.");
    }
  };

  const handleCancel = () => { setIsEditing(false); setEditFormData({}); };

  const filteredItems = items.filter((item) => {
    const roleMatch = partnerType === "all" || item.role?.toLowerCase() === partnerType.toLowerCase();
    const emailMatch = emailSearch === "" || item.partner_email?.toLowerCase().includes(emailSearch.toLowerCase());
    const titleMatch = titleSearch === "" || item.name?.toLowerCase().includes(titleSearch.toLowerCase());
    return roleMatch && emailMatch && titleMatch;
  });

  const totalItems    = filteredItems.length;
  const freeItems     = filteredItems.filter((i) => !i.cost || i.cost === "0").length;
  const paidItems     = totalItems - freeItems;
  const uniquePartners = new Set(filteredItems.map((i) => i.partner_email).filter(Boolean)).size;

  return (
    <div className="admin-marketplace">

      {/* ── Hero ── */}
      <div className="mp-hero">
        <div className="hero-content">
          <h1>Marketplace</h1>
          <p>Browse, manage and update partner offerings</p>
        </div>
        <div className="hero-stats">
          {[
            { value: totalItems,      label: "Listings" },
            { value: paidItems,       label: "Paid" },
            { value: freeItems,       label: "Free" },
            { value: uniquePartners,  label: "Partners" },
          ].map(({ value, label }) => (
            <div className="stat-card" key={label}>
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mp-filters">
        <div className="filter-group">
          <label>Partner Type</label>
          <select value={partnerType} onChange={(e) => setPartnerType(e.target.value)}>
            <option value="all">All Partners</option>
            <option value="institution">Institutions</option>
            <option value="mentor">Mentors</option>
            <option value="distributor">Distributors</option>
            <option value="vendor">Vendors</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Search by Email</label>
          <input
            type="text"
            placeholder="partner@example.com"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Search by Name</label>
          <input
            type="text"
            placeholder="Course or service name..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="mp-section-label">
        {loading ? "Loading…" : `${filteredItems.length} listing${filteredItems.length !== 1 ? "s" : ""}`}
      </div>

      {loading ? (
        <div className="mp-grid">
          {Array(6).fill(0).map((_, i) => (
            <div className="mp-card skeleton" key={i}>
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <Skeleton circle width={42} height={42} />
                  <Skeleton height={18} width="60%" style={{ marginTop: 6 }} />
                </div>
                <Skeleton height={1} style={{ marginBottom: 12 }} />
                <Skeleton height={14} width="40%" style={{ marginBottom: 10 }} />
                <Skeleton height={36} style={{ borderRadius: 30 }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mp-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const theme = THEMES[item.role] || THEMES.institution;
              return (
                <div
                  className="mp-card"
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  style={{ borderTop: `3px solid ${theme.color}` }}
                >
                  {/* Top */}
                  <div className="card-top">
                    <div className="card-top-left">
                      <div className="avatar" style={{ background: theme.bg, color: theme.color }}>
                        {theme.icon}
                      </div>
                      <div className="card-name">{item.name || "Untitled"}</div>
                    </div>
                    {item.duration && (
                      <div className="price-badge">{item.duration}</div>
                    )}
                  </div>

                  <div className="card-divider" />

                  {/* Body */}
                  <div className="card-body">
                    <div className="role-row">
                      <div className="role-dot" style={{ background: theme.color }} />
                      <div className="role-label" style={{ color: theme.color }}>
                        {item.role?.toUpperCase() || "UNKNOWN"}
                      </div>
                      {item.layer && <div className="layer-chip">{item.layer}</div>}
                    </div>

                    <div className="card-footer">
                      <span className="email-icon"><EmailIcon /></span>
                      <div className="partner-email" title={item.partner_email}>
                        {item.partner_email || "—"}
                      </div>
                    </div>

                    <button
                      className="view-btn"
                      onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-items">
              <div className="no-items-icon">📦</div>
              <h3>No listings found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* ── Modal ── */}
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => { setSelectedItem(null); setIsEditing(false); }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const theme = THEMES[selectedItem.role] || THEMES.institution;
              const featureList = parseFeatures(selectedItem.features);
              return (
                <>
                  <div className="modal-head" style={{ background: theme.gradient }}>
                    <div className="modal-head-left">
                      <div className="modal-avatar" style={{ background: theme.bg, color: theme.color }}>
                        {theme.icon}
                      </div>
                      <div className="modal-title-wrapper">
                        {!isEditing ? (
                          <>
                            <h2>{selectedItem.name || "Item Details"}</h2>
                            <div className="modal-meta">
                              <span>{selectedItem.partner_email || "—"}</span>
                              {selectedItem.createdAt && (
                                <>
                                  <span className="meta-dot">·</span>
                                  <span>{new Date(selectedItem.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                                </>
                              )}
                            </div>
                          </>
                        ) : (
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleInputChange}
                            className="edit-input-title"
                            placeholder="Item Name"
                          />
                        )}
                      </div>
                    </div>
                    <div className="modal-head-right">
                      <div className="role-badge" style={{ background: theme.bg, color: theme.color }}>
                        {selectedItem.role?.toUpperCase() || "UNKNOWN"}
                      </div>
                      <button className="modal-close" onClick={() => { setSelectedItem(null); setIsEditing(false); }}>×</button>
                    </div>
                  </div>

                  <div className="modal-scroll-area">
                    <div className="modal-body">

                      {/* Access & Pricing */}
                      <div className="section-header">
                        <span className="section-icon">💰</span>
                        <span className="section-title">Access & Pricing</span>
                      </div>
                      <table className="access-table">
                        <thead>
                          <tr><th>ACCESS</th><th>PRICE</th><th>DISCOUNT</th></tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="highlight">
                              {!isEditing ? selectedItem.access || "Free" : (
                                <input type="text" name="access" value={editFormData.access} onChange={handleInputChange} className="edit-input" />
                              )}
                            </td>
                            <td className="highlight">
                              {!isEditing ? formatPrice(selectedItem.cost) : (
                                <input type="text" name="cost" value={editFormData.cost} onChange={handleInputChange} className="edit-input" />
                              )}
                            </td>
                            <td className="discount-val">
                              {!isEditing ? selectedItem.discount || "N/A" : (
                                <input type="text" name="discount" value={editFormData.discount} onChange={handleInputChange} className="edit-input" />
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Source */}
                      <div className="section-header">
                        <span className="section-icon">📌</span>
                        <span className="section-title">Source</span>
                      </div>
                      <div className="detail-grid">
                        <div className="d-item">
                          <div className="d-label">Layer</div>
                          <div className="d-val">
                            {!isEditing ? selectedItem.layer || "Foundation" : (
                              <select name="layer" value={editFormData.layer} onChange={handleInputChange} className="edit-select">
                                <option value="">Select Layer</option>
                                <option value="Foundation">Foundation</option>
                                <option value="macro">Macro</option>
                                <option value="micro">Micro</option>
                                <option value="nano">Nano</option>
                              </select>
                            )}
                          </div>
                        </div>
                        <div className="d-item">
                          <div className="d-label">Duration</div>
                          <div className="d-val">
                            {!isEditing ? selectedItem.duration || "—" : (
                              <input type="text" name="duration" value={editFormData.duration} onChange={handleInputChange} className="edit-input" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="section-header">
                        <span className="section-icon">📋</span>
                        <span className="section-title">Details</span>
                      </div>
                      <div className="detail-grid">
                        <div className="d-item wide">
                          <div className="d-label">Goal</div>
                          <div className="d-val">
                            {!isEditing ? selectedItem.goal || "—" : (
                              <textarea name="goal" value={editFormData.goal} onChange={handleInputChange} className="edit-textarea" rows="3" />
                            )}
                          </div>
                        </div>
                        <div className="d-item">
                          <div className="d-label">Iterations</div>
                          <div className="d-val">
                            {!isEditing ? selectedItem.iterations || "—" : (
                              <input type="text" name="iterations" value={editFormData.iterations} onChange={handleInputChange} className="edit-input" />
                            )}
                          </div>
                        </div>
                        <div className="d-item wide">
                          <div className="d-label">Outcomes</div>
                          <div className="d-val">
                            {!isEditing ? selectedItem.outcomes || "—" : (
                              <textarea name="outcomes" value={editFormData.outcomes} onChange={handleInputChange} className="edit-textarea" rows="3" />
                            )}
                          </div>
                        </div>
                        <div className="d-item wide">
                          <div className="d-label">Features</div>
                          <div className="d-val">
                            {!isEditing ? (
                              featureList.length > 0 ? (
                                <div className="feature-chips">
                                  {featureList.map((f, i) => (
                                    <span key={i} className="feature-chip" style={{ background: theme.bg, color: theme.color }}>
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              ) : (selectedItem.features || "—")
                            ) : (
                              <textarea name="features" value={editFormData.features} onChange={handleInputChange} className="edit-textarea" rows="3" placeholder="Live Sessions, Mentorship, Certification" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-foot">
                      {!isEditing ? (
                        <button className="edit-btn" onClick={() => handleEditClick(selectedItem)}>Edit</button>
                      ) : (
                        <>
                          <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
                          <button className="save-btn" onClick={handleSave}>Save Changes</button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketplace;