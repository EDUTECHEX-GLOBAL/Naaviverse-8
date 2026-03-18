import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import "./journey.scss";

import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const parseDuration = (raw) => {
  try {
    const l = JSON.parse(raw);
    const parts = [];
    if (parseInt(l.years) > 0)  parts.push(`${l.years}y`);
    if (parseInt(l.months) > 0) parts.push(`${l.months}m`);
    if (parseInt(l.days) > 0)   parts.push(`${l.days}d`);
    return parts.length > 0 ? parts.join(" ") : null;
  } catch {
    return null;
  }
};

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconClock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
    <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
  </svg>
);
const IconTarget = () => (
  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

// ── Step Card ──────────────────────────────────────────────────────────────
const StepCard = ({ step, index, onClick }) => {
  const duration = parseDuration(step.macro_length);
  const isFree   = step.macro_access === "free";
  const stepNum  = step.step_order || index + 1;

  return (
    <div className="step-card" onClick={onClick}>
      <div className="sc-top">
        <div className="sc-number">{stepNum}</div>
      </div>

      <div className="sc-body">
        <div className="sc-title">{step.macro_name}</div>
        <div className="sc-desc">{step.macro_description}</div>
      </div>

      <div className="sc-footer">
       
        <span className="sc-cta">
          View Step <IconArrow />
        </span>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const JourneyPage = () => {
  const navigate = useNavigate();
  const { setCurrentStepData, setCurrentStepDataLength } = useCoinContextData();
  const { setsideNav } = useStore();

  const [loading,         setLoading]         = useState(true);
  const [journeyPageData, setJourneyPageData] = useState(null);

  useEffect(() => {
    const pathId = localStorage.getItem("selectedPathId");
    if (!pathId) { setLoading(false); return; }
    fetchJourneyData(pathId);
  }, []);

  const fetchJourneyData = async (pathId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`);
      if (response.data.status) {
        const data = response.data.data;
        if (data?.steps) {
          data.steps = data.steps.sort((a, b) => (a.step_order || 0) - (b.step_order || 0));
        }
        setJourneyPageData(data);
      } else {
        setJourneyPageData(null);
      }
    } catch (error) {
      console.error("❌ Error fetching steps:", error);
      setJourneyPageData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step, index) => {
    setsideNav("Current Step");
    setCurrentStepData(step);
    setCurrentStepDataLength(journeyPageData?.steps?.length);
    localStorage.setItem("selectedStepId", step._id);
    localStorage.setItem("selectedStepNumber", step.step_order || index + 1);
    navigate("/dashboard/users/current-step");
  };

  const renderNoPathSelected = () => (
    <div className="no-path-wrap">
      <div className="no-path-icon"><IconTarget /></div>
      <div className="no-path-title">No Path Selected</div>
      <div className="no-path-sub">Go to Paths and select your journey to get started.</div>
      <button className="no-path-btn" onClick={() => { setsideNav("Paths"); navigate("/dashboard/users/paths"); }}>
        Go To Paths <IconArrow />
      </button>
    </div>
  );

  const totalSteps = journeyPageData?.steps?.length || 0;

  return (
    <div className="journeypage">

      {/* ── PATH HEADER ── */}
      {journeyPageData && !loading && (
        <div className="journey-header">
          <div className="jh-left">
            <div className="jh-eyebrow">
              <span className="jh-icon"><IconMap /></span>
              Your Selected Path
            </div>
            <h1 className="jh-title">
              {journeyPageData?.nameOfPath || journeyPageData?.name || "N/A"}
            </h1>
            <p className="jh-desc">{journeyPageData?.description}</p>
          </div>
          <div className="jh-right">
            <div className="jh-stat">
              <span className="jh-stat-num">{totalSteps}</span>
              <span className="jh-stat-lbl">Total Steps</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION LABEL ── */}
      {journeyPageData && !loading && (
        <div className="steps-section-head">
          <span className="ssh-label">All Steps</span>
          <div className="ssh-line" />
          <span className="ssh-count">{totalSteps} step{totalSteps !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* ── STEPS GRID ── */}
      <div className="steps-grid">
        {loading ? (
          [1, 2, 3, 4].map(n => (
            <div className="step-card-skeleton" key={n}>
              <Skeleton height={180} borderRadius={14} />
            </div>
          ))
        ) : !localStorage.getItem("selectedPathId") ? (
          renderNoPathSelected()
        ) : journeyPageData?.steps?.length > 0 ? (
          journeyPageData.steps.map((step, index) => (
            <StepCard
              key={step._id}
              step={step}
              index={index}
              onClick={() => handleStepClick(step, index)}
            />
          ))
        ) : (
          <div className="no-steps-msg">No steps found for this path.</div>
        )}
      </div>

    </div>
  );
};

export default JourneyPage;