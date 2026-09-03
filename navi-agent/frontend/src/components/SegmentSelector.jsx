import React from "react";
import { SEGMENT_CONFIGS, SEGMENTS } from "../constants/segments";
import "./SegmentSelector.scss";

export default function SegmentSelector({
  activeSegment = "",
  activeSubSegment = "",
  onSelectSegment,
  onSelectSubSegment,
  showSubSegments = true,
  disabled = false,
  compact = false,
  useDropdown = false,
  className = "",
}) {
  const currentConfig = activeSegment
    ? SEGMENT_CONFIGS.find(s => s.key === activeSegment) || null
    : null;

  const handleSegmentChange = (segmentKey) => {
    if (disabled || segmentKey === activeSegment) return;
    const targetConfig = SEGMENT_CONFIGS.find(s => s.key === segmentKey);
    const defaultSub = targetConfig?.subSegments?.[0]?.label || "";
    if (onSelectSegment) {
      onSelectSegment(segmentKey, defaultSub);
    }
  };

  const handleSubSegmentChange = (subLabel) => {
    if (disabled || subLabel === activeSubSegment) return;
    if (onSelectSubSegment) {
      onSelectSubSegment(subLabel);
    }
  };

  // Dropdown mode — select elements instead of pill buttons
  if (useDropdown) {
    return (
      <div className={`segment-selector-container dropdown-mode ${className}`}>
        <div className="segment-dropdown-row">
          <div className="segment-dropdown-group">
            <label className="segment-dropdown-label">Content Category</label>
            <select
              className="segment-dropdown-select"
              value={activeSegment || ""}
              onChange={(e) => handleSegmentChange(e.target.value)}
              disabled={disabled}
            >
              <option value="">Select Category</option>
              {SEGMENT_CONFIGS.map((seg) => (
                <option key={seg.key} value={seg.key}>
                  {seg.label}
                </option>
              ))}
            </select>
          </div>

          {showSubSegments && (
            <div className="segment-dropdown-group">
              <label className="segment-dropdown-label">Sub-Category</label>
              <select
                className="segment-dropdown-select"
                value={activeSubSegment || ""}
                onChange={(e) => handleSubSegmentChange(e.target.value)}
                disabled={disabled || !activeSegment || !currentConfig?.subSegments?.length}
              >
                <option value="">
                  {!activeSegment ? "Select Category first" : "Select Sub-Category"}
                </option>
                {currentConfig?.subSegments?.map((sub) => (
                  <option key={sub.key} value={sub.label}>
                    {sub.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pill mode (original)
  return (
    <div className={`segment-selector-container ${compact ? "compact" : ""} ${className}`}>
      <div className="segment-pills-row">
        {SEGMENT_CONFIGS.map((seg) => {
          const isActive = seg.key === activeSegment;
          const displayLabel = compact ? (seg.shortLabel || seg.label) : seg.label;
          return (
            <button
              key={seg.key}
              type="button"
              className={`segment-pill ${isActive ? "active" : ""}`}
              onClick={() => handleSegmentChange(seg.key)}
              disabled={disabled}
              title={seg.description}
            >
              <span className="segment-pill-label">{displayLabel}</span>
            </button>
          );
        })}
      </div>

      {showSubSegments && currentConfig?.subSegments?.length > 0 && (
        <div className="subsegment-pills-row">
          <span className="subsegment-label-prefix">Sub-Category:</span>
          {currentConfig.subSegments.map((sub) => {
            const isSubActive =
              activeSubSegment === sub.label ||
              activeSubSegment === sub.key ||
              (!activeSubSegment && sub === currentConfig.subSegments[0]);
            return (
              <button
                key={sub.key}
                type="button"
                className={`subsegment-pill ${isSubActive ? "active" : ""}`}
                onClick={() => handleSubSegmentChange(sub.label)}
                disabled={disabled}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
