import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";
import { motion } from "framer-motion";
import NewStep1 from "../../globalComponents/GlobalDrawer/NewStep1";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const PathPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [openNewStep, setOpenNewStep] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pathName, setPathName] = useState("N/A");
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);

  const isPartnerFlow = location.pathname.startsWith(
    "/dashboard/accountants"
  );

  // ✅ Open drawer when query param exists
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("createStep") === "true") {
      setOpenNewStep(true);
    } else {
      setOpenNewStep(false);
    }
  }, [location.search]);

  // ✅ Fetch path + steps
  const fetchPath = async () => {
    setLoading(true);
    setError(null);

    const pathId = id || localStorage.getItem("selectedPathId");
    if (!pathId) {
      setError("No selected path id found.");
      setLoading(false);
      return;
    }

    try {
      const pathRes = await axios.get(`${BASE_URL}/api/paths/viewpath/${pathId}`);
      setPathName(pathRes?.data?.data?.nameOfPath || "N/A");

      const stepsRes = await axios.get(`${BASE_URL}/api/steps/get`, {
        params: { path_id: pathId },
      });

      setSteps(stepsRes?.data?.data || []);
    } catch (err) {
      setError("Failed to fetch path.");
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPath();
  }, [id]);

  // ✅ Handle create step click
  const handleCreateStep = () => {
    navigate(`?createStep=true`);
  };

  // ✅ Close drawer properly
  const closeDrawer = () => {
    setOpenNewStep(false);
    navigate(location.pathname, { replace: true });
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-body">
        <div className="dashboard-screens" style={{ width: "100%" }}>
          <div style={{ padding: "3rem 3.5rem" }}>
            {/* HEADER */}
            <div className="journey-top-area-premium">
              <div className="premium-title-small">Your Selected Path</div>

              {loading ? (
                <Skeleton width={300} height={32} />
              ) : (
                <div className="premium-title">{pathName}</div>
              )}

              <div className="premium-back" onClick={() => navigate(-1)}>
                ← Go Back
              </div>

              {isPartnerFlow && (
                <button
                  className="premium-create-step-btn"
                  onClick={handleCreateStep}
                >
                  + Create Step
                </button>
              )}
            </div>

            {/* 🔥 Drawer */}
            {openNewStep && (
              <div
                className="global-drawer-overlay"
                onClick={closeDrawer}
              >
                <div
                  className="global-drawer-panel"
                  onClick={(e) => e.stopPropagation()}
                >
                  <NewStep1
                    pathId={id || localStorage.getItem("selectedPathId")}
                    onSuccess={() => {
                      closeDrawer();
                      fetchPath();
                    }}
                  />
                </div>
              </div>
            )}

            {/* STEPS */}
            <div className="steps-grid-premium">
              {loading ? (
                <Skeleton count={3} />
              ) : error ? (
                <p className="premium-error">{error}</p>
              ) : steps.length === 0 ? (
                <p className="premium-error">No steps found.</p>
              ) : (
                steps.map((step, index) => (
                  <motion.div
                    key={step._id}
                    className="step-card-premium"
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bubble">{index + 1}</div>
                    <div className="step-title-premium">{step.name}</div>
                    <div className="step-desc-premium">
                      {step.description}
                    </div>
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
