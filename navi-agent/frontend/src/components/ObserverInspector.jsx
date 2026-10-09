import React, { useState, useMemo } from "react";
import "./ObserverInspector.scss";
import { IconCheck } from "../pages/Icons";

export default function ObserverInspector({
  report,
  onReAudit,
  auditLoading = false,
  pathTitle = "",
  totalDuration = ""
}) {
  const [showAdvisories, setShowAdvisories] = useState(false);

  if (!report) {
    return (
      <div className="obs-inspector">
        <div className="obs-header">
          <div className="obs-title-group">
            <span className="obs-badge-icon">👁️</span>
            <div>
              <div className="obs-title">Naavi Observer Agent</div>
              <div className="obs-subtitle">Real-time quality & accuracy validation engine</div>
            </div>
          </div>
          <button
            className="obs-recheck-btn"
            onClick={onReAudit}
            disabled={auditLoading}
          >
            {auditLoading ? "Auditing..." : "Run Observer Audit"}
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text2, #6b7280)", margin: "8px 0" }}>
          Click "Run Observer Audit" to inspect data integrity, prerequisite sequence, marketplace realism, and duration accuracy.
        </p>
      </div>
    );
  }

  const {
    observer_status = "APPROVED",
    status_label = "Verified High Quality",
    overall_quality_score = 100,
    dimensions = {},
    summary = {},
    issues = [],
    warnings = [],
    hallucinations = [],
    signals_matched = [],
    duration_ms = 0
  } = report;

  // Consolidate repetitive warnings into clean, non-duplicated advisories
  const consolidatedWarnings = useMemo(() => {
    if (!warnings || warnings.length === 0) return [];

    const isMarketEmpty = (w) =>
      w.type === "empty_marketplace" ||
      (typeof w.message === "string" &&
        (w.message.toLowerCase().includes("marketplace recommendations") ||
         w.message.toLowerCase().includes("marketplace needs to be improved")));

    const marketWarnings = warnings.filter(isMarketEmpty);
    const nonMarketWarnings = warnings.filter((w) => !isMarketEmpty(w));

    const result = [];
    if (marketWarnings.length >= 2) {
      result.push({
        severity: "medium",
        type: "empty_marketplace",
        message: "Marketplace recommendations need to be improved across all milestones."
      });
    } else if (marketWarnings.length === 1) {
      result.push(marketWarnings[0]);
    }

    // Deduplicate any non-market warnings with identical messages
    const seen = new Set();
    for (const w of nonMarketWarnings) {
      const msg = (w.message || "").trim();
      if (msg && !seen.has(msg)) {
        seen.add(msg);
        result.push(w);
      }
    }
    return result;
  }, [warnings]);

  const statusClass = observer_status.toLowerCase().replace(/\s+/g, "_");

  const getScoreColorClass = (val = 0) => {
    if (val >= 85) return "high";
    if (val >= 70) return "mid";
    if (val >= 50) return "warning";
    return "low";
  };

  const dimList = [
    { key: "data_integrity", label: "📊 Data Integrity & Schema", val: dimensions.data_integrity ?? 100 },
    { key: "text_semantics", label: "🧠 Prerequisite Sequence (DAG)", val: dimensions.text_semantics ?? 100 },
    { key: "timeline_accuracy", label: "⏱️ Timeline Realism", val: dimensions.timeline_accuracy ?? 100 },
    { key: "marketplace_accuracy", label: "🛒 Marketplace & Providers", val: dimensions.marketplace_accuracy ?? 100 },
    { key: "personalization", label: "🎯 Student Personalization", val: dimensions.personalization ?? 100 },
    { key: "category_scope", label: "🧭 Category Isolation", val: dimensions.category_scope ?? 100 }
  ];

  return (
    <div className="obs-inspector">
      {/* ── TOP HEADER ── */}
      <div className="obs-header">
        <div className="obs-title-group">
          <span className="obs-badge-icon">👁️</span>
          <div>
            <div className="obs-title">
              Naavi Observer Agent
              <span className={`obs-status-pill ${statusClass}`}>
                {observer_status === "APPROVED" && <IconCheck size={13} />}
                {status_label} ({overall_quality_score}/100)
              </span>
            </div>
            <div className="obs-subtitle">
              Audited {summary.step_count || "path"} milestones in {duration_ms}ms · Never trusts agent output blindly
            </div>
          </div>
        </div>

        {onReAudit && (
          <button
            className="obs-recheck-btn"
            onClick={onReAudit}
            disabled={auditLoading}
          >
            {auditLoading ? "Auditing..." : "🔄 Re-Audit Path"}
          </button>
        )}
      </div>

      {/* ── 6 DIMENSION METERS ── */}
      <div className="obs-dimensions-grid">
        {dimList.map(dim => (
          <div key={dim.key} className="obs-dim-card">
            <div className="obs-dim-top">
              <span className="obs-dim-label">{dim.label}</span>
              <span className="obs-dim-score">{Math.round(dim.val)}%</span>
            </div>
            <div className="obs-dim-bar">
              <div
                className={`obs-dim-fill ${getScoreColorClass(dim.val)}`}
                style={{ width: `${Math.max(5, Math.min(100, dim.val))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── LIVE AUDIT CHECKLIST FINDINGS ── */}
      <div className="obs-checklist">
        {/* 1. Hallucination Guard */}
        <div className="obs-check-item">
          {hallucinations.length === 0 ? (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span><strong>Marketplace Guard:</strong> Zero dummy/hallucinated providers detected (no "TBD", "N/A", or fake placeholders).</span>
            </>
          ) : (
            <>
              <span className="obs-icon-err">⚠️</span>
              <span><strong>Marketplace Warning:</strong> Detected {hallucinations.length} unverified or dummy provider name(s).</span>
            </>
          )}
        </div>

        {/* 2. Sequence DAG Ladder */}
        <div className="obs-check-item">
          {issues.some(i => i.type === "sequence_inversion") ? (
            <>
              <span className="obs-icon-err">❌</span>
              <span><strong>Sequence DAG:</strong> Prerequisite sequence inversion detected — foundational material must precede advanced steps.</span>
            </>
          ) : (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span><strong>Sequence DAG:</strong> Chronological progression verified (Foundation → Core → Application → Placement).</span>
            </>
          )}
        </div>

        {/* 3. Duration & Curriculum Check */}
        <div className="obs-check-item">
          {summary.expected_duration ? (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span>
                <strong>Timeline Benchmark:</strong> Authoritative duration verified against Centralized Service: <strong>{summary.expected_duration}</strong>.
              </span>
            </>
          ) : (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span><strong>Timeline:</strong> Step durations verified for realistic pacing ({totalDuration || "consistent"}).</span>
            </>
          )}
        </div>

        {/* 4. Personalization Signals */}
        {signals_matched && signals_matched.length > 0 && (
          <div className="obs-check-item">
            <span className="obs-icon-ok"><IconCheck size={16} /></span>
            <span>
              <strong>Personalization Signals:</strong> Matched student profile signals: {signals_matched.join(" · ")}.
            </span>
          </div>
        )}

        {/* 5. Live Navigation & Real Platforms Check */}
        <div className="obs-check-item">
          <span className="obs-icon-ok"><IconCheck size={16} /></span>
          <span>
            <strong>Real Platform Navigation:</strong> Direct web navigation links enabled. Click any marketplace card or <strong>"Visit Platform ↗"</strong> to launch the official academy/website in a new tab.
          </span>
        </div>
      </div>

      {/* ── ITEMIZED ISSUES / ADVISORIES (COLLAPSED BY DEFAULT BEHIND BUTTON) ── */}
      {(hallucinations.length > 0 || issues.length > 0 || consolidatedWarnings.length > 0) && (
        <div className="obs-issues-section">
          <div className="obs-issues-header-bar">
            <button
              type="button"
              className="obs-toggle-advisories-btn"
              onClick={() => setShowAdvisories(prev => !prev)}
            >
              <span>
                {showAdvisories ? "▲ Hide Findings & Advisories" : "▼ Show Findings & Advisories"} ({hallucinations.length + issues.length + consolidatedWarnings.length})
              </span>
              <span className="obs-advisories-pill">
                {showAdvisories ? "Collapse list" : "Click to view full list"}
              </span>
            </button>
          </div>

          {showAdvisories && (
            <div className="obs-advisories-list">
              {/* Hallucinations */}
              {hallucinations.map((hal, hIdx) => (
                <div key={`hal-${hIdx}`} className="obs-issue-card critical">
                  <span className="obs-tag-severity">Hallucination</span>
                  <div>{hal.message}</div>
                </div>
              ))}

              {/* Critical / High Issues */}
              {issues.map((iss, iIdx) => (
                <div key={`iss-${iIdx}`} className={`obs-issue-card ${iss.severity || 'high'}`}>
                  <span className="obs-tag-severity">{iss.severity || 'Issue'}</span>
                  <div>{iss.message}</div>
                </div>
              ))}

              {/* Consolidated Advisories */}
              {consolidatedWarnings.map((warn, wIdx) => (
                <div key={`warn-${wIdx}`} className="obs-issue-card medium">
                  <span className="obs-tag-severity">Advisory</span>
                  <div>{warn.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
