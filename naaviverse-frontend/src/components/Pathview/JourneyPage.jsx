import React, { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";
import { useNavigate } from "react-router-dom";

const JourneyPage = () => {
  const [loading, setLoading] = useState(false);
  const [journeyPageData, setJourneyPageData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const universityId = localStorage.getItem("selectedUniversityId");

    console.log("Loaded University ID:", universityId);

    if (!universityId) return;

    fetchJourneyData(universityId);
  }, []);

  const fetchJourneyData = async (universityId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/userpaths/steps?universityId=${universityId}`);
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

      {/* ====== TITLE AREA ====== */}
      <div className="journey-top-area">
        <div className="title">Your Selected Path:</div>

        {/* School Name */}
        {loading ? (
          <Skeleton width={300} height={40} />
        ) : (
          <div className="path-title">{journeyPageData?.school}</div>
        )}

        {/* 🧭 Go Back */}
        <div
          className="go-back"
          onClick={() => navigate("/dashboard/users")}
          style={{ cursor: "pointer", textAlign: "right", fontWeight: 600, marginTop: "10px" }}
        >
          Go Back
        </div>
      </div>

      {/* ====== STEPS GRID ====== */}
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
