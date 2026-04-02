// src/pages/DraftPathView.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../components/Pathview/journey.scss";
import EditPathForm from "./MyPaths/paths";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const LAYERS = ["macro", "micro", "nano"];

const EMPTY_LAYER = {
  name: "", desc: "",
  duration: { years: "", months: "", days: "" },
  paid: false, free: false, instructions: "", marketplace: [],
};
const EMPTY_STEP = {
  macro: { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
  micro: { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
  nano:  { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] },
};
const EMPTY_MARKET_FORM = {
  name: "", access: "Free", cost: "", goal: "", outcomes: "",
  iterations: "", durationDays: "", durationHours: "", durationMinutes: "",
  discount: "", features: "",
};

// ─── Static review data (replace with API later) ──────────────────────────────
const STATIC_REVIEW_DATA = {
  status: "changes_requested", // "draft" | "pending" | "changes_requested" | "approved" | "rejected"
  currentRound: 2,
  pathName: "11 Grade, CBSE",
  changeRequest: {
    round: 2,
    date: "9 Mar 2026",
    issues: [
      "Price needs to be reduced",
      "Steps are incomplete — add at least 3 more steps",
    ],
    adminNote: "Reduce price below ₹499. The path currently has only 2 steps — please add at least 3 more detailed steps before resubmitting.",
  },
  history: [
    { type: "submitted", title: "You submitted this path", sub: "8 Mar 2026, 9:00 AM" },
    { type: "request",   title: "Round 1 — Admin requested changes", sub: "Price too high, steps incomplete · 9 Mar 2026" },
    { type: "resubmit",  title: "Round 2 — You resubmitted", sub: "10 Mar 2026 · Admin is reviewing now" },
  ],
};

// ─── Normalizer ───────────────────────────────────────────────────────────────
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
      macro: { ...EMPTY_LAYER, ...raw.macro, marketplace: raw.macro.marketplace || [] },
      micro: { ...EMPTY_LAYER, ...raw.micro, marketplace: raw.micro?.marketplace || [] },
      nano:  { ...EMPTY_LAYER, ...raw.nano,  marketplace: raw.nano?.marketplace  || [] },
    };
  }
  return {
    ...raw,
    macro: { ...EMPTY_LAYER, name: raw.macro_name || "", desc: raw.macro_description || "", duration: parseDuration(raw.macro_length), paid: raw.macro_access === "paid", free: raw.macro_access === "free", instructions: raw.macro_instructions || "", marketplace: raw.macro_marketplace || [] },
    micro: { ...EMPTY_LAYER, name: raw.micro_name || "", desc: raw.micro_description || "", duration: parseDuration(raw.micro_length), paid: raw.micro_access === "paid", free: raw.micro_access === "free", instructions: raw.micro_instructions || "", marketplace: raw.micro_marketplace || [] },
    nano:  { ...EMPTY_LAYER, name: raw.nano_name  || "", desc: raw.nano_description  || "", duration: parseDuration(raw.nano_length),  paid: raw.nano_access  === "paid", free: raw.nano_access  === "free", instructions: raw.nano_instructions  || "", marketplace: raw.nano_marketplace  || [] },
  };
};

