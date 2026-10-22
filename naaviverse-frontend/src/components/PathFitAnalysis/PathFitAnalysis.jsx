import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  SvgCheckCircle,
  SvgWarning,
  SvgSparkles,
  SvgPin,
  SvgDollar,
  SvgClock,
  SvgCheck,
  SvgRefresh,
} from "../../utils/SvgIcons";
import "./PathFitAnalysis.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Client-side fallback evaluator in case network is down or API is unreachable
 */
function evaluateFallbackFit(userProfile, path) {
  const profile = userProfile || {};
  const pathGrades = path?.grade?.length ? path.grade : path?.current_coordinates?.grade || [];
  const pathStreams = path?.stream?.length ? path.stream : path?.current_coordinates?.stream || [];
  const pathFin = path?.financialSituation?.length ? path.financialSituation : path?.current_coordinates?.financialSituation || [];

  const gradeMatch = profile.grade && pathGrades.length > 0 ? pathGrades.includes(String(profile.grade)) : true;
  const streamMatch = profile.stream && pathStreams.length > 0 ? pathStreams.includes(String(profile.stream)) : true;
  const finMatch = profile.financialSituation && pathFin.length > 0 ? pathFin.includes(String(profile.financialSituation)) : true;

  const knownCount = [profile.grade, profile.stream, profile.financialSituation, profile.personality].filter(Boolean).length;
  const completeness = Math.round((knownCount / 4) * 100);

  let score = 75;
  if (!gradeMatch) score -= 20;
  if (!streamMatch) score -= 30;

  let fitCategory = "Good Match";
  let badgeTone = "mint";

  if (completeness < 35) {
    fitCategory = "Needs Verification";
    badgeTone = "lavender";
  } else if (!streamMatch) {
    fitCategory = "Check Prerequisites";
    badgeTone = "yellow";
  } else if (score >= 80) {
    fitCategory = "Strong Fit";
    badgeTone = "mint";
  } else {
    fitCategory = "Good Match";
    badgeTone = "mint";
  }

  return {
    overallScore: score,
    fitCategory,
    badgeTone,
    eligibilityStatus: streamMatch ? "Eligible" : "Check Academic Prerequisites",
    dataCompleteness: completeness,
    summary: `Evaluated against your ${profile.stream || "academic"} background and Grade ${profile.grade || "curriculum"}.`,
    cardHighlight: `Matches your ${profile.stream || "general"} stream profile`,
    matchedFactors: [
      { title: "Grade & Stage", evidence: `Aligned with Grade ${profile.grade || "requirements"}` },
      { title: "Curriculum Pacing", evidence: `Structured milestone progression` },
    ],
    gapsToAddress: streamMatch
      ? []
      : [{ title: "Stream Prerequisite", evidence: `Path recommends ${pathStreams.join("/")} background`, recommendation: "Review foundational subjects" }],
    factors: [
      { key: "goal", title: "Goal & Domain Alignment", weight: 0.20, status: "matched", evidence: "Explores core milestones aligned with career track." },
      { key: "grade", title: "Grade & Educational Stage", weight: 0.20, status: gradeMatch ? "matched" : "partial", evidence: `Tailored for Grade ${profile.grade || "students"}.` },
      { key: "academic", title: "Stream & Academic Prerequisites", weight: 0.20, status: streamMatch ? "matched" : "gap", evidence: streamMatch ? `Matches ${profile.stream} requirements.` : `Requires ${pathStreams.join("/")}.` },
      { key: "skills", title: "Skills & Pathway Readiness", weight: 0.15, status: "matched", evidence: "Includes guided progressive steps." },
      { key: "financial", title: "Financial Alignment & Costs", weight: 0.15, status: finMatch ? "matched" : "partial", evidence: "Accessible pathway milestones." },
      { key: "location", title: "Location & Study Mode", weight: 0.10, status: "matched", evidence: "Flexible digital learning format." },
    ],
  };
}

