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
  nano: { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
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

// ✅ Filter out unpopulated DB refs (objects missing a name)
const normalizeMarketplace = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.filter(
    (item) => item && typeof item === "object" && item.name && item.name.trim() !== ""
  );
};

const normalizeStep = (raw) => {
  if (!raw) return JSON.parse(JSON.stringify(EMPTY_STEP));

  const parseDuration = (val) => {
    if (!val) return { years: "", months: "", days: "" };
    if (typeof val === "object") return val;
    try { return JSON.parse(val); } catch { return { years: "", months: "", days: "" }; }
  };

  if (raw.macro && typeof raw.macro === "object") {
    return {
      ...raw,
      macro: { ...EMPTY_LAYER, ...raw.macro, marketplace: normalizeMarketplace(raw.macro.marketplace) },
      micro: { ...EMPTY_LAYER, ...raw.micro, marketplace: normalizeMarketplace(raw.micro?.marketplace) },
      nano: { ...EMPTY_LAYER, ...raw.nano, marketplace: normalizeMarketplace(raw.nano?.marketplace) },
    };
  }

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
      marketplace: normalizeMarketplace(raw.macro_marketplace || raw.macro?.marketplace),
    },
    micro: {
      ...EMPTY_LAYER,
      name: raw.micro_name || "",
      desc: raw.micro_description || "",
      duration: parseDuration(raw.micro_length),
      paid: raw.micro_access === "paid",
      free: raw.micro_access === "free",
      instructions: raw.micro_instructions || "",
      marketplace: normalizeMarketplace(raw.micro_marketplace || raw.micro?.marketplace),
    },
    nano: {
      ...EMPTY_LAYER,
      name: raw.nano_name || "",
      desc: raw.nano_description || "",
      duration: parseDuration(raw.nano_length),
      paid: raw.nano_access === "paid",
      free: raw.nano_access === "free",
      instructions: raw.nano_instructions || "",
      marketplace: normalizeMarketplace(raw.nano_marketplace || raw.nano?.marketplace),
    },
  };
};

// ─── Small reusable components ────────────────────────────────────────────────

