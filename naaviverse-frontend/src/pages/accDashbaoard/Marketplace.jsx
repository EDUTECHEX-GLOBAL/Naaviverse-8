import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Marketplace.scss";
import Skeleton from "react-loading-skeleton";
import closepop from "../../static/images/dashboard/closepop.svg";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ROLE_CONFIG = {
  mentor:      { color: "#0d6b6e", bg: "#e6f4f1", border: "#b2dcd8", icon: "👨‍🏫" },
  vendor:      { color: "#92400e", bg: "#fef9c3", border: "#fde68a", icon: "🛒" },
  institution: { color: "#6d28d9", bg: "#ede9fe", border: "#c4b5fd", icon: "🏛️" },
  distributor: { color: "#b45309", bg: "#fef3c7", border: "#fcd34d", icon: "📦" },
  default:     { color: "#617388", bg: "#f1f5f9", border: "#cbd5e1", icon: "📋" },
};

const getRoleConfig = (role) =>
  ROLE_CONFIG[role?.toLowerCase()] || ROLE_CONFIG.default;

const formatPrice = (cost) => {
  if (typeof cost === "number") return cost === 0 ? "Free" : `$${cost}`;
  return cost || "Free";
};

const Marketplace = ({ search = "", selectedRole = "all" }) => {
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState({});

  useEffect(() => {
    fetchMarketplaceItems();
    // eslint-disable-next-line
  }, []);

  const fetchMarketplaceItems = async () => {
    setLoading(true);
    try {
      const userDetails = JSON.parse(localStorage.getItem("partner")) || {};
      const email = userDetails?.email || userDetails?.user?.email;
      if (!email) { setLoading(false); return; }

      const [servicesRes, stepsRes, marketplaceRes] = await Promise.allSettled([
        // Source A: Services collection
        axios.get(`${BASE_URL}/api/services/getservices`, {
          params: { productcreatoremail: email },
        }),
        // Source B: Step embedded marketplace arrays
        axios.get(`${BASE_URL}/api/steps/partner`, { params: { email } }),
        // ✅ FIX — Source C: marketplace_items collection
        // Route: GET /api/marketplace/get  param: email
        axios.get(`${BASE_URL}/api/marketplace/get`, {
          params: { email },
        }),
      ]);

      // ── Source A: Services ───────────────────────────────────────────────
      const services = servicesRes.status === "fulfilled"
        ? servicesRes.value.data?.data || []
        : [];

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

      // ── Source B: Step embedded marketplace arrays ───────────────────────
      const stepItems = [];
      if (stepsRes.status === "fulfilled") {
        const allSteps = stepsRes.value.data?.data || [];
        allSteps.forEach((step, si) => {
          ["macro", "micro", "nano"].forEach((layer) => {
            const arr =
              step[`${layer}_marketplace`] || step[layer]?.marketplace || [];
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
                sourceLabel: `${step.macro_name || step.name || `Step ${si + 1}`} › ${layer.toUpperCase()}`,
                sourceStep: step.macro_name || step.name || `Step ${si + 1}`,
                sourceLayer: layer.toUpperCase(),
              });
            });
          });
        });
      }

      // ── Source C: marketplace_items collection ✅ FIX ────────────────────
      const collectionItems = [];
      if (marketplaceRes.status === "fulfilled") {
        const rawItems = marketplaceRes.value.data?.data || [];
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
            // Store path_id/step_id for reference
            pathId: item.path_id,
            stepId: item.step_id,
            layer: item.layer,
          });
        });
      }

      // ── Merge all three sources, deduplicate by name+role ────────────────
      // Collection items take priority over step-embedded duplicates
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
    if (billing_cycle?.monthly?.price !== undefined) return { price: billing_cycle.monthly.price };
    if (billing_cycle?.annual?.price !== undefined)  return { price: billing_cycle.annual.price };
    if (billing_cycle?.lifetime?.price !== undefined) return { price: billing_cycle.lifetime.price };
    return { price: 0 };
  };

  const toggleDesc = (id) => setExpandedDesc((p) => ({ ...p, [id]: !p[id] }));

  const filteredItems = marketplaceItems.filter((item) => {
    const q = search?.toLowerCase();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.role?.toLowerCase().includes(q) ||
      item.features?.toLowerCase().includes(q) ||
      item.goal?.toLowerCase().includes(q);
    const matchesRole =
      selectedRole === "all" ||
      item.role?.toLowerCase() === selectedRole.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div className="marketplace-container">
      {loading ? (
        <div className="marketplace-grid">
          {Array(6).fill(null).map((_, i) => (
            <div key={i} className="marketplace-card mp-skeleton">
              <Skeleton height={28} width="60%" />
              <Skeleton height={18} width="35%" style={{ marginTop: 10 }} />
              <Skeleton count={3} style={{ marginTop: 8 }} />
              <Skeleton height={40} style={{ marginTop: 16, borderRadius: 30 }} />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mp-empty">
          <div className="mp-empty-icon">🏪</div>
          <p className="mp-empty-title">No Marketplace Items Found</p>
          <p className="mp-empty-sub">Create services or add items to steps to see them here.</p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {filteredItems.map((item) => {
            const cfg = getRoleConfig(item.role);
            const price = formatPrice(item.cost);
            const isFree = price === "Free";

            return (
              <div key={item._id} className="marketplace-card" style={{ "--role-bg": cfg.bg }}>

                {/* ── Card body (all content above footer) ── */}
                <div className="mp-card-body">

                  {/* ── Card header: icon + name + free/paid badge ── */}
                  <div className="mp-card-header">
                    <div className="mp-header-left">
                      <span className="mp-role-icon">{cfg.icon}</span>
                      <h3 className="mp-item-name">{item.name}</h3>
                    </div>
                    <span className={`mp-access-badge ${isFree ? "free" : "paid"}`}>
                      {isFree ? "Free" : price}
                    </span>
                  </div>

                  <div className="mp-divider" />

                  {/* ── Role pill ── */}
                  <span
                    className="mp-role-pill"
                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                  >
                    {item.role?.toUpperCase()}
                  </span>

                  {/* ── Info rows ── */}
                  <div className="mp-info-rows">
                    {item.goal && (
                      <div className="mp-info-row">
                        <span className="mp-info-label">Goal</span>
                        <span className="mp-info-val">{item.goal}</span>
                      </div>
                    )}
                    {item.iterations &&
                      item.iterations !== "0" &&
                      Number(item.iterations) > 0 && (
                        <div className="mp-info-row">
                          <span className="mp-info-label">Iterations</span>
                          <span className="mp-info-val">{item.iterations}</span>
                        </div>
                      )}
                    {item.sourceType === "marketplace" && item.layer && (
                      <div className="mp-info-row">
                        <span className="mp-info-label">Layer</span>
                        <span className="mp-info-val">{item.layer?.toUpperCase()}</span>
                      </div>
                    )}
                  </div>

                  {/* ── Description ── */}
                  {(item.features || item.outcomes) &&
                    (() => {
                      const desc = item.features || item.outcomes || "";
                      const isLong = desc.length > 100;
                      const isOpen = expandedDesc[item._id];
                      return (
                        <div>
                          <p className={`mp-description${isLong && !isOpen ? " clamped" : ""}`}>
                            {desc}
                          </p>
                        </div>
                      );
                    })()}
                  {item.sourceType === "step" && (
                    <div className="mp-source-label">
                      <span className="mp-source-dot">📍</span>
                      <span>{item.sourceLabel}</span>
                    </div>
                  )}
                  {item.sourceType === "marketplace" && (
                    <div className="mp-source-label">
                      <span className="mp-source-dot">🗂️</span>
                      <span>Added via Step · {item.layer?.toUpperCase()}</span>
                    </div>
                  )}

                </div>{/* end mp-card-body */}

                {/* ── Footer — always at bottom due to space-between on card ── */}
                <div className="mp-card-footer">
                  <button
                    className="mp-details-btn"
                    style={{ background: cfg.bg, color: cfg.color }}
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

      {/* ══════════════════════════════════
          Details Modal
      ══════════════════════════════════ */}
      {showDetails && selectedItem && (() => {
        const cfg = getRoleConfig(selectedItem.role);
        const price = formatPrice(selectedItem.cost);

        return (
          <div className="mp-modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="mp-modal" onClick={(e) => e.stopPropagation()}>

              {/* Modal top bar */}
              <div className="mp-modal-topbar" style={{ background: cfg.bg }}>
                <div className="mp-modal-title-row">
                  <span className="mp-modal-icon">{cfg.icon}</span>
                  <div>
                    <h2 className="mp-modal-name">{selectedItem.name}</h2>
                    <span
                      className="mp-modal-role-pill"
                      style={{ background: cfg.border, color: cfg.color }}
                    >
                      {selectedItem.role?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="mp-modal-close" onClick={() => setShowDetails(false)}>
                  <img src={closepop} alt="Close" />
                </button>
              </div>

              <div className="mp-modal-body">

                {/* Pricing banner */}
                <div className="mp-pricing-banner" style={{ borderColor: cfg.border }}>
                  <div className="mp-pricing-item">
                    <span className="mp-pricing-label">Access</span>
                    <span className="mp-pricing-val">{selectedItem.access || "Free"}</span>
                  </div>
                  <div className="mp-pricing-divider" />
                  <div className="mp-pricing-item">
                    <span className="mp-pricing-label">Price</span>
                    <span
                      className="mp-pricing-val bold"
                      style={{ color: price === "Free" ? "#166534" : cfg.color }}
                    >
                      {price}
                    </span>
                  </div>
                  {selectedItem.discount && (
                    <>
                      <div className="mp-pricing-divider" />
                      <div className="mp-pricing-item">
                        <span className="mp-pricing-label">Discount</span>
                        <span className="mp-pricing-val bold" style={{ color: "#16a34a" }}>
                          {selectedItem.discount} OFF
                        </span>
                      </div>
                    </>
                  )}
                  {selectedItem.chargingtype && (
                    <>
                      <div className="mp-pricing-divider" />
                      <div className="mp-pricing-item">
                        <span className="mp-pricing-label">Billing</span>
                        <span className="mp-pricing-val">{selectedItem.chargingtype}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Source */}
                {selectedItem.sourceType === "step" && (
                  <div className="mp-detail-section">
                    <div className="mp-section-header">
                      <span className="mp-section-icon">📍</span>
                      <h4>Source</h4>
                    </div>
                    <div className="mp-detail-chips">
                      <div className="mp-chip">
                        <span className="mp-chip-label">Step</span>
                        <span className="mp-chip-val">{selectedItem.sourceStep}</span>
                      </div>
                      <div className="mp-chip" style={{ background: cfg.bg, color: cfg.color }}>
                        <span className="mp-chip-label">Layer</span>
                        <span className="mp-chip-val">{selectedItem.sourceLayer}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Source section for marketplace collection items */}
                {selectedItem.sourceType === "marketplace" && selectedItem.layer && (
                  <div className="mp-detail-section">
                    <div className="mp-section-header">
                      <span className="mp-section-icon">🗂️</span>
                      <h4>Source</h4>
                    </div>
                    <div className="mp-detail-chips">
                      <div className="mp-chip">
                        <span className="mp-chip-label">Layer</span>
                        <span className="mp-chip-val">{selectedItem.layer?.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Goal & Outcomes */}
                {(selectedItem.goal || selectedItem.outcomes) && (
                  <div className="mp-detail-section">
                    <div className="mp-section-header">
                      <span className="mp-section-icon">🎯</span>
                      <h4>Goal & Outcomes</h4>
                    </div>
                    {selectedItem.goal && (
                      <div className="mp-detail-row">
                        <span className="mp-detail-label">Goal</span>
                        <span className="mp-detail-val">{selectedItem.goal}</span>
                      </div>
                    )}
                    {selectedItem.outcomes && (
                      <div className="mp-detail-row">
                        <span className="mp-detail-label">Outcomes</span>
                        <span className="mp-detail-val">{selectedItem.outcomes}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Duration & Iterations */}
                {(selectedItem.duration ||
                  (selectedItem.iterations && selectedItem.iterations !== "0")) && (
                  <div className="mp-detail-section">
                    <div className="mp-section-header">
                      <span className="mp-section-icon">⏱️</span>
                      <h4>Duration & Iterations</h4>
                    </div>
                    <div className="mp-detail-chips">
                      {selectedItem.duration && (
                        <div className="mp-chip">
                          <span className="mp-chip-label">Duration</span>
                          <span className="mp-chip-val">{selectedItem.duration}</span>
                        </div>
                      )}
                      {selectedItem.iterations && selectedItem.iterations !== "0" && (
                        <div className="mp-chip">
                          <span className="mp-chip-label">Iterations</span>
                          <span className="mp-chip-val">{selectedItem.iterations}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Features & Description */}
                {(selectedItem.features || selectedItem.description) && (
                  <div className="mp-detail-section">
                    <div className="mp-section-header">
                      <span className="mp-section-icon">📋</span>
                      <h4>Features & Description</h4>
                    </div>
                    <p className="mp-features-text">
                      {selectedItem.features || selectedItem.description}
                    </p>
                  </div>
                )}
              </div>

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