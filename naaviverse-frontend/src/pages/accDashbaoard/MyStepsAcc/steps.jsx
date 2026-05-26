import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  macro: { ...EMPTY_LAYER },
  micro: { ...EMPTY_LAYER },
  nano: { ...EMPTY_LAYER },
};

const EMPTY_MARKET_FORM = {
  name: "",
  access: "Free",
  cost: "",
  goal: "",
  outcomes: "",
  iterations: "",
  durationDays: "",
  discount: "",
  features: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const parseDuration = (val) => {
  if (!val) return { years: "", months: "", days: "" };
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return { years: "", months: "", days: "" };
  }
};

const normalizeStep = (raw) => {
  if (!raw) return JSON.parse(JSON.stringify(EMPTY_STEP));

  // Already in new shape
  if (raw.macro && typeof raw.macro === "object" && raw.macro.name !== undefined) {
    return {
      macro: { ...EMPTY_LAYER, ...raw.macro, marketplace: raw.macro.marketplace || [] },
      micro: { ...EMPTY_LAYER, ...raw.micro, marketplace: raw.micro?.marketplace || [] },
      nano: { ...EMPTY_LAYER, ...raw.nano, marketplace: raw.nano?.marketplace || [] },
    };
  }

  // Legacy flat shape
  return {
    macro: {
      ...EMPTY_LAYER,
      name: raw.macro_name || raw.name || "",
      desc: raw.macro_description || raw.description || "",
      duration: parseDuration(raw.macro_length || raw.length),
      paid: raw.macro_access === "paid" || raw.cost === "paid",
      free: raw.macro_access === "free" || raw.cost === "free",
      instructions: raw.macro_instructions || "",
      marketplace: raw.macro_marketplace || [],
    },
    micro: {
      ...EMPTY_LAYER,
      name: raw.micro_name || "",
      desc: raw.micro_description || raw.microDescription || "",
      duration: parseDuration(raw.micro_length),
      paid: raw.micro_access === "paid",
      free: raw.micro_access === "free",
      instructions: raw.micro_instructions || "",
      marketplace: raw.micro_marketplace || [],
    },
    nano: {
      ...EMPTY_LAYER,
      name: raw.nano_name || "",
      desc: raw.nano_description || raw.nanoDescription || "",
      duration: parseDuration(raw.nano_length),
      paid: raw.nano_access === "paid",
      free: raw.nano_access === "free",
      instructions: raw.nano_instructions || "",
      marketplace: raw.nano_marketplace || [],
    },
  };
};

// ─── DurationSelect ───────────────────────────────────────────────────────────

const DurationSelect = ({ value, onChange, type }) => {
  const configs = {
    years:  { label: "Years",  count: 11 },
    months: { label: "Months", count: 12 },
    days:   { label: "Days",   count: 31 },
  };
  const { label, count } = configs[type];
  return (
    <select style={styles.durationSelect} value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">{label}</option>
      {[...Array(count)].map((_, i) => (
        <option key={i} value={i}>
          {i} {i === 1 ? label.slice(0, -1) : label}
        </option>
      ))}
    </select>
  );
};

// ─── MarketplaceItemCard ──────────────────────────────────────────────────────

const MarketplaceItemCard = ({ item, onRemove }) => (
  <div style={styles.marketCard}>
    <div style={styles.marketCardHeader}>
      <span style={styles.marketCardTitle}>
        {item.name || "Unnamed"}{item.role ? ` (${item.role})` : ""}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {item.cost && <span style={styles.marketCardCost}>{item.cost}</span>}
        {onRemove && (
          <button onClick={onRemove} style={styles.removeBtn} title="Remove">✕</button>
        )}
      </div>
    </div>
    <div style={styles.marketCardMeta}>
      {item.goal      && <span><strong>Goal:</strong> {item.goal}</span>}
      {item.outcomes  && <span><strong>Outcomes:</strong> {item.outcomes}</span>}
      {item.access    && <span><strong>Access:</strong> {item.access}</span>}
      {item.iterations && <span><strong>Iterations:</strong> {item.iterations}</span>}
      {item.duration  && <span><strong>Duration:</strong> {item.duration}</span>}
      {item.discount  && <span><strong>Discount:</strong> {item.discount}</span>}
    </div>
    {item.features && (
      <div style={styles.marketCardFeatures}><strong>Features:</strong> {item.features}</div>
    )}
  </div>
);

// ─── LayerSection ─────────────────────────────────────────────────────────────

