import React, { useState, useEffect } from "react";
import "./FindBetterMatchModal.scss";

export default function AssistanceRequestModal({
  isOpen,
  onClose,
  service,
  previousItems = [],
  onSubmit,
}) {
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setAdditionalNotes("");
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!additionalNotes.trim()) {
      setError("Please describe your custom requirement in detail.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        additionalNotes: additionalNotes.trim(),
      });
      onClose();
    } catch (err) {
      setError("Failed to create assistance request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <span
              className="nbm-badge"
              style={{ background: "#fef3c7", color: "#b45309", borderColor: "#fde68a" }}
            >
              Maximum 3 Replacements Reached
            </span>
            <h3 className="nbm-title">Request Super Admin Assistance</h3>
            <p className="nbm-subtitle">
              Still haven't found the right match? Our team can review your specific learning path, budget, and requirements to handpick the best option for you.
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

          {previousItems.length > 0 && (
            <div className="nbm-field-group">
              <label className="nbm-label">
                Options evaluated so far ({previousItems.length}):
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {previousItems.map((item, idx) => (
                  <div
                    key={item.id || item._id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "9px 14px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      fontSize: "12.5px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#64748b", fontWeight: 800 }}>#{idx + 1}</span>
                      <span style={{ fontWeight: 700, color: "#1e293b" }}>{item.name}</span>
                    </div>
                    <span
                      style={{
                        color: "#dc2626",
                        background: "#fef2f2",
                        border: "1px solid #fee2e2",
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      Rejected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="nbm-field-group">
            <label className="nbm-label" htmlFor="assistance-notes">
              Describe what you are looking for in detail:
            </label>
            <textarea
              id="assistance-notes"
              className="nbm-textarea"
              placeholder="e.g. I need an accredited weekend certificate program under ₹20,000 near Hyderabad or a live mentor with 1-on-1 code reviews."
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              required
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
              Cancel
            </button>
            <button
              type="submit"
              className="nbm-btn-primary"
              style={{ background: "#2563eb", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)" }}
              disabled={submitting}
            >
              {submitting ? (
                <span className="nbm-spinner-wrap">
                  <span className="nbm-spinner" /> Submitting Request...
                </span>
              ) : (
                "Submit Request to Super Admin →"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
