import React, { useState, useEffect } from "react";
import "./Marketplace.scss";
import Skeleton from "react-loading-skeleton";
import closepop from "../../static/images/dashboard/closepop.svg";
import axios from "axios";

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
  if (!cost) return "Free";
  return cost.toString();
};

const formatRole = (role) => {
  if (!role) return "UNKNOWN";
  return role.toUpperCase();
};

const getBillingInfo = (billing_cycle = {}) => {
  if (billing_cycle?.monthly?.price  !== undefined) return { price: billing_cycle.monthly.price };
  if (billing_cycle?.annual?.price   !== undefined) return { price: billing_cycle.annual.price };
  if (billing_cycle?.lifetime?.price !== undefined) return { price: billing_cycle.lifetime.price };
  return { price: 0 };
};

const Marketplace = ({ search = "", selectedRole = "all", onRoleChange, onSearchChange }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(selectedRole || "all");
  const [localSearch, setLocalSearch] = useState(search || "");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { fetchMarketplaceItems(); }, []);
  useEffect(() => { setLocalSearch(search); }, [search]);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const userDetails = JSON.parse(localStorage.getItem("partner")) || {};
      const email = userDetails?.email || userDetails?.user?.email;
      if (!email) { setLoading(false); return; }

      const [servicesRes, stepsRes, marketplaceRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/services/getservices`, { params: { productcreatoremail: email } }),
        axios.get(`${BASE_URL}/api/steps/partner`, { params: { email } }),
        // ✅ FIX: was /api/marketplace/get (404 — doesn't exist)
        //         correct endpoint is /api/marketplace/admin/get-all
        axios.get(`${BASE_URL}/api/marketplace/admin/get-all`),
      ]);

      // Source A: Services
      const services = servicesRes.status === "fulfilled" ? servicesRes.value.data?.data || [] : [];
      const serviceItems = services.map((s) => {
        const billing = getBillingInfo(s?.billing_cycle);
        return {
          _id: s._id,
          role: (s.type || s.serviceProvider || "vendor").toLowerCase(),
          name: s.name || "Unnamed Service",
          access: s.access || "Free",
          cost: s.cost || billing.price || 0,
          goal: s.goal || "",
          outcomes: s.outcome || "",
          iterations: s.iterations?.length || 0,
          duration: s.duration ? `${s.duration} days` : "",
          discount: s.discountType ? `${s.discountAmount}%` : "",
          features: s.features?.join(", ") || s.description || "",
          sourceType: "service",
          sourceLabel: "My Services",
        };
      });

      // Source B: Step embedded marketplace arrays
      const stepItems = [];
      if (stepsRes.status === "fulfilled") {
        const allSteps = stepsRes.value.data?.data || [];

        allSteps.forEach((step) => {
          step.path_name = step.name || step.macro_name || "Unknown Path";
        });

        allSteps.forEach((step, si) => {
          ["macro", "micro", "nano"].forEach((layer) => {
            const arr = step[`${layer}_marketplace`] || step[layer]?.marketplace || [];
            arr.forEach((item, ii) => {
              if (!item?.name) return;
              stepItems.push({
                _id: `${step._id}-${layer}-${ii}`,
                name: item.name,
                role: (item.role || "vendor").toLowerCase(),
                access: item.access || "Free",
                cost: item.cost || "Free",
                goal: item.goal || "",
                outcomes: item.outcomes || "",
                iterations: item.iterations || "",
                duration: item.duration || "",
                discount: item.discount || "",
                features: item.features || "",
                sourceType: "step",
                sourceLabel: step.macro_name || step.name || `Step ${si + 1}`,
                sourceStep: step.macro_name || step.name || `Step ${si + 1}`,
                sourceLayer: layer.toUpperCase(),
                pathName: step.path_name || "Unknown Path",
              });
            });
          });
        });
      }

      // Source C: marketplace collection — filtered to this partner's email
      const collectionItems = [];
      if (marketplaceRes.status === "fulfilled") {
        const allMarketplaceItems = marketplaceRes.value.data?.data || [];

        // ✅ Filter to only show items belonging to this partner
        allMarketplaceItems
          .filter((item) => item.partner_email === email)
          .forEach((item) => {
            collectionItems.push({
              _id: item._id,
              name: item.name || "Unnamed",
              role: (item.role || "vendor").toLowerCase(),
              access: item.access || "Free",
              cost: item.cost || "Free",
              goal: item.goal || "",
              outcomes: item.outcomes || "",
              iterations: item.iterations || "",
              duration: item.duration || "",
              discount: item.discount || "",
              features: item.features || "",
              sourceType: "marketplace",
              sourceLabel: "Marketplace Items",
              pathName: item.path_name,
              stepName: item.step_name,
              sourceLayer: item.layer?.toUpperCase(),
            });
          });
      }

      // Merge & deduplicate by name + role
      const seen = new Set();
      const merged = [];
      [...serviceItems, ...collectionItems, ...stepItems].forEach((item) => {
        const key = `${item.name?.toLowerCase()}-${item.role?.toLowerCase()}`;
        if (!seen.has(key)) { seen.add(key); merged.push(item); }
      });

      setItems(merged);
    } catch (err) {
      console.error("Error fetching marketplace items:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleClick = (role) => {
    setActiveRole(role);
    if (onRoleChange) onRoleChange(role);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const filteredItems = items.filter((item) => {
    const q = localSearch?.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.role?.toLowerCase().includes(q) ||
      item.features?.toLowerCase().includes(q) ||
      item.goal?.toLowerCase().includes(q);
    const matchesRole =
      activeRole === "all" || item.role?.toLowerCase() === activeRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const isSubscriptionPrice = (cost) =>
    cost?.toString().toLowerCase().includes("subscription") ||
    cost?.toString().toLowerCase().includes("covered");

  return (
    <div className="partner-marketplace">

      {/* Header */}
      <div className="mp-header">
        <h1>Marketplace</h1>
        {!loading && (
          <span className="item-count">
            {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
          </span>
        )}
      </div>

      {/* Filter Row */}
      <div className="mp-filter-row">
        <select
          className="mp-filter-select"
          value={activeRole}
          onChange={(e) => handleRoleClick(e.target.value)}
        >
          <option value="all">All Partners</option>
          <option value="institution">Institutions</option>
          <option value="mentor">Mentors</option>
          <option value="distributor">Distributors</option>
          <option value="vendor">Vendors</option>
        </select>
        <div className="mp-search-wrapper">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21L16.65 16.65" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search marketplace..."
            value={localSearch}
            onChange={handleSearchChange}
            className="mp-search-input"
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
      ) : filteredItems.length === 0 ? (
        <div className="no-items">
          <h3>No items found</h3>
          <p>Create services or add items to steps to see them here.</p>
        </div>
      ) : (
        <div className="mp-grid">
          {filteredItems.map((item) => {
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
                    <div className="price-badge price-yellow">{item.duration}</div>
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
                    {(item.sourceLayer || item.layer) && (
                      <div className="layer-chip">{item.sourceLayer || item.layer}</div>
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
                    {item.outcomes && (
                      <div className="partner-email">{item.outcomes}</div>
                    )}
                    {item.discount && (
                      <div className="access-badge badge-green">{item.discount}</div>
                    )}
                  </div>
                  <button
                    className="view-btn"
                    onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (() => {
        const rc = getRoleConf(selectedItem.role);
        return (
          <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>

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
                  <img src={closepop} alt="close" />
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
                      <td className="highlight">{selectedItem.access || "Free"}</td>
                      <td className="highlight">{formatPrice(selectedItem.cost)}</td>
                      {selectedItem.discount && (
                        <td className="discount-val">{selectedItem.discount}</td>
                      )}
                    </tr>
                  </tbody>
                </table>

                {/* Source */}
                {(selectedItem.sourceLayer || selectedItem.layer || selectedItem.sourceStep) && (
                  <>
                    <div className="section-title">Source</div>
                    <div className="detail-grid" style={{ marginBottom: 20 }}>
                      {(selectedItem.sourceLayer || selectedItem.layer) && (
                        <div className="d-item">
                          <div className="d-label">Layer</div>
                          <div className="d-val">{selectedItem.sourceLayer || selectedItem.layer}</div>
                        </div>
                      )}
                      {selectedItem.sourceStep && (
                        <div className="d-item">
                          <div className="d-label">Step</div>
                          <div className="d-val">{selectedItem.sourceStep}</div>
                        </div>
                      )}
                      {selectedItem.duration && (
                        <div className="d-item">
                          <div className="d-label">Duration</div>
                          <div className="d-val">{selectedItem.duration}</div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Details */}
                <div className="section-title">Details</div>
                <div className="detail-grid">
                  {selectedItem.goal && (
                    <div className="d-item">
                      <div className="d-label">Goal</div>
                      <div className="d-val">{selectedItem.goal}</div>
                    </div>
                  )}
                  {selectedItem.iterations && selectedItem.iterations !== "0" && (
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
                </div>

              </div>

              <div className="modal-foot">
                <button onClick={() => setSelectedItem(null)}>Close</button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Marketplace;