const MarketplaceItemCard = ({ item, compact = false }) => {
  if (!item?.name) return null;
  return (
    <div style={{
      background: "#f4f9fd",
      borderRadius: compact ? 12 : 16,
      padding: compact ? "0.8rem" : "1rem",
      marginBottom: "0.5rem",
      border: "1px solid #ccdae5",
      fontSize: compact ? "0.85rem" : "0.9rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
        <span>{item.name} ({item.role || "unknown"})</span>
        <span>{item.cost}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.3rem", color: "#2c3e50" }}>
        {item.goal && <span><strong>Goal:</strong>       {item.goal}</span>}
        {item.outcomes && <span><strong>Outcomes:</strong>   {item.outcomes}</span>}
        {item.access && <span><strong>Access:</strong>     {item.access}</span>}
        {item.iterations && <span><strong>Iterations:</strong> {item.iterations}</span>}
        {item.duration && <span><strong>Duration:</strong>   {item.duration}</span>}
        {item.discount && <span><strong>Discount:</strong>   {item.discount}</span>}
      </div>
      {item.features && (
        <div style={{ marginTop: "0.4rem" }}><strong>Features:</strong> {item.features}</div>
      )}
    </div>
  );
};

const DurationSelect = ({ value, onChange, type }) => {
  const configs = {
    years: { label: "Years", count: 11 },
    months: { label: "Months", count: 12 },
    days: { label: "Days", count: 31 },
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

const LayerBuilder = ({ layer, layerKey, data, onChange, onAddMarketplace }) => {
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };
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
          <DurationSelect type="years" value={safeData.duration?.years} onChange={(v) => updateDuration("years", v)} />
          <DurationSelect type="months" value={safeData.duration?.months} onChange={(v) => updateDuration("months", v)} />
          <DurationSelect type="days" value={safeData.duration?.days} onChange={(v) => updateDuration("days", v)} />
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
            <p className="no-items">No Marketplace Items Added.</p>
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
      data.duration.years ? `${data.duration.years} years` : "",
      data.duration.months ? `${data.duration.months} months` : "",
      data.duration.days ? `${data.duration.days} days` : "",
    ].filter(Boolean).join(" ") || "Not set"
    : "Not set";

  return (
    <div className="layer-detail-card">
      <h3 style={{
        color: colorMap[layerKey], fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem",
        paddingBottom: "0.5rem", borderBottom: `2px solid ${colorMap[layerKey]}`
      }}>
        {layerKey.toUpperCase()}
      </h3>
      {[
        { label: "NAME", value: data.name },
        { label: "DESCRIPTION", value: data.desc },
        { label: "DURATION", value: durationText },
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

  const [pathData, setPathData] = useState(null);
  const [steps, setSteps] = useState([]);
  const [totalSteps, setTotalSteps] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("draft");
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [editPathOpen, setEditPathOpen] = useState(false);
  const [reviewPanelOpen, setReviewPanelOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentLayer, setCurrentLayer] = useState("macro");
  const [selectedRole, setSelectedRole] = useState("");
  const [marketForm, setMarketForm] = useState(EMPTY_MARKET_FORM);
  const [replyTexts, setReplyTexts] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);

  // ── NEW: tracks which change request thread is expanded in the modal ──
  const [expandedCR, setExpandedCR] = useState(null);
  const [selectedCR, setSelectedCR] = useState(null);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchSteps = useCallback(async (pathId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/steps/get`, {
        params: { path_id: pathId },
      });

      const rawSteps = res.data.data || [];

      const fetched = await Promise.all(
        rawSteps.map(async (raw) => {
          const normalized = normalizeStep(raw);
          const stepId = raw._id?.toString();
          if (!stepId) return normalized;

          try {
            const mpRes = await axios.get(
              `${BASE_URL}/api/marketplace/step/${stepId}`
            );
            const mpItems = mpRes.data?.data || [];

            const grouped = { macro: [], micro: [], nano: [] };
            mpItems.forEach((item) => {
              const layer = item.layer?.toLowerCase();
              if (layer && grouped[layer]) {
                grouped[layer].push(item);
              }
            });

            ["macro", "micro", "nano"].forEach((layer) => {
              if (grouped[layer].length > 0) {
                normalized[layer].marketplace = grouped[layer];
              }
            });
          } catch (e) {
            console.warn(`Could not fetch marketplace for step ${stepId}:`, e);
          }

          return normalized;
        })
      );

      const sorted = fetched.sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
      setSteps(sorted);
      return sorted;
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
        const total = data?.total_steps || 5;
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
        email: JSON.parse(localStorage.getItem("partner"))?.email || "",
        name: currentStep.macro?.name || "",

        macro_name: currentStep.macro?.name || "",
        macro_description: currentStep.macro?.desc || "",
        macro_length: JSON.stringify(currentStep.macro?.duration || {}),
        macro_access: currentStep.macro?.paid ? "paid" : "free",
        macro_instructions: currentStep.macro?.instructions || "",
        macro_marketplace: currentStep.macro?.marketplace || [],

        micro_name: currentStep.micro?.name || "",
        micro_description: currentStep.micro?.desc || "",
        micro_length: JSON.stringify(currentStep.micro?.duration || {}),
        micro_access: currentStep.micro?.paid ? "paid" : "free",
        micro_instructions: currentStep.micro?.instructions || "",
        micro_marketplace: currentStep.micro?.marketplace || [],

        nano_name: currentStep.nano?.name || "",
        nano_description: currentStep.nano?.desc || "",
        nano_length: JSON.stringify(currentStep.nano?.duration || {}),
        nano_access: currentStep.nano?.paid ? "paid" : "free",
        nano_instructions: currentStep.nano?.instructions || "",
        nano_marketplace: currentStep.nano?.marketplace || [],
      };

      if (isNew) {
        const res = await axios.post(`${BASE_URL}/api/steps/add`, payload);
        const merged = {
          ...payload,
          ...(res.data.data || {}),
          macro_marketplace: res.data.data?.macro_marketplace ?? payload.macro_marketplace,
          micro_marketplace: res.data.data?.micro_marketplace ?? payload.micro_marketplace,
          nano_marketplace: res.data.data?.nano_marketplace ?? payload.nano_marketplace,
        };
        const saved = normalizeStep(merged);
        setSteps((prev) => [...prev, saved]);

      } else {
        const stepId = steps[currentStepIndex]._id;
        const res = await axios.put(`${BASE_URL}/api/steps/update/${stepId}`, payload);
        const merged = {
          ...payload,
          _id: stepId,
          ...(res.data.data || {}),
          macro_marketplace: res.data.data?.macro_marketplace ?? payload.macro_marketplace,
          micro_marketplace: res.data.data?.micro_marketplace ?? payload.micro_marketplace,
          nano_marketplace: res.data.data?.nano_marketplace ?? payload.nano_marketplace,
        };
        const saved = normalizeStep(merged);
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
    setSelectedRole("");
    setMarketForm(EMPTY_MARKET_FORM);
    setMarketplaceOpen(true);
  };

  const closeMarketplace = () => {
    setMarketplaceOpen(false);
    setSelectedRole("");
    setMarketForm(EMPTY_MARKET_FORM);
  };

  const addMarketplaceItem = async () => {
    const newItem = {
      role: selectedRole,
      name: marketForm.name,
      access: marketForm.access,
      cost: marketForm.cost,
      goal: marketForm.goal,
      outcomes: marketForm.outcomes,
      iterations: marketForm.iterations,
      duration: marketForm.durationDays,
      discount: marketForm.discount,
      features: marketForm.features,
    };

    const stepId = currentStepIndex !== null ? steps[currentStepIndex]?._id : null;

    if (stepId) {
      try {
        const userDetails = JSON.parse(localStorage.getItem("partner")) || {};
        const email = userDetails?.email || userDetails?.user?.email;

        await axios.post(`${BASE_URL}/api/marketplace/add`, {
          ...newItem,
          partner_email: email,
          path_id: id,
          step_id: stepId,
          layer: currentLayer,
        });
      } catch (err) {
        console.error("Marketplace create error:", err);
        return;
      }
    }

    setCurrentStep((prev) => ({
      ...prev,
      [currentLayer]: {
        ...prev[currentLayer],
        marketplace: [...(prev[currentLayer]?.marketplace || []), newItem],
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

  const refreshPath = async () => {
    const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
    setPathData(updated.data.data);
  };

  const openReviewPanel = async () => {
    setReviewLoading(true);
    try {
      await refreshPath();
    } finally {
      setReviewLoading(false);
      // ── Auto-expand the latest pending CR when opening ──
      const pendingCRs = (pathData?.changeRequests || []).filter(cr => cr.status === "pending");
      if (pendingCRs.length > 0) {
        const latest = [...pendingCRs].sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
        setExpandedCR(latest._id);
      }
      setReviewPanelOpen(true);
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

      {/* Error Banner */}
      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030",
          padding: "0.75rem 1.5rem", fontSize: "0.85rem",
          borderRadius: "8px", marginBottom: "1rem"
        }}>
          {error}
          <button onClick={() => setError(null)} style={{
            marginLeft: "1rem", background: "none",
            border: "none", cursor: "pointer", color: "inherit", fontWeight: 600
          }}>✕</button>
        </div>
      )}

      {/* ══ DRAFT VIEW ══════════════════════════════════════════════════════ */}
      <div className={`draft-view ${view === "draft" ? "active" : ""}`}>
        <div className="path-header-box">
          <div className="path-header-content">
            <button
              className="btn-outline"
              style={{ marginBottom: "12px" }}
              onClick={() => navigate("/dashboard/accountants/paths?tab=draft")}
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

           {/* ── CHANGES REQUESTED BANNER ── */}
{pathData?.status === "changesrequested" &&
  (pathData?.changeRequests || []).some(cr => cr.status === "pending") && (() => {
    const latestCR = (pathData?.changeRequests || [])
      .filter(cr => cr.status === "pending")
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))[0];

    if (!latestCR) return null;

    return (
      <div onClick={openReviewPanel} style={{
        background: '#fff1f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '16px',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%',
            background: '#ef4444', display: 'inline-block',
          }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#be123c' }}>
            Changes Requested
          </span>
          <span style={{ fontSize: '0.75rem', color: '#be123c', marginLeft: 'auto' }}>
            View Feedback →
          </span>
        </div>
      </div>
    );
  })()}

            <div className="path-actions-row">
              <button className="btn-outline" onClick={() => setViewAllOpen(true)}>View All Steps</button>

              {pathData?.changeRequests?.length > 0 && (
                <button className="btn-outline" onClick={openReviewPanel}>
                  💬 View Admin Feedback (
                  {(pathData.changeRequests.filter(cr => cr.status === "pending")).length} pending
                  )
                </button>
              )}
              <button className="btn-outline" onClick={() => setEditPathOpen(true)}>Edit Path</button>
              <button
                className="btn-primary"
                onClick={handleSubmitForApproval}
                disabled={steps.length < totalSteps}
                title={
                  steps.length < totalSteps
                    ? `Complete all ${totalSteps} steps first (${steps.length}/${totalSteps} done)`
                    : "Submit for approval"
                }
                style={{
                  opacity: steps.length < totalSteps ? 0.5 : 1,
                  cursor: steps.length < totalSteps ? "not-allowed" : "pointer",
                }}
              >
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
                <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* ══ DETAIL VIEW ═════════════════════════════════════════════════════ */}
      <div className={`detail-view ${view === "detail" ? "active" : ""}`} style={{ padding: "1rem 2rem" }}>
        {currentStep && (
          <>
            <div className="detail-view-header">
              <button className="back-to-paths" onClick={backToDraft}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
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
              <div className="builder-actions">
                <button className="btn-outline" onClick={backToDraft} disabled={saving}>Cancel</button>
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

            <div className="marketplace-form">
              <h3>Marketplace Listing</h3>

              <div className="form-section">
                <h4>Basic Information</h4>

                <div className="form-group">
                  <label>Marketplace Role *</label>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                    <option value="">Select Role</option>
                    <option value="vendor">Vendor</option>
                    <option value="mentor">Mentor</option>
                    <option value="institution">Institution</option>
                    <option value="distributor">Distributor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    placeholder="Marketplace Name"
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
                    <option value="Free">Free</option>
                    <option value="Covered under Subscription">Covered under Subscription</option>
                    <option value="Paid">Paid</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Cost</label>
                  <input
                    type="text"
                    placeholder="e.g. 65000, 1500 per hour, Free, NA"
                    value={marketForm.cost}
                    onChange={(e) => setMarketForm((f) => ({ ...f, cost: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Goal</label>
                  <input
                    type="text"
                    placeholder="Goal"
                    value={marketForm.goal}
                    onChange={(e) => setMarketForm((f) => ({ ...f, goal: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Outcomes</label>
                  <input
                    type="text"
                    placeholder="Outcome metrics"
                    value={marketForm.outcomes}
                    onChange={(e) => setMarketForm((f) => ({ ...f, outcomes: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Iterations</label>
                  <select
                    value={marketForm.iterations}
                    onChange={(e) => setMarketForm((f) => ({ ...f, iterations: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="3">3</option>
                    <option value="Unlimited">Unlimited</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration</label>
                  <select
                    value={marketForm.durationDays}
                    onChange={(e) => setMarketForm((f) => ({ ...f, durationDays: e.target.value }))}
                  >
                    <option value="">Select Duration</option>
                    <option value="1 Day">1 Day</option>
                    <option value="1 Week">1 Week</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount</label>
                  <select
                    value={marketForm.discount}
                    onChange={(e) => setMarketForm((f) => ({ ...f, discount: e.target.value }))}
                  >
                    <option value="">Select</option>
                    <option value="0%">0%</option>
                    <option value="10%">10%</option>
                    <option value="20%">20%</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Features / Description</label>
                  <textarea
                    rows="2"
                    placeholder="Features or description"
                    value={marketForm.features}
                    onChange={(e) => setMarketForm((f) => ({ ...f, features: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-outline" onClick={closeMarketplace}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={addMarketplaceItem}
                  disabled={!marketForm.name || !selectedRole}
                >
                  Add to Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT PATH MODAL ═════════════════════════════════════════════════ */}
      {editPathOpen && (
        <EditPathForm
          selectedPath={pathData}
          onSave={async () => {
            const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
            setPathData(updated.data.data);
            setEditPathOpen(false);
          }}
          onCancel={() => setEditPathOpen(false)}
        />
      )}

      {/* ══ ADMIN FEEDBACK MODAL ════════════════════════════════════════════ */}
      {reviewPanelOpen && (
        <>
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1200 }}
            onClick={() => { setReviewPanelOpen(false); setSelectedCR(null); }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(650px, 95vw)",
              maxHeight: "88vh",
              background: "#fff",
              zIndex: 1201,
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              borderRadius: 20,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: "12px 20px",
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexShrink: 0,
            }}>
              {/* LEFT: back btn (if detail) + title inline */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                {selectedCR !== null && (
                  <button onClick={() => setSelectedCR(null)} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: "0.75rem", fontWeight: 600, color: "#0d9488",
                    background: "none", border: "none", cursor: "pointer",
                    padding: 0, flexShrink: 0,
                  }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    All requests
                  </button>
                )}
                {/* Title + subtitle stacked, but compact */}
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0f172a", lineHeight: 1.2 }}>
                    Admin Feedback
                  </p>
                  <p style={{
                    margin: 0, fontSize: "0.7rem", color: "#94a3b8",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {pathData?.nameOfPath}
                  </p>
                </div>
              </div>

              {/* RIGHT: close button */}
              <button
                onClick={() => { setReviewPanelOpen(false); setSelectedCR(null); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", padding: 4, flexShrink: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
              {reviewLoading ? (
                <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.83rem", padding: "40px 0" }}>
                  Loading feedback...
                </div>

              ) : selectedCR !== null ? (
                // ─── DETAIL VIEW ─────────────────────────────────────────────
                (() => {
                  const cr = (pathData?.changeRequests || [])[selectedCR];
                  if (!cr) return null;
                  return (
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                      {/* Detail header */}
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        paddingBottom: 12, borderBottom: "1px solid #f1f5f9",
                      }}>
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#0f172a" }}>
                          Request {selectedCR + 1}
                        </span>
                        <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                          {new Date(cr.sentAt).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        <span style={{
                          fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px",
                          borderRadius: 50, marginLeft: "auto",
                          background: cr.status === "addressed" ? "#d1fae5" : "#fef3c7",
                          color: cr.status === "addressed" ? "#065f46" : "#92400e",
                        }}>
                          {cr.status === "addressed" ? "✓ Addressed" : "Pending"}
                        </span>
                      </div>


                      {/* Admin original bubble */}
                      {/* Admin original bubble */}
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: "50%", background: "#6366f1",
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, marginTop: 2,
                        }}>A</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "flex-start" }}>
                          <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>Admin</span>
                          <div style={{
                            width: "fit-content",
                            maxWidth: 320,
                            background: "#eef2ff",
                            border: "1px solid #c7d2fe",
                            borderRadius: "4px 14px 14px 14px",
                            padding: "8px 12px",
                          }}>
                            {cr.issues?.filter(i => i?.trim()).length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 5 }}>
                                {cr.issues.filter(i => i?.trim()).map((issue, i) => (
                                  <span key={i} style={{
                                    fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px",
                                    borderRadius: 50, background: "#e0e7ff", color: "#4338ca", whiteSpace: "nowrap",
                                  }}>{issue}</span>
                                ))}
                              </div>
                            )}
                            <p style={{ margin: 0, fontSize: "0.81rem", color: "#1e293b", lineHeight: 1.4, wordBreak: "break-word" }}>
                              {cr.adminNote || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Replies */}
                      {(cr.replies || []).map((reply, rIdx) => {
                        const isPartner = reply.from === "partner";
                        return (
                          <div key={rIdx} style={{
                            display: "flex",
                            flexDirection: isPartner ? "row-reverse" : "row",
                            alignItems: "flex-start",
                            gap: 8,
                          }}>
                            {/* Avatar */}
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: isPartner ? "#0d9488" : "#6366f1",
                              color: "#fff", display: "flex", alignItems: "center",
                              justifyContent: "center", fontSize: "0.65rem", fontWeight: 700,
                              flexShrink: 0, marginTop: 2,
                            }}>
                              {isPartner ? "P" : "A"}
                            </div>

                            {/* Label + bubble */}
                            <div style={{
                              display: "flex", flexDirection: "column",
                              alignItems: isPartner ? "flex-end" : "flex-start",
                              gap: 2,
                            }}>
                              <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600 }}>
                                {isPartner ? "You" : "Admin"} · {new Date(reply.sentAt).toLocaleString("en-IN", {
                                  day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                                })}
                              </span>

                              {/* ← THE FIX: width fit-content + maxWidth */}
                              <div style={{
                                maxWidth: 320,
                                background: isPartner ? "#f0fdf4" : "#eef2ff",
                                border: `1px solid ${isPartner ? "#bbf7d0" : "#c7d2fe"}`,
                                borderRadius: isPartner ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                                padding: "8px 12px",
                                wordBreak: "break-word",
                              }}>
                                <p style={{
                                  margin: 0, fontSize: "0.81rem",
                                  color: isPartner ? "#065f46" : "#1e293b",
                                  lineHeight: 1.4, wordBreak: "break-word",
                                }}>
                                  {reply.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Reply input */}
                      <div style={{
                        display: "flex", gap: 8, alignItems: "flex-end",
                        background: "#f8fafc", border: "1px solid #e2e8f0",
                        borderRadius: 10, padding: "6px 8px 6px 12px",
                        marginTop: 4,
                      }}>
                        <textarea
                          rows={1}
                          placeholder="Reply to admin..."
                          value={replyTexts[cr._id] || ""}
                          onChange={(e) => {
                            setReplyTexts(prev => ({ ...prev, [cr._id]: e.target.value }));
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              (async () => {
                                const msg = (replyTexts[cr._id] || "").trim();
                                if (!msg) return;
                                setReplyLoading(prev => ({ ...prev, [cr._id]: true }));
                                try {
                                  const pd = JSON.parse(localStorage.getItem("partner") || "{}");
                                  await axios.patch(`${BASE_URL}/api/paths/reply/${pathData._id}/${cr._id}`, {
                                    from: "partner", message: msg,
                                    partnerEmail: pd?.email || pd?.user?.email || "",
                                  });
                                  setReplyTexts(prev => ({ ...prev, [cr._id]: "" }));
                                  await refreshPath();
                                } catch (err) { console.error(err); }
                                finally { setReplyLoading(prev => ({ ...prev, [cr._id]: false })); }
                              })();
                            }
                          }}
                          style={{
                            flex: 1, border: "none", background: "none", outline: "none",
                            resize: "none", fontSize: "0.82rem", color: "#0f172a",
                            lineHeight: 1.5, overflow: "hidden", fontFamily: "inherit", minHeight: 22,
                          }}
                        />
                        <button
                          disabled={!replyTexts[cr._id]?.trim() || replyLoading[cr._id]}
                          onClick={async () => {
                            const msg = (replyTexts[cr._id] || "").trim();
                            if (!msg) return;
                            setReplyLoading(prev => ({ ...prev, [cr._id]: true }));
                            try {
                              const pd = JSON.parse(localStorage.getItem("partner") || "{}");
                              await axios.patch(`${BASE_URL}/api/paths/reply/${pathData._id}/${cr._id}`, {
                                from: "partner", message: msg,
                                partnerEmail: pd?.email || pd?.user?.email || "",
                              });
                              setReplyTexts(prev => ({ ...prev, [cr._id]: "" }));
                              await refreshPath();
                            } catch (err) { console.error(err); }
                            finally { setReplyLoading(prev => ({ ...prev, [cr._id]: false })); }
                          }}
                          style={{
                            flexShrink: 0, width: 30, height: 30, borderRadius: "50%",
                            background: replyTexts[cr._id]?.trim() ? "#0d9488" : "#e2e8f0",
                            border: "none",
                            cursor: replyTexts[cr._id]?.trim() ? "pointer" : "default",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.15s",
                          }}
                        >
                          {replyLoading[cr._id] ? (
                            <span style={{
                              width: 10, height: 10, border: "2px solid #fff",
                              borderTopColor: "transparent", borderRadius: "50%",
                              display: "inline-block", animation: "spin 0.7s linear infinite",
                            }} />
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24"
                              fill="none" stroke="#fff" strokeWidth="2.5">
                              <line x1="22" y1="2" x2="11" y2="13" />
                              <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                          )}
                        </button>
                      </div>


                    </div>
                  );
                })()

              ) : (
                // ─── LIST VIEW ───────────────────────────────────────────────
                (pathData?.changeRequests || []).length === 0 ? (
                  <div style={{
                    textAlign: "center", color: "#94a3b8", fontSize: "0.83rem",
                    background: "#f8fafc", borderRadius: 12,
                    border: "2px dashed #e2e8f0", padding: "36px 20px",
                  }}>
                    No change requests yet.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(pathData?.changeRequests || []).map((cr, idx) => {
                      const replyCount = (cr.replies || []).length;
                      const partnerReplied = (cr.replies || []).some(r => r.from === "partner");
                      const pendingReply = cr.status !== "addressed" && !partnerReplied;

                      return (
                        <div
                          key={cr._id || idx}
                          onClick={() => setSelectedCR(idx)}
                          style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            gap: 8, padding: "10px 14px",
                            border: `1.5px solid ${pendingReply ? "#fecaca" : "#e8edf3"}`,
                            borderRadius: 12,
                            background: pendingReply ? "#fff8f7" : "#fff",
                            cursor: "pointer",
                            transition: "all 0.14s ease",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#a5b4fc";
                            e.currentTarget.style.background = "#f5f3ff";
                            e.currentTarget.style.transform = "translateX(2px)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = pendingReply ? "#fecaca" : "#e8edf3";
                            e.currentTarget.style.background = pendingReply ? "#fff8f7" : "#fff";
                            e.currentTarget.style.transform = "translateX(0)";
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>
                              Request {idx + 1}
                            </span>
                            <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                              {new Date(cr.sentAt).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                            {(cr.issues || []).filter(i => i?.trim()).length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                                {cr.issues.filter(i => i?.trim()).slice(0, 2).map((issue, ii) => (
                                  <span key={ii} style={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    padding: "2px 8px", borderRadius: 50,
                                    background: "#e0e7ff", color: "#4338ca",
                                  }}>{issue}</span>
                                ))}
                                {cr.issues.filter(i => i?.trim()).length > 2 && (
                                  <span style={{
                                    fontSize: "0.65rem", fontWeight: 600,
                                    padding: "2px 8px", borderRadius: 50,
                                    background: "#f1f5f9", color: "#64748b",
                                  }}>
                                    +{cr.issues.filter(i => i?.trim()).length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                              <span style={{ fontSize: "0.65rem", color: "#64748b" }}>
                                💬 {replyCount} {replyCount === 1 ? "reply" : "replies"}
                              </span>
                              {pendingReply && (
                                <span style={{
                                  fontSize: "0.65rem", fontWeight: 700,
                                  background: "#fee2e2", color: "#be123c",
                                  padding: "2px 7px", borderRadius: 999,
                                }}>
                                  Needs your reply
                                </span>
                              )}
                              {partnerReplied && cr.status !== "addressed" && (
                                <span style={{
                                  fontSize: "0.65rem", fontWeight: 700,
                                  background: "#fef3c7", color: "#92400e",
                                  padding: "2px 7px", borderRadius: 999,
                                }}>
                                  Awaiting admin
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <span style={{
                              fontSize: "0.62rem", fontWeight: 700, padding: "2px 8px", borderRadius: 50,
                              background: cr.status === "addressed" ? "#d1fae5" : "#fef3c7",
                              color: cr.status === "addressed" ? "#065f46" : "#92400e",
                            }}>
                              {cr.status === "addressed" ? "✓ Addressed" : "Pending"}
                            </span>
                            <svg width="14" height="14" viewBox="0 0 24 24"
                              fill="none" stroke="#94a3b8" strokeWidth="2">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "14px 20px", borderTop: "1px solid #e2e8f0",
              display: "flex", gap: 10, flexShrink: 0,
            }}>
              <button
                onClick={() => { setReviewPanelOpen(false); setSelectedCR(null); }}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 50,
                  background: "none", color: "#94a3b8",
                  border: "1px solid #e2e8f0", cursor: "pointer", fontSize: "0.82rem",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DraftPathView;