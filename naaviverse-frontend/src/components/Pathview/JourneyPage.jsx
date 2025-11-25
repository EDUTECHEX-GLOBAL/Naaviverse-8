import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";

const JourneyPage = () => {
  const [loading, setLoading] = useState(false);
  const [journeyData, setJourneyData] = useState(null);

  useEffect(() => {
    const uniId = localStorage.getItem("selectedUniversityId");

    if (!uniId) {
      console.warn("No university selected");
      return;
    }

    fetchJourney(uniId);
  }, []);

  const fetchJourney = async (uniId) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/universities/${uniId}/steps`);
      setJourneyData(res.data);
    } catch (err) {
      console.error("Error fetching steps:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journeypage">
      <div className="journey-top-area">
        <div>{journeyData ? "Your Selected Path:" : "No Path Selected"}</div>

        {loading ? (
          <Skeleton width={150} height={30} />
        ) : (
          <div className="bold-text">{journeyData?.name}</div>
        )}
      </div>

      <div className="journey-steps-area">
        {loading ? (
          <Skeleton count={4} height={40} />
        ) : (
          journeyData?.generatedProgram?.steps?.map((step, i) => (
            <div key={i} className="each-j-step">
              <div className="each-j-step-text">{step.name}</div>
              <div className="each-j-step-text1">{step.description}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JourneyPage;
