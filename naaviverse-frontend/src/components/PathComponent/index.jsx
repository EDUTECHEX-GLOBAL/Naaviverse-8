import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Pathview from "../Pathview";
import JourneyPage from "../Pathview/JourneyPage";
import educationIcon from "../../static/images/mapspage/educationIcon.svg";

import { useCoinContextData } from "../../context/CoinContext";
import { GlobalContex } from "../../globalContext";
import { useStore } from "../../components/store/store.ts";
import logActivity from "../../utils/activityLogger";

import "./mapspage.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ─── Modal Step Enum ───────────────────────────────────────────
// null        → no modal
// "view"      → view path details (name, desc, Explore / Select / Back)
// "explore"   → show steps inside same modal
// "confirm"   → are you sure?
// "success"   → congratulations

const PathComponent = () => {
  const navigate = useNavigate();
  const { sideNav, setsideNav } = useStore();

  const [coordsOpen, setCoordsOpen] = useState(false);

  // Modal state
  const [modalPath, setModalPath] = useState(null);   // path object
  const [modalStep, setModalStep] = useState(null);   // "view" | "explore" | "confirm" | "success"
  const [pathSteps, setPathSteps] = useState([]);
  const [stepsLoading, setStepsLoading] = useState(false);

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
    gradeToggle, setGradeToggle,
    curriculumToggle, setCurriculumToggle,
    streamToggle, setStreamToggle,
    performanceToggle, setPerformanceToggle,
    financialToggle, setFinancialToggle,
    personalityToggle, setPersonalityToggle,
    refetchPaths, setRefetchPaths,
  } = useContext(GlobalContex);

  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [approvedPaths, setApprovedPaths] = useState([]);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("userProfile");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });

  const exploreLoggedRef = useRef(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "{}"); }
    catch { return {}; }
  })();

  useEffect(() => {
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
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (exploreLoggedRef.current) return;
    exploreLoggedRef.current = true;
    logActivity({
      type: "explore",
      title: "Browsing learning paths",
      desc: "User opened the Explore Paths page",
    });
  }, []);

  useEffect(() => {
    const fetchApprovedPaths = async () => {
      try {
        setLoading(true);
        const params = {};
        if (gradeToggle && userProfile?.grade) params.grade = userProfile.grade;
        if (curriculumToggle && userProfile?.curriculum) params.curriculum = userProfile.curriculum;
        if (streamToggle && userProfile?.stream) params.stream = userProfile.stream;
        if (performanceToggle && userProfile?.performance) params.performance = userProfile.performance;
        if (financialToggle && userProfile?.financialSituation) params.financial = userProfile.financialSituation;
        if (personalityToggle && userProfile?.personality) params.personality = userProfile.personality;

        const res = await axios.get(`${BASE_URL}/api/paths/active`, { params });
        setApprovedPaths(res.data.data || []);
      } catch (err) {
        console.error("Failed to load approved paths:", err);
        setApprovedPaths([]);
      } finally {
        setLoading(false);
      }
    };
    fetchApprovedPaths();
  }, [
    refetchPaths,
    gradeToggle, curriculumToggle, streamToggle,
    performanceToggle, financialToggle, personalityToggle,
    userProfile,
  ]);

  // ── Open "View Path" modal ────────────────────────────────────
  const handleViewPath = (path) => {
    setModalPath(path);
    setModalStep("view");
    setPathSteps([]);
  };

  // ── Close all modals & reset state ───────────────────────────
  const closeModal = () => {
    setModalStep(null);
    setModalPath(null);
    setPathSteps([]);
    // Also reset legacy pathItemSelected state so returning to paths is clean
    setPathItemSelected(false);
    setSelectedPathItem(null);
  };

  // ── Explore Path: fetch steps & show inside modal ─────────────
  const handleExplore = async () => {
    if (!modalPath?._id) return;
    setModalStep("explore");
    setStepsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/steps/get`, {
        params: { path_id: modalPath._id },
      });
      const sorted = (res?.data?.data || []).sort(
        (a, b) => (a.step_order || 0) - (b.step_order || 0)
      );
      setPathSteps(sorted);
    } catch {
      setPathSteps([]);
    } finally {
      setStepsLoading(false);
    }
  };

  // ── Confirm selection ─────────────────────────────────────────
  const handleConfirmSelect = async () => {
    const email = user?.email;
    const pathId = modalPath?._id;
    if (!email || !pathId) return;

    try {
      setConfirmLoading(true);
    localStorage.setItem("selectedPathId", pathId);
localStorage.setItem("selectedPathOwner", email); // 👈 store owner
localStorage.removeItem("selectedStepId");
localStorage.removeItem("selectedStepNumber");
      await axios.post(`${BASE_URL}/api/userpaths/selectpath`, { email, pathId });
    } catch (err) {
      console.error("Select path error:", err.response?.data || err.message);
    } finally {
      setConfirmLoading(false);
      logActivity({
        type: "path",
        title: `Selected path: ${modalPath?.nameOfPath}`,
        desc: `User enrolled in "${modalPath?.nameOfPath}"`,
        pathId: pathId,
        pathName: modalPath?.nameOfPath || "",
        status: "completed",
      });
      setModalStep("success");
      // Auto-navigate after 2.2 s
      setTimeout(() => {
        closeModal();
        setsideNav("My Journey");
        navigate("/dashboard/users/my-journey");
      }, 2200);
    }
  };

  const parseDuration = (raw) => {
    try {
      const l = JSON.parse(raw);
      const parts = [];
      if (parseInt(l.years) > 0) parts.push(`${l.years}y`);
      if (parseInt(l.months) > 0) parts.push(`${l.months}m`);
      if (parseInt(l.days) > 0) parts.push(`${l.days}d`);
      return parts.length > 0 ? parts.join(" ") : null;
    } catch { return null; }
  };

  const coordinates = [
    { label: "Grade", value: userProfile?.grade, toggle: gradeToggle, setToggle: setGradeToggle },
    { label: "Curriculum", value: userProfile?.curriculum, toggle: curriculumToggle, setToggle: setCurriculumToggle },
    { label: "Stream", value: userProfile?.stream, toggle: streamToggle, setToggle: setStreamToggle },
    { label: "Performance", value: userProfile?.performance, toggle: performanceToggle, setToggle: setPerformanceToggle },
    { label: "Financial", value: userProfile?.financialSituation, toggle: financialToggle, setToggle: setFinancialToggle },
    { label: "Personality", value: userProfile?.personality, toggle: personalityToggle, setToggle: setPersonalityToggle },
  ];

  const isModalOpen = !!modalStep;

  return (
    <div className="mapspage-modern">
      {showPathDetails ? (
        <JourneyPage />
      ) : (
        <div className="maps-main-container">
          <div className="maps-paths-area">
            <Pathview
              paths={approvedPaths}
              loading={loading}
              onAdjustCoordinates={() => setCoordsOpen(true)}
              onViewPath={handleViewPath}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          MODAL SYSTEM — backdrop only covers main content
      ══════════════════════════════════════════════════ */}
      {isModalOpen && (
        <div
          className="content-modal-backdrop"
          onClick={closeModal}
        />
      )}

      {/* ── VIEW PATH MODAL ── */}
      {modalStep === "view" && modalPath && (
        <div className="path-flow-modal">
          <button className="pfm-close" onClick={closeModal}>✕</button>

          <div className="pfm-icon">
            {(modalPath.nameOfPath || "P").charAt(0).toUpperCase()}
          </div>
          <h3 className="pfm-title">{modalPath.nameOfPath || modalPath.name}</h3>

          {modalPath.program && modalPath.program !== "-" && (
            <span className="pfm-tag">{modalPath.program}</span>
          )}

          {modalPath.description && modalPath.description !== "-" && (
            <p className="pfm-desc">{modalPath.description}</p>
          )}

          <div className="pfm-btns">
            <button className="pfm-btn pfm-btn--outline" onClick={handleExplore}>
              Explore Path
            </button>
            <button className="pfm-btn pfm-btn--primary" onClick={() => setModalStep("confirm")}>
              Select This Path
            </button>
            <button className="pfm-btn pfm-btn--ghost" onClick={closeModal}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── EXPLORE STEPS MODAL ── */}
      {modalStep === "explore" && modalPath && (
        <div className="path-flow-modal path-flow-modal--wide">
          <button className="pfm-close" onClick={closeModal}>✕</button>
          <button className="pfm-back-btn" onClick={() => setModalStep("view")}>← Back</button>

          <div className="pfm-explore-header">
            <div className="pfm-icon pfm-icon--sm">
              {(modalPath.nameOfPath || "P").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="pfm-title pfm-title--left">{modalPath.nameOfPath}</h3>
              <span className="pfm-tag">{modalPath.program}</span>
            </div>
          </div>

          <div className="pfm-steps-scroll">
            {stepsLoading ? (
              <div className="pfm-steps-loading">
                <div className="pfm-spinner" />
                <span>Loading steps…</span>
              </div>
            ) : pathSteps.length === 0 ? (
              <p className="pfm-no-steps">No steps found for this path.</p>
            ) : (
              <div className="pfm-steps-list">
                {pathSteps.map((step, idx) => {
                  const dur = parseDuration(step.macro_length);
                  return (
                    <div className="pfm-step-card" key={step._id}>
                      <div className="pfm-step-num">{step.step_order || idx + 1}</div>
                      <div className="pfm-step-body">
                        <div className="pfm-step-name">{step.macro_name}</div>
                        {step.macro_description && (
                          <div className="pfm-step-desc">{step.macro_description}</div>
                        )}
                        {dur && <div className="pfm-step-dur">⏱ {dur}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pfm-btns pfm-btns--bottom">
            <button
              className="pfm-btn pfm-btn--primary"
              onClick={() => setModalStep("confirm")}
            >
              Select This Path
            </button>
          </div>
        </div>
      )}

     {modalStep === "confirm" && modalPath && (
  <div className="path-flow-modal">
    <button className="pfm-close" onClick={closeModal}>✕</button>

    {/* CENTERED ICON - no wrapper div */}
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Shield shape */}
        <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#3b82f6" opacity="0.15"/>
        <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" stroke="#3b82f6" strokeWidth="1.8" strokeLinejoin="round"/>
        {/* Checkmark inside */}
        <path d="M8.5 12L11 14.5L15.5 10" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>

    <h3 className="pfm-title">Confirm Selection</h3>
    <p className="pfm-sub">Are you sure you want to select this path?</p>
    <span className="pfm-tag pfm-tag--lg">
      {modalPath.nameOfPath || modalPath.name}
    </span>

    <div className="pfm-btns">
      <button
        className="pfm-btn pfm-btn--primary"
        onClick={handleConfirmSelect}
        disabled={confirmLoading}
      >
        {confirmLoading ? "Confirming…" : "Yes, Select"}
      </button>
      <button
        className="pfm-btn pfm-btn--ghost"
        onClick={() => setModalStep(pathSteps.length ? "explore" : "view")}
      >
        ← Cancel
      </button>
    </div>
  </div>
)}

      {/* ── SUCCESS MODAL ── */}
      {modalStep === "success" && modalPath && (
        <div className="path-flow-modal">
          <button className="pfm-close" onClick={closeModal}>✕</button>

          <div className="pfm-icon pfm-icon--success">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
</div>
          <h3 className="pfm-title pfm-title--success">Congratulations!</h3>
          <p className="pfm-sub">You've successfully enrolled in:</p>
          <span className="pfm-tag pfm-tag--lg">
            {modalPath.nameOfPath || modalPath.name}
          </span>
          <small className="pfm-redirect">Redirecting to My Journey…</small>
        </div>
      )}

      {/* ─── COORDINATES RIGHT SIDEBAR ─── */}
      {coordsOpen && (
        <div className="coords-overlay" onClick={() => setCoordsOpen(false)} />
      )}
      <div className={`coords-sidebar ${coordsOpen ? "coords-sidebar--open" : ""}`}>
        <div className="coords-sidebar__header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* ── Education icon ── */}
            <div className="coords-sidebar__icon">
              <img
                src={educationIcon}
                alt="Education"
                width="32"
                height="32"
              />
            </div>
            <div>
              <p className="coords-sidebar__label">Education</p>
              <h3 className="coords-sidebar__title">My Coordinates</h3>
            </div>
          </div>
          <button className="coords-sidebar__close" onClick={() => setCoordsOpen(false)}>✕</button>
        </div>

        <span className="coords-sidebar__hint" style={{ display: 'block' }}>
          Toggle filters to personalise your path recommendations.
        </span>

        <div className="coords-list">
          {coordinates.map(({ label, value, toggle, setToggle }) => (
            <div className="coord-row" key={label}>
              <div className="coord-row__left">
                <span className="coord-row__label">{label}</span>
                <span className="coord-row__value">{value || "Not set"}</span>
              </div>
              <button
                className={`toggle-pill ${toggle ? "toggle-pill--on" : ""}`}
                onClick={() => setToggle(!toggle)}
                aria-pressed={toggle}
              >
                <span className="toggle-pill__knob" />
              </button>
            </div>
          ))}
        </div>

        <button
          className="btn-primary coords-sidebar__apply"
          onClick={() => {
            setRefetchPaths(!refetchPaths);
            setCoordsOpen(false);
          }}
        >
          Apply & Find Paths
        </button>
      </div>
    </div>
  );
};

export default PathComponent;