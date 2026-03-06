// src/pages/DraftPathView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/Pathview/journey.scss";
import EditPathForm from "./MyPaths/paths";

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const LAYERS = ["macro", "micro", "nano"];

const EMPTY_LAYER = {
  name: "",
  desc: "",
  duration: { years: "", months: "", days: "" },
  paid: false,
  free: false,
  instructions: "",
  marketplace: [],
};

const EMPTY_STEP = {
  macro: { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
  micro: { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
  nano:  { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
};

const EMPTY_MARKET_FORM = {
  name: "",
  access: "Free",
  cost: "",
  goal: "",
  outcomes: "",
  iterations: "",
  durationDays: "",
  durationHours: "",
  durationMinutes: "",
  discount: "",
  features: "",
};

// ─── FIX #3: Normalize a raw step from the API into the macro/micro/nano shape ──
const normalizeStep = (raw) => {
  if (!raw) return JSON.parse(JSON.stringify(EMPTY_STEP));

  const parseDuration = (val) => {
    if (!val) return { years: "", months: "", days: "" };
    if (typeof val === "object") return val;
    try { return JSON.parse(val); } catch { return { years: "", months: "", days: "" }; }
  };

  // If the step already has the nested shape, just ensure marketplace arrays exist
  if (raw.macro && typeof raw.macro === "object") {
    return {
      ...raw,
      macro: { ...EMPTY_LAYER, ...raw.macro, marketplace: raw.macro.marketplace || [] },
      micro: { ...EMPTY_LAYER, ...raw.micro, marketplace: raw.micro?.marketplace || [] },
      nano:  { ...EMPTY_LAYER, ...raw.nano,  marketplace: raw.nano?.marketplace  || [] },
    };
  }

  // Flat API shape → nested shape
  return {
    ...raw,
macro: {
  ...EMPTY_LAYER,
  name: raw.macro_name || "",
  desc: raw.macro_description || "",
  duration: parseDuration(raw.macro_length),

  paid: raw.macro_access === "paid",
  free: raw.macro_access === "free",

  instructions: raw.macro_instructions || "",
  marketplace: raw.macro_marketplace || [],
},
micro: {
  ...EMPTY_LAYER,
  name: raw.micro_name || "",
  desc: raw.micro_description || "",
  duration: parseDuration(raw.micro_length),

  paid: raw.micro_access === "paid",
  free: raw.micro_access === "free",

  instructions: raw.micro_instructions || "",
  marketplace: raw.micro_marketplace || [],
},
nano: {
  ...EMPTY_LAYER,
  name: raw.nano_name || "",
  desc: raw.nano_description || "",
  duration: parseDuration(raw.nano_length),

  paid: raw.nano_access === "paid",
  free: raw.nano_access === "free",

  instructions: raw.nano_instructions || "",
  marketplace: raw.nano_marketplace || [],
},
  };
};

// ─── Small reusable components ────────────────────────────────────────────────

const MarketplaceItemCard = ({ item, compact = false }) => (
  <div style={{
    background: "#f4f9fd",
    borderRadius: compact ? 12 : 16,
    padding: compact ? "0.8rem" : "1rem",
    marginBottom: "0.5rem",
    border: "1px solid #ccdae5",
    fontSize: compact ? "0.85rem" : "0.9rem",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
      <span>{item.name || "Unnamed"} ({item.role || "unknown"})</span>
      <span>{item.cost}</span>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.3rem", color: "#2c3e50" }}>
      {item.goal       && <span><strong>Goal:</strong> {item.goal}</span>}
      {item.outcomes   && <span><strong>Outcomes:</strong> {item.outcomes}</span>}
      {item.access     && <span><strong>Access:</strong> {item.access}</span>}
      {item.iterations && <span><strong>Iterations:</strong> {item.iterations}</span>}
      {item.duration   && <span><strong>Duration:</strong> {item.duration}</span>}
      {item.discount   && <span><strong>Discount:</strong> {item.discount}</span>}
    </div>
    {item.features && (
      <div style={{ marginTop: "0.4rem" }}><strong>Features:</strong> {item.features}</div>
    )}
  </div>
);

const DurationSelect = ({ value, onChange, type }) => {
  const configs = {
    years:  { label: "Years",  count: 11 },
    months: { label: "Months", count: 12 },
    days:   { label: "Days",   count: 31 },
  };
  const { label, count } = configs[type];
  return (
    <select className="duration-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {[...Array(count)].map((_, i) => (
        <option key={i} value={i}>
          {i} {i === 1 ? label.slice(0, -1) : label}
        </option>
      ))}
    </select>
  );
};

// ─── FIX #3: Guard data prop so LayerBuilder never crashes on undefined ───────
const LayerBuilder = ({ layer, layerKey, data, onChange, onAddMarketplace }) => {
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };

  // Safe fallback if data is somehow undefined
  const safeData = data || { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] };

  const update = (field, value) =>
    onChange({ ...safeData, [field]: value });

  const updateDuration = (part, value) =>
    onChange({ ...safeData, duration: { ...safeData.duration, [part]: value } });

  return (
    <div className="builder-layer">
      <h3 style={{ color: colorMap[layerKey], fontSize: "0.9rem", fontWeight: 600, marginBottom: "1.25rem" }}>
        {layer.toUpperCase()}
      </h3>

      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          placeholder={`e.g., ${layerKey === "macro" ? "Career Exploration" : layerKey === "micro" ? "Aptitude Test" : "Take Online Assessment"}`}
          value={safeData.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea
          rows="2"
          placeholder="Enter description"
          value={safeData.desc}
          onChange={(e) => update("desc", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Duration</label>
        <div className="duration-select-group">
          <DurationSelect type="years"  value={safeData.duration?.years}  onChange={(v) => updateDuration("years", v)} />
          <DurationSelect type="months" value={safeData.duration?.months} onChange={(v) => updateDuration("months", v)} />
          <DurationSelect type="days"   value={safeData.duration?.days}   onChange={(v) => updateDuration("days", v)} />
        </div>
        <div className="checkbox-group">
          <label className="checkbox-label">
            <input type="checkbox" checked={!!safeData.paid} onChange={(e) => update("paid", e.target.checked)} />
            Paid
          </label>
          <label className="checkbox-label">
            <input type="checkbox" checked={!!safeData.free} onChange={(e) => update("free", e.target.checked)} />
            Free
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>Instructions</label>
        <textarea
          rows="2"
          placeholder="Enter instructions"
          value={safeData.instructions}
          onChange={(e) => update("instructions", e.target.value)}
        />
      </div>

      <div className="marketplace-section">
        <label>Marketplace Items</label>
        <div className="marketplace-items-builder">
          {(safeData.marketplace || []).length === 0 ? (
            <p className="no-items">No marketplace items added.</p>
          ) : (
            (safeData.marketplace || []).map((item, i) => (
              <MarketplaceItemCard key={i} item={item} compact />
            ))
          )}
        </div>
        <button
          className="icon-btn"
          onClick={(e) => { e.stopPropagation(); onAddMarketplace(layerKey); }}
        >
          + Add Marketplace
        </button>
      </div>
    </div>
  );
};

const LayerDetail = ({ layerKey, data }) => {
  if (!data) return null;
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };

  const durationText = data.duration
    ? [
        data.duration.years  ? `${data.duration.years} years`  : "",
        data.duration.months ? `${data.duration.months} months` : "",
        data.duration.days   ? `${data.duration.days} days`    : "",
      ].filter(Boolean).join(" ") || "Not set"
    : "Not set";

  return (
    <div className="layer-detail-card">
      <h3 style={{ color: colorMap[layerKey], fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem",
                   paddingBottom: "0.5rem", borderBottom: `2px solid ${colorMap[layerKey]}` }}>
        {layerKey.toUpperCase()}
      </h3>
      {[
        { label: "NAME",         value: data.name },
        { label: "DESCRIPTION",  value: data.desc },
        { label: "DURATION",     value: durationText },
        { label: "INSTRUCTIONS", value: data.instructions },
      ].map(({ label, value }) => (
        <div className="detail-row" key={label}>
          <span className="detail-label">{label}</span>
          <div className="detail-value">{value || "—"}</div>
        </div>
      ))}
      {(data.marketplace || []).map((item, i) => (
        <MarketplaceItemCard key={i} item={item} />
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const DraftPathView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const stopClick = (e) => e.stopPropagation();
    el.addEventListener("click", stopClick, true);
    return () => el.removeEventListener("click", stopClick, true);
  }, []);

  const [pathData,   setPathData]   = useState(null);
  const [steps,      setSteps]      = useState([]);
  const [totalSteps, setTotalSteps] = useState(5);
  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState(null);

  const [view, setView] = useState("draft");

  const [viewAllOpen,     setViewAllOpen]     = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [editPathOpen,    setEditPathOpen]    = useState(false);

  const [currentStep,      setCurrentStep]      = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentLayer,     setCurrentLayer]     = useState("macro");

  const [selectedRole, setSelectedRole] = useState(null);
  const [marketForm,   setMarketForm]   = useState(EMPTY_MARKET_FORM);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchSteps = useCallback(async (pathId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/steps/get`, { params: { path_id: pathId } });
      // FIX #2: normalize every step so macro.name is always accessible
      const fetched = (res.data.data || []).map(normalizeStep);
      setSteps(fetched);
      return fetched;
    } catch (err) {
      console.error("Error fetching steps:", err);
      return [];
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        const pathRes = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
        const data = pathRes.data.data;
        setPathData(data);
        // ── totalSteps: read from localStorage where CreateNewPath saves it ──
        const savedStepCount = localStorage.getItem('pathStepCount');
        const total = savedStepCount
          ? parseInt(savedStepCount, 10)
          : (data?.totalSteps || data?.total_steps || data?.numberOfSteps || 5);
        setTotalSteps(Number(total));
        await fetchSteps(id);
      } catch (err) {
        console.error("Error fetching path:", err);
        setError("Failed to load path. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, fetchSteps]);

  // ─── Navigation helpers ───────────────────────────────────────────────────

  const openBuilder = (index) => {
    if (index === null) {
      setCurrentStep(JSON.parse(JSON.stringify(EMPTY_STEP)));
      setCurrentStepIndex(null);
    } else {
      // FIX #3: use already-normalized step
      setCurrentStep(JSON.parse(JSON.stringify(steps[index])));
      setCurrentStepIndex(index);
    }
    setView("builder");
  };

  const openDetail = (index) => {
    setCurrentStep(steps[index]);
    setView("detail");
    setViewAllOpen(false);
  };

  const backToDraft = () => {
    setView("draft");
    setCurrentStep(null);
    setCurrentStepIndex(null);
  };

  // ─── Step save ────────────────────────────────────────────────────────────

  const saveStep = async () => {
    if (!currentStep) return;
    setSaving(true);
    setError(null);

    try {
      const isNew = currentStepIndex === null;
const payload = {
  path_id: id,
  step_order: isNew ? steps.length + 1 : steps[currentStepIndex]?.step_order,

  // ✅ ADD THIS — required for My Steps page to find these steps
  email: JSON.parse(localStorage.getItem("partner"))?.email || "",

  name: currentStep.macro?.name || "",
  macro_name:         currentStep.macro?.name        || "",
  macro_description:  currentStep.macro?.desc        || "",
  macro_length:       JSON.stringify(currentStep.macro?.duration || {}),
  macro_access:       currentStep.macro?.paid ? "paid" : "free",
  macro_instructions: currentStep.macro?.instructions || "",

  micro_name:         currentStep.micro?.name        || "",
  micro_description:  currentStep.micro?.desc        || "",
  micro_length:       JSON.stringify(currentStep.micro?.duration || {}),
  micro_access:       currentStep.micro?.paid ? "paid" : "free",
  micro_instructions: currentStep.micro?.instructions || "",

  nano_name:          currentStep.nano?.name         || "",
  nano_description:   currentStep.nano?.desc         || "",
  nano_length:        JSON.stringify(currentStep.nano?.duration  || {}),
  nano_access:        currentStep.nano?.paid ? "paid" : "free",
  nano_instructions:  currentStep.nano?.instructions || "",
};

      if (isNew) {
        const res = await axios.post(`${BASE_URL}/api/steps/add`, payload);
        // FIX #2: normalize the returned step before storing
        const saved = normalizeStep(res.data.data || payload);
        setSteps((prev) => [...prev, saved]);
      } else {
        const stepId = steps[currentStepIndex]._id;
        const res = await axios.put(`${BASE_URL}/api/steps/update/${stepId}`, payload);
        const saved = normalizeStep(res.data.data || { ...payload, _id: stepId });
        setSteps((prev) => {
          const copy = [...prev];
          copy[currentStepIndex] = saved;
          return copy;
        });
      }

      backToDraft();
    } catch (err) {
      console.error("Error saving step:", err);
      setError("Failed to save step. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const updateLayer = (layerKey, newLayerData) => {
    setCurrentStep((prev) => ({ ...prev, [layerKey]: newLayerData }));
  };

  // ─── Marketplace ──────────────────────────────────────────────────────────

  const openMarketplace = (layerKey) => {
    setCurrentLayer(layerKey);
    setSelectedRole(null);
    setMarketForm(EMPTY_MARKET_FORM);
    setMarketplaceOpen(true);
  };

  const closeMarketplace = () => {
    setMarketplaceOpen(false);
    setSelectedRole(null);
    setMarketForm(EMPTY_MARKET_FORM);
  };

  const addMarketplaceItem = () => {
    const durationParts = [
      marketForm.durationDays    ? `${marketForm.durationDays} days`   : "",
      marketForm.durationHours   ? `${marketForm.durationHours} hrs`   : "",
      marketForm.durationMinutes ? `${marketForm.durationMinutes} min` : "",
    ].filter(Boolean);

    const item = {
      role:       selectedRole,
      name:       marketForm.name,
      access:     marketForm.access,
      cost:       marketForm.cost,
      goal:       marketForm.goal,
      outcomes:   marketForm.outcomes,
      iterations: marketForm.iterations,
      duration:   durationParts.join(" "),
      discount:   marketForm.discount,
      features:   marketForm.features,
    };

    setCurrentStep((prev) => ({
      ...prev,
      [currentLayer]: {
        ...prev[currentLayer],
        marketplace: [...(prev[currentLayer].marketplace || []), item],
      },
    }));

    closeMarketplace();
  };

  // ─── Submit for approval ──────────────────────────────────────────────────

  const handleSubmitForApproval = async () => {
    try {
      await axios.put(`${BASE_URL}/api/paths/submit`, { pathId: id });
      alert("Path submitted for approval successfully!");
      const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
      setPathData(updated.data.data);
    } catch (err) {
      console.error("Error submitting path:", err);
      setError("Failed to submit for approval.");
    }
  };

  // ─── Render guards ────────────────────────────────────────────────────────

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p>Loading path details...</p>
    </div>
  );

  if (error && !pathData) return (
    <div className="loading-container">
      <p style={{ color: "#e53e3e" }}>{error}</p>
    </div>
  );

  if (!pathData) return null;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="draft-path-container">

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030",
                      padding: "0.75rem 1.5rem", fontSize: "0.85rem" }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "1rem", background: "none",
            border: "none", cursor: "pointer", color: "inherit", fontWeight: 600 }}>✕</button>
        </div>
      )}

      {/* ══ DRAFT VIEW ══════════════════════════════════════════════════════ */}
<div className={`draft-view ${view === "draft" ? "active" : ""}`}>
  <div className="path-header-box">
    <div className="path-header-content">

      {/* 🔹 Back Button */}
      <button
        className="btn-outline"
        style={{ marginBottom: "12px" }}
        onClick={() => navigate("/dashboard/accountants")}
      >
        ← Back to Paths
      </button>

      <div className="path-title-section">
        <h1 className="path-title">{pathData.nameOfPath || "Untitled Path"}</h1>
        <span className="draft-badge">DRAFT</span>
      </div>

      <div className="path-stats">
        <span className="steps-count">Steps: {steps.length}/{totalSteps}</span>
      </div>

      {pathData.description && (
        <p className="path-description">{pathData.description}</p>
      )}

      <div className="path-actions-row">
        <button className="btn-outline" onClick={() => setViewAllOpen(true)}>
          View All Steps
        </button>
        <button className="btn-outline" onClick={() => setEditPathOpen(true)}>
          Edit Path
        </button>
        <button className="btn-primary" onClick={handleSubmitForApproval}>
          Submit for Approval
        </button>
      </div>

    </div>
  </div>

        <div className="steps-section">
          <div className="steps-header">
            <h3>Steps</h3>
          </div>
          <div className="step-list">
            {steps.length === 0 ? (
              <div className="empty-state">
                <p>No steps yet. Click "Add New" to begin.</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div className="step-card" key={step._id || index}>
                  <div className="step-info">
                    <span className="step-number">Step {index + 1}</span>
                    {/* FIX #2: macro.name is now always available after normalization */}
                    <span className="step-name">
                      {step.macro?.name || step.macro_name || step.name || "Untitled Step"}
                    </span>
                  </div>
                  <button className="edit-btn" onClick={() => openBuilder(index)}>Edit</button>
                </div>
              ))
            )}
          </div>
          <div className="add-new-container">
            <button
              className="btn-add-new"
              onClick={() => openBuilder(null)}
              disabled={steps.length >= totalSteps}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* ══ DETAIL VIEW ═════════════════════════════════════════════════════ */}
      <div className={`detail-view ${view === "detail" ? "active" : ""}`}>
        {currentStep && (
          <>
            <div className="detail-view-header">
              <button className="back-to-paths" onClick={backToDraft}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                        strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back
              </button>
              <h2>
                Step {steps.findIndex((s) => s === currentStep || s._id === currentStep._id) + 1}:{" "}
                {currentStep.macro?.name || currentStep.name || "Untitled"}
              </h2>
            </div>
            <div className="detail-content">
              {LAYERS.map((layerKey) => (
                <LayerDetail key={layerKey} layerKey={layerKey} data={currentStep[layerKey]} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══ BUILDER VIEW ════════════════════════════════════════════════════ */}
      {/* FIX #1: builder-view is full height with its own scroll, so Save Step is always reachable */}
      <div className={`builder-view ${view === "builder" ? "active" : ""}`}>
        {currentStep && (
          <>
            <div className="builder-view-header">
              <div className="builder-title-row">
                <h2>
                  {currentStepIndex === null
                    ? `Add Step ${steps.length + 1}`
                    : `Edit Step ${currentStepIndex + 1}`}
                </h2>
                <span className="step-counter">
                  Step {currentStepIndex === null ? steps.length + 1 : currentStepIndex + 1}/{totalSteps}
                </span>
              </div>
            </div>

            <div className="builder-content">
              {LAYERS.map((layerKey) => (
                <LayerBuilder
                  key={layerKey}
                  layer={layerKey}
                  layerKey={layerKey}
                  data={currentStep[layerKey]}
                  onChange={(newData) => updateLayer(layerKey, newData)}
                  onAddMarketplace={openMarketplace}
                />
              ))}

              {/* FIX #1: actions are inside builder-content so they scroll into view naturally */}
              <div className="builder-actions">
                <button className="btn-outline" onClick={backToDraft} disabled={saving}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveStep} disabled={saving}>
                  {saving ? "Saving…" : "Save Step"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ VIEW ALL STEPS MODAL ════════════════════════════════════════════ */}
      {viewAllOpen && (
        <div className="modal active" onClick={() => setViewAllOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>All Steps</h2>
            <ul className="step-list-modal">
              {steps.length === 0 ? (
                <li className="empty-item">No steps yet.</li>
              ) : (
                steps.map((step, index) => (
                  <li key={step._id || index} onClick={() => openDetail(index)}>
                    <span className="step-num">Step {index + 1}</span>
                    {step.macro?.name || step.macro_name || step.name || "Untitled"}
                  </li>
                ))
              )}
            </ul>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setViewAllOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MARKETPLACE MODAL ═══════════════════════════════════════════════ */}
      {marketplaceOpen && (
        <div className="modal active" onClick={closeMarketplace}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="marketplace-context">
              Adding to{" "}
              <strong>{currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}</strong>
            </div>

            {!selectedRole ? (
              <div className="role-selector-container">
                <h2>Choose Marketplace Role</h2>
                <p>Select the type of partner.</p>
                <div className="role-selector">
                  {["vendor", "mentor", "institution", "distributor"].map((role) => (
                    <div className="role-option" key={role} onClick={() => setSelectedRole(role)}>
                      <h4>{role.charAt(0).toUpperCase() + role.slice(1)}</h4>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button className="btn-outline" onClick={closeMarketplace}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="marketplace-form">
                <h3>Marketplace Listing</h3>

                <div className="form-section">
                  <h4>Basic Information</h4>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., edutechex"
                        value={marketForm.name}
                        onChange={(e) => setMarketForm((f) => ({ ...f, name: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Access</label>
                      <select
                        value={marketForm.access}
                        onChange={(e) => setMarketForm((f) => ({ ...f, access: e.target.value }))}
                      >
                        <option>Free</option>
                        <option>Covered under Subscription</option>
                        <option>Paid</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cost</label>
                      <input
                        type="text"
                        placeholder="e.g., Rs. 100, $50"
                        value={marketForm.cost}
                        onChange={(e) => setMarketForm((f) => ({ ...f, cost: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Goal</label>
                      <input
                        type="text"
                        placeholder="e.g., Assessment, Counselling"
                        value={marketForm.goal}
                        onChange={(e) => setMarketForm((f) => ({ ...f, goal: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Outcomes</label>
                      <input
                        type="text"
                        placeholder="e.g., Defined Metrics, 80%"
                        value={marketForm.outcomes}
                        onChange={(e) => setMarketForm((f) => ({ ...f, outcomes: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Iterations</label>
                      <input
                        type="text"
                        placeholder="e.g., 3 - Unlimited"
                        value={marketForm.iterations}
                        onChange={(e) => setMarketForm((f) => ({ ...f, iterations: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration</label>
                      <div className="duration-input-group">
                        <input
                          type="number" placeholder="Days" min="0"
                          className="duration-small-input"
                          value={marketForm.durationDays}
                          onChange={(e) => setMarketForm((f) => ({ ...f, durationDays: e.target.value }))}
                        />
                        <input
                          type="number" placeholder="Hours" min="0" max="23"
                          className="duration-small-input"
                          value={marketForm.durationHours}
                          onChange={(e) => setMarketForm((f) => ({ ...f, durationHours: e.target.value }))}
                        />
                        <input
                          type="number" placeholder="Minutes" min="0" max="59"
                          className="duration-small-input"
                          value={marketForm.durationMinutes}
                          onChange={(e) => setMarketForm((f) => ({ ...f, durationMinutes: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Discount</label>
                      <input
                        type="text"
                        placeholder="e.g., 10%"
                        value={marketForm.discount}
                        onChange={(e) => setMarketForm((f) => ({ ...f, discount: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Features / Description</label>
                    <textarea
                      rows="2"
                      placeholder="Provide course features, USP, credentials..."
                      value={marketForm.features}
                      onChange={(e) => setMarketForm((f) => ({ ...f, features: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="btn-outline" onClick={() => setSelectedRole(null)}>Back</button>
                  <button
                    className="btn-primary"
                    onClick={addMarketplaceItem}
                    disabled={!marketForm.name.trim()}
                  >
                    Add to Step
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ EDIT PATH DRAWER ════════════════════════════════════════════════ */}
      {editPathOpen && (
        <div className="global-drawer-overlay" onClick={() => setEditPathOpen(false)}>
          <div className="global-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <EditPathForm
              selectedPath={pathData}
              onSave={async () => {
                const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
                setPathData(updated.data.data);
                setEditPathOpen(false);
              }}
              onCancel={() => setEditPathOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftPathView;