import React, { useState, useEffect } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Single color palette for all boxes (as requested)
const UNIFIED_COLOR = {
  color: "#4f46e5",
  bg: "#eef2ff",
  gradient: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
  emoji: "🏛",
};

const getRoleConf = () => UNIFIED_COLOR;

const formatPrice = (cost) => {
  if (!cost) return "Free";
  return cost.toString();
};

const formatRole = (role) => {
  if (!role) return "UNKNOWN";
  return role.toUpperCase();
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

  return (
    <div className="admin-marketplace">
      <div className="mp-header">
        <h1>Marketplace</h1>
        {!loading && (
          <span className="item-count">
            {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

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

      {loading ? (
        <div className="mp-grid">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div className="mp-card skeleton" key={i}>
                <div className="card-top">
                  <Skeleton circle width={40} height={40} />
                  <Skeleton
                    height={18}
                    width="60%"
                    style={{ marginLeft: 10 }}
                  />
                </div>
                <div className="card-body">
                  <Skeleton height={14} count={4} style={{ marginTop: 8 }} />
                  <Skeleton
                    height={40}
                    style={{ marginTop: 16, borderRadius: 30 }}
                  />
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="mp-grid">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const rc = getRoleConf();
              return (
                <div
                  className="mp-card"
                  key={item._id}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="card-top">
                    <div className="card-top-left">
                      <div className="avatar" style={{ background: rc.bg }}>
                        {rc.emoji}
                      </div>
                      <div className="card-name">{item.name || "Untitled"}</div>
                    </div>
                    {item.duration && (
                      <div className="price-badge price-yellow">
                        {item.duration}
                      </div>
                    )}
                  </div>

                  <div className="card-divider" />

                  <div className="card-body">
                    <div className="role-row">
                      <div
                        className="role-dot"
                        style={{ background: rc.color }}
                      />
                      <div
                        className="role-label"
                        style={{ color: rc.color }}
                      >
                        {formatRole(item.role)}
                      </div>
                      {item.layer && (
                        <div className="layer-chip">{item.layer}</div>
                      )}
                    </div>

                    {item.goal && (
                      <div className="goal-row">
                        <span className="goal-label">Goal</span>
                        <span className="goal-val">{item.goal}</span>
                      </div>
                    )}

                    {item.features && (
                      <div className="card-features">{item.features}</div>
                    )}

                    <div className="card-footer">
                      <div
                        className="partner-email"
                        title={item.partner_email}
                      >
                        {item.partner_email || "—"}
                      </div>
                    </div>

                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(item);
                      }}
                    >
                      View Details
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

      {/* Details Modal */}
      {selectedItem && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedItem(null);
            setIsEditing(false);
          }}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const rc = getRoleConf();
              const featureList = parseFeatures(selectedItem.features);
              return (
                <>
                  {/* Gradient Header - Unified Color */}
                  <div
                    className="modal-head"
                    style={{ background: rc.gradient }}
                  >
                    <div className="modal-head-left">
                      {/* Just logo icon, no background */}
                      <div className="modal-avatar">{rc.emoji}</div>
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
                                    {new Date(
                                      selectedItem.createdAt
                                    ).toLocaleDateString("en-IN", {
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
                      <div className="role-badge">{formatRole(selectedItem.role)}</div>
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

                  {/* Scrollable body */}
                  <div className="modal-scroll-area">
                    <div className="modal-body">
                      {/* Access & Pricing */}
                      <div className="section-header">
                        <span className="section-icon">💰</span>
                        <span className="section-title">Access & Pricing</span>
                        <span className="field-count">3 fields</span>
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
                      <div className="detail-grid" style={{ marginBottom: 24 }}>
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
                        <div className="d-item">
                          <div className="d-label">GOAL</div>
                          <div className="d-val">
                            {!isEditing ? (
                              selectedItem.goal || "—"
                            ) : (
                              <input
                                type="text"
                                name="goal"
                                value={editFormData.goal}
                                onChange={handleInputChange}
                                className="edit-input"
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
                                    <span key={i} className="feature-chip">
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
                        <div className="d-item wide">
                          <div className="d-label">PARTNER EMAIL</div>
                          <div className="d-val email">
                            {!isEditing ? (
                              selectedItem.partner_email || "Unknown"
                            ) : (
                              <input
                                type="email"
                                name="partner_email"
                                value={editFormData.partner_email}
                                onChange={handleInputChange}
                                className="edit-input"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer - No sticky, just natural flow */}
                    <div className="modal-foot">
                      {!isEditing ? (
                        <button
                          className="edit-btn"
                          onClick={() => handleEditClick(selectedItem)}
                        >
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