// ─── Small reusable components ────────────────────────────────────────────────
const MarketplaceItemCard = ({ item, compact = false }) => (
  <div style={{ background: "#f4f9fd", borderRadius: compact ? 12 : 16, padding: compact ? "0.8rem" : "1rem", marginBottom: "0.5rem", border: "1px solid #ccdae5", fontSize: compact ? "0.85rem" : "0.9rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
      <span>{item.name || "Unnamed"} ({item.role || "unknown"})</span>
      <span>{item.cost}</span>
    </div>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.3rem", color: "#2c3e50" }}>
      {item.goal      && <span><strong>Goal:</strong> {item.goal}</span>}
      {item.outcomes  && <span><strong>Outcomes:</strong> {item.outcomes}</span>}
      {item.access    && <span><strong>Access:</strong> {item.access}</span>}
      {item.iterations && <span><strong>Iterations:</strong> {item.iterations}</span>}
      {item.duration  && <span><strong>Duration:</strong> {item.duration}</span>}
      {item.discount  && <span><strong>Discount:</strong> {item.discount}</span>}
    </div>
    {item.features && <div style={{ marginTop: "0.4rem" }}><strong>Features:</strong> {item.features}</div>}
  </div>
);

const DurationSelect = ({ value, onChange, type }) => {
  const configs = { years: { label: "Years", count: 11 }, months: { label: "Months", count: 12 }, days: { label: "Days", count: 31 } };
  const { label, count } = configs[type];
  return (
    <select className="duration-select" value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {[...Array(count)].map((_, i) => (
        <option key={i} value={i}>{i} {i === 1 ? label.slice(0, -1) : label}</option>
      ))}
    </select>
  );
};

const LayerBuilder = ({ layer, layerKey, data, onChange, onAddMarketplace }) => {
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };
  const safeData = data || { ...EMPTY_LAYER, duration: { years: "", months: "", days: "" }, marketplace: [] };
  const update = (field, value) => onChange({ ...safeData, [field]: value });
  const updateDuration = (part, value) => onChange({ ...safeData, duration: { ...safeData.duration, [part]: value } });
  return (
    <div className="builder-layer">
      <h3 style={{ color: colorMap[layerKey], fontSize: "0.9rem", fontWeight: 600, marginBottom: "1.25rem" }}>{layer.toUpperCase()}</h3>
      <div className="form-group">
        <label>Name</label>
        <input type="text" placeholder={`e.g., ${layerKey === "macro" ? "Career Exploration" : layerKey === "micro" ? "Aptitude Test" : "Take Online Assessment"}`} value={safeData.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea rows="2" placeholder="Enter description" value={safeData.desc} onChange={(e) => update("desc", e.target.value)} />
      </div>
      <div className="form-group">
        <label>Duration</label>
        <div className="duration-select-group">
          <DurationSelect type="years"  value={safeData.duration?.years}  onChange={(v) => updateDuration("years", v)}  />
          <DurationSelect type="months" value={safeData.duration?.months} onChange={(v) => updateDuration("months", v)} />
          <DurationSelect type="days"   value={safeData.duration?.days}   onChange={(v) => updateDuration("days", v)}   />
        </div>
        <div className="checkbox-group">
          <label className="checkbox-label"><input type="checkbox" checked={!!safeData.paid} onChange={(e) => update("paid", e.target.checked)} />Paid</label>
          <label className="checkbox-label"><input type="checkbox" checked={!!safeData.free} onChange={(e) => update("free", e.target.checked)} />Free</label>
        </div>
      </div>
      <div className="form-group">
        <label>Instructions</label>
        <textarea rows="2" placeholder="Enter instructions" value={safeData.instructions} onChange={(e) => update("instructions", e.target.value)} />
      </div>
      <div className="marketplace-section">
        <label>Marketplace Items</label>
        <div className="marketplace-items-builder">
          {(safeData.marketplace || []).length === 0
            ? <p className="no-items">No Marketplace Items Added.</p>
            : (safeData.marketplace || []).map((item, i) => <MarketplaceItemCard key={i} item={item} compact />)}
        </div>
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onAddMarketplace(layerKey); }}>+ Add Marketplace</button>
      </div>
    </div>
  );
};

const LayerDetail = ({ layerKey, data }) => {
  if (!data) return null;
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };
  const durationText = data.duration
    ? [data.duration.years ? `${data.duration.years} years` : "", data.duration.months ? `${data.duration.months} months` : "", data.duration.days ? `${data.duration.days} days` : ""].filter(Boolean).join(" ") || "Not set"
    : "Not set";
  return (
    <div className="layer-detail-card">
      <h3 style={{ color: colorMap[layerKey], fontSize: "0.9rem", fontWeight: 600, marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: `2px solid ${colorMap[layerKey]}` }}>{layerKey.toUpperCase()}</h3>
      {[{ label: "NAME", value: data.name }, { label: "DESCRIPTION", value: data.desc }, { label: "DURATION", value: durationText }, { label: "INSTRUCTIONS", value: data.instructions }].map(({ label, value }) => (
        <div className="detail-row" key={label}><span className="detail-label">{label}</span><div className="detail-value">{value || "—"}</div></div>
      ))}
      {(data.marketplace || []).map((item, i) => <MarketplaceItemCard key={i} item={item} />)}
    </div>
  );
};

// ─── Status badge config ──────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:              { label: "Draft",             color: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  pending:            { label: "Under Review",      color: "#1e40af", bg: "#dbeafe", border: "#93c5fd" },
  changes_requested:  { label: "Changes Requested", color: "#be123c", bg: "#fee2e2", border: "#fecaca" },
  approved:           { label: "Approved",          color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  rejected:           { label: "Rejected",          color: "#7f1d1d", bg: "#fee2e2", border: "#fca5a5" },
};