const LayerSection = ({ layerKey, data, onChange, onAddMarketplace }) => {
  const colorMap = { macro: "#0d6b6e", micro: "#3b82f6", nano: "#a855f7" };
  const color = colorMap[layerKey];

  const update = (field, value) => onChange({ ...data, [field]: value });
  const updateDuration = (part, value) =>
    onChange({ ...data, duration: { ...data.duration, [part]: value } });

  const removeMarketplaceItem = (index) => {
    const updated = (data.marketplace || []).filter((_, i) => i !== index);
    onChange({ ...data, marketplace: updated });
  };

  return (
    <div style={{ ...styles.layerSection, borderLeft: `3px solid ${color}` }}>
      <h3 style={{ ...styles.layerTitle, color }}>{layerKey.toUpperCase()}</h3>

      {/* Name */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Name</label>
        <input
          type="text"
          style={styles.input}
          placeholder={`${layerKey.charAt(0).toUpperCase() + layerKey.slice(1)} name...`}
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>

      {/* Description */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Description</label>
        <textarea
          rows={3}
          style={styles.textarea}
          placeholder="Enter description..."
          value={data.desc}
          onChange={(e) => update("desc", e.target.value)}
        />
      </div>

      {/* Duration */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Duration</label>
        <div style={styles.durationRow}>
          <DurationSelect type="years"  value={data.duration?.years}  onChange={(v) => updateDuration("years", v)} />
          <DurationSelect type="months" value={data.duration?.months} onChange={(v) => updateDuration("months", v)} />
          <DurationSelect type="days"   value={data.duration?.days}   onChange={(v) => updateDuration("days", v)} />
        </div>
        <div style={styles.checkboxRow}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={!!data.paid}
              onChange={(e) => update("paid", e.target.checked)}
            />
            Paid
          </label>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={!!data.free}
              onChange={(e) => update("free", e.target.checked)}
            />
            Free
          </label>
        </div>
      </div>

      {/* Instructions */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Instructions</label>
        <textarea
          rows={3}
          style={styles.textarea}
          placeholder="Enter instructions..."
          value={data.instructions}
          onChange={(e) => update("instructions", e.target.value)}
        />
      </div>

      {/* Marketplace */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Marketplace Items</label>
        <div style={styles.marketplaceList}>
          {(data.marketplace || []).length === 0 ? (
            <p style={styles.noItems}>No Marketplace Items Added.</p>
          ) : (
            (data.marketplace || []).map((item, i) => (
              <MarketplaceItemCard
                key={i}
                item={item}
                onRemove={() => removeMarketplaceItem(i)}
              />
            ))
          )}
        </div>
        <button
          style={styles.addMarketBtn}
          onClick={(e) => { e.preventDefault(); onAddMarketplace(layerKey); }}
        >
          + Add Marketplace
        </button>
      </div>
    </div>
  );
};

// ─── MarketplaceModal ─────────────────────────────────────────────────────────

const MarketplaceModal = ({ layerKey, onAdd, onClose }) => {
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm] = useState(EMPTY_MARKET_FORM);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleAdd = () => {
    if (!form.name || !selectedRole) return;
    onAdd({
      role: selectedRole,
      name: form.name,
      access: form.access,
      cost: form.cost,
      goal: form.goal,
      outcomes: form.outcomes,
      iterations: form.iterations,
      duration: form.durationDays,
      discount: form.discount,
      features: form.features,
    });
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalContext}>
          Adding to <strong>{layerKey.charAt(0).toUpperCase() + layerKey.slice(1)}</strong>
        </div>
        <h3 style={styles.modalTitle}>Marketplace Listing</h3>

        <div style={styles.formGroup}>
          <label style={styles.label}>Marketplace Role *</label>
          <select style={styles.input} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="">Select Role</option>
            <option value="vendor">Vendor</option>
            <option value="mentor">Mentor</option>
            <option value="institution">Institution</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Name *</label>
          <input type="text" style={styles.input} placeholder="Marketplace Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Access</label>
          <select style={styles.input} value={form.access} onChange={(e) => set("access", e.target.value)}>
            <option value="Free">Free</option>
            <option value="Covered under Subscription">Covered under Subscription</option>
            <option value="Paid">Paid</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Cost</label>
          <input type="text" style={styles.input} placeholder="e.g. 65000, 1500 per hour, Free, NA" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Goal</label>
          <input type="text" style={styles.input} placeholder="Goal" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Outcomes</label>
          <input type="text" style={styles.input} placeholder="Outcome metrics" value={form.outcomes} onChange={(e) => set("outcomes", e.target.value)} />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Iterations</label>
          <select style={styles.input} value={form.iterations} onChange={(e) => set("iterations", e.target.value)}>
            <option value="">Select</option>
            <option value="1">1</option>
            <option value="3">3</option>
            <option value="Unlimited">Unlimited</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Duration</label>
          <select style={styles.input} value={form.durationDays} onChange={(e) => set("durationDays", e.target.value)}>
            <option value="">Select Duration</option>
            <option value="1 Day">1 Day</option>
            <option value="1 Week">1 Week</option>
            <option value="1 Month">1 Month</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Discount</label>
          <select style={styles.input} value={form.discount} onChange={(e) => set("discount", e.target.value)}>
            <option value="">Select</option>
            <option value="0%">0%</option>
            <option value="10%">10%</option>
            <option value="20%">20%</option>
            <option value="Not Applicable">Not Applicable</option>
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Features / Description</label>
          <textarea rows={3} style={styles.textarea} placeholder="Features or description" value={form.features} onChange={(e) => set("features", e.target.value)} />
        </div>

        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{ ...styles.saveBtn, opacity: (!form.name || !selectedRole) ? 0.5 : 1 }}
            disabled={!form.name || !selectedRole}
            onClick={handleAdd}
          >
            Add to Step
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EditStepForm (main) ──────────────────────────────────────────────────────

const EditStepForm = ({ selectedStep, onSave, onCancel }) => {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(EMPTY_STEP)));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  const [currentLayer, setCurrentLayer] = useState("macro");

  // ── Prefill from selectedStep ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedStep) return;
    setFormData(normalizeStep(selectedStep));
  }, [selectedStep]);

  // ── Layer update ───────────────────────────────────────────────────────────
  const updateLayer = (layerKey, newLayerData) => {
    setFormData((prev) => ({ ...prev, [layerKey]: newLayerData }));
  };

  // ── Marketplace ────────────────────────────────────────────────────────────
  const openMarketplace = (layerKey) => {
    setCurrentLayer(layerKey);
    setMarketplaceOpen(true);
  };

  const addMarketplaceItem = (newItem) => {
    setFormData((prev) => ({
      ...prev,
      [currentLayer]: {
        ...prev[currentLayer],
        marketplace: [...(prev[currentLayer]?.marketplace || []), newItem],
      },
    }));
    setMarketplaceOpen(false);
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedStep?._id) return;
    setLoading(true);
    setMessage("");

    try {
      const partner = JSON.parse(localStorage.getItem("partner"));

      const payload = {
        email: partner?.email || "",
        name: formData.macro?.name || "",

        macro_name:         formData.macro?.name || "",
        macro_description:  formData.macro?.desc || "",
        macro_length:       JSON.stringify(formData.macro?.duration || {}),
        macro_access:       formData.macro?.paid ? "paid" : "free",
        macro_instructions: formData.macro?.instructions || "",
        macro_marketplace:  formData.macro?.marketplace || [],

        micro_name:         formData.micro?.name || "",
        micro_description:  formData.micro?.desc || "",
        micro_length:       JSON.stringify(formData.micro?.duration || {}),
        micro_access:       formData.micro?.paid ? "paid" : "free",
        micro_instructions: formData.micro?.instructions || "",
        micro_marketplace:  formData.micro?.marketplace || [],

        nano_name:          formData.nano?.name || "",
        nano_description:   formData.nano?.desc || "",
        nano_length:        JSON.stringify(formData.nano?.duration || {}),
        nano_access:        formData.nano?.paid ? "paid" : "free",
        nano_instructions:  formData.nano?.instructions || "",
        nano_marketplace:   formData.nano?.marketplace || [],
      };

      const response = await axios.put(
        `${BASE_URL}/api/steps/update/${selectedStep._id}`,
        payload,
        {
          headers: {
            email: partner?.email,
            token: partner?.token || partner?.idToken,
          },
        }
      );

      if (response.data.status) {
        setMessage("Step updated successfully!");
        setShowSuccess(true);
        onSave(response.data.data);
      } else {
        setMessage(response.data.message || "Failed to update step.");
      }
    } catch (error) {
      console.error(error.response?.data || error);
      setMessage("Failed to update step.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div style={styles.successPage}>
        <p style={styles.successText}>{message}</p>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.container}>
      {message && !showSuccess && (
        <div style={styles.errorMsg}>{message}</div>
      )}

      {LAYERS.map((layerKey) => (
        <LayerSection
          key={layerKey}
          layerKey={layerKey}
          data={formData[layerKey]}
          onChange={(newData) => updateLayer(layerKey, newData)}
          onAddMarketplace={openMarketplace}
        />
      ))}

      <div style={styles.buttonRow}>
        <button style={styles.cancelBtn} onClick={onCancel} disabled={loading}>
          Go Back
        </button>
        <button style={styles.saveBtn} onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {marketplaceOpen && (
        <MarketplaceModal
          layerKey={currentLayer}
          onAdd={addMarketplaceItem}
          onClose={() => setMarketplaceOpen(false)}
        />
      )}
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  container: {
    maxHeight: "80vh",
    overflowY: "auto",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  layerSection: {
    background: "#f9fbfd",
    borderRadius: 12,
    padding: "1.25rem",
    border: "1px solid #e2eaf2",
  },
  layerTitle: {
    fontSize: "0.85rem",
    fontWeight: 700,
    marginBottom: "1rem",
    letterSpacing: "0.08em",
  },
  formGroup: {
    marginBottom: "0.9rem",
  },
  label: {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 600,
    color: "#4a5568",
    marginBottom: "0.3rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: "1px solid #d1dce8",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
    background: "#fff",
  },
  textarea: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    border: "1px solid #d1dce8",
    fontSize: "0.9rem",
    outline: "none",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "#fff",
  },
  durationRow: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
  },
  durationSelect: {
    flex: 1,
    minWidth: 90,
    padding: "0.45rem 0.5rem",
    borderRadius: 8,
    border: "1px solid #d1dce8",
    fontSize: "0.85rem",
    background: "#fff",
    cursor: "pointer",
  },
  checkboxRow: {
    display: "flex",
    gap: "1.25rem",
    marginTop: "0.5rem",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    fontSize: "0.88rem",
    cursor: "pointer",
    color: "#2d3748",
  },
  marketplaceList: {
    marginBottom: "0.5rem",
  },
  noItems: {
    fontSize: "0.82rem",
    color: "#a0aec0",
    fontStyle: "italic",
    margin: "0 0 0.4rem 0",
  },
  marketCard: {
    background: "#eef4fb",
    borderRadius: 10,
    padding: "0.7rem 0.9rem",
    marginBottom: "0.4rem",
    border: "1px solid #ccdae5",
    fontSize: "0.83rem",
  },
  marketCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    marginBottom: "0.25rem",
  },
  marketCardTitle: {
    fontSize: "0.85rem",
  },
  marketCardCost: {
    fontSize: "0.8rem",
    color: "#2c5282",
  },
  marketCardMeta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.4rem 1rem",
    color: "#4a5568",
    fontSize: "0.8rem",
  },
  marketCardFeatures: {
    marginTop: "0.3rem",
    fontSize: "0.8rem",
    color: "#4a5568",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#e53e3e",
    fontSize: "0.85rem",
    padding: "0 0.2rem",
    lineHeight: 1,
  },
  addMarketBtn: {
    background: "none",
    border: "1px dashed #a0aec0",
    borderRadius: 8,
    padding: "0.4rem 0.9rem",
    fontSize: "0.82rem",
    color: "#4a5568",
    cursor: "pointer",
    marginTop: "0.25rem",
  },
  buttonRow: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    paddingTop: "0.5rem",
  },
  cancelBtn: {
    padding: "0.55rem 1.4rem",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#1f304f",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: 500,
  },
  saveBtn: {
    padding: "0.55rem 1.4rem",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(90deg, #47b4d5 0%, #29449d 100%)",
    color: "#fff",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: 600,
  },
  errorMsg: {
    background: "#fff5f5",
    border: "1px solid #fed7d7",
    color: "#c53030",
    borderRadius: 8,
    padding: "0.6rem 1rem",
    fontSize: "0.85rem",
  },
  successPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  successText: {
    fontSize: "1rem",
    color: "#2f855a",
    fontWeight: 500,
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    background: "#fff",
    borderRadius: 16,
    padding: "1.5rem",
    width: "100%",
    maxWidth: 480,
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalContext: {
    fontSize: "0.8rem",
    color: "#718096",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  modalTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    marginBottom: "1rem",
    color: "#1a202c",
  },
  modalFooter: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
  },
};

export default EditStepForm;