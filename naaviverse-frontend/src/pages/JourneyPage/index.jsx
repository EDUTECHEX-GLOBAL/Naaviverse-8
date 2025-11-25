import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";

const JourneyPage = () => {
  const [loading, setLoading] = useState(false);
  const [journeyPageData, setJourneyPageData] = useState(null);

  useEffect(() => {
    const programId = localStorage.getItem("selectedPathId");
    if (!programId) return;

    fetchJourneyData(programId);
  }, []);

const fetchJourneyData = async (programId) => {
  setLoading(true);
  try {
    const response = await axios.get(`/api/userpaths/steps?programId=${programId}`);
    if (response.data.success) {
      setJourneyPageData(response.data.data);
    }
  } catch (error) {
    console.error("Error fetching steps:", error);
  } finally {
    setLoading(false);
  }
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

      {/* -------- Steps Grid -------- */}
      <div className="steps-grid">
        {loading ? (
          <Skeleton count={3} height={200} />
        ) : (
          journeyPageData?.steps?.map((step, index) => (
            <div className="step-card" key={index}>
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
