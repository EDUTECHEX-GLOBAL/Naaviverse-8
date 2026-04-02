import React, { useState, useEffect, useRef } from "react";
import { useCoinContextData } from "../../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import lg1 from "../../../static/images/login/lg1.svg";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const parseDuration = (raw) => {
  if (!raw) return null;
  try {
    const dur = typeof raw === "string" ? JSON.parse(raw) : raw;
    const parts = [];

    const years = dur?.Years || dur?.years || "";
    const months = dur?.Months || dur?.months || "";
    const days = dur?.Days || dur?.days || "";

    if (parseInt(years) > 0) parts.push(`${years} ${years === "1" ? "Year" : "Years"}`);
    if (parseInt(months) > 0) parts.push(`${months} ${months === "1" ? "Month" : "Months"}`);
    if (parseInt(days) > 0) parts.push(`${days} ${days === "1" ? "Day" : "Days"}`);

    return parts.length ? parts.join(" ") : null;
  } catch { return null; }
};

// ─── layerConfig — reads actual names/descriptions from the step document ───
const getLayerConfig = (stepData) => ({
  macro: {
    label: "Macro",
    color: "#7c3aed",
    bg: "#faf5ff",
    border: "#e9d5ff",
    viewName: stepData?.macro_name || "Macro View",
    viewDesc: stepData?.macro_description || "High-Level Pathway Services",
  },
  micro: {
    label: "Micro",
    color: "#0891b2",
    bg: "#ecfeff",
    border: "#a5f3fc",
    viewName: stepData?.micro_name || "Micro View",
    viewDesc: stepData?.micro_description || "Mid-Level Support Services",
  },
  nano: {
    label: "Nano",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    viewName: stepData?.nano_name || "Nano View",
    viewDesc: stepData?.nano_description || "Granular Task-Level Services",
  },
});

