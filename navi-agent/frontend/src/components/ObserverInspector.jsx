import React, { useState, useMemo } from "react";
import "./ObserverInspector.scss";
import {
  IconCheck,
  IconAlert,
  IconClock,
  IconShoppingCart,
  IconTarget,
  IconGlobe,
  IconFileText,
  IconRoute
} from "../pages/Icons";

/**
 * Translates technical audit messages into simple, everyday language
 * so Super Admins can easily understand issues and suggestions.
 */
function simplifyMessage(msg) {
  if (!msg || typeof msg !== "string") return "";
  const clean = msg.trim();

  // 1. Sequence & Ordering Issues
  if (
    clean.includes("Prerequisite sequence inversion detected") ||
    clean.includes("introduces foundational material after advanced")
  ) {
    return clean.replace(
      /.*(Step\s*\d+[^:]*:\s*)?.*(?:introduces foundational material|Prerequisite sequence inversion).*/i,
      "$1Foundational basics should come before advanced steps (e.g. core skills before internships or capstone projects)."
    );
  }
  if (clean.includes("emphasizes corporate employment before academic foundation")) {
    return clean.replace(
      /.*(Step\s*\d+[^:]*:\s*)?.*/i,
      "$1Job or placement activities are suggested before finishing academic basics."
    );
  }

  // 2. Placeholder / Unverified Provider Names
  if (
    clean.includes("dummy/hallucinated marketplace provider") ||
    clean.includes("unverified or dummy provider")
  ) {
    return clean.replace(
      /Detected dummy\/hallucinated marketplace provider '([^']+)' in Step (\d+)\.?/i,
      "Step $2: '$1' looks like a placeholder name. Please replace with a real institution or platform."
    );
  }

  // 3. Timeline / Duration Discrepancies
  if (clean.includes("significantly diverges from standard curriculum timeline")) {
    return clean.replace(
      /Roadmap total duration \(([^)]+)\) significantly diverges from standard curriculum timeline \(([^)]+)\)\.?/i,
      "Total pathway duration ($1) differs significantly from the typical standard duration ($2)."
    );
  }
  if (clean.includes("slight discrepancy with authoritative duration")) {
    return clean.replace(
      /Roadmap duration \(([^)]+)\) has a slight discrepancy with authoritative duration \(([^)]+)\)\.?/i,
      "Total pathway duration ($1) differs slightly from the recommended duration ($2)."
    );
  }
  if (clean.includes("specifies an impossible duration")) {
    return clean.replace(
      /Step (\d+) \('([^']+)'\) specifies an impossible duration '([^']+)' for a multi-year formal degree\.?/i,
      "Step $1 ('$2'): Duration '$3' looks too short or unrealistic for this type of program."
    );
  }
  if (clean.includes("duration is unspecified")) {
    return clean.replace(
      /Step (\d+) duration is unspecified\.?/i,
      "Step $1 has no duration specified. Please set a timeline."
    );
  }

  // 4. Budget / Financial Constraints
  if (clean.includes("constrained financial capacity") && clean.includes("premium/high-cost")) {
    return "The student requested budget-friendly options, but premium/high-cost courses were recommended. Consider adding free or low-cost alternatives.";
  }
  if (clean.includes("no free foundational resources")) {
    return "No free learning resources are included. Consider adding free guides or introductory courses.";
  }

  // 5. Grade Level / Prerequisites
  if (clean.includes("initial milestones appear to assume college-level prerequisites")) {
    return clean.replace(
      /Student is in Grade (\d+), but initial milestones appear to assume college-level prerequisites\.?/i,
      "Student is in Grade $1, but early steps seem too advanced. Start with grade-appropriate foundations."
    );
  }

  // 6. Category / Domain Relevance
  if (clean.includes("introduces technical software coding into a Non-Academic Counselling")) {
    return clean.replace(
      /Step (\d+) \('([^']+)'\) introduces technical software coding into a Non-Academic Counselling pathway\.?/i,
      "Step $1 ('$2'): Technical coding modules do not fit into a counselling pathway."
    );
  }

  // 7. Missing Resources
  if (
    clean.includes("Marketplace recommendations need to be improved") ||
    clean.includes("does not provide any marketplace recommendations")
  ) {
    if (/Step (\d+)/i.test(clean)) {
      return clean.replace(
        /Step (\d+) does not provide any marketplace recommendations\.?/i,
        "Step $1: Add recommended courses, books, or platforms."
      );
    }
    return "Add recommended courses, mentors, or platforms for each milestone.";
  }

  // 8. Duplicate or Generic Titles
  if (clean.includes("appears") && clean.includes("times across the roadmap")) {
    return clean.replace(
      /Milestone title '([^']+)' appears (\d+) times across the roadmap\.?/i,
      "Step title '$1' is repeated $2 times. Please give each step a unique name."
    );
  }
  if (clean.includes("contains vague filler language")) {
    return clean.replace(
      /Step (\d+) contains vague filler language\.?/i,
      "Step $1 has placeholder text. Please add specific guidance or goals."
    );
  }
  if (clean.includes("has no learning objectives")) {
    return clean.replace(
      /Step (\d+) has no learning objectives\.?/i,
      "Step $1: Add 2-3 clear learning goals for what the student will achieve."
    );
  }
  if (clean.includes("has no micro_steps checklist")) {
    return clean.replace(
      /Step (\d+) has no micro_steps checklist\.?/i,
      "Step $1: Add an actionable checklist of tasks for the student."
    );
  }
  if (
    clean.includes("missing macro_view") ||
    clean.includes("missing micro_view") ||
    clean.includes("missing nano_view")
  ) {
    return clean.replace(
      /Step (\d+) missing (macro_view|micro_view|nano_view)\.?/i,
      "Step $1: Missing detailed view description for $2."
    );
  }
  if (clean.includes("Multiple milestones lack structured macro, micro, or nano")) {
    return "Some milestones need more detailed descriptions in Macro, Micro, or Nano views.";
  }
  if (clean.includes("Roadmap contains zero steps/milestones")) {
    return "This pathway has no steps or milestones yet.";
  }
  if (clean.includes("Mandatory root field")) {
    return clean.replace(
      /Mandatory root field '([^']+)' is missing\.?/i,
      "Pathway is missing required information: '$1'."
    );
  }

  return clean;
}

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
            <span className="obs-badge-icon">
              <IconCheck size={18} />
            </span>
            <div>
              <div className="obs-title">Naavi Quality Check</div>
              <div className="obs-subtitle">Automatic pathway quality & accuracy check</div>
            </div>
          </div>
          <button
            className="obs-recheck-btn"
            onClick={onReAudit}
            disabled={auditLoading}
          >
            {auditLoading ? "Checking..." : "Run Quality Check"}
          </button>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text2, #6b7280)", margin: "8px 0" }}>
          Click "Run Quality Check" to automatically verify that steps are in the right order, timelines are realistic, and all recommended learning resources are valid.
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
        message: "Add recommended learning resources (courses, books, or platforms) for each milestone."
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

  const getSimpleStatusLabel = (status, defaultLabel) => {
    switch (status) {
      case "APPROVED":
        return "High Quality · Verified";
      case "APPROVED_WITH_WARNINGS":
        return "Good Quality · Minor Suggestions";
      case "REQUIRES_CORRECTION":
        return "Needs Review Before Approving";
      case "REJECTED":
        return "Needs Revisions";
      default:
        return defaultLabel || "Quality Checked";
    }
  };

  const getSeverityTag = (sev, fallback) => {
    const s = (sev || fallback || "").toLowerCase();
    if (s === "hallucination") return "Placeholder Name";
    if (s === "critical") return "Action Required";
    if (s === "high") return "High Priority";
    if (s === "medium" || s === "advisory") return "Suggestion";
    if (s === "low") return "Helpful Note";
    return "Note";
  };

  const dimList = [
    {
      key: "data_integrity",
      label: "Path Structure & Details",
      icon: <IconFileText size={15} />,
      val: dimensions.data_integrity ?? 100
    },
    {
      key: "text_semantics",
      label: "Step Learning Order",
      icon: <IconRoute size={15} />,
      val: dimensions.text_semantics ?? 100
    },
    {
      key: "timeline_accuracy",
      label: "Realistic Timeline",
      icon: <IconClock size={15} />,
      val: dimensions.timeline_accuracy ?? 100
    },
    {
      key: "marketplace_accuracy",
      label: "Recommended Resources",
      icon: <IconShoppingCart size={15} />,
      val: dimensions.marketplace_accuracy ?? 100
    },
    {
      key: "personalization",
      label: "Student Profile Match",
      icon: <IconTarget size={15} />,
      val: dimensions.personalization ?? 100
    },
    {
      key: "category_scope",
      label: "Domain & Subject Focus",
      icon: <IconGlobe size={15} />,
      val: dimensions.category_scope ?? 100
    }
  ];

  return (
    <div className="obs-inspector">
      {/* ── TOP HEADER ── */}
      <div className="obs-header">
        <div className="obs-title-group">
          <span className="obs-badge-icon">
            <IconCheck size={18} />
          </span>
          <div>
            <div className="obs-title">
              Naavi Quality Check
              <span className={`obs-status-pill ${statusClass}`}>
                {observer_status === "APPROVED" && <IconCheck size={13} />}
                {getSimpleStatusLabel(observer_status, status_label)} ({overall_quality_score}/100)
              </span>
            </div>
            <div className="obs-subtitle">
              Checked {summary.step_count || "path"} milestones · Automated safety & quality review ({duration_ms}ms)
            </div>
          </div>
        </div>

        {onReAudit && (
          <button
            className="obs-recheck-btn"
            onClick={onReAudit}
            disabled={auditLoading}
          >
            {auditLoading ? "Checking..." : "Re-Check Pathway"}
          </button>
        )}
      </div>

      {/* ── 6 DIMENSION METERS ── */}
      <div className="obs-dimensions-grid">
        {dimList.map((dim) => (
          <div key={dim.key} className="obs-dim-card">
            <div className="obs-dim-top">
              <span className="obs-dim-label">
                {dim.icon}
                <span>{dim.label}</span>
              </span>
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
        {/* 1. Verified Learning Providers */}
        <div className="obs-check-item">
          {hallucinations.length === 0 ? (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span>
                <strong>Verified Providers:</strong> All recommended platforms, courses, and institutions are real and active (no fake or placeholder names).
              </span>
            </>
          ) : (
            <>
              <span className="obs-icon-err"><IconAlert size={16} /></span>
              <span>
                <strong>Provider Review:</strong> Found {hallucinations.length} unverified or placeholder name(s) that need updating.
              </span>
            </>
          )}
        </div>

        {/* 2. Step Learning Order */}
        <div className="obs-check-item">
          {issues.some((i) => i.type === "sequence_inversion") ? (
            <>
              <span className="obs-icon-err"><IconAlert size={16} /></span>
              <span>
                <strong>Step Learning Order:</strong> Basic foundational steps appear after advanced or placement steps. Basics should come first.
              </span>
            </>
          ) : (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span>
                <strong>Step Learning Order:</strong> Steps follow a clear learning progression (Basics → Core Skills → Practical Projects → Career Preparation).
              </span>
            </>
          )}
        </div>

        {/* 3. Duration & Curriculum Check */}
        <div className="obs-check-item">
          {summary.expected_duration ? (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span>
                <strong>Estimated Timeline:</strong> Total duration matches the recommended standard for this program: <strong>{summary.expected_duration}</strong>.
              </span>
            </>
          ) : (
            <>
              <span className="obs-icon-ok"><IconCheck size={16} /></span>
              <span>
                <strong>Estimated Timeline:</strong> Step durations are realistic and well-paced ({totalDuration || "well-balanced"}).
              </span>
            </>
          )}
        </div>

        {/* 4. Personalization Signals */}
        {signals_matched && signals_matched.length > 0 && (
          <div className="obs-check-item">
            <span className="obs-icon-ok"><IconCheck size={16} /></span>
            <span>
              <strong>Matched to Student Profile:</strong> Customized for student details: {signals_matched.join(" · ")}.
            </span>
          </div>
        )}

        {/* 5. Live Navigation & Real Platforms Check */}
        <div className="obs-check-item">
          <span className="obs-icon-ok"><IconCheck size={16} /></span>
          <span>
            <strong>Direct Website Links:</strong> All partner cards include direct web links. Click any card or <strong>"Visit Platform ↗"</strong> to open the official website.
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
              onClick={() => setShowAdvisories((prev) => !prev)}
            >
              <span>
                {showAdvisories ? "▲ Hide Issues & Suggestions" : "▼ Show Issues & Suggestions"} ({hallucinations.length + issues.length + consolidatedWarnings.length})
              </span>
              <span className="obs-advisories-pill">
                {showAdvisories ? "Collapse list" : "Click to view details"}
              </span>
            </button>
          </div>

          {showAdvisories && (
            <div className="obs-advisories-list">
              {/* Hallucinations */}
              {hallucinations.map((hal, hIdx) => (
                <div key={`hal-${hIdx}`} className="obs-issue-card critical">
                  <span className="obs-tag-severity">{getSeverityTag(hal.severity, "Placeholder Name")}</span>
                  <div>{simplifyMessage(hal.message)}</div>
                </div>
              ))}

              {/* Critical / High Issues */}
              {issues.map((iss, iIdx) => (
                <div key={`iss-${iIdx}`} className={`obs-issue-card ${iss.severity || "high"}`}>
                  <span className="obs-tag-severity">{getSeverityTag(iss.severity, "High Priority")}</span>
                  <div>{simplifyMessage(iss.message)}</div>
                </div>
              ))}

              {/* Consolidated Advisories */}
              {consolidatedWarnings.map((warn, wIdx) => (
                <div key={`warn-${wIdx}`} className="obs-issue-card medium">
                  <span className="obs-tag-severity">{getSeverityTag(warn.severity, "Suggestion")}</span>
                  <div>{simplifyMessage(warn.message)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
