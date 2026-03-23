import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "./journey.scss";
import { motion } from "framer-motion";

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

const PathPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [pathName, setPathName] = useState("N/A");
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState(null);

  const isPartnerFlow = location.pathname.startsWith("/dashboard/accountants");

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

      const sorted = (stepsRes?.data?.data || []).sort(
        (a, b) => (a.step_order || 0) - (b.step_order || 0)
      );
      setSteps(sorted);
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

  const handleCreateStep = () => {
    navigate(`/dashboard/accountants/create-step/${id}`);
  };

  return (
    <div className="pathpage-root">

      {/* HEADER */}
      <div className="pathpage-header">
        <div className="pathpage-header-left">
          <span className="pathpage-label">Your Selected Path</span>
          {loading
            ? <Skeleton width={260} height={28} />
            : <h1 className="pathpage-title">{pathName}</h1>
          }
        </div>
        <div className="pathpage-header-right">
          <button className="pathpage-back-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          {isPartnerFlow && (
            <button className="pathpage-create-btn" onClick={handleCreateStep}>
              + Create Step
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE STEPS AREA */}
      <div className="pathpage-scroll-area">
        {loading ? (
          <div className="pathpage-skeleton-grid">
            {[1, 2, 3].map(n => <Skeleton key={n} height={220} borderRadius={20} />)}
          </div>
        ) : error ? (
          <p className="pathpage-error">{error}</p>
        ) : steps.length === 0 ? (
          <p className="pathpage-error">No steps found for this path.</p>
        ) : (
          <div className="pathpage-steps-grid">
            {steps.map((step, index) => {
              const duration = parseDuration(step.macro_length);
              return (
                <motion.div
                  key={step._id}
                  className="pathpage-step-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="pathpage-step-number">
                    {step.step_order || index + 1}
                  </div>

                  <div className="pathpage-step-name">{step.macro_name}</div>

                  <div className="pathpage-step-desc">{step.macro_description}</div>

                
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default PathPage;