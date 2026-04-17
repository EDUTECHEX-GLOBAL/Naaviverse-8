import React, { useState, useEffect } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const roleConfig = {
  institution: { color: "#7c3aed", bg: "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(124,58,237,0.02))", emoji: "🏛" },
  mentor: { color: "#0891b2", bg: "linear-gradient(135deg, rgba(8,145,178,0.08), rgba(8,145,178,0.02))", emoji: "👤" },
  distributor: { color: "#d97706", bg: "linear-gradient(135deg, rgba(217,119,6,0.08), rgba(217,119,6,0.02))", emoji: "📦" },
  vendor: { color: "#dc2626", bg: "linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.02))", emoji: "🛍" },
};

const getRoleConf = (role) =>
  roleConfig[role?.toLowerCase()] || { color: "#64748b", bg: "linear-gradient(135deg, rgba(100,116,139,0.08), rgba(100,116,139,0.02))", emoji: "❓" };

const formatPrice = (cost) => {
  if (!cost) return "Price not set";
  return cost.toString();
};

const formatRole = (role) => {
  if (!role) return "UNKNOWN";
  return role.toUpperCase();
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
    partner_email: ""
  });

  useEffect(() => {
    fetchMarketplaceItems();
  }, []);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/marketplace/admin/get-all`);
      if (response.data?.status) {
        setItems(response.data.data || []);
        if (response.data.data.length === 0) toast.info("No marketplace items available");
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
      partner_email: item.partner_email || ""
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
        setItems(prevItems => 
          prevItems.map(item => 
            item._id === selectedItem._id 
              ? updatedItem
              : item
          )
        );
        setSelectedItem(updatedItem);
        setIsEditing(false);
      } else {
        toast.error(response.data?.message || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      if (error.response?.status === 404) {
        toast.error("Update endpoint not found. Please check server configuration.");
      } else if (error.response?.status === 400) {
        toast.error(error.response.data?.message || "Invalid data provided");
      } else {
        toast.error(error.response?.data?.message || "Error updating item. Please try again.");
      }
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
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

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

      {loading ? (
        <div className="mp-grid">
          {Array(6).fill(0).map((_, i) => (
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
              const rc = getRoleConf(item.role);
              return (
                <div className="mp-card" key={item._id} onClick={() => setSelectedItem(item)}>
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
                      <div className="role-dot" style={{ background: rc.color }} />
                      <div className="role-label" style={{ color: rc.color }}>
                        {formatRole(item.role)}
                      </div>
                      {item.layer && <div className="layer-chip">{item.layer}</div>}
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
                      <div className="partner-email" title={item.partner_email}>
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
        <div className="modal-overlay" onClick={() => {
          setSelectedItem(null);
          setIsEditing(false);
        }}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const rc = getRoleConf(selectedItem.role);
              return (
                <>
                  <div className="modal-head">
                    <div className="modal-head-left">
                      <div className="modal-avatar" style={{ background: rc.bg }}>
                        {rc.emoji}
                      </div>
                      <div className="modal-title-wrapper">
                        {!isEditing ? (
                          <h2>{selectedItem.name || "Item Details"}</h2>
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
                    <button className="modal-close" onClick={() => {
                      setSelectedItem(null);
                      setIsEditing(false);
                    }}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    <div className="section-title">Access &amp; Pricing</div>
                    <table className="access-table">
                      <thead>
                        <tr>
                          <th>Access</th>
                          <th>Price</th>
                          {selectedItem.discount && <th>Discount</th>}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="highlight">
                            {!isEditing ? (
                              selectedItem.access || "—"
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
                          {selectedItem.discount && (
                            <td className="discount-val">
                              {!isEditing ? (
                                selectedItem.discount
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
                          )}
                        </tr>
                      </tbody>
                    </table>

                    <div className="section-title">Source</div>
                    <div className="detail-grid" style={{ marginBottom: 20 }}>
                      <div className="d-item">
                        <div className="d-label">Layer</div>
                        <div className="d-val">
                          {!isEditing ? (
                            selectedItem.layer || "Not specified"
                          ) : (
                            <input
                              type="text"
                              name="layer"
                              value={editFormData.layer}
                              onChange={handleInputChange}
                              className="edit-input"
                            />
                          )}
                        </div>
                      </div>
                      <div className="d-item">
                        <div className="d-label">Duration</div>
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

                    <div className="section-title">Details</div>
                    <div className="detail-grid">
                      <div className="d-item">
                        <div className="d-label">Goal</div>
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
                        <div className="d-label">Created</div>
                        <div className="d-val">
                          {new Date(selectedItem.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="d-item">
                        <div className="d-label">Iterations</div>
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
                        <div className="d-label">Outcomes</div>
                        <div className="d-val">
                          {!isEditing ? (
                            selectedItem.outcomes || "—"
                          ) : (
                            <textarea
                              name="outcomes"
                              value={editFormData.outcomes}
                              onChange={handleInputChange}
                              className="edit-textarea"
                              rows="2"
                            />
                          )}
                        </div>
                      </div>
                      <div className="d-item wide">
                        <div className="d-label">Features</div>
                        <div className="d-val">
                          {!isEditing ? (
                            selectedItem.features || "—"
                          ) : (
                            <textarea
                              name="features"
                              value={editFormData.features}
                              onChange={handleInputChange}
                              className="edit-textarea"
                              rows="2"
                            />
                          )}
                        </div>
                      </div>
                      <div className="d-item wide">
                        <div className="d-label">Partner Email</div>
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