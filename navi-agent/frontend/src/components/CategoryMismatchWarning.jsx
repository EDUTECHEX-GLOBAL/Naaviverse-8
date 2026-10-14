import React from "react";
import "./CategoryMismatchWarning.scss";
import { IconArrowRight } from "../pages/Icons";

/**
 * CategoryMismatchWarning Component
 * 
 * Renders dynamic warnings for category inconsistency:
 * - Strong mismatch
 * - Possible mismatch
 * - Ambiguous input verification
 * 
 * Provides interactive options:
 * 1. One-click switch to Detected Category
 * 2. Focus / Review inputs
 * 3. Toggle intentional cross-category acknowledgement
 */
export default function CategoryMismatchWarning({
  validation,
  allowCrossCategory,
  onToggleCrossCategory,
  onSwitchCategory,
  onFocusInputs,
}) {
  if (!validation || !validation.shouldWarn) {
    return null;
  }

  const {
    status,
    selectedCategory,
    detectedCategory,
    reason,
    warningTitle,
    warningMessage,
    softNotice,
  } = validation;

  const isStrongMismatch = status === "strong_mismatch";
  const isPossibleMismatch = status === "possible_mismatch";
  const isAmbiguous = status === "ambiguous";

  const bannerClass = isStrongMismatch
    ? "warning-strong"
    : isPossibleMismatch
    ? "warning-medium"
    : "warning-ambiguous";

  return (
    <div className={`category-mismatch-banner ${bannerClass} ${allowCrossCategory ? "acknowledged" : ""}`} role="alert">
      <div className="banner-header">
        <div className="banner-icon-wrapper">
          {isStrongMismatch ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : isPossibleMismatch ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          )}
        </div>
        <div className="banner-title-area">
          <div className="banner-kicker">
            {isStrongMismatch ? "Validation Alert" : isPossibleMismatch ? "Advisory Check" : "Domain Verification"}
          </div>
          <h4 className="banner-title">{warningTitle}</h4>
        </div>

        {detectedCategory && detectedCategory.key !== selectedCategory.key && (
          <div className="category-tags">
            <span className="tag selected" title="Currently Selected Category">
              Selected: <strong>{selectedCategory.label}</strong>
            </span>
            <span className="tag-arrow"><IconArrowRight size={14} /></span>
            <span className="tag detected" title="Inferred Category from Inputs">
              Detected: <strong>{detectedCategory.label}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="banner-body">
        <p className="banner-message">
          {warningMessage}
        </p>

        {reason && (
          <div className="banner-reason">
            <strong>Reason:</strong> {reason}
          </div>
        )}

        {allowCrossCategory && (
          <div className="banner-acknowledged-notice">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Intentional cross-category pathway acknowledged by admin. Generation permitted.
          </div>
        )}
      </div>

      <div className="banner-actions">
        {detectedCategory && detectedCategory.key !== selectedCategory.key && onSwitchCategory && (
          <button
            type="button"
            className="btn-switch-category"
            onClick={() => onSwitchCategory(detectedCategory.key)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            Switch Category to <strong>{detectedCategory.label}</strong>
          </button>
        )}

        {onFocusInputs && (
          <button
            type="button"
            className="btn-edit-inputs"
            onClick={onFocusInputs}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Review &amp; Edit Inputs
          </button>
        )}

        <label className="checkbox-cross-category">
          <input
            type="checkbox"
            checked={!!allowCrossCategory}
            onChange={(e) => onToggleCrossCategory && onToggleCrossCategory(e.target.checked)}
          />
          <span>Allow intentional cross-category path</span>
        </label>
      </div>
    </div>
  );
}
