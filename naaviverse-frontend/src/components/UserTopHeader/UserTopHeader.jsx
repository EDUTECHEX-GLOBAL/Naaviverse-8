import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./UserTopHeader.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function UserTopHeader({ onBack }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [fromLabel, setFromLabel] = useState("Please select");
  const [toLabel, setToLabel] = useState("Please select");
  const [stepsLabel, setStepsLabel] = useState("Please select");
  const [cityLabel, setCityLabel] = useState("Machilipatnam");

  const updateHeaderInfo = async () => {
    try {
      // 1. User & Profile Data
      let userObj = null;
      try {
        const rawUser = localStorage.getItem("user");
        const parsed = rawUser ? JSON.parse(rawUser) : null;
        userObj = parsed?.user || parsed;
      } catch (e) {
        userObj = null;
      }

      let profileObj = null;
      try {
        const rawProfile = localStorage.getItem("userProfile");
        profileObj = rawProfile ? JSON.parse(rawProfile) : null;
      } catch (e) {
        profileObj = null;
      }

      const email = userObj?.email || "";

      // Determine 'FROM' (Current Position)
      let from = "";
      if (profileObj) {
        from = [profileObj.grade, profileObj.stream || profileObj.curriculum, profileObj.country]
          .filter(Boolean)
          .join(" • ") || profileObj.profession || profileObj.currentPosition || "";
      }
      if (!from && userObj) {
        from = [userObj.grade, userObj.stream || userObj.curriculum, userObj.country]
          .filter(Boolean)
          .join(" • ") || userObj.currentPosition || "";
      }
      setFromLabel(from || "Please select");

      // Determine City / Location
      const city = profileObj?.city || userObj?.city || profileObj?.country || userObj?.country || "Machilipatnam";
      setCityLabel(city);

      // 2. Selected Path & Steps (Destination)
      let pathId = localStorage.getItem("selectedPathId");
      let pathName = localStorage.getItem("selectedPathName");
      let stepsCount = localStorage.getItem("selectedPathSteps");

      // If we have pathId but not cached name or steps, fetch from backend
      if (pathId && (!pathName || !stepsCount)) {
        try {
          const res = await axios.get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`);
          if (res.data?.status && res.data?.data) {
            const fetchedName = res.data.data.name || res.data.data.nameOfPath || "";
            const count = res.data.data.steps?.length || 0;
            if (fetchedName) {
              pathName = fetchedName;
              localStorage.setItem("selectedPathName", fetchedName);
            }
            if (count) {
              stepsCount = `${count} steps`;
              localStorage.setItem("selectedPathSteps", `${count} steps`);
            }
          }
        } catch (err) {
          // ignore error
        }
      }

      // If no path in storage, try to restore from userpaths/selected
      if (!pathId && email) {
        try {
          const selRes = await axios.get(`${BASE_URL}/api/userpaths/selected`, {
            params: { email },
          });
          if (selRes.data?.status && selRes.data?.pathId) {
            pathId = selRes.data.pathId;
            localStorage.setItem("selectedPathId", pathId);
            const stepsRes = await axios.get(`${BASE_URL}/api/userpaths/steps?pathId=${pathId}`);
            if (stepsRes.data?.status && stepsRes.data?.data) {
              const fetchedName = stepsRes.data.data.name || stepsRes.data.data.nameOfPath || "";
              const count = stepsRes.data.data.steps?.length || 0;
              if (fetchedName) {
                pathName = fetchedName;
                localStorage.setItem("selectedPathName", fetchedName);
              }
              if (count) {
                stepsCount = `${count} steps`;
                localStorage.setItem("selectedPathSteps", `${count} steps`);
              }
            }
          }
        } catch (err) {
          // ignore
        }
      }

      setToLabel(pathName || "Please select");
      setStepsLabel(stepsCount || (pathName ? "5 steps" : "Please select"));
    } catch (e) {
      console.error("Error updating UserTopHeader:", e);
    }
  };

  useEffect(() => {
    updateHeaderInfo();

    const handleStorageChange = () => updateHeaderInfo();
    const handlePathSelected = () => updateHeaderInfo();
    const handleStepCompleted = () => updateHeaderInfo();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("naavi:path-selected", handlePathSelected);
    window.addEventListener("naavi:step-completed", handleStepCompleted);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("naavi:path-selected", handlePathSelected);
      window.removeEventListener("naavi:step-completed", handleStepCompleted);
    };
  }, [location.pathname]);

  const isHome = location.pathname === "/dashboard/users" || location.pathname === "/dashboard/users/home";

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="user-top-header">
      <div className="uth-left-actions">
        {!isHome && (
          <button className="uth-back-btn" onClick={handleBackClick} aria-label="Go back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back</span>
          </button>
        )}
      </div>

      <div className="uth-route-searchbar" aria-label="Current career route">
        {/* FROM */}
        <div className="uth-search-point from-point">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div className="uth-search-copy uth-from-copy">
          <span className="uth-label">FROM</span>
          <strong className={`uth-value ${fromLabel === "Please select" ? "uth-placeholder" : ""}`} title={fromLabel}>
            {fromLabel}
          </strong>
        </div>

        <div className="uth-divider" />

        {/* TO */}
        <div className="uth-search-point to-point">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
        </div>
        <div className="uth-search-copy uth-to-copy">
          <span className="uth-label">TO</span>
          <strong className={`uth-value ${toLabel === "Please select" ? "uth-placeholder" : ""}`} title={toLabel}>
            {toLabel}
          </strong>
        </div>

        <div className="uth-divider" />

        {/* STEPS */}
        <div className="uth-search-copy uth-steps-copy">
          <span className="uth-label">STEPS</span>
          <strong className={`uth-value ${stepsLabel === "Please select" ? "uth-placeholder" : ""}`}>
            {stepsLabel}
          </strong>
        </div>
      </div>

      <div className="uth-location-pill" title={cityLabel}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
        <span>{cityLabel}</span>
      </div>
    </header>
  );
}
