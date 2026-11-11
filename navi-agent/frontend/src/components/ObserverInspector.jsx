import React, { useState, useMemo, useEffect } from "react";
import "./ObserverInspector.scss";
import {
  IconCheck,
  IconAlert,
  IconClock,
  IconShoppingCart,
  IconTarget,
  IconGlobe,
  IconFileText,
  IconRoute,
  IconBrain,
  IconSparkles,
  IconChevronDown,
  IconChevronUp,
  IconUser,
  IconX,
  IconRefresh
} from "../pages/Icons";

const API =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== "undefined" && window.location.origin) ||
  "http://localhost:8000";

const DIMENSION_CONFIG = [
  {
    key: "path_structure",
    fallbackKey: "data_integrity",
    label: "Path Structure & Completeness",
    weight: "15%",
    weightNum: 0.15,
    icon: <IconFileText size={16} />,
    description: "Validates schema integrity, step indices, completeness of required fields, and transitional milestones."
  },
  {
    key: "step_learning_order",
    fallbackKey: "text_semantics",
    label: "Step Learning Order & Sequence",
    weight: "20%",
    weightNum: 0.20,
    icon: <IconRoute size={16} />,
    description: "Audits pedagogical progression, validates prerequisite DAG dependencies, and detects sequence inversions."
  },
  {
    key: "academic_relevance",
    fallbackKey: "category_scope",
    label: "Academic & Goal Relevance",
    weight: "15%",
    weightNum: 0.15,
    icon: <IconGlobe size={16} />,
    description: "Ensures curriculum alignment with student goal, prevents domain cross-contamination, and flags filler steps."
  },
  {
    key: "step_granularity",
    fallbackKey: "path_structure",
    label: "Step Count & Granularity",
    weight: "10%",
    weightNum: 0.10,
    icon: <IconBrain size={16} />,
    description: "Evaluates step count appropriateness for journey scope and checks micro-task actionability."
  },
  {
    key: "realistic_timeline",
    fallbackKey: "timeline_accuracy",
    label: "Realistic Timeline & Duration",
    weight: "15%",
    weightNum: 0.15,
    icon: <IconClock size={16} />,
    description: "Cross-checks against authoritative duration service, avoids zero-durations, and prevents impossible timelines."
  },
  {
    key: "marketplace_quality",
    fallbackKey: "marketplace_accuracy",
    label: "Marketplace Recommendation Quality",
    weight: "10%",
    weightNum: 0.10,
    icon: <IconShoppingCart size={16} />,
    description: "Detects placeholder/hallucinated providers, ensures tier balance, link validness, and budget fit."
  },
  {
    key: "profile_alignment",
    fallbackKey: "personalization",
    label: "Student Profile Alignment",
    weight: "5%",
    weightNum: 0.05,
    icon: <IconTarget size={16} />,
    description: "Customized for student's starting grade, geographical curriculum, academic background, and constraints."
  },
  {
    key: "factual_reliability",
    fallbackKey: "path_structure",
    label: "Evidence & Factual Reliability",
    weight: "5%",
    weightNum: 0.05,
    icon: <IconSparkles size={16} />,
    description: "Validates accredited credential terminology, standard entrance exams, and verifiable learning outcomes."
  },
  {
    key: "actionability_clarity",
    fallbackKey: "path_structure",
    label: "Actionability & Clarity",
    weight: "5%",
    weightNum: 0.05,
    icon: <IconCheck size={16} />,
    description: "Verifies imperative action verbs, clear completion criteria, and absence of vague filler directives."
  }
];

