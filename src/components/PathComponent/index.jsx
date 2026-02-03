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

// Styles
import "./mapspage.scss";

const PathComponent = () => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();

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
    gradeToggle,
    setGradeToggle,
    curriculumToggle,
    setCurriculumToggle,
    streamToggle,
    setStreamToggle,
    performanceToggle,
    setPerformanceToggle,
    financialToggle,
    setFinancialToggle,
    personalityToggle,
    setPersonalityToggle,
    refetchPaths,
    setRefetchPaths,
  } = useContext(GlobalContex);

  const [loading, setLoading] = useState(false);
  const [approvedPaths, setApprovedPaths] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");



 const buildFilterParams = () => {
  if (!userProfile) return {};

  const params = {};

  if (gradeToggle) params.grade = userProfile.grade;
  if (curriculumToggle) params.curriculum = userProfile.curriculum;
  if (streamToggle) params.stream = userProfile.stream;
  if (performanceToggle) params.performance = userProfile.performance;
  if (financialToggle) params.financial = userProfile.financialSituation;
  if (personalityToggle) params.personality = userProfile.personality;

  return params;
};
 
  // --------------------------------------------------------------
  //  FETCH USER PROFILE
  // --------------------------------------------------------------
  const fetchUserProfile = async () => {
    try {
      const email = user?.email;
      if (!email) return;

      const res = await axios.get(`/api/users/get/${email}`);
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

// --------------------------------------------------------------
//  FETCH ADMIN-APPROVED PATHS (WITH TOGGLES)
// --------------------------------------------------------------
useEffect(() => {
  const fetchApprovedPaths = async () => {
    try {
      setLoading(true);

      // 🔑 BUILD FILTERS BASED ON TOGGLES
      const params = {};

      if (gradeToggle) params.grade = userProfile?.grade;
      if (curriculumToggle) params.curriculum = userProfile?.curriculum;
      if (streamToggle) params.stream = userProfile?.stream;
      if (performanceToggle) params.performance = userProfile?.performance;
      if (financialToggle) params.financial = userProfile?.financialSituation;
      if (personalityToggle) params.personality = userProfile?.personality;

      console.log("FETCHING PATHS WITH FILTERS 👉", params);

      const res = await axios.get(
        "http://localhost:4545/api/paths/active",
        { params }
      );

      setApprovedPaths(res.data.data || []);
    } catch (err) {
      console.error("Failed to load approved paths:", err);
      setApprovedPaths([]);
    } finally {
      setLoading(false);
    }
  };

  // ⛔ prevent API call before profile loads
  if (userProfile) {
    fetchApprovedPaths();
  }
}, [
  refetchPaths,
  gradeToggle,
  curriculumToggle,
  streamToggle,
  performanceToggle,
  financialToggle,
  personalityToggle,
  userProfile
]);


  // --------------------------------------------------------------
  //  USER CONFIRMS PATH (POST SELECT)
  // --------------------------------------------------------------
// --------------------------------------------------------------
//  USER CONFIRMS PATH (POST SELECT)
// --------------------------------------------------------------
const confirmPathSelection = () => {
  const email = user?.email;
  const pathId = selectedPathItem?._id;

  if (!email || !pathId) {
    alert("Missing email or pathId");
    return;
  }

  // ⭐ VERY IMPORTANT — SAVE PATH ID FOR JOURNEY PAGE
  localStorage.setItem("selectedPathId", pathId);

  axios
    .post("http://localhost:4545/api/fetch/selectpath", {
      email,
      pathId,
    })
    .then(() => {
      setPathItemStep(3);

      // ⭐ NAVIGATE TO MY JOURNEY AFTER SUCCESS
      setTimeout(() => {
        setsideNav("My Journey");
        navigate("/dashboard/users");
      }, 1200);
    })
    .catch((err) => console.error("Select path error:", err));
};


  // --------------------------------------------------------------
  //  RETURN: FULL CLEAN UI
  // --------------------------------------------------------------
  return (
    <div className="mapspage1">
      {showPathDetails ? (
        <JourneyPage />
      ) : (
        <div className="maps-container1">
          {/* LEFT SIDEBAR */}
          <div className="maps-sidebar1">
            
            {/* Path Action Flow */}
            {pathItemSelected && pathItemStep === 1 ? (
              <div className="mid-area1" style={{ borderBottom: "none" }}>
                <div style={{ margin: "0.5rem 0" }}>What do you want to do?</div>

                <div className="maps-btns-div1">
                  <div
                    className="reset-btn1"
                    onClick={() =>
                      navigate(`/dashboard/path/${selectedPathItem?._id}`)
                    }
                  >
                    Explore Path
                  </div>

                  <div
                    className="reset-btn1"
                    onClick={() => setPathItemStep(2)}
                  >
                    Select Path
                  </div>

                  <div
                    className="reset-btn1"
                    onClick={() => {
                      setPathItemSelected(false);
                      setSelectedPathItem(null);
                    }}
                  >
                    Go Back
                  </div>
                </div>
              </div>
            ) : pathItemSelected && pathItemStep === 2 ? (
              <div className="mid-area1" style={{ borderBottom: "none" }}>
                <div style={{ margin: "0.5rem 0" }}>
                  Are you sure you want to select this path?
                </div>

                <div className="maps-btns-div1">
                  <div
                    className="reset-btn1"
                    onClick={confirmPathSelection}
                    style={{ opacity: loading ? 0.5 : 1 }}
                  >
                    {loading ? "Loading..." : "Yes, Confirm"}
                  </div>

                  <div
                    className="reset-btn1"
                    onClick={() => setPathItemStep(1)}
                  >
                    Go Back
                  </div>
                </div>
              </div>
            ) : pathItemSelected && pathItemStep === 3 ? (
              <div className="congrats-area">
                <div className="congrats-textt">Congratulations</div>
                <div className="congrats-textt1">
                  You have selected: {selectedPathItem?.name}
                </div>
              </div>
            ) : (
              // DEFAULT: CURRENT COORDINATES
<div className="mid-area1">

  {/* ================= EDUCATION HEADER (NEW) ================= */}
   {/* EDUCATION HEADER */}
  <div className="education-header">
    <div className="education-icon">
      <img src={educationIcon} alt="Education" />
    </div>
    <div className="education-title">Education</div>
  </div>
  {/* ================= CURRENT COORDINATES ================= */}
  <div className="current-coord-container">

                  <div className="current-text">Current Coordinates</div>

                  {!userProfile ? (
                    <p>Loading profile...</p>
                  ) : (
                    <>
                      <div className="each-coo-field">
                        <div className="field-name">Grade</div>
                        <div
                          className="toggleContainer"
                          onClick={() => setGradeToggle(!gradeToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !gradeToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">{userProfile.grade}</div>
                      </div>

                      {/* curriculum */}
                      <div className="each-coo-field">
                        <div className="field-name">Curriculum</div>
                        <div
                          className="toggleContainer"
                          onClick={() =>
                            setCurriculumToggle(!curriculumToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !curriculumToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">
                          {userProfile.curriculum}
                        </div>
                      </div>

                      {/* Stream */}
                      <div className="each-coo-field">
                        <div className="field-name">Stream</div>
                        <div
                          className="toggleContainer"
                          onClick={() => setStreamToggle(!streamToggle)}
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !streamToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">{userProfile.stream}</div>
                      </div>

                      {/* Performance */}
                      <div className="each-coo-field">
                        <div className="field-name">Performance</div>
                        <div
                          className="toggleContainer"
                          onClick={() =>
                            setPerformanceToggle(!performanceToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !performanceToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">
                          {userProfile.performance}
                        </div>
                      </div>

                      {/* Financial */}
                      <div className="each-coo-field">
                        <div className="field-name">Financial</div>
                        <div
                          className="toggleContainer"
                          onClick={() =>
                            setFinancialToggle(!financialToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !financialToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">
                          {userProfile.financialSituation}
                        </div>
                      </div>

                      {/* Personality */}
                      <div className="each-coo-field">
                        <div className="field-name">Personality</div>
                        <div
                          className="toggleContainer"
                          onClick={() =>
                            setPersonalityToggle(!personalityToggle)
                          }
                        >
                          <div
                            className="toggle"
                            style={{
                              transform: !personalityToggle
                                ? "translateX(0)"
                                : "translateX(20px)",
                            }}
                          ></div>
                        </div>
                        <div className="field-value">
                          {userProfile.personality}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="maps-btns-div1">
                  <div
                    className="gs-Btn-maps1"
                    onClick={() => setRefetchPaths(!refetchPaths)}
                  >
                    Find Paths
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDE: SHOW APPROVED PATHS */}
          <div className="maps-content-area1">
            <Pathview
              paths={approvedPaths}
              loading={loading}
              onConfirmPath={(path) => {
                setSelectedPathItem(path);
                setPathItemSelected(true);
                setPathItemStep(1);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PathComponent;
