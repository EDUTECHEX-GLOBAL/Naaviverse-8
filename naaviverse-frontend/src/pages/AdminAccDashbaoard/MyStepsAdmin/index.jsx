import React, { useState, useEffect } from "react";
import { useCoinContextData } from "../../../context/CoinContext.js";
import Skeleton from "react-loading-skeleton";
import "./mypaths.scss";
import axios from "axios";
import closepop from "../../../static/images/dashboard/closepop.svg";
import lg1 from "../../../static/images/login/lg1.svg";
import { useStore } from "../../../components/store/store.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const MyStepsAdmin = ({ search, admin, fetchAllServicesAgain }) => {
  const navigate = useNavigate();
  let userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const { mypathsMenu, setMypathsMenu } = useCoinContextData();

  const [partnerStepsData, setPartnerStepsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [serviceCountMap, setServiceCountMap] = useState({});

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalScreen, setModalScreen] = useState("main"); // main | editStep | editServices | addService | removeService | addMarketplace | deleteConfirm | success
  const [selectedStep, setSelectedStep] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);

  // Services
  const [allServices, setAllServices] = useState([]);
  const [attachedServices, setAttachedServices] = useState([]);

  // Edit form
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLength, setEditLength] = useState("");
  const [editCost, setEditCost] = useState("");

  // Marketplace form
  const [mpRole, setMpRole] = useState("");
  const [mpName, setMpName] = useState("");
  const [mpAccess, setMpAccess] = useState("Free");
  const [mpCost, setMpCost] = useState("");
  const [mpGoal, setMpGoal] = useState("");
  const [mpOutcomes, setMpOutcomes] = useState("");
  const [mpDuration, setMpDuration] = useState("");
  const [mpLayer, setMpLayer] = useState("macro");
  const [mpFeatures, setMpFeatures] = useState("");
  const [mpDiscount, setMpDiscount] = useState("");

  // Marketplace items attached to this step
  const [stepMarketItems, setStepMarketItems] = useState([]);
  const [allMarketItems, setAllMarketItems] = useState([]);

  // ─── Data fetchers ────────────────────────────────────────
  const getAllSteps = () => {
    setLoading(true);
    const status = mypathsMenu === "Active Steps" ? "active" : "inactive";
    axios.get(`${BASE_URL}/api/steps/get?status=${status}`)
      .then(({ data }) => {
        const result = data?.data || [];
        setPartnerStepsData(result);
        if (result.length > 0) fetchServiceCounts(result);
        else setServiceCountMap({});
        setLoading(false);
      })
      .catch(() => { setPartnerStepsData([]); setLoading(false); });
  };

  const fetchServiceCounts = async (steps = []) => {
    if (!Array.isArray(steps) || steps.length === 0) return;
    const counts = {};
    await Promise.all(steps.map(async (step) => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/steps/getall/${step._id}`);
        counts[step._id] = data?.data?.length || 0;
      } catch { counts[step._id] = 0; }
    }));
    setServiceCountMap(counts);
  };

  const fetchAttachedServices = async (stepId) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/steps/getall/${stepId}`);
      setAttachedServices(data?.status ? data.data || [] : []);
    } catch { setAttachedServices([]); }
  };

  const fetchAllServices = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/services/admin?status=active`);
      setAllServices(data?.status ? data.data || [] : []);
    } catch { setAllServices([]); }
  };

  const fetchStepMarketItems = async (stepId) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/marketplace/step/${stepId}`);
      setStepMarketItems(data?.status ? data.data || [] : []);
    } catch { setStepMarketItems([]); }
  };

  const fetchAllMarketItems = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/marketplace/admin/get-all`);
      setAllMarketItems(data?.status ? data.data || [] : []);
    } catch { setAllMarketItems([]); }
  };

  useEffect(() => { getAllSteps(); }, [mypathsMenu]);

  useEffect(() => {
    if (modalOpen) document.body.classList.add('admin-popup-open');
    else document.body.classList.remove('admin-popup-open');
    return () => document.body.classList.remove('admin-popup-open');
  }, [modalOpen]);

  // ─── Modal navigation ─────────────────────────────────────
  const openModal = async (step) => {
    setSelectedStep(step);
    setModalScreen("main");
    setModalHistory([]);
    setModalOpen(true);
  };

  const goTo = async (screen) => {
    setModalHistory(prev => [...prev, modalScreen]);
    setModalScreen(screen);

    if (screen === "editStep") {
      setEditName(selectedStep?.name || "");
      setEditDesc(selectedStep?.description || "");
      setEditLength(selectedStep?.length || "");
      setEditCost(selectedStep?.cost || "");
    }
    if (screen === "editServices") {
      await fetchAttachedServices(selectedStep._id);
    }
    if (screen === "addService") {
      await fetchAllServices();
      await fetchAttachedServices(selectedStep._id);
    }
    if (screen === "removeService") {
      await fetchAttachedServices(selectedStep._id);
    }
    if (screen === "marketplace") {
      await fetchStepMarketItems(selectedStep._id);
      await fetchAllMarketItems();
    }
    if (screen === "addMarketplace") {
      setMpRole(""); setMpName(""); setMpAccess("Free"); setMpCost("");
      setMpGoal(""); setMpOutcomes(""); setMpDuration(""); setMpLayer("macro");
      setMpFeatures(""); setMpDiscount("");
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
    setAttachedServices([]);
    setAllServices([]);
    setStepMarketItems([]);
    setAllMarketItems([]);
  };

  const getTitle = () => {
    const titles = {
      main: "Step Actions",
      editStep: "Edit Step",
      editServices: "Manage Services",
      addService: "Add Service",
      removeService: "Remove Service",
      marketplace: "Marketplace",
      addMarketplace: "Add Marketplace Listing",
      deleteConfirm: "Delete Step",
      success: "",
    };
    return titles[modalScreen] || "Step Actions";
  };

  // ─── Actions ──────────────────────────────────────────────
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
      if (editDesc) payload.description = editDesc;
      if (editLength) payload.length = editLength;
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

  const handleAddService = async (serviceId) => {
    if (!selectedStep?._id) return;
    try {
      await axios.post(`${BASE_URL}/api/steps/attachservice`, { step_id: selectedStep._id, service_ids: [serviceId] });
      toast.success("Service added");
      await fetchAttachedServices(selectedStep._id);
      fetchServiceCounts(partnerStepsData);
    } catch { toast.error("Failed to add service"); }
  };

  const handleRemoveService = async (serviceId) => {
    if (!selectedStep?._id) return;
    setActionLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/steps/remove/${selectedStep._id}/${serviceId}`);
      toast.success("Service removed");
      await fetchAttachedServices(selectedStep._id);
      fetchServiceCounts(partnerStepsData);
    } catch { toast.error("Failed to remove service"); }
    finally { setActionLoading(false); }
  };

  const handleAddMarketplace = async () => {
    if (!mpRole || !mpName) { toast.error("Role and Name are required"); return; }
    setActionLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/marketplace/add`, {
        name: mpName,
        role: mpRole,
        layer: mpLayer,
        step_id: selectedStep._id,
        partner_email: userDetails?.email || "",
        access: mpAccess,
        cost: mpCost,
        goal: mpGoal,
        outcomes: mpOutcomes,
        duration: mpDuration,
        features: mpFeatures,
        discount: mpDiscount,
      });
      toast.success("Marketplace item added");
      setActionLoading(false);
      await fetchStepMarketItems(selectedStep._id);
      goBack();
    } catch {
      toast.error("Failed to add marketplace item");
      setActionLoading(false);
    }
  };

  const handleDetachMarket = async (itemId) => {
    setActionLoading(true);
    try {
      await axios.patch(`${BASE_URL}/api/marketplace/update/${itemId}`, { step_id: null });
      toast.success("Removed from step");
      await fetchStepMarketItems(selectedStep._id);
    } catch { toast.error("Failed to remove"); }
    finally { setActionLoading(false); }
  };

  const handleAttachExistingMarket = async (item) => {
    setActionLoading(true);
    try {
      await axios.patch(`${BASE_URL}/api/marketplace/update/${item._id}`, { step_id: selectedStep._id });
      toast.success("Service attached");
      setStepMarketItems(prev => [...prev, { ...item, step_id: selectedStep._id }]);
      setAllMarketItems(prev => prev.filter(m => m._id !== item._id));
    } catch { toast.error("Failed to attach"); }
    finally { setActionLoading(false); }
  };

  // ─── Filter ───────────────────────────────────────────────
  const filtered = partnerStepsData?.filter(e =>
    e?.name?.toLowerCase()?.includes(search?.toLowerCase() || "")
  );

  const roleEmoji = { institution: "🏛", mentor: "👤", distributor: "📦", vendor: "🛍" };
  const roleColor = { institution: "#7c3aed", mentor: "#0891b2", distributor: "#d97706", vendor: "#dc2626" };

  return (
    <div className="admin-mypaths">

      {/* TABS */}
      <div className="admin-mypaths-menu">
        {["Active Steps", "Inactive Steps"].map(tab => (
          <div key={tab}
            className={`admin-each-mypath-menu ${mypathsMenu === tab ? "active-tab" : ""}`}
            onClick={() => setMypathsMenu(tab)}>
            {tab}
          </div>
        ))}
      </div>

      {/* CONTENT */}
      <div className="admin-mypaths-content">
        {/* Table header */}
        <div className="admin-mypathsNav">
          <div className="admin-mypathsName">Name</div>
          <div className="admin-mypathsCountry">Length</div>
          <div className="admin-mypathsCountry">Cost</div>
          <div className="admin-mypathsMicrosteps">MarketPlace</div>
        </div>

        <div className="admin-mypathsScroll-div">
          {loading
            ? Array(8).fill("").map((_, i) => (
              <div className="step-row" key={i} style={{ pointerEvents: "none" }}>
                <div className="step-row-main">
                  <div style={{ width: "25%" }}><Skeleton height={16} width="70%" /></div>
                  <div style={{ width: "25%" }}><Skeleton height={16} width="50%" /></div>
                  <div style={{ width: "25%" }}><Skeleton height={16} width="50%" /></div>
                  <div style={{ width: "25%" }}><Skeleton height={16} width="30%" /></div>
                </div>
              </div>
            ))
            : filtered?.map(e => {
              const isFree = !e?.cost || e?.cost?.toLowerCase() === "free";
              return (
                <div className="step-row" key={e._id} onClick={() => openModal(e)}>
                  <div className="step-row-main">
                    <div className="step-row-name">{e?.name || "Untitled"}</div>
                    <div className="step-row-length">{e?.length || 0} Days</div>
                    <div className="step-row-cost">
                      <span className={`step-cost-pill ${isFree ? "free" : "paid"}`}>
                        {isFree ? "Free" : e?.cost}
                      </span>
                    </div>
                    <div className="step-row-services">
                      <span className="step-services-count">{serviceCountMap[e._id] ?? 0}</span>
                    </div>
                  </div>
                  {e?.description && <div className="step-row-desc">{e.description}</div>}
                  <div className="step-row-footer">
                   
                    <span className="step-footer-date">
                      {e?.createdAt ? new Date(e.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* ══ STEP MODAL ══ */}
      {modalOpen && (
        <>
          <div className="sm-overlay" onClick={closeModal} />
          <div className="sm-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
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

            {/* Step name chip */}
            {selectedStep && modalScreen !== "success" && (
              <div className="sm-chip">
                <span className="sm-chip-dot" />
                {selectedStep.name}
              </div>
            )}

            <div className="sm-body">

              {/* MAIN */}
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>

                  <div className="sm-option" onClick={() => goTo("marketplace")}>
                    <div className="sm-option-icon" style={{ background: "#f0fdfa" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </div>
                    <div className="sm-option-content">
                      <strong>Marketplace</strong>
                      <span>Add or manage marketplace listings for this step</span>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
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

              {/* MARKETPLACE */}
              {modalScreen === "marketplace" && (
                <div>
                  {stepMarketItems.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <p className="sm-section-label">Attached to this step</p>
                      <div className="sm-service-list">
                        {stepMarketItems.map(item => {
                          const re = roleEmoji[item.role?.toLowerCase()] || "📦";
                          const rc = roleColor[item.role?.toLowerCase()] || "#64748b";
                          return (
                            <div key={item._id} className="sm-service-item">
                              <div className="sm-service-left">
                                <div className="sm-service-emoji">{re}</div>
                                <div>
                                  <div className="sm-service-name">{item.name}</div>
                                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: rc, textTransform: "uppercase" }}>{item.role}</div>
                                </div>
                              </div>
                              <button className="sm-remove-btn" onClick={() => handleDetachMarket(item._id)}>Remove</button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="sm-mkt-actions">
                    <div className="sm-option" onClick={() => goTo("addMarketplace")}>
                      <div className="sm-option-icon" style={{ background: "#ecfdf5" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                      <div className="sm-option-content">
                        <strong>Create New Listing</strong>
                        <span>Add a new marketplace item to this step</span>
                      </div>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>

                  {allMarketItems.filter(m => !stepMarketItems.some(s => s._id === m._id)).length > 0 && (
                    <div style={{ marginTop: 20 }}>
                      <p className="sm-section-label">Attach existing item</p>
                      <div className="sm-service-list">
                        {allMarketItems.filter(m => !stepMarketItems.some(s => s._id === m._id)).map(item => {
                          const re = roleEmoji[item.role?.toLowerCase()] || "📦";
                          const rc = roleColor[item.role?.toLowerCase()] || "#64748b";
                          const alreadyOnStep = item.step_id && item.step_id.toString() === selectedStep._id.toString();
                          return (
                            <div key={item._id}
                              className={`sm-service-item sm-service-item--attach ${alreadyOnStep ? "sm-service-item--disabled" : ""}`}
                              onClick={() => { if (!alreadyOnStep) handleAttachExistingMarket(item); }}>
                              <div className="sm-service-left">
                                <div className="sm-service-emoji">{re}</div>
                                <div>
                                  <div className="sm-service-name">{item.name}</div>
                                  <div style={{ fontSize: "0.7rem", fontWeight: 600, color: rc, textTransform: "uppercase" }}>{item.role}</div>
                                </div>
                              </div>
                              {alreadyOnStep
                                ? <span className="sm-tag sm-tag--gray">Added</span>
                                : <span className="sm-tag sm-tag--teal">Attach →</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ADD MARKETPLACE FORM — inline, no second popup */}
              {modalScreen === "addMarketplace" && (
                <div className="sm-form">
                  <div className="sm-form-layer-badge">
                    <span>Adding to</span>
                    <select className="sm-layer-select" value={mpLayer} onChange={e => setMpLayer(e.target.value)}>
                      <option value="macro">Macro</option>
                      <option value="micro">Micro</option>
                      <option value="nano">Nano</option>
                    </select>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Marketplace Role <span className="sm-required">*</span></label>
                    <select className="sm-input sm-select" value={mpRole} onChange={e => setMpRole(e.target.value)}>
                      <option value="">Select role...</option>
                      <option value="institution">Institution</option>
                      <option value="mentor">Mentor</option>
                      <option value="distributor">Distributor</option>
                      <option value="vendor">Vendor</option>
                    </select>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Name <span className="sm-required">*</span></label>
                    <input className="sm-input" type="text" value={mpName} onChange={e => setMpName(e.target.value)} placeholder="e.g. Malla Reddy University" />
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Access</label>
                      <select className="sm-input sm-select" value={mpAccess} onChange={e => setMpAccess(e.target.value)}>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                        <option value="Subscription">Subscription</option>
                      </select>
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Cost</label>
                      <input className="sm-input" type="text" value={mpCost} onChange={e => setMpCost(e.target.value)} placeholder="e.g. ₹65,000" />
                    </div>
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Duration</label>
                    <input className="sm-input" type="text" value={mpDuration} onChange={e => setMpDuration(e.target.value)} placeholder="e.g. 3 months, 1 year" />
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Goal</label>
                    <input className="sm-input" type="text" value={mpGoal} onChange={e => setMpGoal(e.target.value)} placeholder="What goal does this serve?" />
                  </div>

                  <div className="sm-form-group">
                    <label className="sm-label">Features</label>
                    <textarea className="sm-input sm-textarea" value={mpFeatures} onChange={e => setMpFeatures(e.target.value)} placeholder="Key features or offerings" />
                  </div>

                  <div className="sm-form-row">
                    <div className="sm-form-group">
                      <label className="sm-label">Outcomes</label>
                      <input className="sm-input" type="text" value={mpOutcomes} onChange={e => setMpOutcomes(e.target.value)} placeholder="Expected outcomes" />
                    </div>
                    <div className="sm-form-group">
                      <label className="sm-label">Discount</label>
                      <input className="sm-input" type="text" value={mpDiscount} onChange={e => setMpDiscount(e.target.value)} placeholder="e.g. 10%" />
                    </div>
                  </div>

                  <button className="sm-btn-primary" onClick={handleAddMarketplace} disabled={actionLoading}>
                    {actionLoading ? "Adding..." : "Add to Marketplace"}
                  </button>
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

            {actionLoading && modalScreen !== "deleteConfirm" && modalScreen !== "editStep" && modalScreen !== "addMarketplace" && (
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