// ─── History dot colors ───────────────────────────────────────────────────────
const DOT_CLASS = {
  submitted: "rv-dot--submitted",
  request:   "rv-dot--request",
  resubmit:  "rv-dot--resubmit",
  approved:  "rv-dot--approved",
  rejected:  "rv-dot--rejected",
};

// ─── Review Status Panel ──────────────────────────────────────────────────────
const ReviewStatusPanel = ({ reviewData, onClose, onEditPath, onResubmit }) => {
  const statusCfg = STATUS_CONFIG[reviewData.status] || STATUS_CONFIG.draft;

  return (
    <div className="rv-overlay" onClick={onClose}>
      <div className="rv-panel" onClick={(e) => e.stopPropagation()}>

        {/* Panel Header */}
        <div className="rv-panel-header">
          <div className="rv-panel-header-left">
            <h2 className="rv-panel-title">Review Status</h2>
            <p className="rv-panel-subtitle">{reviewData.pathName}</p>
          </div>
          <button className="rv-close-btn" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Current Status Badge */}
        <div className="rv-status-banner" style={{ background: statusCfg.bg, border: `1.5px solid ${statusCfg.border}` }}>
          <div className="rv-status-dot" style={{ background: statusCfg.color }}></div>
          <span className="rv-status-text" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
          {reviewData.status === "changes_requested" && (
            <span className="rv-round-pill">Round {reviewData.currentRound}</span>
          )}
        </div>

        <div className="rv-panel-body">

          {/* CHANGES REQUESTED SECTION */}
          {reviewData.status === "changes_requested" && reviewData.changeRequest && (
            <div className="rv-change-request-box">
              <div className="rv-change-header">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>Admin flagged these issues</span>
              </div>
              <ul className="rv-issues-list">
                {reviewData.changeRequest.issues.map((issue, i) => (
                  <li key={i} className="rv-issue-item">
                    <span className="rv-issue-bullet"></span>
                    {issue}
                  </li>
                ))}
              </ul>
              {reviewData.changeRequest.adminNote && (
                <div className="rv-admin-note">
                  <p className="rv-admin-note-label">Admin note</p>
                  <p className="rv-admin-note-text">"{reviewData.changeRequest.adminNote}"</p>
                </div>
              )}
              <div className="rv-action-row">
                <button className="rv-btn rv-btn--outline" onClick={onEditPath}>Edit Path</button>
                <button className="rv-btn rv-btn--primary" onClick={onResubmit}>Resubmit for Review →</button>
              </div>
            </div>
          )}

          {/* APPROVED SECTION */}
          {reviewData.status === "approved" && (
            <div className="rv-approved-box">
              <div className="rv-approved-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h4 className="rv-approved-title">Path Approved!</h4>
              <p className="rv-approved-msg">Your path is now live and visible to all users on the platform.</p>
            </div>
          )}

          {/* REJECTED SECTION */}
          {reviewData.status === "rejected" && (
            <div className="rv-rejected-box">
              <div className="rv-rejected-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </div>
              <h4 className="rv-rejected-title">Path Rejected</h4>
              <p className="rv-rejected-msg">This path has been rejected after multiple revision rounds. You can create a new path or contact support.</p>
            </div>
          )}

          {/* PENDING SECTION */}
          {reviewData.status === "pending" && (
            <div className="rv-pending-box">
              <div className="rv-pending-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h4 className="rv-pending-title">Under Admin Review</h4>
              <p className="rv-pending-msg">Your path has been submitted and is currently being reviewed by the admin. You'll be notified when there's an update.</p>
            </div>
          )}

          {/* HISTORY SECTION */}
          <div className="rv-history-section">
            <p className="rv-section-label">Submission History</p>
            <div className="rv-timeline">
              {reviewData.history.map((item, idx) => (
                <div className="rv-timeline-item" key={idx}>
                  <div className={`rv-dot ${DOT_CLASS[item.type] || "rv-dot--submitted"}`}></div>
                  {idx < reviewData.history.length - 1 && <div className="rv-timeline-line"></div>}
                  <div className="rv-timeline-content">
                    <p className="rv-tl-title">{item.title}</p>
                    <p className="rv-tl-sub">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
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

  const [pathData, setPathData]       = useState(null);
  const [steps, setSteps]             = useState([]);
  const [totalSteps, setTotalSteps]   = useState(5);
  const [loading, setLoading]         = useState(false);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);

  const [view, setView]               = useState("draft");
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [editPathOpen, setEditPathOpen]       = useState(false);

  // ── NEW: review panel state ───────────────────────────────────────────────
  const [reviewPanelOpen, setReviewPanelOpen]   = useState(false);
  const [reviewData]                            = useState(STATIC_REVIEW_DATA);
  // Derived: show notification badge when there's a change request
  const hasUnread = reviewData.status === "changes_requested";

  const [currentStep, setCurrentStep]           = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(null);
  const [currentLayer, setCurrentLayer]         = useState("macro");
  const [selectedRole, setSelectedRole]         = useState("");
  const [marketForm, setMarketForm]             = useState(EMPTY_MARKET_FORM);

  // ─── Data fetching ─────────────────────────────────────────────────────────
  const fetchSteps = useCallback(async (pathId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/steps/get`, { params: { path_id: pathId } });
      const fetched = (res.data.data || []).map(normalizeStep).sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
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
      setLoading(true); setError(null);
      try {
        const pathRes = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
        const data = pathRes.data.data;
        setPathData(data);
        setTotalSteps(Number(data?.total_steps || 5));
        await fetchSteps(id);
      } catch (err) {
        console.error("Error fetching path:", err);
        setError("Failed to load path. Please refresh.");
      } finally { setLoading(false); }
    };
    init();
  }, [id, fetchSteps]);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const openBuilder = (index) => {
    setCurrentStep(index === null ? JSON.parse(JSON.stringify(EMPTY_STEP)) : JSON.parse(JSON.stringify(steps[index])));
    setCurrentStepIndex(index);
    setView("builder");
  };
  const openDetail = (index) => { setCurrentStep(steps[index]); setView("detail"); setViewAllOpen(false); };
  const backToDraft = () => { setView("draft"); setCurrentStep(null); setCurrentStepIndex(null); };

  // ─── Step save ─────────────────────────────────────────────────────────────
  const saveStep = async () => {
    if (!currentStep) return;
    setSaving(true); setError(null);
    try {
      const isNew = currentStepIndex === null;
      const payload = {
        path_id: id, step_order: isNew ? steps.length + 1 : steps[currentStepIndex]?.step_order,
        email: JSON.parse(localStorage.getItem("partner"))?.email || "",
        name: currentStep.macro?.name || "",
        macro_name: currentStep.macro?.name || "", macro_description: currentStep.macro?.desc || "", macro_length: JSON.stringify(currentStep.macro?.duration || {}), macro_access: currentStep.macro?.paid ? "paid" : "free", macro_instructions: currentStep.macro?.instructions || "", macro_marketplace: currentStep.macro?.marketplace || [],
        micro_name: currentStep.micro?.name || "", micro_description: currentStep.micro?.desc || "", micro_length: JSON.stringify(currentStep.micro?.duration || {}), micro_access: currentStep.micro?.paid ? "paid" : "free", micro_instructions: currentStep.micro?.instructions || "", micro_marketplace: currentStep.micro?.marketplace || [],
        nano_name: currentStep.nano?.name  || "", nano_description: currentStep.nano?.desc  || "", nano_length: JSON.stringify(currentStep.nano?.duration  || {}), nano_access: currentStep.nano?.paid  ? "paid" : "free", nano_instructions: currentStep.nano?.instructions  || "", nano_marketplace: currentStep.nano?.marketplace  || [],
      };
      if (isNew) {
        const res = await axios.post(`${BASE_URL}/api/steps/add`, payload);
        const merged = { ...payload, ...(res.data.data || {}), macro_marketplace: res.data.data?.macro_marketplace ?? payload.macro_marketplace, micro_marketplace: res.data.data?.micro_marketplace ?? payload.micro_marketplace, nano_marketplace: res.data.data?.nano_marketplace ?? payload.nano_marketplace };
        setSteps((prev) => [...prev, normalizeStep(merged)]);
      } else {
        const stepId = steps[currentStepIndex]._id;
        const res = await axios.put(`${BASE_URL}/api/steps/update/${stepId}`, payload);
        const merged = { ...payload, _id: stepId, ...(res.data.data || {}), macro_marketplace: res.data.data?.macro_marketplace ?? payload.macro_marketplace, micro_marketplace: res.data.data?.micro_marketplace ?? payload.micro_marketplace, nano_marketplace: res.data.data?.nano_marketplace ?? payload.nano_marketplace };
        setSteps((prev) => { const copy = [...prev]; copy[currentStepIndex] = normalizeStep(merged); return copy; });
      }
      backToDraft();
    } catch (err) { console.error("Error saving step:", err); setError("Failed to save step. Please try again."); }
    finally { setSaving(false); }
  };

  const updateLayer = (layerKey, newLayerData) => setCurrentStep((prev) => ({ ...prev, [layerKey]: newLayerData }));

  // ─── Marketplace ───────────────────────────────────────────────────────────
  const openMarketplace = (layerKey) => { setCurrentLayer(layerKey); setSelectedRole(""); setMarketForm(EMPTY_MARKET_FORM); setMarketplaceOpen(true); };
  const closeMarketplace = () => { setMarketplaceOpen(false); setSelectedRole(""); setMarketForm(EMPTY_MARKET_FORM); };

  const addMarketplaceItem = async () => {
    const newItem = { role: selectedRole, name: marketForm.name, access: marketForm.access, cost: marketForm.cost, goal: marketForm.goal, outcomes: marketForm.outcomes, iterations: marketForm.iterations, duration: marketForm.durationDays, discount: marketForm.discount, features: marketForm.features };
    const stepId = currentStepIndex !== null ? steps[currentStepIndex]?._id : null;
    if (stepId) {
      try {
        const userDetails = JSON.parse(localStorage.getItem("partner")) || {};
        await axios.post(`${BASE_URL}/api/marketplace/add`, { ...newItem, partner_email: userDetails?.email || userDetails?.user?.email, path_id: id, step_id: stepId, layer: currentLayer });
      } catch (err) { console.error("Marketplace create error:", err); return; }
    }
    setCurrentStep((prev) => ({ ...prev, [currentLayer]: { ...prev[currentLayer], marketplace: [...(prev[currentLayer]?.marketplace || []), newItem] } }));
    closeMarketplace();
  };

  // ─── Submit for approval ───────────────────────────────────────────────────
  const handleSubmitForApproval = async () => {
    try {
      await axios.put(`${BASE_URL}/api/paths/submit`, { pathId: id });
      alert("Path submitted for approval successfully!");
      const updated = await axios.get(`${BASE_URL}/api/paths/viewpath/${id}`);
      setPathData(updated.data.data);
    } catch (err) { console.error("Error submitting path:", err); setError("Failed to submit for approval."); }
  };

  // ─── Resubmit (from review panel) ─────────────────────────────────────────
  const handleResubmit = async () => {
    try {
      await axios.put(`${BASE_URL}/api/paths/submit`, { pathId: id });
      setReviewPanelOpen(false);
      alert("Path resubmitted for review!");
    } catch (err) { console.error("Resubmit error:", err); }
  };

  // ─── Render guards ─────────────────────────────────────────────────────────
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

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="draft-path-container">

      {error && (
        <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", color: "#c53030", padding: "0.75rem 1.5rem", fontSize: "0.85rem" }}>
          {error}
          <button onClick={() => setError(null)} style={{ marginLeft: "1rem", background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: 600 }}>✕</button>
        </div>
      )}

      {/* ══ DRAFT VIEW ═════════════════════════════════════════════════════ */}
      <div className={`draft-view ${view === "draft" ? "active" : ""}`}>

        {/* ── Changes Requested Banner (only when admin requests changes) ── */}
        {reviewData.status === "changes_requested" && (
          <div className="rv-inline-banner" onClick={() => setReviewPanelOpen(true)}>
            <div className="rv-inline-banner-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#be123c" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <strong>Admin has requested changes</strong>
                <span>{reviewData.changeRequest?.issues?.length} issue(s) to fix before resubmitting</span>
              </div>
            </div>
            <span className="rv-inline-banner-cta">View Details →</span>
          </div>
        )}

        {/* ── Approved Banner ── */}
        {reviewData.status === "approved" && (
          <div className="rv-inline-banner rv-inline-banner--approved" onClick={() => setReviewPanelOpen(true)}>
            <div className="rv-inline-banner-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#065f46" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              <div>
                <strong>Path Approved!</strong>
                <span>Your path is now live on the platform</span>
              </div>
            </div>
            <span className="rv-inline-banner-cta">View Details →</span>
          </div>
        )}

        {/* ── Under Review Banner ── */}
        {reviewData.status === "pending" && (
          <div className="rv-inline-banner rv-inline-banner--pending" onClick={() => setReviewPanelOpen(true)}>
            <div className="rv-inline-banner-left">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <strong>Under Admin Review</strong>
                <span>Submitted — waiting for admin to review</span>
              </div>
            </div>
            <span className="rv-inline-banner-cta">View Status →</span>
          </div>
        )}

        <div className="path-header-box">
          <div className="path-header-content">
            <button className="btn-outline" style={{ marginBottom: "12px" }} onClick={() => navigate("/dashboard/accountants/paths?tab=draft")}>← Back to Paths</button>

            <div className="path-title-section">
              <h1 className="path-title">{pathData.nameOfPath || "Untitled Path"}</h1>
              {/* Status Badge */}
              {/* {reviewData.status !== "draft" && (
                <span className="rv-status-badge" style={{
                  background: STATUS_CONFIG[reviewData.status]?.bg,
                  color: STATUS_CONFIG[reviewData.status]?.color,
                  border: `1px solid ${STATUS_CONFIG[reviewData.status]?.border}`,
                }}>
                  {STATUS_CONFIG[reviewData.status]?.label}
                </span>
              )} */}
              {reviewData.status === "draft" && <span className="draft-badge">DRAFT</span>}
            </div>

            <div className="path-stats">
              <span className="steps-count">Steps: {steps.length}/{totalSteps}</span>
            </div>

            {pathData.description && <p className="path-description">{pathData.description}</p>}

            <div className="path-actions-row">
              <button className="btn-outline" onClick={() => setViewAllOpen(true)}>View All Steps</button>
              <button className="btn-outline" onClick={() => setEditPathOpen(true)}>Edit Path</button>

              {/* Review Status button with badge */}
              <button className="rv-status-btn" onClick={() => setReviewPanelOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                Review Status
                {hasUnread && <span className="rv-notif-dot"></span>}
              </button>

              {/* Show submit only when draft or changes_requested */}
              {(reviewData.status === "draft" || reviewData.status === "changes_requested") && (
                <button
                  className="btn-primary"
                  onClick={reviewData.status === "changes_requested" ? () => setReviewPanelOpen(true) : handleSubmitForApproval}
                  disabled={steps.length < totalSteps}
                  style={{ opacity: steps.length < totalSteps ? 0.5 : 1, cursor: steps.length < totalSteps ? "not-allowed" : "pointer" }}
                >
                  {reviewData.status === "changes_requested" ? "Resubmit for Review" : "Submit for Approval"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="steps-section">
          <div className="steps-header"><h3>Steps</h3></div>
          <div className="step-list">
            {steps.length === 0 ? (
              <div className="empty-state"><p>No steps yet. Click "Add New" to begin.</p></div>
            ) : (
              steps.map((step, index) => (
                <div className="step-card" key={step._id || index}>
                  <div className="step-info">
                    <span className="step-number">Step {index + 1}</span>
                    <span className="step-name">{step.macro?.name || step.macro_name || step.name || "Untitled Step"}</span>
                  </div>
                  <button className="edit-btn" onClick={() => openBuilder(index)}>Edit</button>
                </div>
              ))
            )}
          </div>
          <div className="add-new-container">
            <button className="btn-add-new" onClick={() => openBuilder(null)} disabled={steps.length >= totalSteps}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* ══ DETAIL VIEW ════════════════════════════════════════════════════ */}
      <div className={`detail-view ${view === "detail" ? "active" : ""}`} style={{ padding: "1rem 2rem" }}>
        {currentStep && (
          <>
            <div className="detail-view-header">
              <button className="back-to-paths" onClick={backToDraft}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </button>
              <h2>Step {steps.findIndex((s) => s === currentStep || s._id === currentStep._id) + 1}: {currentStep.macro?.name || currentStep.name || "Untitled"}</h2>
            </div>
            <div className="detail-content">
              {LAYERS.map((layerKey) => <LayerDetail key={layerKey} layerKey={layerKey} data={currentStep[layerKey]} />)}
            </div>
          </>
        )}
      </div>

      {/* ══ BUILDER VIEW ═══════════════════════════════════════════════════ */}
      <div className={`builder-view ${view === "builder" ? "active" : ""}`}>
        {currentStep && (
          <>
            <div className="builder-view-header">
              <div className="builder-title-row">
                <h2>{currentStepIndex === null ? `Add Step ${steps.length + 1}` : `Edit Step ${currentStepIndex + 1}`}</h2>
                <span className="step-counter">Step {currentStepIndex === null ? steps.length + 1 : currentStepIndex + 1}/{totalSteps}</span>
              </div>
            </div>
            <div className="builder-content">
              {LAYERS.map((layerKey) => (
                <LayerBuilder key={layerKey} layer={layerKey} layerKey={layerKey} data={currentStep[layerKey]} onChange={(newData) => updateLayer(layerKey, newData)} onAddMarketplace={openMarketplace} />
              ))}
              <div className="builder-actions">
                <button className="btn-outline" onClick={backToDraft} disabled={saving}>Cancel</button>
                <button className="btn-primary" onClick={saveStep} disabled={saving}>{saving ? "Saving…" : "Save Step"}</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══ VIEW ALL STEPS MODAL ═══════════════════════════════════════════ */}
      {viewAllOpen && (
        <div className="modal active" onClick={() => setViewAllOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>All Steps</h2>
            <ul className="step-list-modal">
              {steps.length === 0 ? <li className="empty-item">No steps yet.</li> : steps.map((step, index) => (
                <li key={step._id || index} onClick={() => openDetail(index)}>
                  <span className="step-num">Step {index + 1}</span>
                  {step.macro?.name || step.macro_name || step.name || "Untitled"}
                </li>
              ))}
            </ul>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setViewAllOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MARKETPLACE MODAL ══════════════════════════════════════════════ */}
      {marketplaceOpen && (
        <div className="modal active" onClick={closeMarketplace}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="marketplace-context">
              Adding to <strong>{currentLayer.charAt(0).toUpperCase() + currentLayer.slice(1)}</strong>
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
                  <input type="text" placeholder="Marketplace Name" value={marketForm.name} onChange={(e) => setMarketForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Access</label>
                  <select value={marketForm.access} onChange={(e) => setMarketForm((f) => ({ ...f, access: e.target.value }))}>
                    <option value="Free">Free</option>
                    <option value="Covered under Subscription">Covered under Subscription</option>
                    <option value="Paid">Paid</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Cost</label>
                  <input type="text" placeholder="e.g. 65000, 1500 per hour, Free, NA" value={marketForm.cost} onChange={(e) => setMarketForm((f) => ({ ...f, cost: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Goal</label>
                  <input type="text" placeholder="Goal" value={marketForm.goal} onChange={(e) => setMarketForm((f) => ({ ...f, goal: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Outcomes</label>
                  <input type="text" placeholder="Outcome metrics" value={marketForm.outcomes} onChange={(e) => setMarketForm((f) => ({ ...f, outcomes: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Iterations</label>
                  <select value={marketForm.iterations} onChange={(e) => setMarketForm((f) => ({ ...f, iterations: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="3">3</option>
                    <option value="Unlimited">Unlimited</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <select value={marketForm.durationDays} onChange={(e) => setMarketForm((f) => ({ ...f, durationDays: e.target.value }))}>
                    <option value="">Select Duration</option>
                    <option value="1 Day">1 Day</option>
                    <option value="1 Week">1 Week</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount</label>
                  <select value={marketForm.discount} onChange={(e) => setMarketForm((f) => ({ ...f, discount: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="0%">0%</option>
                    <option value="10%">10%</option>
                    <option value="20%">20%</option>
                    <option value="Not Applicable">Not Applicable</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Features / Description</label>
                  <textarea rows="2" placeholder="Features or description" value={marketForm.features} onChange={(e) => setMarketForm((f) => ({ ...f, features: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-outline" onClick={closeMarketplace}>Cancel</button>
                <button className="btn-primary" onClick={addMarketplaceItem} disabled={!marketForm.name || !selectedRole}>Add to Step</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT PATH DRAWER ═══════════════════════════════════════════════ */}
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

      {/* ══ REVIEW STATUS PANEL ════════════════════════════════════════════ */}
      {reviewPanelOpen && (
        <ReviewStatusPanel
          reviewData={reviewData}
          onClose={() => setReviewPanelOpen(false)}
          onEditPath={() => { setReviewPanelOpen(false); setEditPathOpen(true); }}
          onResubmit={handleResubmit}
        />
      )}

    </div>
  );
};

export default DraftPathView;