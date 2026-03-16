import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Marketplace.scss";
import Skeleton from "react-loading-skeleton";
import closepop from "../../static/images/dashboard/closepop.svg";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const MentorIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 11H4V13H20V11Z M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
  </svg>
);

const VendorIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
  </svg>
);

const InstitutionIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L2 7V9H22V7L12 2ZM4 11V19H8V11H4ZM10 11V19H14V11H10ZM18 11V19H20V11H18Z" />
  </svg>
);

const DistributorIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3H20V7H4V3ZM2 9H22V21H2V9ZM6 13V17H18V13H6Z" />
  </svg>
);

const DefaultIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" />
  </svg>
);

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG = {
  mentor:      { color: "#0B6E4F", bg: "#E3F2E9", border: "#A8D5BA", icon: MentorIcon },
  vendor:      { color: "#af5918", bg: "#FEF3C7", border: "#FCD34D", icon: VendorIcon },
  institution: { color: "#6D28D9", bg: "#EDE9FE", border: "#C4B5FD", icon: InstitutionIcon },
  distributor: { color: "#c93232", bg: "#FEE2E2", border: "#FCA5A5", icon: DistributorIcon },
  default:     { color: "#4B5563", bg: "#F3F4F6", border: "#D1D5DB", icon: DefaultIcon },
};

const getRoleConfig = (role) =>
  ROLE_CONFIG[role?.toLowerCase()] || ROLE_CONFIG.default;

const formatPrice = (cost) => {
  if (typeof cost === "number") return cost === 0 ? "Free" : `$${cost}`;
  return cost || "Free";
};

// ─── Component ────────────────────────────────────────────────────────────────

