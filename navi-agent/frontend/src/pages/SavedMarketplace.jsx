import { useEffect, useState, useMemo } from "react";
import "./SavedMarketplace.scss";

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://127.0.0.1:8001" : "");

const CATEGORY_OPTIONS = [
  { key: "all", label: "All Saved" },
  { key: "macro_free", label: "Macro – Free Resources" },
  { key: "micro_structured", label: "Micro – Structured Courses" },
  { key: "nano_expert", label: "Nano – Expert Reviews" },
];

const CATEGORY_COLORS = {
  macro_free: "#1a73e8",
  micro_structured: "#e8710a",
  nano_expert: "#0d652d",
};

const ACTION_LABELS = {
  saved: "Saved",
  started: "Started",
  completed: "Completed",
  interested: "Interested",
};

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function mapProviderType(type) {
  if (!type) return "macro_free";
  const t = type.toLowerCase();
  if (t.includes("free") || t.includes("youtube") || t.includes("portal") || t.includes("directory") || t.includes("tool") || t.includes("resource")) return "macro_free";
  if (t.includes("course") || t.includes("certification") || t.includes("bootcamp") || t.includes("app") || t.includes("counselling") || t.includes("group")) return "micro_structured";
  if (t.includes("expert") || t.includes("coaching") || t.includes("review") || t.includes("consult")) return "nano_expert";
  return "macro_free";
}

export default function SavedMarketplace() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/marketplace-feedback`);
      if (!res.ok) throw new Error("Failed to load saved marketplace items");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/api/marketplace-feedback/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");
      setFeedbacks((prev) => prev.filter((f) => f.id !== id && f._id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = useMemo(() => {
    if (selectedCategory === "all") return feedbacks;
    return feedbacks.filter((f) => mapProviderType(f.provider_type) === selectedCategory);
  }, [feedbacks, selectedCategory]);

  const counts = useMemo(() => {
    const c = { all: feedbacks.length, macro_free: 0, micro_structured: 0, nano_expert: 0 };
    feedbacks.forEach((f) => {
      const cat = mapProviderType(f.provider_type);
      c[cat] = (c[cat] || 0) + 1;
    });
    return c;
  }, [feedbacks]);

  const selectedLabel = CATEGORY_OPTIONS.find((o) => o.key === selectedCategory)?.label || "All Saved";

  return (
    <div className="saved-marketplace">
      <div className="saved-mp-header">
        <div className="saved-mp-title-row">
          <h1 className="saved-mp-title">Saved Marketplace</h1>
          <span className="saved-mp-count">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</span>
        </div>
        <p className="saved-mp-subtitle">Review all saved marketplace resources across your generated pathways. Use these to inform future path generation.</p>
      </div>

      {/* Category Filter Dropdown */}
      <div className="saved-mp-filter-bar">
        <div className={`saved-mp-dropdown ${dropdownOpen ? "open" : ""}`}>
          <button
            className="saved-mp-dropdown-trigger"
            onClick={() => setDropdownOpen((o) => !o)}
            type="button"
          >
            <span className="saved-mp-dropdown-label">{selectedLabel}</span>
            <span className="saved-mp-dropdown-count">{counts[selectedCategory]}</span>
            <svg className="saved-mp-dropdown-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="saved-mp-dropdown-menu">
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  className={`saved-mp-dropdown-option ${selectedCategory === opt.key ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(opt.key);
                    setDropdownOpen(false);
                  }}
                >
                  {opt.key !== "all" && (
                    <span className="saved-mp-cat-dot" style={{ background: CATEGORY_COLORS[opt.key] }} />
                  )}
                  <span className="saved-mp-opt-label">{opt.label}</span>
                  <span className="saved-mp-opt-count">{counts[opt.key]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button className="saved-mp-refresh-btn" onClick={fetchFeedbacks} title="Refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="saved-mp-loading">
          <div className="saved-mp-spinner" />
          <span>Loading saved marketplace items...</span>
        </div>
      ) : error ? (
        <div className="saved-mp-error">
          <p>{error}</p>
          <button onClick={fetchFeedbacks}>Retry</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="saved-mp-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <p>No saved marketplace items{selectedCategory !== "all" ? ` in ${selectedLabel}` : ""}</p>
          <span className="saved-mp-empty-hint">When you save marketplace resources in Step Details, they'll appear here for review.</span>
        </div>
      ) : (
        <div className="saved-mp-grid">
          {filtered.map((fb) => {
            const cat = mapProviderType(fb.provider_type);
            const catColor = CATEGORY_COLORS[cat] || "#666";
            const catLabel = CATEGORY_OPTIONS.find((o) => o.key === cat)?.label || cat;
            return (
              <div className="saved-mp-card" key={fb.id || fb._id}>
                <div className="saved-mp-card-header">
                  <span className="saved-mp-card-badge" style={{ background: catColor + "18", color: catColor, borderColor: catColor + "40" }}>
                    {catLabel.split("–")[0]?.trim()}
                  </span>
                  <span className="saved-mp-card-action">{ACTION_LABELS[fb.action] || fb.action}</span>
                </div>
                <h3 className="saved-mp-card-name">{fb.provider_name}</h3>
                <p className="saved-mp-card-type">{fb.provider_type}</p>
                <div className="saved-mp-card-meta">
                  <div className="saved-mp-card-meta-item">
                    <span className="saved-mp-meta-label">Path</span>
                    <span className="saved-mp-meta-value">{fb.path_name || "—"}</span>
                  </div>
                  <div className="saved-mp-card-meta-item">
                    <span className="saved-mp-meta-label">Step</span>
                    <span className="saved-mp-meta-value">{fb.step_title || `Step ${fb.step_id}`}</span>
                  </div>
                  <div className="saved-mp-card-meta-item">
                    <span className="saved-mp-meta-label">Student</span>
                    <span className="saved-mp-meta-value">{fb.student_email || "—"}</span>
                  </div>
                  <div className="saved-mp-card-meta-item">
                    <span className="saved-mp-meta-label">Saved</span>
                    <span className="saved-mp-meta-value">{formatDate(fb.timestamp)}</span>
                  </div>
                </div>
                <div className="saved-mp-card-footer">
                  <button className="saved-mp-delete-btn" onClick={() => handleDelete(fb.id || fb._id)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
