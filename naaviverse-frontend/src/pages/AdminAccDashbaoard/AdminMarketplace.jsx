import React, { useState, useEffect } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Premium icons (no emojis)
const PARTNER_ICONS = {
  institution: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 21H21M5 21V7L12 3L19 7V21M9 21V13H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  mentor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C14.7614 15 17 12.7614 17 10C17 7.23858 14.7614 5 12 5C9.23858 5 7 7.23858 7 10C7 12.7614 9.23858 15 12 15Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3 20.5C4.5 17.5 7.5 16 12 16C16.5 16 19.5 17.5 21 20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  distributor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M8 6L12 3L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="8" y="15" width="2" height="2" fill="currentColor"/>
      <rect x="14" y="15" width="2" height="2" fill="currentColor"/>
    </svg>
  ),
  vendor: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 7L3 12L6 17H18L21 12L18 7H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="8" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="16" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  ),
};

// Theme colors - soft gradients, no dark/black
const THEMES = {
  institution: {
    color: "#0F3B3C",
    bg: "#E6F7F5",
    gradient: "linear-gradient(135deg, #f0f9f6, #e6f2ef)",
    icon: PARTNER_ICONS.institution,
  },
  mentor: {
    color: "#4A2E1B",
    bg: "#FDF4E3",
    gradient: "linear-gradient(135deg, #fef7e8, #f5ede0)",
    icon: PARTNER_ICONS.mentor,
  },
  distributor: {
    color: "#1E4A6D",
    bg: "#EAF4FC",
    gradient: "linear-gradient(135deg, #eff5fa, #e5edf5)",
    icon: PARTNER_ICONS.distributor,
  },
  vendor: {
    color: "#5A2A4A",
    bg: "#FDF0F6",
    gradient: "linear-gradient(135deg, #fdf2f7, #f5eaf0)",
    icon: PARTNER_ICONS.vendor,
  },
};

