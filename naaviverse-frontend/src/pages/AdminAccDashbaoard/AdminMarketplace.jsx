import React, { useState, useEffect } from "react";
import "./AdminMarketplace.scss";
import Skeleton from "react-loading-skeleton";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const roleConfig = {
  institution: { color: "#7c3aed", bg: "#ede9fe", emoji: "🏛" },
  mentor:       { color: "#0891b2", bg: "#cffafe", emoji: "👤" },
  distributor:  { color: "#d97706", bg: "#fef3c7", emoji: "📦" },
  vendor:       { color: "#dc2626", bg: "#fee2e2", emoji: "🛍" },
};

const getRoleConf = (role) =>
  roleConfig[role?.toLowerCase()] || { color: "#64748b", bg: "#f1f5f9", emoji: "❓" };

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

  const isSubscriptionPrice = (cost) =>
    cost?.toLowerCase().includes("subscription") ||
    cost?.toLowerCase().includes("covered");

  return (
    <div className="admin-marketplace">
      {/* Header */}
      <div className="mp-header">
        <h1>Marketplace</h1>
        {!loading && (
          <span className="item-count">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* Filters */}
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

      {/* Grid */}
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
              const isSub = isSubscriptionPrice(item.cost);
              return (
                <div className="mp-card" key={item._id} onClick={() => setSelectedItem(item)}>
                  {/* Card Top */}
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

                  {/* Card Body */}
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
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
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
                      <div>
                        <h2>{selectedItem.name || "Item Details"}</h2>
                      </div>
                    </div>
                    <button className="modal-close" onClick={() => setSelectedItem(null)}>
                      ×
                    </button>
                  </div>

                  <div className="modal-body">
                    {/* Access & Pricing */}
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
                          <td className="highlight">{selectedItem.access || "—"}</td>
                          <td className="highlight">{formatPrice(selectedItem.cost)}</td>
                          {selectedItem.discount && (
                            <td className="discount-val">{selectedItem.discount}</td>
                          )}
                        </tr>
                      </tbody>
                    </table>

                    {/* Source */}
                    <div className="section-title">Source</div>
                    <div className="detail-grid" style={{ marginBottom: 20 }}>
                      <div className="d-item">
                        <div className="d-label">Layer</div>
                        <div className="d-val">{selectedItem.layer || "Not specified"}</div>
                      </div>
                      <div className="d-item">
                        <div className="d-label">Duration</div>
                        <div className="d-val">{selectedItem.duration || "—"}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="section-title">Details</div>
                    <div className="detail-grid">
                      <div className="d-item">
                        <div className="d-label">Goal</div>
                        <div className="d-val">{selectedItem.goal || "—"}</div>
                      </div>
                      <div className="d-item">
                        <div className="d-label">Created</div>
                        <div className="d-val">
                          {new Date(selectedItem.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </div>
                      </div>
                      {selectedItem.iterations && (
                        <div className="d-item">
                          <div className="d-label">Iterations</div>
                          <div className="d-val">{selectedItem.iterations}</div>
                        </div>
                      )}
                      {selectedItem.outcomes && (
                        <div className="d-item wide">
                          <div className="d-label">Outcomes</div>
                          <div className="d-val">{selectedItem.outcomes}</div>
                        </div>
                      )}
                      {selectedItem.features && (
                        <div className="d-item wide">
                          <div className="d-label">Features</div>
                          <div className="d-val">{selectedItem.features}</div>
                        </div>
                      )}
                      <div className="d-item wide">
                        <div className="d-label">Partner Email</div>
                        <div className="d-val email">{selectedItem.partner_email || "Unknown"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="modal-foot">
                    <button onClick={() => setSelectedItem(null)}>Close</button>
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