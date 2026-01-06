import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import { useNavigate } from "react-router-dom";
import "./journey.scss";

import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../../components/store/store.ts";

const JourneyPage = () => {
  const navigate = useNavigate();
  const { setCurrentStepData, setCurrentStepDataLength } = useCoinContextData();
  const { setsideNav } = useStore();

  const [loading, setLoading] = useState(true);
  const [journeyPageData, setJourneyPageData] = useState(null);

  // -------------------------------
  // LOAD SELECTED PATH ID
  // -------------------------------
  useEffect(() => {
    const pathId = localStorage.getItem("selectedPathId");

    console.log("🔥 Loaded Path ID:", pathId);

    if (!pathId) {
      setLoading(false);
      return;
    }

    fetchJourneyData(pathId);
  }, []);

  // -------------------------------
  // FETCH PATH + STEPS
  // -------------------------------
  const fetchJourneyData = async (pathId) => {
    try {
      const response = await axios.get(`/api/userpaths/steps?pathId=${pathId}`);

      console.log("🔥 STEPS RESPONSE:", response.data);

      if (response.data.status) {
        setJourneyPageData(response.data.data);
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

  // -------------------------------
  // STEP CLICK HANDLER (NO AI)
  // -------------------------------
  const handleStepClick = (step, index) => {
    const stepId = step._id;

    console.log("🔥 Selected Step ID:", stepId);

    setsideNav("Current Step");
    setCurrentStepData(step);
    setCurrentStepDataLength(journeyPageData?.steps?.length);

    localStorage.setItem("selectedStepId", stepId);

    navigate("/dashboard/users/current-step");
  };

  return (
    <div className="journeypage">
      <div className="journey-top-area">
        <div className="title">Your Selected Path:</div>

        {loading ? (
          <Skeleton width={200} height={30} />
        ) : (
          <div className="path-title">{journeyPageData?.name || "N/A"}</div>
        )}

        {loading ? (
          <Skeleton width={500} height={20} />
        ) : (
          <div className="path-desc">{journeyPageData?.description}</div>
        )}
      </div>

      <div className="steps-grid">
        {loading ? (
          <Skeleton count={3} height={200} />
        ) : (
          journeyPageData?.steps?.map((step, index) => (
            <div
              className="step-card"
              key={step._id}
              onClick={() => handleStepClick(step, index)}
              style={{ cursor: "pointer" }}
            >
              <div className="step-title">{step.name}</div>
              <div className="step-desc">{step.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
