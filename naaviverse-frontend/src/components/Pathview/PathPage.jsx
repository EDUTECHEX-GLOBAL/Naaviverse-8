// PathPage.jsx (Premium Version)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";
import { motion } from "framer-motion";

const PathPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schoolName, setSchoolName] = useState("N/A");
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSteps = async () => {
      setLoading(true);
      setError(null);

      const pathId = localStorage.getItem("selectedPathId");
      if (!pathId) {
        setError("No selected path id found.");
        setLoading(false);
        return;
      }

      try {
        let resp = null;
        try {
          resp = await axios.get(`/api/universities/${pathId}/steps`);
          if (resp?.data?.steps && Array.isArray(resp.data.steps)) {
            setSteps(resp.data.steps);
          } else if (Array.isArray(resp?.data)) {
            setSteps(resp.data);
          } else {
            resp = null;
          }
        } catch (err) {
          resp = null;
        }

        if (!resp) {
          const r2 = await axios.get(`/api/universities/${pathId}`);
          const uni = r2?.data?.data || r2?.data;
          setSchoolName(uni?.name || uni?.school || "N/A");

          const program = uni?.generatedProgram || uni?.program || {};
          const fetchedSteps = Array.isArray(program?.steps)
            ? program.steps
            : [];

          setSteps(fetchedSteps);
        } else {
          axios.get(`/api/universities/${pathId}`).then((rName) => {
            const uni = rName?.data?.data || rName?.data;
            if (uni?.name) setSchoolName(uni.name);
          });
        }
      } catch (err) {
        console.error("Error fetching steps:", err);
        setError("Failed to fetch steps.");
        setSteps([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, []);

  return (
    <div className="dashboard-main">
      <div className="dashboard-body">
        <div className="dashboard-screens" style={{ width: "100%" }}>
          <div style={{ padding: "3rem 3.5rem" }}>
            {/* Top Section */}
            <div className="journey-top-area-premium">
              <div className="premium-title-small">Your Selected Path</div>

              {loading ? (
                <Skeleton width={300} height={32} />
              ) : (
                <div className="premium-title">{schoolName}</div>
              )}

              <div
                className="premium-back"
                onClick={() => navigate(-1)}
              >
                ← Go Back
              </div>
            </div>

            {/* Steps Section */}
            <div className="steps-grid-premium">
              {loading ? (
                Array(3)
                  .fill("")
                  .map((_, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * i }}
                      className="step-card-premium"
                      key={i}
                    >
                      <Skeleton width={"60%"} height={22} />
                      <Skeleton width={"95%"} height={14} style={{ marginTop: 8 }} />
                      <Skeleton width={"92%"} height={14} style={{ marginTop: 6 }} />
                    </motion.div>
                  ))
              ) : error ? (
                <p className="premium-error">{error}</p>
              ) : steps.length === 0 ? (
                <p className="premium-error">No steps found.</p>
              ) : (
                steps.map((step, index) => (
                  <motion.div
                    key={index}
                    className="step-card-premium"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="step-number">
                      <div className="bubble">{index + 1}</div>
                    </div>

                    <div className="step-title-premium">{step.name}</div>
                    <div className="step-desc-premium">{step.description}</div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PathPage;
