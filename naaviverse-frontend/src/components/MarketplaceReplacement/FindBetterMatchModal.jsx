import React, { useState, useEffect } from "react";
import "./FindBetterMatchModal.scss";

const REASONS = [
  {
    id: "too_expensive",
    label: "Too expensive",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "wrong_location",
    label: "Wrong location",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    id: "wrong_level",
    label: "Wrong difficulty level",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    id: "wrong_duration",
    label: "Wrong duration",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "offline_preferred",
    label: "Offline instead of online",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3" />
      </svg>
    ),
  },
  {
    id: "online_preferred",
    label: "Online instead of offline",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: "rating_not_suitable",
    label: "Rating / reviews not suitable",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "service_type_mismatch",
    label: "Service type is not suitable",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
  {
    id: "not_relevant",
    label: "Not relevant to my goal",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  {
    id: "other",
    label: "Other requirement",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export default function FindBetterMatchModal({
  isOpen,
  onClose,
  service,
  currentCount = 0,
  onSubmit,
}) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customRequirement, setCustomRequirement] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset form state every time modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReasons([]);
      setCustomRequirement("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !service) return null;

  const toggleReason = (id) => {
    setSelectedReasons((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedReasons.length === 0 && !customRequirement.trim()) {
      setError("Please select at least one reason or type what you are looking for.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        reasons: selectedReasons,
        message: customRequirement.trim(),
      });
      onClose();
    } catch (err) {
      setError("Failed to find a replacement. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const nextCount = Math.min(3, currentCount + 1);

  return (
    <div className="nbm-overlay" onClick={onClose}>
      <div
        className="nbm-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="nbm-header">
          <div className="nbm-header-left">
            <span className="nbm-badge">
              Replacement {nextCount} of 3
            </span>
            <h3 className="nbm-title">Find a Better Match</h3>
            <p className="nbm-subtitle">
              Tell us why <span className="nbm-service-highlight">"{service.name}"</span> isn't right for you. We'll re-rank alternatives to match your preferences.
            </p>
          </div>
          <button
            type="button"
            className="nbm-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="nbm-form">
          {error && <div className="nbm-error-alert">{error}</div>}

          <div className="nbm-field-group">
            <label className="nbm-label">
              What is not suitable about this recommendation?
            </label>
            <div className="nbm-chips-container">
              {REASONS.map((r) => {
                const isSelected = selectedReasons.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={`nbm-chip ${isSelected ? "is-selected" : ""}`}
                    onClick={() => toggleReason(r.id)}
                  >
                    <span className="nbm-chip-indicator">{isSelected ? "✓" : "+"}</span>
                    <span className="nbm-chip-icon">{r.icon}</span>
                    <span className="nbm-chip-text">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="nbm-field-group">
            <label className="nbm-label" htmlFor="nbm-custom-req">
              Tell us what you want <span className="nbm-optional">(Optional)</span>
            </label>
            <textarea
              id="nbm-custom-req"
              className="nbm-textarea"
              placeholder="e.g. I am looking for a lower cost option or an offline classroom course in my city..."
              rows={3}
              value={customRequirement}
              onChange={(e) => setCustomRequirement(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="nbm-footer">
            <button
              type="button"
              className="nbm-btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Keep Current Option
            </button>
            <button
              type="submit"
              className="nbm-btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="nbm-spinner-wrap">
                  <span className="nbm-spinner" /> Finding match...
                </span>
              ) : (
                `Find Better Match (${nextCount}/3)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
