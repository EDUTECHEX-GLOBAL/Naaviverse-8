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

  const [loading, setLoading] = useState(false);
  const [journeyPageData, setJourneyPageData] = useState(null);

  useEffect(() => {
    const universityId = localStorage.getItem("selectedUniversityId");

    console.log("Loaded University ID:", universityId);

    if (!universityId) return;

    fetchJourneyData(universityId);
  }, []);

  const fetchJourneyData = async (universityId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/userpaths/steps?universityId=${universityId}`
      );

      if (response.data.success) {
        setJourneyPageData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching steps:", error);
    } finally {
      setLoading(false);
    }
  };

const handleStepClick = async (step, index) => {
  const stepId = step._id; 
  const universityId = localStorage.getItem("selectedUniversityId");

  console.log("🔥 Step ID:", stepId);

  setsideNav("Current Step");
  setCurrentStepData(step);
  setCurrentStepDataLength(journeyPageData?.steps?.length);

  localStorage.setItem("selectedStepId", stepId);

  try {
    // 🔥 FETCH AI-GENERATED MACRO / MICRO / NANO VIEWS
    const res = await axios.get(
      `/api/stepviews?stepId=${stepId}&universityId=${universityId}`
    );

    console.log("🔥 AI STEP VIEWS:", res.data.data);

    // SAVE in localStorage or Context so you can show in Users Page
    localStorage.setItem("currentStepViews", JSON.stringify(res.data.data));

  } catch (err) {
    console.error("Error generating StepViews:", err);
  }

  navigate("/dashboard/users");
};



  return (
    <div className="journeypage">
      <div className="journey-top-area">
        <div className="title">Your Selected Path:</div>

        {loading ? (
          <Skeleton width={200} height={30} />
        ) : (
          <div className="path-title">{journeyPageData?.school}</div>
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
              key={index}
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