const formatPrice = (cost) => {
  if (!cost || cost === "0") return "Free";
  return `$${cost}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const parseFeatures = (features) => {
  if (!features) return [];
  return features
    .split(/[,;]+/)
    .map((f) => f.trim())
    .filter(Boolean);
};

const AdminMarketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerType, setPartnerType] = useState("all");
  const [emailSearch, setEmailSearch] = useState("");
  const [titleSearch, setTitleSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    access: "",
    cost: "",
    discount: "",
    layer: "",
    duration: "",
    goal: "",
    features: "",
    outcomes: "",
    iterations: "",
    partner_email: "",
  });

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/marketplace/admin/get-all`
      );
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
      name: item.name || "",
      access: item.access || "",
      cost: item.cost || "",
      discount: item.discount || "",
      layer: item.layer || "",
      duration: item.duration || "",
      goal: item.goal || "",
      features: item.features || "",
      outcomes: item.outcomes || "",
      iterations: item.iterations || "",
      partner_email: item.partner_email || "",
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
        setItems((prev) =>
          prev.map((item) =>
            item._id === selectedItem._id ? updatedItem : item
          )
        );
        setSelectedItem(updatedItem);
        setIsEditing(false);
      } else {
        toast.error(response.data?.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(
        error.response?.data?.message || "Error updating item. Please try again."
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditFormData({});
  };

  const filteredItems = items.filter((item) => {
    const roleMatch =
      partnerType === "all" ||
      item.role?.toLowerCase() === partnerType.toLowerCase();
    const emailMatch =
      emailSearch === "" ||
      item.partner_email?.toLowerCase().includes(emailSearch.toLowerCase());
    const titleMatch =
      titleSearch === "" ||
      item.name?.toLowerCase().includes(titleSearch.toLowerCase());
    return roleMatch && emailMatch && titleMatch;
  });

  const totalItems = filteredItems.length;
  const freeItems = filteredItems.filter(
    (i) => !i.cost || i.cost === "0"
  ).length;
  const paidItems = totalItems - freeItems;
  const uniquePartners = new Set(
    filteredItems.map((i) => i.partner_email).filter(Boolean)
  ).size;

  return (
    <div className="admin-marketplace">
      {/* Hero Section - Reduced Size, Soft Colors */}
  {/* Hero Section - Green transparent effect */}
<div className="mp-hero">
  <div className="hero-stats">
    <div className="stat-card">
      <span className="stat-value">{totalItems}</span>
      <span className="stat-label">Total Listings</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{paidItems}</span>
      <span className="stat-label">Paid</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{freeItems}</span>
      <span className="stat-label">Free</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{uniquePartners}</span>
      <span className="stat-label">Partners</span>
    </div>
  </div>
  <div className="hero-content">
    <h1>Marketplace Overview</h1>
    <p>Browse, manage, and update partner offerings</p>
  </div>
</div>

      {/* Filters */}
      <div className="mp-filters">
        <div className="filter-group">
          <label>PARTNER TYPE</label>
          <select
            value={partnerType}
            onChange={(e) => setPartnerType(e.target.value)}
          >
            <option value="all">All Partners</option>
            <option value="institution">Institutions</option>
            <option value="mentor">Mentors</option>
            <option value="distributor">Distributors</option>
            <option value="vendor">Vendors</option>
          </select>
        </div>
        <div className="filter-group">
          <label>SEARCH BY EMAIL</label>
          <input
            type="text"
            placeholder="partner@example.com"
            value={emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>SEARCH BY NAME</label>
          <input
            type="text"
            placeholder="Course or service name..."
            value={titleSearch}
            onChange={(e) => setTitleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Cards Grid - 3 per row */}
      {loading ? (
        <div className="mp-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div className="mp-card skeleton" key={i}>
                <div className="card-top">
                  <Skeleton circle width={40} height={40} />
                  <Skeleton height={18} width="60%" style={{ marginLeft: 10 }} />
                </div>
                <div className="card-body">
                  <Skeleton height={14} count={4} style={{ marginTop: 8 }} />
                  <Skeleton height={40} style={{ marginTop: 16, borderRadius: 30 }} />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mp-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const theme = THEMES[item.role] || THEMES.institution;
              const featureList = parseFeatures(item.features);
              return (
                <div
                  className="mp-card"
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                  style={{ borderTop: `3px solid ${theme.color}` }}
                >
                  <div className="card-top">
                    <div className="card-top-left">
                      <div className="avatar" style={{ background: theme.bg, color: theme.color }}>
                        {theme.icon}
                      </div>
                      <div className="card-name">{item.name || "Untitled"}</div>
                    </div>
                    {item.duration && (
                      <div className="price-badge price-yellow">{item.duration}</div>
                    )}
                  </div>

                  <div className="card-divider" />

                  <div className="card-body">
                    <div className="role-row">
                      <div className="role-dot" style={{ background: theme.color }} />
                      <div className="role-label" style={{ color: theme.color }}>
                        {item.role?.toUpperCase() || "UNKNOWN"}
                      </div>
                      {item.layer && <div className="layer-chip">{item.layer}</div>}
                    </div>
{/* 
                    {item.goal && (
                      <div className="goal-row">
                        <span className="goal-label">Goal</span>
                        <span className="goal-val">{item.goal}</span>
                      </div>
                    )} */}

                    {/* {item.features && <div className="card-features">{item.features}</div>} */}

                    <div className="card-footer">
                      <div className="partner-email" title={item.partner_email}>
                        {item.partner_email || "—"}
                      </div>
                    </div>

                    <button className="view-btn" onClick={(e) => {
    e.stopPropagation();
    setSelectedItem(item);
  }}>
    View →
  </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-items">
              <h3>No items found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Details Modal - Reduced Header Height */}
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedItem(null);
            setIsEditing(false);
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const theme = THEMES[selectedItem.role] || THEMES.institution;
              const featureList = parseFeatures(selectedItem.features);
              return (
                <>
                  {/* Modal Header - REDUCED HEIGHT */}
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
                                  <span>
                                    {new Date(selectedItem.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
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
                      <button
                        className="modal-close"
                        onClick={() => {
                          setSelectedItem(null);
                          setIsEditing(false);
                        }}
                      >
                        ×
                      </button>
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
                          <tr>
                            <th>ACCESS</th>
                            <th>PRICE</th>
                            <th>DISCOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="highlight">
                              {!isEditing ? (
                                selectedItem.access || "Free"
                              ) : (
                                <input
                                  type="text"
                                  name="access"
                                  value={editFormData.access}
                                  onChange={handleInputChange}
                                  className="edit-input"
                                />
                              )}
                            </td>
                            <td className="highlight">
                              {!isEditing ? (
                                formatPrice(selectedItem.cost)
                              ) : (
                                <input
                                  type="text"
                                  name="cost"
                                  value={editFormData.cost}
                                  onChange={handleInputChange}
                                  className="edit-input"
                                />
                              )}
                            </td>
                            <td className="discount-val">
                              {!isEditing ? (
                                selectedItem.discount || "Not Applicable"
                              ) : (
                                <input
                                  type="text"
                                  name="discount"
                                  value={editFormData.discount}
                                  onChange={handleInputChange}
                                  className="edit-input"
                                />
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
                          <div className="d-label">LAYER</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.layer || "Foundation"
                            ) : (
                              <select
                                name="layer"
                                value={editFormData.layer}
                                onChange={handleInputChange}
                                className="edit-select"
                              >
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
                          <div className="d-label">DURATION</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.duration || "—"
                            ) : (
                              <input
                                type="text"
                                name="duration"
                                value={editFormData.duration}
                                onChange={handleInputChange}
                                className="edit-input"
                              />
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
                          <div className="d-label">GOAL</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.goal || "—"
                            ) : (
                              <textarea
                                name="goal"
                                value={editFormData.goal}
                                onChange={handleInputChange}
                                className="edit-textarea"
                                rows="3"
                              />
                            )}
                          </div>
                        </div>
                        <div className="d-item">
                          <div className="d-label">ITERATIONS</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.iterations || "—"
                            ) : (
                              <input
                                type="text"
                                name="iterations"
                                value={editFormData.iterations}
                                onChange={handleInputChange}
                                className="edit-input"
                              />
                            )}
                          </div>
                        </div>
                        <div className="d-item wide">
                          <div className="d-label">OUTCOMES</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.outcomes || "—"
                            ) : (
                              <textarea
                                name="outcomes"
                                value={editFormData.outcomes}
                                onChange={handleInputChange}
                                className="edit-textarea"
                                rows="3"
                              />
                            )}
                          </div>
                        </div>
                        <div className="d-item wide">
                          <div className="d-label">FEATURES</div>
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
                              ) : (
                                selectedItem.features || "—"
                              )
                            ) : (
                              <textarea
                                name="features"
                                value={editFormData.features}
                                onChange={handleInputChange}
                                className="edit-textarea"
                                rows="3"
                                placeholder="Live Sessions, Mentorship, Certification, Self-paced"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-foot">
                      {!isEditing ? (
                        <button className="edit-btn" onClick={() => handleEditClick(selectedItem)}>
                          Edit
                        </button>
                      ) : (
                        <>
                          <button className="cancel-btn" onClick={handleCancel}>
                            Cancel
                          </button>
                          <button className="save-btn" onClick={handleSave}>
                            Save Changes
                          </button>
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