const PathFitAnalysis = ({ path, userProfile, compact = false }) => {
  const [fitData, setFitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedFactor, setExpandedFactor] = useState(null);

  const pathId = path?._id;
  const userEmail = userProfile?.email;

  useEffect(() => {
    let isMounted = true;

    const fetchFitAnalysis = async () => {
      if (!pathId) return;
      setLoading(true);

      try {
        const url = `${BASE_URL}/api/paths/fit-analysis/${pathId}${userEmail ? `?email=${encodeURIComponent(userEmail)}` : ""}`;
        const res = await axios.get(url, { timeout: 6000 });

        if (isMounted && res.data?.status && res.data.data) {
          setFitData(res.data.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        // Fallback to client-side assessment
        console.warn("Fit analysis API fetch failed, falling back to local evaluation:", err.message);
      }

      if (isMounted) {
        const fallback = evaluateFallbackFit(userProfile, path);
        setFitData(fallback);
        setLoading(false);
      }
    };

    fetchFitAnalysis();

    return () => {
      isMounted = false;
    };
  }, [pathId, userEmail, userProfile?.stream, userProfile?.grade, userProfile?.personality]);

  const toggleFactor = (key) => {
    setExpandedFactor((prev) => (prev === key ? null : key));
  };

  if (loading) {
    return (
      <div className="path-fit-container path-fit-container--loading">
        <div className="pfa-skeleton-header">
          <div className="pfa-skeleton pfa-skeleton--title" />
          <div className="pfa-skeleton pfa-skeleton--badge" />
        </div>
        <div className="pfa-skeleton pfa-skeleton--text" />
        <div className="pfa-skeleton pfa-skeleton--text pfa-skeleton--short" />
      </div>
    );
  }

  if (!fitData) return null;

  const {
    overallScore,
    fitCategory,
    badgeTone = "mint",
    eligibilityStatus,
    dataCompleteness,
    summary,
    factors = [],
    matchedFactors = [],
    gapsToAddress = [],
  } = fitData;

  // Tone class
  const toneClass = `pfa-tone--${badgeTone}`;

  return (
    <div className={`path-fit-container ${compact ? "path-fit-container--compact" : ""}`}>
      {/* ── HEADER & OVERALL FIT CARD ── */}
      <div className="pfa-header">
        <div className="pfa-header__left">
          <div className="pfa-title-row">
            <span className="pfa-title-icon">
              <SvgSparkles size={16} color="#6D5BD0" />
            </span>
            <h4 className="pfa-title">Why This Path Fits You</h4>
          </div>
          <p className="pfa-summary">{summary}</p>
        </div>

        <div className="pfa-header__right">
          <div className={`pfa-score-badge ${toneClass}`}>
            {overallScore !== null && (
              <span className="pfa-score-num">{overallScore}%</span>
            )}
            <span className="pfa-score-label">{fitCategory}</span>
          </div>

          <div className="pfa-meta-badges">
            <span className="pfa-pill pfa-pill--completeness" title="Based on information in your profile">
              {dataCompleteness}% profile verified
            </span>
            {eligibilityStatus && (
              <span
                className={`pfa-pill ${
                  eligibilityStatus.includes("Check")
                    ? "pfa-pill--warning"
                    : "pfa-pill--success"
                }`}
              >
                {eligibilityStatus === "Check Academic Prerequisites" && fitCategory?.toLowerCase().includes("prerequisite")
                  ? "Prerequisites Required"
                  : eligibilityStatus}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── HIGHLIGHTS & GAPS SUMMARY TILES ── */}
      <div className="pfa-summary-grid">
        {/* Matched Strengths */}
        {matchedFactors.length > 0 && (
          <div className="pfa-tile pfa-tile--matched">
            <div className="pfa-tile__header">
              <span className="pfa-tile__icon pfa-tile__icon--green">
                <SvgCheckCircle size={15} color="#16834A" />
              </span>
              <span className="pfa-tile__title">Matched Highlights</span>
            </div>
            <ul className="pfa-tile__list">
              {matchedFactors.slice(0, 3).map((item, idx) => (
                <li key={idx} className="pfa-tile__item">
                  <div className="pfa-tile__item-header">
                    <strong className="pfa-tile__item-title">{item.title}</strong>
                  </div>
                  <p className="pfa-tile__item-desc">{item.evidence}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prerequisites & Verification Needed */}
        {gapsToAddress.length > 0 ? (
          <div className="pfa-tile pfa-tile--gaps">
            <div className="pfa-tile__header">
              <span className="pfa-tile__icon pfa-tile__icon--yellow">
                <SvgWarning size={15} color="#A66A12" />
              </span>
              <span className="pfa-tile__title">Prerequisites to Verify</span>
            </div>
            <ul className="pfa-tile__list">
              {gapsToAddress.slice(0, 3).map((item, idx) => (
                <li key={idx} className="pfa-tile__item pfa-tile__item--gap">
                  <div className="pfa-tile__item-header">
                    <strong className="pfa-tile__item-title">{item.title}</strong>
                  </div>
                  <p className="pfa-tile__item-desc">{item.evidence}</p>
                  {item.recommendation && (
                    <div className="pfa-tile__action-callout">
                      <span className="pfa-tile__action-icon">💡</span>
                      <span className="pfa-tile__action-text">{item.recommendation}</span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="pfa-tile pfa-tile--neutral">
            <div className="pfa-tile__header">
              <span className="pfa-tile__icon pfa-tile__icon--blue">
                <SvgCheck size={14} color="#3B6FE8" />
              </span>
              <span className="pfa-tile__title">Academic Readiness</span>
            </div>
            <p className="pfa-tile__text">
              No prerequisite barriers detected. You meet standard eligibility criteria for this pathway.
            </p>
          </div>
        )}
      </div>

      {/* ── 6-DIMENSION DETAILED BREAKDOWN ACCORDION ── */}
      {!compact && factors.length > 0 && (
        <div className="pfa-factors-section">
          <div className="pfa-factors-heading">
            <span>Evaluation Factor Breakdown</span>
            <small>Weighted multi-factor fit synthesis</small>
          </div>

          <div className="pfa-factors-list">
            {factors.map((factor) => {
              const isExpanded = expandedFactor === factor.key;
              const statusTone =
                factor.status === "matched"
                  ? "mint"
                  : factor.status === "gap"
                  ? "coral"
                  : factor.status === "partial"
                  ? "yellow"
                  : "lavender";

              return (
                <div
                  key={factor.key}
                  className={`pfa-factor-card ${isExpanded ? "pfa-factor-card--expanded" : ""}`}
                  onClick={() => toggleFactor(factor.key)}
                >
                  <div className="pfa-factor-card__bar">
                    <div className="pfa-factor-card__info">
                      <span className="pfa-factor-title">{factor.title}</span>
                      <span className="pfa-factor-weight">
                        {Math.round(factor.weight * 100)}% weight
                      </span>
                    </div>

                    <div className="pfa-factor-card__status">
                      <span className={`pfa-status-badge pfa-status-badge--${statusTone}`}>
                        {factor.status === "matched" && "✓ Matched"}
                        {factor.status === "partial" && "Partial Match"}
                        {factor.status === "gap" && "Prerequisite Check"}
                        {factor.status === "unknown" && "Not Specified"}
                      </span>
                      <span className="pfa-toggle-chevron">{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pfa-factor-card__details">
                      <p className="pfa-factor-evidence">
                        <strong>Evidence:</strong> {factor.evidence || "No specific requirement recorded."}
                      </p>
                      {factor.recommendation && (
                        <p className="pfa-factor-recom">
                          <strong>Guidance:</strong> {factor.recommendation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PROFILE COMPLETION NUDGE (If data is missing) ── */}
      {dataCompleteness < 75 && (
        <div className="pfa-nudge-box">
          <span className="pfa-nudge-icon">
            <SvgSparkles size={14} color="#6D5BD0" />
          </span>
          <span className="pfa-nudge-text">
            Add missing profile details (stream, grade, or career interests) to enhance match precision.
          </span>
        </div>
      )}
    </div>
  );
};

export default PathFitAnalysis;
