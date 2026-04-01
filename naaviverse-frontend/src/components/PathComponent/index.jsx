import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Components
import Pathview from "../Pathview";
import JourneyPage from "../Pathview/JourneyPage";

// Contexts
import { useCoinContextData } from "../../context/CoinContext";
import { GlobalContex } from "../../globalContext";
import { useStore } from "../../components/store/store.ts";
import educationIcon from "../../static/images/mapspage/educationIcon.svg";

import logActivity from "../../utils/activityLogger";

// Styles
import "./mapspage.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PathComponent = () => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();

  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    pathItemSelected,
    setPathItemSelected,
    pathItemStep,
    setPathItemStep,
    selectedPathItem,
    setSelectedPathItem,
    showPathDetails,
  } = useCoinContextData();

  const {
    gradeToggle,      setGradeToggle,
    curriculumToggle, setCurriculumToggle,
    streamToggle,     setStreamToggle,
    performanceToggle, setPerformanceToggle,
    financialToggle,  setFinancialToggle,
    personalityToggle, setPersonalityToggle,
    refetchPaths,     setRefetchPaths,
  } = useContext(GlobalContex);

  const [loading,        setLoading]        = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [approvedPaths,  setApprovedPaths]  = useState([]);
  const [userProfile,    setUserProfile]    = useState(null);

  // ── track whether explore has been logged this session ──────────────────
  const exploreLoggedRef = useRef(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  // ── FETCH USER PROFILE ────────────────────────────────────────────────────
  const fetchUserProfile = async () => {
    try {
      const email = user?.email;
      if (!email) return;
      const res = await axios.get(`${BASE_URL}/api/users/get/${email}`);
      if (res.data.status) {
        setUserProfile(res.data.data);
        localStorage.setItem("userProfile", JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // ── LOG "explore" ONCE when paths page mounts ─────────────────────────────
  useEffect(() => {
    if (exploreLoggedRef.current) return;
    exploreLoggedRef.current = true;

    logActivity({
      type:  "explore",
      title: "Browsing learning paths",
      desc:  "User opened the Explore Paths page",
    });
  }, []);

  // ── FETCH APPROVED PATHS (WITH TOGGLES) ───────────────────────────────────
  useEffect(() => {
    const fetchApprovedPaths = async () => {
      try {
        setLoading(true);
        const params = {};
        if (gradeToggle)       params.grade       = userProfile?.grade;
        if (curriculumToggle)  params.curriculum  = userProfile?.curriculum;
        if (streamToggle)      params.stream      = userProfile?.stream;
        if (performanceToggle) params.performance = userProfile?.performance;
        if (financialToggle)   params.financial   = userProfile?.financialSituation;
        if (personalityToggle) params.personality = userProfile?.personality;

        const res = await axios.get(`${BASE_URL}/api/paths/active`, { params });
        setApprovedPaths(res.data.data || []);
      } catch (err) {
        console.error("Failed to load approved paths:", err);
        setApprovedPaths([]);
      } finally {
        setLoading(false);
      }
    };

    if (userProfile) fetchApprovedPaths();
  }, [
    refetchPaths,
    gradeToggle, curriculumToggle, streamToggle,
    performanceToggle, financialToggle, personalityToggle,
    userProfile,
  ]);

  // ── USER CONFIRMS PATH ────────────────────────────────────────────────────
  const confirmPathSelection = async () => {
    const email  = user?.email;
    const pathId = selectedPathItem?._id;

    if (!email || !pathId) {
      alert("Something went wrong. Please try again.");
      return;
    }

    try {
      setConfirmLoading(true);
      localStorage.setItem("selectedPathId", pathId);
      localStorage.removeItem("selectedStepId");

      await axios.post(`${BASE_URL}/api/userpaths/selectpath`, { email, pathId });

      // ✅ Log path selected / enrolled
      logActivity({
        type:     "path",
        title:    `Selected path: ${selectedPathItem?.name}`,
        desc:     `User enrolled in "${selectedPathItem?.name}"`,
        pathId:   pathId,
        pathName: selectedPathItem?.name || "",
        status:   "completed",
      });

      setPathItemStep(3);
      setTimeout(() => {
        setsideNav("My Journey");
        navigate("/dashboard/users/my-journey");
      }, 2000);
    } catch (err) {
      console.error("❌ Select path error:", err.response?.data || err.message);

      // Still log even if API failed (path was set in localStorage)
      logActivity({
        type:     "path",
        title:    `Selected path: ${selectedPathItem?.name}`,
        desc:     `User enrolled in "${selectedPathItem?.name}"`,
        pathId:   pathId,
        pathName: selectedPathItem?.name || "",
        status:   "completed",
      });

      setPathItemStep(3);
      setTimeout(() => {
        setsideNav("My Journey");
        navigate("/dashboard/users/my-journey");
      }, 2000);
    } finally {
      setConfirmLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="mapspage1">
      {showPathDetails ? (
        <JourneyPage />
      ) : (
        <div className="maps-container1">

          {/* ── RIGHT: Filters Sidebar ── */}
          <div className={`maps-sidebar1 ${filtersOpen ? "mobile-filters-open" : ""}`}>

            <div
              className="mobile-filter-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <span>🎯 Filters & Coordinates</span>
              <span className="mobile-filter-chevron">{filtersOpen ? "▲" : "▼"}</span>
            </div>

            <div className={`sidebar-filter-content ${filtersOpen ? "open" : ""}`}>

              {pathItemSelected && pathItemStep === 1 ? (
                <div className="mid-area1" style={{ borderBottom: "none" }}>
                  <div style={{ margin: "0.5rem 0" }}>What do you want to do?</div>
                  <div className="maps-btns-div1">
                    <div
                      className="reset-btn1"
                      onClick={() => navigate(`/dashboard/path/${selectedPathItem?._id}`)}
                    >
                      Explore Path
                    </div>
                    <div className="reset-btn1" onClick={() => setPathItemStep(2)}>
                      Select Path
                    </div>
                    <div
                      className="reset-btn1"
                      onClick={() => { setPathItemSelected(false); setSelectedPathItem(null); }}
                    >
                      Go Back
                    </div>
                  </div>
                </div>

              ) : pathItemSelected && pathItemStep === 2 ? (
                <div className="mid-area1" style={{ borderBottom: "none" }}>
                  <div style={{ margin: "0.5rem 0" }}>
                    Are you sure you want to select{" "}
                    <strong>{selectedPathItem?.name}</strong>?
                  </div>
                  <div className="maps-btns-div1">
                    <div
                      className="reset-btn1"
                      onClick={confirmPathSelection}
                      style={{
                        opacity: confirmLoading ? 0.6 : 1,
                        pointerEvents: confirmLoading ? "none" : "auto",
                        cursor: confirmLoading ? "not-allowed" : "pointer",
                      }}
                    >
                      {confirmLoading ? "Confirming..." : "Yes, Confirm"}
                    </div>
                    <div className="reset-btn1" onClick={() => setPathItemStep(1)}>Go Back</div>
                  </div>
                </div>

              ) : pathItemSelected && pathItemStep === 3 ? (
                <div className="congrats-area">
                  <div className="congrats-textt">🎉 Congratulations!</div>
                  <div className="congrats-textt1">You have selected:</div>
                  <div className="congrats-textt1" style={{ fontWeight: 700 }}>
                    {selectedPathItem?.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px" }}>
                    Redirecting to My Journey...
                  </div>
                </div>

              ) : (
                <div className="mid-area1">
                  <div className="education-header">
                    <div className="education-icon">
                      <img src={educationIcon} alt="Education" />
                    </div>
                    <div className="education-title">Education</div>
                  </div>

                  <div className="current-coord-container">
                    <div className="current-text">Current Coordinates</div>
                    {!userProfile ? (
                      <p>Loading profile...</p>
                    ) : (
                      <>
                        {[
                          { label: "Grade",       value: userProfile.grade,              toggle: gradeToggle,       setToggle: setGradeToggle },
                          { label: "Curriculum",  value: userProfile.curriculum,         toggle: curriculumToggle,  setToggle: setCurriculumToggle },
                          { label: "Stream",      value: userProfile.stream,             toggle: streamToggle,      setToggle: setStreamToggle },
                          { label: "Performance", value: userProfile.performance,        toggle: performanceToggle, setToggle: setPerformanceToggle },
                          { label: "Financial",   value: userProfile.financialSituation, toggle: financialToggle,   setToggle: setFinancialToggle },
                          { label: "Personality", value: userProfile.personality,        toggle: personalityToggle, setToggle: setPersonalityToggle },
                        ].map(({ label, value, toggle, setToggle }) => (
                          <div className="each-coo-field" key={label}>
                            <div className="field-name">{label}</div>
                            <div
                              className="toggleContainer"
                              onClick={() => setToggle(!toggle)}
                            >
                              <div
                                className="toggle"
                                style={{ transform: !toggle ? "translateX(0)" : "translateX(20px)" }}
                              />
                            </div>
                            <div className="field-value">{value}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  <div className="maps-btns-div1">
                    <div
                      className="gs-Btn-maps1"
                      onClick={() => {
                        setRefetchPaths(!refetchPaths);
                        setFiltersOpen(false);
                      }}
                    >
                      Find Paths
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── LEFT: Approved Paths ── */}
          <div className="maps-content-area1">
            <Pathview
              paths={approvedPaths}
              loading={loading}
              onConfirmPath={(path) => {
                setSelectedPathItem(path);
                setPathItemSelected(true);
                setPathItemStep(1);
                setFiltersOpen(true);

                // ✅ Log that user tapped/viewed a specific path card
                logActivity({
                  type:     "explore",
                  title:    `Viewed path: ${path?.name}`,
                  desc:     `User tapped on "${path?.name}" to view details`,
                  pathId:   path?._id,
                  pathName: path?.name || "",
                  status:   "viewed",
                });
              }}
            />
          </div>

        </div>
      )}
    </div>
  );
};

export default PathComponent;