const MyStepsAdmin = ({ search, admin, fetchAllServicesAgain }) => {
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pathId = queryParams.get("pathId");
  const stepsFromPath = location.state?.steps || null;
  let userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const { mypathsMenu, setMypathsMenu } = useCoinContextData();

  const [partnerStepsData, setPartnerStepsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [serviceCountMap, setServiceCountMap] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScreen, setModalScreen] = useState("main");
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLength, setEditLength] = useState("");
  const [editCost, setEditCost] = useState("");

  // View step layer tab
  const [viewLayerTab, setViewLayerTab] = useState("macro");
  const [expandedSteps, setExpandedSteps] = useState({});

  // ── Marketplace states ────────────────────────────────
  const [marketLayer, setMarketLayer] = useState("");
  const [marketplaceItems, setMarketplaceItems] = useState([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [attachedServices, setAttachedServices] = useState([]);

  // ── Marketplace create-listing form states ────────────────────────────────
  const [mpRole, setMpRole] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpAccess, setMpAccess] = useState("Free");
  const [mpCost, setMpCost] = useState("");
  const [mpGoal, setMpGoal] = useState("");
  const [mpOutcomes, setMpOutcomes] = useState("");
  const [mpDuration, setMpDuration] = useState("");
  const [mpFeatures, setMpFeatures] = useState("");
  const [mpDiscount, setMpDiscount] = useState("");

  // ─── Data fetchers ────────────────────────────────────────────────────────

  const getAllSteps = () => {
    setLoading(true);
    const status = mypathsMenu === "Active Steps" ? "active" : "inactive";
    axios.get(`${BASE_URL}/api/steps/get?status=${status}`)
      .then(({ data }) => {
        const result = data?.data || [];
        setPartnerStepsData(result);
        if (result.length > 0) fetchMarketplaceCounts(result);
        else setServiceCountMap({});
        setLoading(false);
      })
      .catch(() => { setPartnerStepsData([]); setLoading(false); });
  };

  const fetchMarketplaceCounts = async (steps = []) => {
    if (!Array.isArray(steps) || steps.length === 0) return;
    const counts = {};
    await Promise.all(steps.map(async (step) => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/marketplace/step/${step._id}`);
        counts[step._id] = data?.data?.length || 0;
      } catch { counts[step._id] = 0; }
    }));
    setServiceCountMap(counts);
  };

  const fetchMarketplaceData = (stepId, layer) => {
    const sid = stepId || selectedStep?._id;
    const lay = layer || marketLayer;
    if (!sid || !lay) return;

    setMarketplaceLoading(true);

    axios
      .get(`${BASE_URL}/api/marketplace/step/${sid}?layer=${lay}`)
      .then(({ data }) => {
        setAttachedServices(data?.status ? data.data : []);
      })
      .catch(() => setAttachedServices([]));

    axios
      .get(`${BASE_URL}/api/marketplace/admin/get-all?layer=${lay}`)
      .then(({ data }) => {
        setMarketplaceItems(data?.status ? data.data : []);
        setMarketplaceLoading(false);
      })
      .catch(() => {
        setMarketplaceItems([]);
        setMarketplaceLoading(false);
      });
  };

  // ✅ REPLACE WITH:
  const isMounted = useRef(false); // ✅ add this ref

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    const correctMenu = tab === "inactive" ? "Inactive Steps" : "Active Steps";
    setMypathsMenu(correctMenu);
    setLoading(true);
    const status = correctMenu === "Active Steps" ? "active" : "inactive";
    axios.get(`${BASE_URL}/api/steps/get?status=${status}`)
      .then(({ data }) => {
        const result = data?.data || [];
        setPartnerStepsData(result);
        if (result.length > 0) fetchMarketplaceCounts(result);
        else setServiceCountMap({});
        setLoading(false);
      })
      .catch(() => { setPartnerStepsData([]); setLoading(false); });

    // Mark mount as done AFTER initial fetch
    isMounted.current = true;
  }, []);

  // ✅ Skip the very first run — only fires when user manually clicks a tab
  useEffect(() => {
    if (!isMounted.current) return;
    getAllSteps();
  }, [mypathsMenu]);

  useEffect(() => {
    if (modalOpen) document.body.classList.add("admin-popup-open");
    else document.body.classList.remove("admin-popup-open");
    return () => document.body.classList.remove("admin-popup-open");
  }, [modalOpen]);

  // ─── Modal navigation ─────────────────────────────────────────────────────

  const openModal = (step) => {
    setSelectedStep(step);
    setModalScreen("main");
    setModalHistory([]);
    setModalOpen(true);
  };

  const goTo = (screen) => {
    setModalHistory(prev => [...prev, modalScreen]);
    setModalScreen(screen);

    if (screen === "editStep") {
      setEditName(selectedStep?.name || "");
      setEditDesc(selectedStep?.macro_description || selectedStep?.description || "");
      setEditLength(selectedStep?.length ?? "");
      setEditCost(selectedStep?.cost || "");
    }
    if (screen === "marketplace_layer") {
      setMarketLayer("");
      setAttachedServices([]);
      setMarketplaceItems([]);
    }
    if (screen === "marketplace_create") {
      setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
      setMpGoal(""); setMpOutcomes(""); setMpDuration("");
      setMpFeatures(""); setMpDiscount("");
    }
    if (screen === "viewStep") {
      setViewLayerTab("macro");
    }
  };

  const goBack = () => {
    if (modalHistory.length > 0) {
      const prev = modalHistory[modalHistory.length - 1];
      setModalHistory(h => h.slice(0, -1));
      setModalScreen(prev);
    } else {
      closeModal();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalScreen("main");
    setModalHistory([]);
    setSelectedStep(null);
    setMarketLayer("");
    setAttachedServices([]);
    setMarketplaceItems([]);
    setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
    setMpGoal(""); setMpOutcomes(""); setMpDuration("");
    setMpFeatures(""); setMpDiscount("");
  };

  const getTitle = () => {
    const titles = {
      main: "Step Actions",
      editStep: "Edit Step",
      viewStep: "View Step",
      marketplace_layer: "Marketplace",
      marketplace_attach: "Marketplace",
      marketplace_create: "Marketplace",
      deleteConfirm: "Delete Step",
      success: "",
    };
    return titles[modalScreen] || "Step Actions";
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleDeleteStep = async () => {
    setActionLoading(true);
    try {
      const { data } = await axios.delete(`${BASE_URL}/api/steps/delete/${selectedStep._id}`);
      if (data?.status) {
        setActionLoading(false);
        setModalScreen("success");
        setTimeout(() => { closeModal(); getAllSteps(); }, 1800);
      }
    } catch { setActionLoading(false); }
  };

  const handleSaveStep = async () => {
    setActionLoading(true);
    try {
      const payload = {};
      if (editName) payload.name = editName;
      if (editDesc) payload.macro_description = editDesc;
      if (editLength !== "" && editLength !== null && editLength !== undefined) {
        payload.length = Number(editLength);
      }
      if (editCost) payload.cost = editCost;
      await axios.patch(`${BASE_URL}/api/steps/edit/${selectedStep._id}`, payload);
      toast.success("Step updated");
      setActionLoading(false);
      getAllSteps();
      goBack();
    } catch {
      toast.error("Failed to update");
      setActionLoading(false);
    }
  };

  // ─── Marketplace Actions ───────────────────────────────────────────

  const attachMarketService = (item) => {
    setActionLoading(true);

    const fieldKey = `${marketLayer}_marketplace`;
    const currentIds = (selectedStep?.[fieldKey] || []).map(id => id.toString());

    if (currentIds.includes(item._id.toString())) {
      setActionLoading(false);
      return;
    }

    const updatedIds = [...currentIds, item._id.toString()];

    axios
      .put(`${BASE_URL}/api/steps/update/${selectedStep._id}`, { [fieldKey]: updatedIds })
      .then(({ data }) => {
        if (data?.status) {
          setSelectedStep(prev => ({ ...prev, [fieldKey]: updatedIds }));

          axios.patch(`${BASE_URL}/api/marketplace/link-step`, {
            item_id: item._id,
            step_id: selectedStep._id,
          }).then(() => {
            setAttachedServices(prev => [...prev, item]);
            setMarketplaceItems(prev =>
              prev.map(m => m._id === item._id ? { ...m, step_id: selectedStep._id } : m)
            );
            fetchMarketplaceCounts(partnerStepsData);
          });
        }
        setActionLoading(false);
      })
      .catch(() => setActionLoading(false));
  };

  const detachMarketService = (item) => {
    setActionLoading(true);

    const fieldKey = `${marketLayer}_marketplace`;
    const currentIds = (selectedStep?.[fieldKey] || []).map(id => id.toString());
    const updatedIds = currentIds.filter(id => id !== item._id.toString());

    axios
      .put(`${BASE_URL}/api/steps/update/${selectedStep._id}`, { [fieldKey]: updatedIds })
      .then(({ data }) => {
        if (data?.status) {
          setSelectedStep(prev => ({ ...prev, [fieldKey]: updatedIds }));

          axios.patch(`${BASE_URL}/api/marketplace/link-step`, {
            item_id: item._id,
            step_id: null,
          }).then(() => {
            setAttachedServices(prev => prev.filter(s => s._id !== item._id));
            setMarketplaceItems(prev =>
              prev.map(m => m._id === item._id ? { ...m, step_id: null } : m)
            );
            fetchMarketplaceCounts(partnerStepsData);
          });
        }
        setActionLoading(false);
      })
      .catch(() => setActionLoading(false));
  };




  const filtered = (stepsFromPath || partnerStepsData)?.filter(e =>
    e?.name?.toLowerCase()?.includes(search?.toLowerCase() || "")
  );
  const currentLayerCfg = selectedStep ? getLayerConfig(selectedStep)[marketLayer] : null;
  const attachedIds = new Set(attachedServices.map(s => s._id?.toString()));
  const availableItems = marketplaceItems.filter(
    item => !attachedIds.has(item._id?.toString())
  );

  const IconChevron = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  return (
    <div className="admin-steps-container">

      {/* TABS + SEARCH */}
      <div className="admin-steps-topbar">
        <div className="admin-steps-menu">
          {["Active Steps", "Inactive Steps"].map(tab => (
            <div key={tab}
              className={`admin-steps-menu-item ${mypathsMenu === tab ? "active-tab" : ""}`}
              onClick={() => {
                setMypathsMenu(tab);
                const tabValue = tab === "Inactive Steps" ? "inactive" : "active";
                navigate(`/admin/dashboard/steps?tab=${tabValue}`); // ✅ updates URL
              }}>
              {tab}
            </div>
          ))}
        </div>
        <div className="admin-steps-search-row">
          <div className="admin-steps-search-input">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by step"
              value={search || ""}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-steps-content">

        {pathId && (
          <button
            className="show-all-btn"
            onClick={() => navigate("/steps")}
            style={{ marginBottom: "10px" }}
          >
            Show All Steps
          </button>
        )}
        <div className="admin-steps-list">
          {loading
            ? Array(6).fill("").map((_, i) => (
              <div className="admin-step-card" key={i}>
                <div className="admin-step-name"><Skeleton width={120} height={20} /></div>
                <div className="admin-step-desc"><Skeleton width="90%" height={20} /></div>
                <div className="admin-step-right"><Skeleton width={80} height={32} borderRadius={50} /></div>
              </div>
            ))
            : filtered?.map(e => {
              const isFree = !e?.cost || e?.cost?.toLowerCase() === "free";
              const rawDesc = e?.macro_description || e?.micro_description || e?.nano_description || "";
              const isExpanded = expandedSteps[e._id];
              const isLong = rawDesc.length > 120;
              const desc = rawDesc.trim().length > 0
                ? (isExpanded || !isLong ? rawDesc : rawDesc.substring(0, 120))
                : null;
              return (
                <div className="admin-step-card" key={e._id} onClick={() => openModal(e)}>
                  <div className="admin-step-name">
                    <span className="admin-step-name-text">{e?.name || "Untitled"}</span>
                  </div>
                  <div className="admin-step-desc" onClick={ev => ev.stopPropagation()}>
                    {desc ? (
                      <span className="admin-step-desc-text">
                        {desc}
                        {isLong && (
                          <span
                            onClick={ev => {
                              ev.stopPropagation();
                              setExpandedSteps(prev => ({ ...prev, [e._id]: !prev[e._id] }));
                            }}
                            style={{
                              color: "#7c3aed",
                              fontWeight: 600,
                              cursor: "pointer",
                              marginLeft: 4,
                              fontSize: "0.82rem",
                              whiteSpace: "nowrap"
                            }}
                          >
                            {isExpanded ? " Show Less " : "... See More "}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="admin-step-desc-empty">No description available</span>
                    )}
                  </div>
                  <div className="admin-step-right">
                    <div className="admin-step-meta">
                      <span className="admin-step-date">
                        {e?.createdAt
                          ? new Date(e.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "—"}
                      </span>
                      <span className="admin-step-mkt-count">🛒 {serviceCountMap[e._id] ?? 0}</span>
                    </div>
                    <span
                      className="admin-step-actions-pill"
                      onClick={ev => { ev.stopPropagation(); openModal(e); }}
                    >
                      Actions
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* STEP MODAL - Keep same modal classes as they don't conflict */}
      {modalOpen && (
        <>
          <div className="sm-overlay" onClick={closeModal} />
          <div className="sm-modal" onClick={e => e.stopPropagation()}>

            {modalScreen !== "success" && (
              <div className="sm-header">
                <div className="sm-header-left">
                  {modalHistory.length > 0 && (
                    <button className="sm-back-btn" onClick={goBack}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                      </svg>
                      Back
                    </button>
                  )}
                  <h2 className="sm-title">{getTitle()}</h2>
                </div>
                <button className="sm-close-btn" onClick={closeModal}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {selectedStep && modalScreen !== "success" && (
              <div className="sm-chip">
                <span className="sm-chip-dot" />
                {selectedStep.name}
              </div>
            )}

            <div className="sm-body">
              {/* MAIN - Keep same content structure but with admin classes where needed */}
              {modalScreen === "main" && (
                <div className="sm-option-list">
                  <div className="sm-option" onClick={() => goTo("editStep")}>
                    <div className="sm-option-icon" style={{ background: "#eff6ff" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                      </svg>
                    </div>
                    <div className="sm-option-content">
                      <strong>Edit Step</strong>
                      <span>Update name, description, cost and length</span>
                    </div>
                    <IconChevron />
                  </div>

                  <div className="sm-option" onClick={() => goTo("viewStep")}>
                    <div className="sm-option-icon" style={{ background: "#f5f3ff" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <div className="sm-option-content">
                      <strong>View Step</strong>
                      <span>See Macro, Micro and Nano layer details</span>
                    </div>
                    <IconChevron />
                  </div>

                  <div className="sm-option" onClick={() => goTo("marketplace_layer")}>
                    <div className="sm-option-icon" style={{ background: "#f0fdfa" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                    <div className="sm-option-content">
                      <strong>Marketplace</strong>
                      <span>Add or manage marketplace listings by layer</span>
                    </div>
                    <IconChevron />
                  </div>

                  <div className="sm-option sm-option--danger" onClick={() => goTo("deleteConfirm")}>
                    <div className="sm-option-icon" style={{ background: "#fef2f2" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10" />
                        <line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </div>
                    <div className="sm-option-content">
                      <strong>Delete Step</strong>
                      <span>Permanently remove this step</span>
                    </div>
                    <IconChevron />
                  </div>
                </div>
              )}

              {/* EDIT STEP */}
              {modalScreen === "editStep" && (
                <div className="sm-form">
                  <div className="sm-form-group">
                    <label className="sm-label">Name</label>
                    <input className="sm-input" type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Step name" />
                  </div>
                  <div className="sm-form-group">
                    <label className="sm-label">Description</label>
                    <textarea className="sm-input sm-textarea" value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="What does this step cover?" />
                  </div>
                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Length (days)</label>
                      <input className="sm-input" type="number" value={editLength} onChange={e => setEditLength(e.target.value)} placeholder="e.g. 30" />
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Cost</label>
                      <input className="sm-input" type="text" value={editCost} onChange={e => setEditCost(e.target.value)} placeholder="Free or amount" />
                    </div>
                  </div>
                  <button className="sm-btn-primary" onClick={handleSaveStep} disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}

              {/* VIEW STEP - Keep same structure */}
              {modalScreen === "viewStep" && (
                <div className="sm-view-step">
                  <div className="sm-layer-tabs">
                    {[
                      { key: "macro", label: "Macro", color: "#7c3aed" },
                      { key: "micro", label: "Micro", color: "#0891b2" },
                      { key: "nano", label: "Nano", color: "#d97706" },
                    ].map(({ key, label, color }) => (
                      <button
                        key={key}
                        className={`sm-layer-tab ${viewLayerTab === key ? "active" : ""}`}
                        style={viewLayerTab === key ? { background: color, color: "#fff", borderColor: color } : {}}
                        onClick={() => setViewLayerTab(key)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {["macro", "micro", "nano"].map(layer => (
                    viewLayerTab === layer && (
                      <div key={layer} className={`sm-layer-card sm-layer-card--${layer}`}>
                        {[
                          ["Name", selectedStep?.[`${layer}_name`]],
                          ["Description", selectedStep?.[`${layer}_description`]],
                          ["Length", parseDuration(selectedStep?.length) || parseDuration(selectedStep?.[`${layer}_length`])],
                          ["Access", selectedStep?.[`${layer}_access`]],
                          ["Instructions", selectedStep?.[`${layer}_instructions`]],
                          ["Chances", selectedStep?.[`${layer}_chances`]],
                        ].map(([label, val]) => val ? (
                          <div key={label} className="sm-layer-row">
                            <span className="sm-layer-key">{label}</span>
                            <span className="sm-layer-val">{val}</span>
                          </div>
                        ) : null)}
                        {!selectedStep?.[`${layer}_name`] && !selectedStep?.[`${layer}_description`] && (
                          <p className="sm-layer-empty">
                            No {layer.charAt(0).toUpperCase() + layer.slice(1)} data configured for this step.
                          </p>
                        )}
                      </div>
                    )
                  ))}
                </div>
              )}

              {/* MARKETPLACE LAYER SELECTOR */}
              {modalScreen === "marketplace_layer" && (
                <div className="admin-pp-selector">
                  <p className="admin-pp-section-label">Select a view to manage</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {Object.entries(getLayerConfig(selectedStep)).map(([layerKey, cfg]) => (
                      <div
                        key={layerKey}
                        style={{
                          padding: "18px 20px",
                          borderRadius: 16,
                          cursor: "pointer",
                          border: `1.5px solid ${cfg.border}`,
                          background: cfg.bg,
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          transition: "all 0.15s",
                        }}
                        onClick={() => {
                          setMarketLayer(layerKey);
                          setAttachedServices([]);
                          setMarketplaceItems([]);
                          fetchMarketplaceData(selectedStep._id, layerKey);
                          goTo("marketplace_attach");
                        }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: cfg.color, display: "flex",
                          alignItems: "center", justifyContent: "center",
                          color: "#fff", fontWeight: 800, fontSize: "1rem", flexShrink: 0,
                        }}>
                          {cfg.label[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontWeight: 700, fontSize: "0.78rem",
                            color: cfg.color, textTransform: "uppercase",
                            letterSpacing: "0.07em", marginBottom: 3,
                          }}>
                            {cfg.label}
                          </div>
                          <div style={{
                            fontWeight: 600, fontSize: "0.88rem",
                            color: "#0f172a", marginBottom: 2,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {cfg.viewName}
                          </div>
                          <div style={{
                            fontSize: "0.74rem", color: "#64748b",
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {cfg.viewDesc}
                          </div>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MARKETPLACE ATTACH */}
              {modalScreen === "marketplace_attach" && (
                <div>
                  {currentLayerCfg && (
                    <div style={{ marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "600" }}>{currentLayerCfg.viewName}</h3>
                      <p style={{ color: "#64748b", fontSize: "13px" }}>{currentLayerCfg.viewDesc}</p>
                    </div>
                  )}

                  <p className="admin-pp-section-label">
                    ATTACHED TO THIS STEP ({marketLayer?.toUpperCase()})
                  </p>

                  {marketplaceLoading ? (
                    <div style={{ padding: "12px 0", color: "#64748b", fontSize: "13px" }}>Loading...</div>
                  ) : attachedServices.length > 0 ? (
                    attachedServices.map(item => (
                      <div className="admin-pp-market-item" key={item._id}>
                        <div className="admin-pp-market-item-info">
                          <div className="admin-pp-market-emoji">📦</div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.role}</span>
                          </div>
                        </div>
                        <button
                          className="admin-pp-market-remove-btn"
                          disabled={actionLoading}
                          onClick={() => detachMarketService(item)}>
                          {actionLoading ? "..." : "Remove"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="admin-pp-empty">No items attached to this step</div>
                  )}

                  <button
                    className="admin-pp-create-btn"
                    style={{ marginTop: "16px", marginBottom: "8px" }}
                    onClick={() => goTo("marketplace_create")}>
                    + Create New Listing
                  </button>

                  <p className="admin-pp-section-label" style={{ marginTop: "20px" }}>
                    ALL {marketLayer?.toUpperCase()} MARKETPLACE ({availableItems.length} available)
                  </p>

                  {marketplaceLoading ? (
                    <div style={{ padding: "12px 0", color: "#64748b", fontSize: "13px" }}>Loading...</div>
                  ) : availableItems.length === 0 ? (
                    <div className="admin-pp-empty">No other {marketLayer} items in marketplace</div>
                  ) : (
                    // REPLACE the availableItems.map block in marketplace_attach
                    availableItems.map(item => (
                      <div className="admin-pp-market-item" key={item._id}>
                        <div className="admin-pp-market-item-info">
                          <div className="admin-pp-market-emoji">📦</div>
                          <div>
                            <strong>{item.name}</strong>
                            <span>{item.role}</span>    {/* ← span is already separate, issue is CSS */}
                            {item.step_id && (
                              <span style={{ fontSize: "11px", color: "#f59e0b", display: "block" }}>
                                ⚠ Already linked to another step
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="admin-pp-market-attach-btn"
                          disabled={actionLoading}
                          onClick={() => attachMarketService(item)}>
                          {actionLoading ? "..." : "Attach"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* MARKETPLACE CREATE */}
              {modalScreen === "marketplace_create" && (
                <div className="admin-pp-selector">
 // REPLACE the currentLayerCfg block at top of marketplace_attach
                  {currentLayerCfg && (
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 12px",
                      background: currentLayerCfg.bg,
                      borderRadius: 8,
                      border: `1.5px solid ${currentLayerCfg.border}`,
                      fontSize: "0.75rem",
                      color: currentLayerCfg.color,
                      fontWeight: 600,
                      marginBottom: 14,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {currentLayerCfg.label} — {currentLayerCfg.viewName}
                    </div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Role *</label>
                      <select
                        value={mpRole} onChange={e => setMpRole(e.target.value)}
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", background: "#fff" }}>
                        <option value="">Select role...</option>
                        <option value="institution">Institution</option>
                        <option value="mentor">Mentor</option>
                        <option value="distributor">Distributor</option>
                        <option value="vendor">Vendor</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Name *</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpName} onChange={e => setMpName(e.target.value)}
                        placeholder="e.g. Malla Reddy University"
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Access</label>
                        <select
                          value={mpAccess} onChange={e => setMpAccess(e.target.value)}
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", background: "#fff" }}>
                          <option value="Free">Free</option>
                          <option value="Paid">Paid</option>
                          <option value="Subscription">Subscription</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Cost</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpCost} onChange={e => setMpCost(e.target.value)} placeholder="e.g. ₹65,000"
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Duration</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpDuration} onChange={e => setMpDuration(e.target.value)} placeholder="e.g. 3 months"
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Goal</label>
                      <input
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                        type="text" value={mpGoal} onChange={e => setMpGoal(e.target.value)} placeholder="What goal does this serve?"
                      />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Features</label>
                      <textarea
                        style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none", minHeight: 70, resize: "vertical", fontFamily: "inherit" }}
                        value={mpFeatures} onChange={e => setMpFeatures(e.target.value)} placeholder="Key features or offerings"
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Outcomes</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpOutcomes} onChange={e => setMpOutcomes(e.target.value)} placeholder="Expected outcomes"
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        <label className="admin-pp-section-label" style={{ marginBottom: 0 }}>Discount</label>
                        <input
                          style={{ padding: "9px 12px", border: "1.5px solid #e8ecf0", borderRadius: 10, fontSize: "0.85rem", outline: "none" }}
                          type="text" value={mpDiscount} onChange={e => setMpDiscount(e.target.value)} placeholder="e.g. 10%"
                        />
                      </div>
                    </div>

                    <button
                      className="admin-pp-btn admin-pp-btn--blue"
                      style={{ marginTop: 4, borderRadius: 50 }}
                      disabled={actionLoading}
                      onClick={() => {
                        if (!mpRole || !mpName) { toast.error("Role and Name are required"); return; }
                        setActionLoading(true);

                        axios
                          .post(`${BASE_URL}/api/marketplace/add`, {
                            name: mpName,
                            role: mpRole,
                            layer: marketLayer,
                            step_id: selectedStep._id,
                            path_id: null,
                            partner_email: userDetails?.email || "",
                            access: mpAccess,
                            cost: mpCost,
                            goal: mpGoal,
                            outcomes: mpOutcomes,
                            duration: mpDuration,
                            features: mpFeatures,
                            discount: mpDiscount,
                          })
                          .then(({ data }) => {
                            if (data?.status && data?.data) {
                              const newItem = data.data;
                              setAttachedServices(prev => [...prev, newItem]);
                              setMarketplaceItems(prev => [...prev, newItem]);
                              const fieldKey = `${marketLayer}_marketplace`;
                              setSelectedStep(prev => ({
                                ...prev,
                                [fieldKey]: [...(prev?.[fieldKey] || []), newItem._id],
                              }));
                              setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
                              setMpGoal(""); setMpOutcomes(""); setMpDuration("");
                              setMpFeatures(""); setMpDiscount("");
                              fetchMarketplaceCounts(partnerStepsData);
                              goBack();
                            }
                            setActionLoading(false);
                          })
                          .catch(() => {
                            toast.error("Failed to add marketplace item");
                            setActionLoading(false);
                          });
                      }}>
                      {actionLoading ? "Adding..." : "Add to Marketplace"}
                    </button>
                  </div>
                </div>
              )}

              {/* DELETE CONFIRM */}
              {modalScreen === "deleteConfirm" && (
                <div className="sm-confirm">
                  <div className="sm-confirm-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0h10" />
                    </svg>
                  </div>
                  <h3>Delete this step?</h3>
                  <p><strong>"{selectedStep?.name}"</strong> will be permanently removed.</p>
                  <div className="sm-confirm-actions">
                    <button className="sm-btn-danger" onClick={handleDeleteStep} disabled={actionLoading}>
                      {actionLoading ? "Deleting..." : "Yes, Delete"}
                    </button>
                    <button className="sm-btn-ghost" onClick={goBack}>Cancel</button>
                  </div>
                </div>
              )}

              {/* SUCCESS */}
              {modalScreen === "success" && (
                <div className="sm-success">
                  <div className="sm-success-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3>Done!</h3>
                  <p>Step deleted successfully</p>
                </div>
              )}
            </div>
            {actionLoading && !["deleteConfirm", "editStep", "marketplace_create"].includes(modalScreen) && (
              <div className="sm-loading-overlay">
                <img src={lg1} alt="" style={{ width: 40, height: 40, animation: "smSpin 1s linear infinite" }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MyStepsAdmin;