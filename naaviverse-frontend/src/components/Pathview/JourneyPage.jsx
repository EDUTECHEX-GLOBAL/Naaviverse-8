import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";
import { useNavigate } from "react-router-dom";

import logActivity from "../../utils/activityLogger";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const JourneyPage = () => {
  const [loading,         setLoading]         = useState(true);
  const [journeyPageData, setJourneyPageData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const universityId = localStorage.getItem("selectedUniversityId");
    if (!universityId) { setLoading(false); return; }
    fetchJourneyData(universityId);
  }, []);

  const fetchJourneyData = async (universityId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}//api/userpaths/steps?universityId=${universityId}`
      );
      if (response.data.success) {
        setJourneyPageData(response.data.data);

        // ✅ Log that user opened their journey / path steps view
        const pathName = response.data.data?.school || "Selected Path";
        const pathId   = localStorage.getItem("selectedPathId") || "";
        logActivity({
          type:     "path",
          title:    `Viewing journey: ${pathName}`,
          desc:     `User opened their journey steps for "${pathName}"`,
          pathId,
          pathName,
          status:   "in_progress",
        });
      }
    } catch (error) {
      console.error("Error fetching steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (step) => {
    if (!step) return;

    localStorage.setItem("selectedStepId",   step._id);
    localStorage.setItem("selectedStepData", JSON.stringify(step));

    // ✅ Log step viewed — with path context
    const pathName = journeyPageData?.school || localStorage.getItem("selectedPathName") || "";
    const pathId   = localStorage.getItem("selectedPathId") || "";

    logActivity({
      type:     "step",
      title:    `Viewed step: ${step.name}`,
      desc:     `User opened step "${step.name}"`,
      pathId,
      pathName,
      stepId:   step._id,
      stepName: step.name || "",
      status:   "viewed",
    });

    navigate("/dashboard/users/current-step");
  };

  return (
    <div className="journey-wrapper">

      {/* TOP BLOCK */}
      <div className="journey-header">
        <div className="jh-title">Your Selected Path</div>

        {loading ? (
          <Skeleton width={260} height={35} />
        ) : (
          <div className="jh-pathname">{journeyPageData?.school || "N/A"}</div>
        )}

        {!loading && journeyPageData?.description && (
          <p className="jh-description">{journeyPageData.description}</p>
        )}

        <div className="jh-back" onClick={() => navigate("/dashboard/users")}>
          ← Back to Explore
        </div>
      </div>

      {/* STEPS GRID */}
      <div className="journey-steps-section">
        {loading ? (
          <Skeleton count={3} height={200} />
        ) : journeyPageData?.steps?.length > 0 ? (
          <div className="steps-container">
            {journeyPageData.steps.map((step, i) => (
              <div
                className="step-card-clean"
                key={step._id || i}
                onClick={() => handleStepClick(step)}
              >
                <div className="sc-title">{step.name}</div>
                <div className="sc-desc">{step.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-steps-text">
            No steps available for this university.
          </div>
        )}
      </div>

    </div>
  );
};

export default JourneyPage;