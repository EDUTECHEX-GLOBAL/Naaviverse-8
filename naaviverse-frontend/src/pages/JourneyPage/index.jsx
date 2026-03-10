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
    if (parseInt(l.years) > 0) parts.push(`${l.years}y`);
    if (parseInt(l.months) > 0) parts.push(`${l.months}m`);
    if (parseInt(l.days) > 0) parts.push(`${l.days}d`);
    return parts.length > 0 ? parts.join(" ") : null;
  } catch {
    return null;
  }
};

const JourneyPage = () => {
  const navigate = useNavigate();
  const { setCurrentStepData, setCurrentStepDataLength } = useCoinContextData();
  const { setsideNav } = useStore();

  const [loading, setLoading] = useState(true);
  const [journeyPageData, setJourneyPageData] = useState(null);

  // ✅ FIX: On every fresh browser refresh, clear stale selectedPathId
  // sessionStorage is wiped on refresh — so if no flag exists, it's a fresh load
  useEffect(() => {
    const sessionActive = sessionStorage.getItem("journeySessionActive");

    if (!sessionActive) {
      // Fresh refresh — clear stale path from localStorage
      localStorage.removeItem("selectedPathId");
      sessionStorage.setItem("journeySessionActive", "true");
      setLoading(false);
      return;
    }

    // User navigated here within the same session — load normally
    const pathId = localStorage.getItem("selectedPathId");
    if (!pathId) { setLoading(false); return; }
    fetchJourneyData(pathId);
  }, []);

  const fetchJourneyData = async (pathId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/userpaths/steps?pathId=${pathId}`
      );
      console.log("🔥 STEPS RESPONSE:", response.data);

      if (response.data.status) {
        const data = response.data.data;
        // Sort steps by step_order
        if (data?.steps) {
          data.steps = data.steps.sort(
            (a, b) => (a.step_order || 0) - (b.step_order || 0)
          );
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
    console.log("🔥 Selected Step ID:", step._id);
    setsideNav("Current Step");
    setCurrentStepData(step);
    setCurrentStepDataLength(journeyPageData?.steps?.length);
    localStorage.setItem("selectedStepId", step._id);
    navigate("/dashboard/users/current-step");
  };

  // ✅ No path selected — show prompt to go select one
  const renderNoPathSelected = () => (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "60vh",
      gap: "16px",
      textAlign: "center",
      padding: "0 20px",
    }}>
      <div style={{ fontSize: "3rem" }}>🎯</div>
      <div style={{
        fontSize: "1.4rem",
        fontWeight: "700",
        color: "#182542",
      }}>
        No Path Selected
      </div>
      <div style={{
        fontSize: "1rem",
        color: "#6c757d",
        maxWidth: "360px",
        lineHeight: "1.6",
      }}>
        Go to Paths and select your journey to get started.
      </div>
      <button
        onClick={() => {
          setsideNav("Paths");
          navigate("/dashboard/users/paths");
        }}
        style={{
          marginTop: "12px",
          padding: "12px 28px",
          background: "#182542",
          color: "#fff",
          border: "none",
          borderRadius: "30px",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
        }}
      >
        Go To Paths →
      </button>
    </div>
  );

  return (
    <div className="journeypage">

      {/* ✅ Only show header if a path is loaded */}
      {journeyPageData && (
        <div className="journey-top-area">
          <div className="title">Your Selected Path:</div>

          {loading ? (
            <Skeleton width={200} height={30} />
          ) : (
            <div className="path-title">
              {journeyPageData?.nameOfPath || journeyPageData?.name || "N/A"}
            </div>
          )}

          {loading ? (
            <Skeleton width={500} height={20} />
          ) : (
            <div className="path-desc">{journeyPageData?.description}</div>
          )}
        </div>
      )}

      {/* STEPS GRID */}
      <div className="steps-grid">
        {loading ? (
          [1, 2, 3].map(n => <Skeleton key={n} height={200} borderRadius={16} />)

        ) : !localStorage.getItem("selectedPathId") ? (
          // ✅ Fresh refresh or no path ever selected
          renderNoPathSelected()

        ) : journeyPageData?.steps?.length > 0 ? (
          journeyPageData.steps.map((step, index) => {
            const duration = parseDuration(step.macro_length);
            return (
              <div
                className="step-card"
                key={step._id}
                onClick={() => handleStepClick(step, index)}
              >
                {/* Step number bubble */}
                <div className="step-bubble">{step.step_order || index + 1}</div>

                {/* Title */}
                <div className="step-title">{step.macro_name}</div>

                {/* Description */}
                <div className="step-desc">{step.macro_description}</div>

                {/* Badges */}
                <div className="step-card-footer">
                  <span className={`step-badge ${step.macro_access === "free" ? "badge-free" : "badge-paid"}`}>
                    {step.macro_access === "free" ? "Free" : "Paid"}
                  </span>
                  {duration && (
                    <span className="step-duration">⏱ {duration}</span>
                  )}
                </div>
              </div>
            );
          })

        ) : (
          // Path was selected but no steps found
          <div className="no-steps-msg">No steps found for this path.</div>
        )}
      </div>

    </div>
  );
};

export default JourneyPage;