const Marketplace = ({ search = "", selectedRole = "all", onRoleChange, onSearchChange }) => {
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [activeRole, setActiveRole] = useState(selectedRole || "all");
  const [localSearch, setLocalSearch] = useState(search || "");

  useEffect(() => {
    fetchMarketplaceItems();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const userDetails = JSON.parse(localStorage.getItem("partner")) || {};
      const email = userDetails?.email || userDetails?.user?.email;
      if (!email) { setLoading(false); return; }

      const [servicesRes, stepsRes, marketplaceRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/api/services/getservices`, { params: { productcreatoremail: email } }),
        axios.get(`${BASE_URL}/api/steps/partner`, { params: { email } }),
        axios.get(`${BASE_URL}/api/marketplace/get`, { params: { email } }),
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
          chargingtype: s.chargingtype,
          sourceType: "service",
          sourceLabel: "My Services",
        };
      });

      // Source B: Step embedded marketplace arrays
      const stepItems = [];
      if (stepsRes.status === "fulfilled") {
        const allSteps = stepsRes.value.data?.data || [];
        
        // Fetch path details for each step to get path names
        for (const step of allSteps) {
          try {
            if (step.path_id) {
              const pathRes = await axios.get(`${BASE_URL}/api/paths/viewpath/${step.path_id}`);
              const pathData = pathRes.data.data;
              step.path_name = pathData?.nameOfPath || "Unknown Path";
            }
          } catch (err) {
            console.error("Error fetching path details:", err);
          }
        }

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

      // Source C: marketplace_items collection
      const collectionItems = [];
      if (marketplaceRes.status === "fulfilled") {
        const rawItems = marketplaceRes.value.data?.data || [];
        
        // Fetch additional details for each marketplace item
        for (const item of rawItems) {
          try {
            if (item.path_id) {
              const pathRes = await axios.get(`${BASE_URL}/api/paths/viewpath/${item.path_id}`);
              const pathData = pathRes.data.data;
              item.path_name = pathData?.nameOfPath || "Unknown Path";
            }
            
            if (item.step_id) {
              const stepRes = await axios.get(`${BASE_URL}/api/steps/get/${item.step_id}`);
              const stepData = stepRes.data.data;
              item.step_name = stepData?.macro_name || stepData?.name || "Unknown Step";
            }
          } catch (err) {
            console.error("Error fetching details for marketplace item:", err);
          }
        }

        rawItems.forEach((item) => {
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

      // Merge & deduplicate
      const seen = new Set();
      const merged = [];
      [...serviceItems, ...collectionItems, ...stepItems].forEach((item) => {
        const key = `${item.name?.toLowerCase()}-${item.role?.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(item);
        }
      });

      setMarketplaceItems(merged);
    } catch (err) {
      console.error("Error fetching marketplace items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBillingInfo = (billing_cycle = {}) => {
    if (billing_cycle?.monthly?.price  !== undefined) return { price: billing_cycle.monthly.price };
    if (billing_cycle?.annual?.price   !== undefined) return { price: billing_cycle.annual.price };
    if (billing_cycle?.lifetime?.price !== undefined) return { price: billing_cycle.lifetime.price };
    return { price: 0 };
  };

  const toggleDesc = (id) => setExpandedDesc((p) => ({ ...p, [id]: !p[id] }));

  const handleRoleClick = (role) => {
    setActiveRole(role);
    if (onRoleChange) onRoleChange(role);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const filteredItems = marketplaceItems.filter((item) => {
    const q = localSearch?.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.role?.toLowerCase().includes(q) ||
      item.features?.toLowerCase().includes(q) ||
      item.goal?.toLowerCase().includes(q);
    const matchesRole =
      activeRole === "all" ||
      item.role?.toLowerCase() === activeRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="marketplace-container">

      {/* ── Filter Row ── */}
      <div className="mp-filter-row">
        <div className="mp-filter-buttons">
          {["all", "vendor", "mentor", "institution", "distributor"].map((role) => (
            <button
              key={role}
              className={`mp-filter-btn ${activeRole === role ? "active" : ""}`}
              onClick={() => handleRoleClick(role)}
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
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

      {/* ── Loading ── */}
      {loading ? (
        <div className="marketplace-grid">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="marketplace-card mp-skeleton">
              <Skeleton height={24} width="80%" />
              <Skeleton height={16} width="50%" style={{ marginTop: 8 }} />
              <Skeleton count={2} style={{ marginTop: 6 }} />
              <Skeleton height={32} style={{ marginTop: 12, borderRadius: 20 }} />
            </div>
          ))}
        </div>

      ) : filteredItems.length === 0 ? (
        <div className="mp-empty">
          <p className="mp-empty-title">No Marketplace Items Found</p>
          <p className="mp-empty-sub">Create services or add items to steps to see them here.</p>
        </div>

      ) : (
        <div className="marketplace-grid">
          {filteredItems.map((item) => {
            const cfg = getRoleConfig(item.role);
            const price = formatPrice(item.cost);
            const isFree = price === "Free";
            const RoleIcon = cfg.icon;

            return (
              <div key={item._id} className="marketplace-card">

                {/* Card Header */}
                <div className="mp-card-header">
                  <div className="mp-header-left">
                    <div className="mp-role-icon" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
                      <RoleIcon />
                    </div>
                    <h3 className="mp-item-name">{item.name}</h3>
                  </div>
                  <span className={`mp-access-badge ${isFree ? "free" : "paid"}`}>
                    {price}
                  </span>
                </div>

                {/* Role Pill */}
                <div className="mp-role-pill" style={{ color: cfg.color }}>
                  {item.role?.toUpperCase()}
                </div>

                {/* Goals Section */}
                <div className="mp-goals-section">
                  {item.goal && (
                    <div className="mp-goal-item">
                      <span className="mp-goal-label">Goal</span>
                      <span className="mp-goal-text">{item.goal}</span>
                    </div>
                  )}
                  {item.outcomes && !item.goal && (
                    <div className="mp-goal-item">
                      <span className="mp-goal-label">Outcomes</span>
                      <span className="mp-goal-text">{item.outcomes}</span>
                    </div>
                  )}
                  {item.sourceLayer && (
                    <div className="mp-goal-item">
                      <span className="mp-goal-label">Layer</span>
                      <span className="mp-goal-text">{item.sourceLayer}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {item.features && (
                  <div className="mp-description">
                    {item.features.length > 80 ? (
                      <>
                        {expandedDesc[item._id]
                          ? item.features
                          : `${item.features.substring(0, 80)}...`}
                        <button
                          className="mp-read-more"
                          onClick={() => toggleDesc(item._id)}
                        >
                          {expandedDesc[item._id] ? "Less" : "More"}
                        </button>
                      </>
                    ) : (
                      item.features
                    )}
                  </div>
                )}

                {/* Source Info */}
                {(item.sourceType === "step" || item.sourceLayer) && (
                  <div className="mp-source-info">
                    Added Via Step: {item.sourceLayer || "MACRO"}
                  </div>
                )}

                {/* Card Footer */}
                <div className="mp-card-footer">
                  <button
                    className="mp-details-btn"
                    style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    onClick={() => { setSelectedItem(item); setShowDetails(true); }}
                  >
                    View All Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ Details Modal ══════════════════════════════════════════════════════ */}
      {showDetails && selectedItem && (() => {
        const cfg = getRoleConfig(selectedItem.role);
        const price = formatPrice(selectedItem.cost);
        const RoleIcon = cfg.icon;

        const getLayerColor = (layer) => {
          const layerLower = layer?.toLowerCase();
          if (layerLower === 'macro') return '#0d6b6e';
          if (layerLower === 'micro') return '#3b82f6';
          if (layerLower === 'nano') return '#a855f7';
          return cfg.color;
        };

        const getLayerBgColor = (layer) => {
          const layerLower = layer?.toLowerCase();
          if (layerLower === 'macro') return '#e6f3f4';
          if (layerLower === 'micro') return '#eff6ff';
          if (layerLower === 'nano') return '#f3e8ff';
          return '#f3f4f6';
        };

        return (
          <div className="mp-modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="mp-modal" onClick={(e) => e.stopPropagation()}>

              {/* Modal Header */}
              <div className="mp-modal-header" style={{ backgroundColor: cfg.bg }}>
                <div className="mp-modal-title-row">
                  <div className="mp-modal-icon" style={{ color: cfg.color }}>
                    <RoleIcon />
                  </div>
                  <div>
                    <h2 className="mp-modal-name">{selectedItem.name}</h2>
                    <span className="mp-modal-role" style={{ color: cfg.color }}>
                      {selectedItem.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="mp-modal-close" onClick={() => setShowDetails(false)}>
                  <img src={closepop} alt="Close" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="mp-modal-body">

                {/* Access & Pricing */}
                <div className="mp-modal-section">
                  <div className="mp-section-title">ACCESS & PRICING</div>
                  <div className="mp-pricing-grid">
                    <div className="mp-pricing-item">
                      <span className="mp-pricing-label">Access</span>
                      <span className="mp-pricing-value">{selectedItem.access || "Free"}</span>
                    </div>
                    <div className="mp-pricing-item">
                      <span className="mp-pricing-label">Price</span>
                      <span
                        className="mp-pricing-value"
                        style={{ color: price === "Free" ? "#166534" : cfg.color }}
                      >
                        {price}
                      </span>
                    </div>
                    {selectedItem.discount && (
                      <div className="mp-pricing-item">
                        <span className="mp-pricing-label">Discount</span>
                        <span className="mp-pricing-value" style={{ color: "#16a34a" }}>
                          {selectedItem.discount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SOURCE - Path Name, Step Name & Layer Name */}
                {(selectedItem.sourceLayer || selectedItem.layer || 
                  selectedItem.sourceStep || selectedItem.stepName || 
                  selectedItem.pathName) && (
                  <div className="mp-modal-section">
                    <div className="mp-section-title">SOURCE</div>
                    <div className="mp-source-grid" style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem',
                      backgroundColor: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '12px'
                    }}>
                      
                      {/* Path Name */}
                      {selectedItem.pathName && (
                        <div className="mp-source-item" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '0.5rem'
                        }}>
                          <span className="mp-source-label" style={{ 
                            fontWeight: 600, 
                            color: '#1e293b',
                            fontSize: '0.9rem'
                          }}>
                            Path
                          </span>
                          <span className="mp-source-value" style={{ 
                            fontWeight: 500, 
                            color: '#0d6b6e',
                            backgroundColor: '#e6f3f4',
                            padding: '0.25rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}>
                            {selectedItem.pathName}
                          </span>
                        </div>
                      )}
                      
                      {/* Step Name */}
                      {(selectedItem.sourceStep || selectedItem.stepName) && (
                        <div className="mp-source-item" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '0.5rem'
                        }}>
                          <span className="mp-source-label" style={{ 
                            fontWeight: 600, 
                            color: '#1e293b',
                            fontSize: '0.9rem'
                          }}>
                            Step
                          </span>
                          <span className="mp-source-value" style={{ 
                            fontWeight: 500, 
                            color: '#0d6b6e',
                            backgroundColor: '#e6f3f4',
                            padding: '0.25rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.9rem'
                          }}>
                            {selectedItem.sourceStep || selectedItem.stepName}
                          </span>
                        </div>
                      )}
                      
                      {/* Layer Name */}
                      {(selectedItem.sourceLayer || selectedItem.layer) && (
                        <div className="mp-source-item" style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span className="mp-source-label" style={{ 
                            fontWeight: 600, 
                            color: '#1e293b',
                            fontSize: '0.9rem'
                          }}>
                            Layer
                          </span>
                          <span 
                            className="mp-source-value" 
                            style={{ 
                              fontWeight: 600,
                              color: getLayerColor(selectedItem.sourceLayer || selectedItem.layer),
                              backgroundColor: getLayerBgColor(selectedItem.sourceLayer || selectedItem.layer),
                              padding: '0.35rem 1.2rem',
                              borderRadius: '30px',
                              display: 'inline-block',
                              fontSize: '0.9rem',
                              border: `1px solid ${getLayerColor(selectedItem.sourceLayer || selectedItem.layer)}40`
                            }}
                          >
                            {(selectedItem.sourceLayer || selectedItem.layer)?.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Duration */}
                {selectedItem.duration && (
                  <div className="mp-modal-section">
                    <div className="mp-section-title">DURATION</div>
                    <div className="mp-duration-item" style={{
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      <span className="mp-duration-value" style={{
                        color: '#0d6b6e',
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}>{selectedItem.duration}</span>
                    </div>
                  </div>
                )}

                {/* Goal & Outcomes */}
                {(selectedItem.goal || selectedItem.outcomes) && (
                  <div className="mp-modal-section">
                    <div className="mp-section-title">GOAL & OUTCOMES</div>
                    {selectedItem.goal && (
                      <div className="mp-goal-detail" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                        marginBottom: '0.75rem'
                      }}>
                        <span className="mp-goal-detail-label" style={{
                          fontWeight: 600,
                          color: '#4b5563',
                          fontSize: '0.85rem'
                        }}>Goal</span>
                        <span className="mp-goal-detail-value" style={{
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}>{selectedItem.goal}</span>
                      </div>
                    )}
                    {selectedItem.outcomes && (
                      <div className="mp-goal-detail" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                      }}>
                        <span className="mp-goal-detail-label" style={{
                          fontWeight: 600,
                          color: '#4b5563',
                          fontSize: '0.85rem'
                        }}>Outcomes</span>
                        <span className="mp-goal-detail-value" style={{
                          color: '#1e293b',
                          backgroundColor: '#f8fafc',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.95rem'
                        }}>{selectedItem.outcomes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Iterations */}
                {selectedItem.iterations && selectedItem.iterations !== "0" && (
                  <div className="mp-modal-section">
                    <div className="mp-section-title">ITERATIONS</div>
                    <div className="mp-iterations-item" style={{
                      backgroundColor: '#f8fafc',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      display: 'inline-block'
                    }}>
                      <span className="mp-iterations-value" style={{
                        color: '#0d6b6e',
                        fontWeight: 500,
                        fontSize: '1rem'
                      }}>{selectedItem.iterations}</span>
                    </div>
                  </div>
                )}

                {/* Features */}
                {selectedItem.features && (
                  <div className="mp-modal-section">
                    <div className="mp-section-title">FEATURES</div>
                    <p className="mp-features-text" style={{
                      backgroundColor: '#f8fafc',
                      padding: '1rem',
                      borderRadius: '8px',
                      color: '#1e293b',
                      lineHeight: '1.6',
                      fontSize: '0.95rem',
                      margin: 0
                    }}>{selectedItem.features}</p>
                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="mp-modal-footer">
                <button className="mp-close-btn" onClick={() => setShowDetails(false)}>
                  Close
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Marketplace;