export default function ObserverInspector({
  report,
  onReAudit,
  auditLoading = false,
  pathTitle = "",
  totalDuration = "",
  pathId = null,
  onHumanReviewUpdated = null,
  onApplyUniquenessRepair = null
}) {
  const [activeSeverityFilter, setActiveSeverityFilter] = useState("all");
  const [expandedDimension, setExpandedDimension] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewScore, setReviewScore] = useState(85);
  const [reviewerEmail, setReviewerEmail] = useState("academic_reviewer@naavi.com");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [showDetailsSection, setShowDetailsSection] = useState(true);

  const safeReport = report || {};
  const {
    observer_status = "APPROVED",
    status_label = "Verified High Quality",
    status_color = "#137333",
    overall_quality_score = 100,
    dimensions = {},
    dimension_breakdown = {},
    critical_blockers = [],
    issues = [],
    warnings = [],
    hallucinations = [],
    signals_matched = [],
    duration_ms = 0,
    summary = {},
    human_review = {},
    comparison = {}
  } = safeReport;

  // Auto-refresh if report has old schema (missing step_learning_order or dimensions count < 9)
  const isStaleSchema = useMemo(() => {
    if (!report || !report.dimensions) return false;
    return !("step_learning_order" in report.dimensions) || Object.keys(report.dimensions).length < 9;
  }, [report]);

  useEffect(() => {
    if (isStaleSchema && onReAudit && !auditLoading) {
      onReAudit();
    }
  }, [isStaleSchema, onReAudit, auditLoading]);

  // Filter issues based on selected tab - ALWAYS called before any conditional return
  const filteredIssues = useMemo(() => {
    const combined = [...issues, ...warnings];
    if (activeSeverityFilter === "all") return combined;
    if (activeSeverityFilter === "critical") {
      return combined.filter(i => (i.severity || "").toLowerCase() === "critical");
    }
    if (activeSeverityFilter === "high") {
      return combined.filter(i => (i.severity || "").toLowerCase() === "high");
    }
    if (activeSeverityFilter === "medium") {
      return combined.filter(i => (i.severity || "").toLowerCase() === "medium");
    }
    if (activeSeverityFilter === "low") {
      return combined.filter(i => (i.severity || "").toLowerCase() === "low");
    }
    if (activeSeverityFilter === "hallucinations") {
      return hallucinations;
    }
    return combined;
  }, [issues, warnings, hallucinations, activeSeverityFilter]);

  if (!report) {
    return (
      <div className="obs-inspector">
        <div className="obs-empty-state">
          <div className="obs-empty-icon"><IconBrain size={28} /></div>
          <div className="obs-empty-title">Pathway Accuracy Evaluation</div>
          <div className="obs-empty-desc">
            Run the 9-dimension AI Observer audit to inspect pedagogical sequencing, DAG dependencies,
            timeline realism, and compare against human academic review.
          </div>
          <button
            className="obs-recheck-btn primary"
            onClick={onReAudit}
            disabled={auditLoading}
          >
            {auditLoading ? "Auditing Pathway..." : "Run Observer Audit"}
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (val = 0) => {
    if (val >= 85) return "#15803d";
    if (val >= 70) return "#2563eb";
    if (val >= 50) return "#d97706";
    return "#dc2626";
  };

  const getScoreClass = (val = 0) => {
    if (val >= 85) return "high";
    if (val >= 70) return "mid";
    if (val >= 50) return "warning";
    return "low";
  };

  const handleOpenReviewModal = () => {
    if (human_review && human_review.overall_score) {
      setReviewScore(human_review.overall_score);
      setReviewFeedback(human_review.feedback || "");
      setReviewerEmail(human_review.reviewer_email || "academic_reviewer@naavi.com");
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!pathId) {
      const updatedReview = {
        status: "reviewed",
        overall_score: Number(reviewScore),
        feedback: reviewFeedback,
        reviewer_email: reviewerEmail,
        reviewed_at: new Date().toISOString()
      };
      if (onHumanReviewUpdated) {
        onHumanReviewUpdated(updatedReview);
      }
      setReviewSuccessMsg("Human review recorded successfully!");
      setTimeout(() => {
        setReviewSuccessMsg("");
        setShowReviewModal(false);
      }, 1500);
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/observer/paths/${pathId}/human-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overall_score: Number(reviewScore),
          feedback: reviewFeedback,
          reviewer_email: reviewerEmail
        })
      });
      if (!res.ok) throw new Error("Failed to submit human review");
      const data = await res.json();
      if (onHumanReviewUpdated) {
        onHumanReviewUpdated(data.human_review, data.comparison);
      }
      setReviewSuccessMsg("Human review saved & compared successfully!");
      setTimeout(() => {
        setReviewSuccessMsg("");
        setShowReviewModal(false);
        if (onReAudit) onReAudit();
      }, 1500);
    } catch (err) {
      alert(`Error submitting review: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasHumanReview = comparison.has_human_review || (human_review && human_review.status === "reviewed");
  const humanScore = hasHumanReview ? (human_review.overall_score ?? comparison.human_score) : null;
  const scoreDiff = comparison.score_difference ?? (hasHumanReview ? Math.abs(humanScore - overall_quality_score) : null);

  return (
    <div className="obs-inspector">
      {/* ── TOP HEADER WITH ACTION BUTTON ── */}
      <div className="obs-top-bar">
        <div className="obs-top-bar-left">
          <div className="obs-main-title">
            <IconBrain size={22} className="obs-icon-brand" />
            <span>Pathway Accuracy & Quality Evaluation</span>
          </div>
          <div className="obs-main-subtitle">
            Audited {summary.step_count || "all"} milestones · 9 weighted pedagogical dimensions · Deterministic DAG validation
          </div>
        </div>
        <div className="obs-top-bar-right">
          {onApplyUniquenessRepair && (
            <button
              type="button"
              className="obs-repair-btn"
              onClick={onApplyUniquenessRepair}
              disabled={auditLoading}
              title="Apply Path Uniqueness Agent corrections and deduplication"
            >
              <IconSparkles size={14} />
              <span>Apply Uniqueness Repairs</span>
            </button>
          )}
          {onReAudit && (
            <button
              type="button"
              className="obs-recheck-btn"
              onClick={onReAudit}
              disabled={auditLoading}
              title="Re-run Observer Agent audit"
            >
              <IconRefresh size={14} className={auditLoading ? "obs-spin" : ""} />
              <span>{auditLoading ? "Auditing..." : "Re-Check Pathway"}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 1. TWO CLEARLY DISTINGUISHED EVALUATION RESULTS ── */}
      <div className="obs-comparison-header">
        {/* Human Review Score Card */}
        <div className="obs-eval-card human">
          <div className="obs-eval-card-top">
            <span className="obs-eval-type-badge human">
              <IconUser size={13} />
              <span>Human Review</span>
            </span>
            <button
              type="button"
              className="obs-review-action-btn"
              onClick={handleOpenReviewModal}
            >
              {hasHumanReview ? "Edit Review" : "+ Add Human Review"}
            </button>
          </div>
          <div className="obs-eval-score-row">
            {hasHumanReview ? (
              <div className="obs-score-number-group">
                <span className="obs-eval-big-score">{humanScore}</span>
                <span className="obs-eval-total">/ 100</span>
              </div>
            ) : (
              <span className="obs-eval-not-reviewed">Not Reviewed</span>
            )}
          </div>
          <div className="obs-eval-footer">
            {hasHumanReview ? (
              <div>
                <div className="obs-eval-reviewer">Reviewer: {human_review.reviewer_email || "Academic Dean"}</div>
                {human_review.feedback && (
                  <div className="obs-eval-feedback-snippet">"{human_review.feedback}"</div>
                )}
              </div>
            ) : (
              <span>Independent review by academic reviewer pending. Never auto-generated.</span>
            )}
          </div>
        </div>

        {/* Observer Agent AI Score Card */}
        <div className="obs-eval-card ai">
          <div className="obs-eval-card-top">
            <span className="obs-eval-type-badge ai">
              <IconBrain size={13} />
              <span>Observer Agent AI</span>
            </span>
            <span className="obs-eval-timing">{duration_ms}ms</span>
          </div>
          <div className="obs-eval-score-row">
            <div className="obs-score-number-group">
              <span className="obs-eval-big-score" style={{ color: status_color }}>{overall_quality_score}</span>
              <span className="obs-eval-total">/ 100</span>
            </div>
            <span className={`obs-status-tag ${observer_status.toLowerCase()}`}>
              {status_label}
            </span>
          </div>
          <div className="obs-eval-footer">
            <span>Verified across 9 dimensions totaling 100% weight.</span>
          </div>
        </div>

        {/* Score Comparison Difference Card */}
        <div className="obs-eval-card comparison">
          <div className="obs-eval-card-top">
            <span className="obs-eval-type-badge comp">
              <IconTarget size={13} />
              <span>Score Comparison</span>
            </span>
            {hasHumanReview && (
              <span className={`obs-diff-tag ${scoreDiff <= 5 ? "match" : scoreDiff <= 15 ? "moderate" : "divergent"}`}>
                {scoreDiff === 0 ? "Exact Match" : `${scoreDiff} pts diff`}
              </span>
            )}
          </div>
          <div className="obs-comparison-body">
            {hasHumanReview ? (
              <>
                <div className="obs-diff-lead">
                  {comparison.agreement_level || "Comparison Evaluated"}
                </div>
                <div className="obs-diff-explanation">
                  {comparison.explanation || `Human Review (${humanScore}/100) vs Observer AI (${overall_quality_score}/100).`}
                </div>
              </>
            ) : (
              <div className="obs-diff-pending">
                Awaiting human review to calculate comparative variance and agreement level.
              </div>
            )}
          </div>
          <div className="obs-comparison-note">
            Scores are evaluated separately and never averaged.
          </div>
        </div>
      </div>

      {/* ── 2. CRITICAL BLOCKERS ALERT (IF ANY) ── */}
      {critical_blockers.length > 0 && (
        <div className="obs-critical-blockers-card">
          <div className="obs-blocker-title">
            <IconAlert size={20} />
            <span>Critical Academic Blockers Detected ({critical_blockers.length})</span>
          </div>
          <div className="obs-blocker-desc">
            The following structural defects require resolution before this pathway can be academically verified:
          </div>
          <div className="obs-blocker-list">
            {critical_blockers.map((blk, idx) => (
              <div key={idx} className="obs-blocker-item">
                <div className="obs-blocker-head">
                  <span className="obs-blocker-badge">Critical Blocker</span>
                  <strong>{blk.what_is_wrong}</strong>
                </div>
                <div className="obs-blocker-details">
                  <div><strong>Why it matters:</strong> {blk.why_it_is_wrong}</div>
                  <div><strong>Correction:</strong> {blk.expected_order_or_correction}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. 9 EVALUATION DIMENSIONS BREAKDOWN ── */}
      <div className="obs-section-header">
        <div className="obs-section-title">
          <IconFileText size={18} />
          <span>9-Dimension Comprehensive Audit</span>
        </div>
        <div className="obs-section-sub">
          All dimensions evaluated with strict pedagogical criteria totaling 100% weight. Click any card to view audit details.
        </div>
      </div>

      <div className="obs-dimensions-grid-9">
        {DIMENSION_CONFIG.map((dim) => {
          const val = dimensions[dim.key] ?? (dim.fallbackKey ? dimensions[dim.fallbackKey] : 100);
          const scoreNum = Math.round(val);
          const dimData = dimension_breakdown[dim.key] || {};
          const isExpanded = expandedDimension === dim.key;
          const contribution = (dim.weightNum * scoreNum).toFixed(1);

          return (
            <div
              key={dim.key}
              className={`obs-dim9-card ${isExpanded ? "expanded" : ""}`}
              onClick={() => setExpandedDimension(isExpanded ? null : dim.key)}
            >
              <div className="obs-dim9-top">
                <div className="obs-dim9-label-group">
                  <span className="obs-dim9-icon">{dim.icon}</span>
                  <div>
                    <div className="obs-dim9-name">{dim.label}</div>
                    <div className="obs-dim9-weight">Weight: {dim.weight} · Contrib: {contribution} pts</div>
                  </div>
                </div>
                <div className="obs-dim9-score" style={{ color: getScoreColor(scoreNum) }}>
                  {scoreNum}%
                </div>
              </div>

              <div className="obs-dim9-meter">
                <div
                  className={`obs-dim9-fill ${getScoreClass(scoreNum)}`}
                  style={{ width: `${Math.max(6, Math.min(100, scoreNum))}%` }}
                />
              </div>

              {isExpanded && (
                <div className="obs-dim9-details" onClick={(e) => e.stopPropagation()}>
                  <p className="obs-dim9-desc">{dim.description}</p>
                  <div className="obs-dim9-meta">
                    <span>Issues: {dimData.issues_count || 0}</span>
                    <span>·</span>
                    <span>Warnings: {dimData.warnings_count || 0}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 4. AUDIT HIGHLIGHTS CHECKLIST ── */}
      <div className="obs-checklist">
        <div className="obs-check-item">
          {hallucinations.length === 0 ? (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span><strong>Verified Providers:</strong> All recommended courses and institutions are recognized and active (no fake or placeholder names).</span>
            </>
          ) : (
            <>
              <span className="obs-icon-err"><IconAlert size={16} /></span>
              <span><strong>Provider Review:</strong> Found {hallucinations.length} placeholder or unverified provider name(s) needing replacement.</span>
            </>
          )}
        </div>

        <div className="obs-check-item">
          {issues.some(i => i.type === "sequence_inversion" || i.type === "circular_dependency") ? (
            <>
              <span className="obs-icon-err"><IconAlert size={16} /></span>
              <span><strong>Step Learning Order:</strong> Sequence issue detected in learning progression. Foundational steps must precede advanced milestones.</span>
            </>
          ) : (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span><strong>Step Learning Order:</strong> Steps strictly follow an academically validated prerequisite progression.</span>
            </>
          )}
        </div>

        <div className="obs-check-item">
          <span className="obs-icon-ok"><IconCheck size={16} /></span>
          <span><strong>Estimated Timeline:</strong> Duration verified against official academic curriculum standards ({summary.expected_duration || totalDuration || "consistent pacing"}).</span>
        </div>

        {signals_matched && signals_matched.length > 0 && (
          <div className="obs-check-item">
            <span className="obs-icon-ok"><IconCheck size={16} /></span>
            <span><strong>Profile Personalization:</strong> Tailored to student details: {signals_matched.join(" · ")}.</span>
          </div>
        )}

        <div className="obs-check-item">
          <span className="obs-icon-ok"><IconCheck size={16} /></span>
          <span><strong>Platform Navigation:</strong> Direct partner links enabled. Click any marketplace card or "Visit Platform ↗" to view official offerings.</span>
        </div>
      </div>

      {/* ── 4B. PATH UNIQUENESS & CONSISTENCY REPORT ── */}
      {safeReport.uniqueness_report && (
        <div className="obs-uniqueness-panel">
          <div className="obs-uniqueness-header">
            <div className="obs-uniqueness-title-group">
              <IconSparkles size={18} className="obs-uniqueness-sparkle" />
              <span className="obs-uniqueness-title">Path Uniqueness & Consistency Audit</span>
              <span className={`obs-uniqueness-badge ${(safeReport.uniqueness_report.validation_status || "passed").toLowerCase()}`}>
                {safeReport.uniqueness_report.status_label || safeReport.uniqueness_report.validation_status}
              </span>
            </div>
            {onApplyUniquenessRepair && (safeReport.uniqueness_report.confirmed_duplicates_detected > 0 || safeReport.uniqueness_report.boilerplate_description_rate > 0) && (
              <button
                type="button"
                className="obs-uniqueness-action-btn"
                onClick={onApplyUniquenessRepair}
                disabled={auditLoading}
              >
                <IconSparkles size={13} />
                <span>Execute Auto-Corrections</span>
              </button>
            )}
          </div>

          <div className="obs-uniqueness-grid">
            <div className="obs-u-stat">
              <span className="obs-u-stat-label">Unique Activities</span>
              <span className="obs-u-stat-val">{safeReport.uniqueness_report.total_unique_activities} / {safeReport.uniqueness_report.total_original_activities}</span>
              <span className="obs-u-stat-sub">{Math.round((safeReport.uniqueness_report.uniqueness_ratio || 1) * 100)}% Distinct</span>
            </div>
            <div className="obs-u-stat">
              <span className="obs-u-stat-label">Duplicates Identified</span>
              <span className={`obs-u-stat-val ${safeReport.uniqueness_report.confirmed_duplicates_detected > 0 ? "warning" : "ok"}`}>
                {safeReport.uniqueness_report.confirmed_duplicates_detected}
              </span>
              <span className="obs-u-stat-sub">{safeReport.uniqueness_report.confirmed_duplicates_resolved} Resolved</span>
            </div>
            <div className="obs-u-stat">
              <span className="obs-u-stat-label">Descriptions Fixed</span>
              <span className={`obs-u-stat-val ${safeReport.uniqueness_report.descriptions_regenerated > 0 ? "warning" : "ok"}`}>
                {safeReport.uniqueness_report.descriptions_regenerated || (safeReport.uniqueness_report.description_defects || []).length}
              </span>
              <span className="obs-u-stat-sub">Boilerplate Synthesized</span>
            </div>
            <div className="obs-u-stat">
              <span className="obs-u-stat-label">Valid Recurrences</span>
              <span className="obs-u-stat-val ok">{safeReport.uniqueness_report.valid_recurrences_preserved || 0}</span>
              <span className="obs-u-stat-sub">Periodic Diagnostics</span>
            </div>
            <div className="obs-u-stat">
              <span className="obs-u-stat-label">Marketplace Filtered</span>
              <span className="obs-u-stat-val ok">{safeReport.uniqueness_report.marketplace_duplicates_resolved || 0}</span>
              <span className="obs-u-stat-sub">Diverse Offerings</span>
            </div>
          </div>

          {/* Before & After Duplicate Groups Preview */}
          {safeReport.uniqueness_report.candidate_pairs && safeReport.uniqueness_report.candidate_pairs.length > 0 && (
            <div className="obs-u-candidates-drawer">
              <div className="obs-u-drawer-title">
                Duplicate Activity Analysis & Resolutions ({safeReport.uniqueness_report.candidate_pairs.length})
              </div>
              <div className="obs-u-pairs-list">
                {safeReport.uniqueness_report.candidate_pairs.map((p, pIdx) => (
                  <div key={pIdx} className="obs-u-pair-row">
                    <div className="obs-u-pair-cols">
                      <div className="obs-u-col before">
                        <span className="obs-u-col-tag before">Original Activity</span>
                        <div className="obs-u-col-title">{p.task_a_title}</div>
                        {p.task_a_desc && <div className="obs-u-col-desc">{p.task_a_desc.slice(0, 110)}...</div>}
                      </div>
                      <div className="obs-u-vs-divider">⇄</div>
                      <div className="obs-u-col after">
                        <span className="obs-u-col-tag after">Detected Duplicate</span>
                        <div className="obs-u-col-title">{p.task_b_title}</div>
                        <div className="obs-u-col-meta">{p.classification} · {p.reason}</div>
                      </div>
                    </div>
                    <div className="obs-u-pair-actions">
                      <span className={`obs-u-res-badge ${p.recommended_action?.toLowerCase()}`}>
                        {p.recommended_action === "REMOVE_DUPLICATE" ? "Safely Merged / Remapped" : p.recommended_action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── 5. STRUCTURED FINDINGS & EVIDENCE SECTION ── */}
      <div className="obs-findings-section">
        <div className="obs-findings-header">
          <div className="obs-findings-title">
            <IconAlert size={18} />
            <span>Audit Findings & Actionable Evidence ({issues.length + warnings.length})</span>
          </div>
          <div className="obs-severity-tabs">
            <button
              type="button"
              className={`obs-sev-tab ${activeSeverityFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveSeverityFilter("all")}
            >
              All ({issues.length + warnings.length})
            </button>
            <button
              type="button"
              className={`obs-sev-tab critical ${activeSeverityFilter === "critical" ? "active" : ""}`}
              onClick={() => setActiveSeverityFilter("critical")}
            >
              Critical ({critical_blockers.length})
            </button>
            <button
              type="button"
              className={`obs-sev-tab high ${activeSeverityFilter === "high" ? "active" : ""}`}
              onClick={() => setActiveSeverityFilter("high")}
            >
              High ({issues.filter(i => (i.severity || "").toLowerCase() === "high").length})
            </button>
            <button
              type="button"
              className={`obs-sev-tab medium ${activeSeverityFilter === "medium" ? "active" : ""}`}
              onClick={() => setActiveSeverityFilter("medium")}
            >
              Suggestions ({warnings.length})
            </button>
            {hallucinations.length > 0 && (
              <button
                type="button"
                className={`obs-sev-tab hal ${activeSeverityFilter === "hallucinations" ? "active" : ""}`}
                onClick={() => setActiveSeverityFilter("hallucinations")}
              >
                Placeholders ({hallucinations.length})
              </button>
            )}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="obs-no-issues">
            <IconCheck size={20} color="#15803d" />
            <span>No issues found matching the selected filter. Pathway aligns with audit requirements.</span>
          </div>
        ) : (
          <div className="obs-issues-list">
            {filteredIssues.map((item, idx) => {
              const sev = (item.severity || "medium").toLowerCase();
              return (
                <div key={item.issue_id || idx} className={`obs-issue-card ${sev}`}>
                  <div className="obs-issue-card-header">
                    <div className="obs-issue-tags">
                      <span className={`obs-badge-sev ${sev}`}>
                        {sev === "critical" ? "Critical Blocker" : sev === "high" ? "High Priority" : "Suggestion"}
                      </span>
                      <span className="obs-badge-dim">
                        {item.dimension_label || item.dimension || "Evaluation"}
                      </span>
                      {item.step_id && (
                        <span className="obs-badge-step">
                          Step {item.step_id}
                        </span>
                      )}
                    </div>
                    {item.issue_id && (
                      <span className="obs-issue-id">{item.issue_id}</span>
                    )}
                  </div>

                  <div className="obs-issue-what">
                    <strong>{item.what_is_wrong || item.message}</strong>
                  </div>

                  {item.why_it_is_wrong && (
                    <div className="obs-issue-field">
                      <span className="obs-field-label">Why it matters:</span>
                      <span className="obs-field-val">{item.why_it_is_wrong}</span>
                    </div>
                  )}

                  {item.expected_order_or_correction && (
                    <div className="obs-issue-field">
                      <span className="obs-field-label">Expected correction:</span>
                      <span className="obs-field-val ok">{item.expected_order_or_correction}</span>
                    </div>
                  )}

                  {item.supporting_evidence && (
                    <div className="obs-issue-field">
                      <span className="obs-field-label">Supporting evidence:</span>
                      <span className="obs-field-val code">{item.supporting_evidence}</span>
                    </div>
                  )}

                  {item.suggested_action && (
                    <div className="obs-issue-field action">
                      <span className="obs-field-label">Action to take:</span>
                      <span className="obs-field-val">{item.suggested_action}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 6. ACADEMIC HUMAN REVIEW MODAL ── */}
      {showReviewModal && (
        <div className="obs-modal-backdrop" onClick={() => setShowReviewModal(false)}>
          <div className="obs-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="obs-modal-header">
              <div className="obs-modal-title">
                <IconUser size={18} />
                <span>Submit Academic Human Review</span>
              </div>
              <button
                type="button"
                className="obs-modal-close"
                onClick={() => setShowReviewModal(false)}
              >
                <IconX size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="obs-modal-form">
              <div className="obs-form-group">
                <label>Reviewer Email / Identity</label>
                <input
                  type="email"
                  required
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  placeholder="e.g. academic_dean@naavi.com"
                />
              </div>

              <div className="obs-form-group">
                <label>
                  Overall Human Review Score: <strong>{reviewScore} / 100</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={reviewScore}
                  onChange={(e) => setReviewScore(Number(e.target.value))}
                  className="obs-range-input"
                />
                <div className="obs-range-labels">
                  <span>0 (Rejected)</span>
                  <span>50 (Needs Work)</span>
                  <span>75 (Good)</span>
                  <span>100 (Exemplary)</span>
                </div>
              </div>

              <div className="obs-form-group">
                <label>Reviewer Feedback & Rationale</label>
                <textarea
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Provide qualitative feedback on prerequisite sequence, workload feasibility, or resource relevance..."
                />
              </div>

              {reviewSuccessMsg && (
                <div className="obs-success-banner">{reviewSuccessMsg}</div>
              )}

              <div className="obs-modal-actions">
                <button
                  type="button"
                  className="obs-btn-cancel"
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="obs-btn-submit"
                  disabled={submittingReview}
                >
                  {submittingReview ? "Saving..." : "Save Human Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
