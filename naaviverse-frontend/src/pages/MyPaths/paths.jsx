import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// ── Inject styles once ───────────────────────────────────────────────────────
const STYLE_ID = "epm-styles-v3";
if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=DM+Serif+Display&display=swap');

    /* ── Overlay ────────────────────────────────────── */
    .epm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10, 18, 30, 0.52);
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: epmOverlayIn 0.2s ease both;
    }
    @keyframes epmOverlayIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ── Modal ──────────────────────────────────────── */
    .epm-modal {
      font-family: 'DM Sans', sans-serif;
      background: #ffffff;
      border-radius: 22px;
      width: 100%;
      max-width: 580px;
      max-height: 86vh;
      display: flex;
      flex-direction: column;
      box-shadow:
        0 2px 4px rgba(0,0,0,0.03),
        0 12px 32px rgba(0,0,0,0.12),
        0 32px 64px rgba(0,0,0,0.10);
      /* NO transform/translate — starts centered via flexbox on overlay */
      animation: epmModalIn 0.24s cubic-bezier(0.34, 1.26, 0.64, 1) both;
      overflow: hidden;
    }
    @keyframes epmModalIn {
      from { opacity: 0; transform: scale(0.94) translateY(16px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);     }
    }

    /* ── Header ─────────────────────────────────────── */
    .epm-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 22px 24px 16px;
      border-bottom: 1px solid #f0f4f8;
      flex-shrink: 0;
    }
    .epm-header-title {
      font-family: 'DM Serif Display', serif;
      font-size: 1.3rem;
      font-weight: 400;
      color: #0d1b2a;
      margin: 0 0 3px;
      letter-spacing: -0.015em;
    }
    .epm-header-sub {
      font-size: 0.74rem;
      color: #94a3b8;
      margin: 0;
    }
    .epm-close {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      color: #94a3b8;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.15s;
    }
    .epm-close:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #ef4444;
    }

    /* ── Body ───────────────────────────────────────── */
    .epm-body {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 20px 24px 8px;
    }
    .epm-body::-webkit-scrollbar { width: 4px; }
    .epm-body::-webkit-scrollbar-track { background: transparent; }
    .epm-body::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

    /* ── Section label ──────────────────────────────── */
    .epm-sec {
      font-size: 0.63rem;
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #94a3b8;
      margin: 20px 0 10px;
    }
    .epm-sec:first-child { margin-top: 4px; }

    /* ── Grid layouts ───────────────────────────────── */
    .epm-row2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* ── Field ──────────────────────────────────────── */
    .epm-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin-bottom: 12px;
    }
    .epm-label {
      font-size: 0.71rem;
      font-weight: 600;
      color: #475569;
    }
    .epm-input,
    .epm-select,
    .epm-textarea {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.84rem;
      color: #0d1b2a;
      background: #f8fafc;
      border: 1.5px solid #e8ecf2;
      border-radius: 10px;
      padding: 8px 11px;
      outline: none;
      width: 100%;
      box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }
    .epm-input:focus,
    .epm-select:focus,
    .epm-textarea:focus {
      border-color: #0d9488;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(13,148,136,0.10);
    }
    .epm-input::placeholder,
    .epm-textarea::placeholder { color: #c8d5e0; }
    .epm-textarea { resize: vertical; min-height: 68px; line-height: 1.5; }
    .epm-select {
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 11px center;
      padding-right: 30px;
    }

    /* ── Pill group ─────────────────────────────────── */
    .epm-pills {
      display: flex;
      flex-wrap: wrap;     /* CRITICAL: must wrap */
      gap: 8px;
      width: 100%;
    }
    .epm-pill {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.74rem;
      font-weight: 500;
      padding: 5px 13px;
      border-radius: 50px;
      border: 1.5px solid #e2e8f0;
      background: #f8fafc;
      color: #64748b;
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      flex-shrink: 0;       /* pills never shrink — they wrap instead */
      transition: all 0.13s;
      line-height: 1.4;
    }
    .epm-pill:hover {
      border-color: #99f6e4;
      background: #f0fdf4;
      color: #0d9488;
    }
    .epm-pill.on {
      border-color: #0d9488;
      background: #ccfbf1;
      color: #0f766e;
      font-weight: 600;
    }

    /* ── Error banner ───────────────────────────────── */
    .epm-err {
      background: #fff1f2;
      border: 1px solid #fecaca;
      border-radius: 10px;
      padding: 9px 13px;
      font-size: 0.79rem;
      color: #be123c;
      margin-bottom: 14px;
    }

    /* ── Footer ─────────────────────────────────────── */
    .epm-footer {
      padding: 14px 24px 18px;
      border-top: 1px solid #f0f4f8;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-shrink: 0;
    }
    .epm-hint {
      font-size: 0.71rem;
      color: #94a3b8;
    }
    .epm-hint strong { color: #f59e0b; font-weight: 600; }
    .epm-btns { display: flex; gap: 8px; }

    .epm-btn-cancel {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.81rem;
      font-weight: 500;
      padding: 9px 18px;
      border-radius: 50px;
      border: 1.5px solid #e2e8f0;
      background: transparent;
      color: #64748b;
      cursor: pointer;
      transition: all 0.15s;
    }
    .epm-btn-cancel:hover { background: #f1f5f9; }

    .epm-btn-save {
      font-family: 'DM Sans', sans-serif;
      font-size: 0.81rem;
      font-weight: 600;
      padding: 9px 22px;
      border-radius: 50px;
      border: none;
      background: #0d9488;
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s;
    }
    .epm-btn-save:hover:not(:disabled) {
      background: #0f766e;
      transform: translateY(-1px);
      box-shadow: 0 4px 14px rgba(13,148,136,0.28);
    }
    .epm-btn-save:disabled { opacity: 0.48; cursor: not-allowed; transform: none; }

    /* ── Spinner ────────────────────────────────────── */
    .epm-spin {
      width: 12px; height: 12px;
      border: 2px solid rgba(255,255,255,0.35);
      border-top-color: #fff;
      border-radius: 50%;
      animation: epmSpin 0.65s linear infinite;
      display: inline-block;
    }
    @keyframes epmSpin { to { transform: rotate(360deg); } }

    /* ── Success ────────────────────────────────────── */
    .epm-success {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 52px 24px;
      text-align: center;
      gap: 10px;
    }
    .epm-success-icon {
      width: 54px; height: 54px;
      border-radius: 50%;
      background: #d1fae5;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 4px;
    }
    .epm-success h3 {
      font-family: 'DM Serif Display', serif;
      font-size: 1.2rem; font-weight: 400;
      color: #0d1b2a; margin: 0;
    }
    .epm-success p { font-size: 0.81rem; color: #64748b; margin: 0; }

    @media (max-width: 520px) {
      .epm-row2 { grid-template-columns: 1fr; }
      .epm-modal { border-radius: 18px; max-height: 92vh; }
      .epm-footer { flex-direction: column; align-items: stretch; }
      .epm-btns { justify-content: flex-end; }
    }
  `;
  document.head.appendChild(style);
}

// ── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OPTS = {
  financialSituation: ["0-25L", "25L-75L", "75L-3CR", "3CR+", "Other"],
  curriculum:         ["IB", "IGCSE", "CBSE", "ICSE", "Nordic"],
  grade:              ["9", "10", "11", "12"],
  stream:             ["MPC", "BIPC", "CEC", "MEC", "HEC"],
  gradeAvg: [
    "0% - 35%", "36% - 60%", "61% - 75%",
    "76% - 85%", "86% - 95%", "96% - 100%",
  ],
  personality: [
    "realistic", "investigative", "artistic",
    "social", "enterprising", "conventional",
  ],
  pathType: ["education", "career", "immigration"],
  pathCat:  ["K12", "Degree"],
};

// ── Pill components ───────────────────────────────────────────────────────────
const Pills = ({ options, value = [], onChange }) => (
  <div className="epm-pills">
    {options.map(opt => (
      <span
        key={opt}
        className={`epm-pill${value.includes(opt) ? " on" : ""}`}
        onClick={() =>
          onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt])
        }
      >
        {opt}
      </span>
    ))}
  </div>
);

const PillsSingle = ({ options, value, onChange }) => (
  <div className="epm-pills">
    {options.map(opt => (
      <span
        key={opt}
        className={`epm-pill${value === opt ? " on" : ""}`}
        onClick={() => onChange(opt === value ? "" : opt)}
      >
        {opt}
      </span>
    ))}
  </div>
);

// ── Main ─────────────────────────────────────────────────────────────────────
const EditPathForm = ({ selectedPath, onSave, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  const blank = () => ({
    nameOfPath:              "",
    description:             "",
    program:                 "",
    path_type:               "",
    path_cat:                "",
    personality:             "",
    financialSituation:      [],
    curriculum:              [],
    grade:                   [],
    stream:                  [],
    length:                  "",
    destination_institution: "",
    city:                    "",
    country:                 "",
    grade_avg:               [],
  });

  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!selectedPath) return;
    setForm({
      nameOfPath:              selectedPath.nameOfPath              || "",
      description:             selectedPath.description             || "",
      program:                 selectedPath.program                 || "",
      path_type:               selectedPath.path_type               || "",
      path_cat:                selectedPath.path_cat                || "",
      personality:             selectedPath.personality             || "",
      financialSituation:      selectedPath.financialSituation      || [],
      curriculum:              selectedPath.curriculum              || [],
      grade:                   selectedPath.grade                   || [],
      stream:                  selectedPath.stream                  || [],
      length:                  selectedPath.length                  || "",
      destination_institution:
        selectedPath.destination_institution ||
        selectedPath.university              || "",
      city:                    selectedPath.city                    || "",
      country:                 selectedPath.country                 || "",
      grade_avg:               selectedPath.grade_avg               || [],
    });
    setSuccess(false);
    setError("");
  }, [selectedPath]);

  // count changed fields
  const changedCount = Object.keys(form).filter(key => {
    const nv = form[key], ov = selectedPath?.[key];
    if (Array.isArray(nv)) {
      const oa = Array.isArray(ov) ? ov : [];
      return !(nv.length === oa.length && nv.every((v, i) => String(v) === String(oa[i])));
    }
    return nv !== (ov ?? "");
  }).length;

  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const onTxt  = e => { const { name, value } = e.target; set(name, value); };
  const onGA   = e => set("grade_avg", e.target.value ? [e.target.value] : []);

  // overlay click closes
  const overlayClick = e => { if (e.target === e.currentTarget) onCancel?.(); };

  const save = async () => {
    if (!selectedPath?._id) return;
    setError("");
    const diff = {};
    Object.keys(form).forEach(key => {
      const nv = form[key], ov = selectedPath[key];
      if (Array.isArray(nv)) {
        const oa = Array.isArray(ov) ? ov : [];
        const same = nv.length === oa.length && nv.every((v, i) => String(v) === String(oa[i]));
        if (!same) diff[key] = nv;
      } else if (nv !== (ov ?? "")) {
        diff[key] = typeof nv === "string" ? nv.trim() : nv;
      }
    });
    if (!Object.keys(diff).length) { setError("No changes detected."); return; }
    setLoading(true);
    try {
      const res = await axios.put(`${BASE_URL}/api/paths/update/${selectedPath._id}`, diff);
      setSuccess(true);
      onSave?.(res.data?.data || null);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to update. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Overlay renders directly — no parent drawer wrapper needed */
    <div className="epm-overlay" onClick={overlayClick}>
      <div className="epm-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="epm-header">
          <div>
            <p className="epm-header-title">Edit Path</p>
            <p className="epm-header-sub">{selectedPath?.nameOfPath || "Untitled Path"}</p>
          </div>
          <button className="epm-close" onClick={onCancel} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {success ? (
          <div className="epm-success">
            <div className="epm-success-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#059669" strokeWidth="2.2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </div>
            <h3>Path updated!</h3>
            <p>Your changes have been saved successfully.</p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="epm-body">
              {error && <div className="epm-err">{error}</div>}

              {/* ── Basic Info ── */}
              <p className="epm-sec">Basic Info</p>

              <div className="epm-field">
                <label className="epm-label">Path Name</label>
                <input className="epm-input" type="text" name="nameOfPath"
                  value={form.nameOfPath} onChange={onTxt}
                  placeholder="e.g. IBDP Engineering Pathway" />
              </div>

              <div className="epm-field">
                <label className="epm-label">Description</label>
                <textarea className="epm-textarea" name="description"
                  value={form.description} onChange={onTxt}
                  placeholder="Describe what this path covers..." />
              </div>

              <div className="epm-row2">
                <div className="epm-field">
                  <label className="epm-label">Program</label>
                  <input className="epm-input" type="text" name="program"
                    value={form.program} onChange={onTxt}
                    placeholder="e.g. B.Sc. Engineering" />
                </div>
                <div className="epm-field">
                  <label className="epm-label">Destination Institution</label>
                  <input className="epm-input" type="text"
                    name="destination_institution"
                    value={form.destination_institution} onChange={onTxt}
                    placeholder="e.g. TU Munich" />
                </div>
              </div>

              <div className="epm-row2">
                <div className="epm-field">
                  <label className="epm-label">City</label>
                  <input className="epm-input" type="text" name="city"
                    value={form.city} onChange={onTxt} placeholder="City" />
                </div>
                <div className="epm-field">
                  <label className="epm-label">Country</label>
                  <input className="epm-input" type="text" name="country"
                    value={form.country} onChange={onTxt} placeholder="Country" />
                </div>
              </div>

              <div className="epm-row2">
                <div className="epm-field">
                  <label className="epm-label">Path Type</label>
                  <select className="epm-select" name="path_type"
                    value={form.path_type} onChange={onTxt}>
                    <option value="">Select type</option>
                    {OPTS.pathType.map(o => (
                      <option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="epm-field">
                  <label className="epm-label">Category</label>
                  <select className="epm-select" name="path_cat"
                    value={form.path_cat} onChange={onTxt}>
                    <option value="">Select category</option>
                    {OPTS.pathCat.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="epm-row2">
                <div className="epm-field">
                  <label className="epm-label">Length (months)</label>
                  <input className="epm-input" type="text" name="length"
                    value={form.length} onChange={onTxt} placeholder="e.g. 24" />
                </div>
                <div className="epm-field">
                  <label className="epm-label">Grade Average</label>
                  <select className="epm-select" name="grade_avg"
                    value={form.grade_avg?.[0] || ""} onChange={onGA}>
                    <option value="">Select range</option>
                    {OPTS.gradeAvg.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Personality ── */}
              <p className="epm-sec">Personality Type</p>
              <div className="epm-field">
                <PillsSingle options={OPTS.personality}
                  value={form.personality}
                  onChange={v => set("personality", v)} />
              </div>

              {/* ── Academic Filters ── */}
              <p className="epm-sec">Academic Filters</p>

              <div className="epm-field">
                <label className="epm-label">Curriculum</label>
                <Pills options={OPTS.curriculum}
                  value={form.curriculum}
                  onChange={v => set("curriculum", v)} />
              </div>

              <div className="epm-field">
                <label className="epm-label">Grade</label>
                <Pills options={OPTS.grade}
                  value={form.grade}
                  onChange={v => set("grade", v)} />
              </div>

              <div className="epm-field">
                <label className="epm-label">Stream</label>
                <Pills options={OPTS.stream}
                  value={form.stream}
                  onChange={v => set("stream", v)} />
              </div>

              {/* ── Financial ── */}
              <p className="epm-sec">Financial Situation</p>
              <div className="epm-field" style={{ marginBottom: 8 }}>
                <Pills options={OPTS.financialSituation}
                  value={form.financialSituation}
                  onChange={v => set("financialSituation", v)} />
              </div>

            </div>

            {/* Footer */}
            <div className="epm-footer">
              <span className="epm-hint">
                {changedCount > 0
                  ? <><strong>{changedCount}</strong> field{changedCount > 1 ? "s" : ""} modified</>
                  : "No changes yet"
                }
              </span>
              <div className="epm-btns">
                <button className="epm-btn-cancel" onClick={onCancel} disabled={loading}>
                  Cancel
                </button>
                <button className="epm-btn-save" onClick={save}
                  disabled={loading || changedCount === 0}>
                  {loading
                    ? <><span className="epm-spin" /> Saving…</>
                    : "Save Changes"
                  }
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default EditPathForm;