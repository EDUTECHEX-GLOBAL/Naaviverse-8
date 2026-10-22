import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  FiCompass,
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLayers,
  FiArrowRight,
  FiArrowLeft,
  FiX,
  FiInfo,
  FiBookmark,
  FiEye,
  FiAward,
  FiBriefcase,
  FiBookOpen,
  FiUser,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import "./UserPathRequestModal.scss";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4545";

const SECTORS = [
  "Computer Science & AI",
  "Engineering & Technology",
  "Higher Education",
  "Business & Management",
  "Data Science & Analytics",
  "Healthcare & Medicine",
  "Arts & Creative Design",
  "Law & Public Policy",
  "Natural Sciences",
  "Finance & Economics",
];

const EDUCATION_LEVELS = [
  "High School / K-12",
  "Undergraduate (Bachelor's)",
  "Postgraduate (Master's / PhD)",
  "Career Transition / Professional",
];

const TIMELINES = [
  "6 Months",
  "1 Year",
  "2 Years",
  "3 Years",
  "4 Years",
  "Flexible / Self-Paced",
];

// Clean, compact and responsive in-DOM dropdown for desktop & mobile
const CustomSelect = ({ value, onChange, options = [], placeholder = "Select" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`upr-custom-select-wrapper ${isOpen ? "is-open" : ""}`} ref={dropdownRef}>
      <button
        type="button"
        className={`upr-custom-select-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="upr-trigger-text">{value || placeholder}</span>
        <svg
          className={`upr-select-arrow ${isOpen ? "open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="upr-custom-select-menu" role="listbox">
          {options.map((opt) => {
            const isSelected = String(opt) === String(value);
            return (
              <div
                key={opt}
                className={`upr-custom-select-option ${isSelected ? "selected" : ""}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                <span>{opt}</span>
                {isSelected && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Helper to format step title cleanly without duplicate "Step 1: Step 1:"
const formatStepTitle = (rawName, idx) => {
  if (!rawName) return `Step ${idx + 1}`;
  const stripped = rawName.replace(/^Step\s*\d+\s*[:\-–]\s*/i, "").trim();
  return `Step ${idx + 1}: ${stripped || rawName}`;
};

export default function UserPathRequestModal({
  isOpen,
  onClose,
  initialGoal = "",
  userProfile = null,
  onSelectCreatedPath,
  initialTab = "request",
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // "request" | "my_requests"
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [targetGoal, setTargetGoal] = useState(initialGoal);
  const [targetInstitution, setTargetInstitution] = useState("");
  const [sector, setSector] = useState("Computer Science & AI");
  const [educationLevel, setEducationLevel] = useState("Undergraduate (Bachelor's)");
  const [targetTimeline, setTargetTimeline] = useState("4 Years");
  const [goalDetails, setGoalDetails] = useState("");
  const [mandatoryRequirements, setMandatoryRequirements] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [selectingPathId, setSelectingPathId] = useState(null);

  // Path Preview State (View Path)
  const [previewRequest, setPreviewRequest] = useState(null);
  const [previewPathData, setPreviewPathData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [previewActiveStepIdx, setPreviewActiveStepIdx] = useState(0);
  const [previewActiveViewKey, setPreviewActiveViewKey] = useState("macro");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  })();

  const userEmail = user?.email || userProfile?.email || "";
  const userName =
    user?.displayName ||
    userProfile?.displayName ||
    userProfile?.name ||
    user?.username ||
    "Student";

  // Pre-fill targetGoal when prop updates
  useEffect(() => {
    if (initialGoal) {
      setTargetGoal(initialGoal);
      if (/stanford/i.test(initialGoal)) {
        setTargetInstitution("Stanford University");
      } else if (/harvard/i.test(initialGoal)) {
        setTargetInstitution("Harvard University");
      } else if (/mit/i.test(initialGoal)) {
        setTargetInstitution("MIT");
      } else if (/university/i.test(initialGoal)) {
        const match = initialGoal.match(/([a-zA-Z\s]+University)/i);
        if (match) setTargetInstitution(match[1].trim());
      }
    }
  }, [initialGoal]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load user requests
  const fetchMyRequests = useCallback(async () => {
    if (!userEmail) return;
    try {
      setLoadingRequests(true);
      const res = await axios.get(`${BASE_URL}/api/path-requests/my-requests`, {
        params: { email: userEmail },
      });
      if (res.data?.status) {
        setMyRequests(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch path requests:", err);
    } finally {
      setLoadingRequests(false);
    }
  }, [userEmail]);

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
      setSubmittedSuccess(false);
      setErrorMsg("");
      setPreviewRequest(null);
      setPreviewPathData(null);
    }
  }, [isOpen, fetchMyRequests]);

  const handleModalClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!targetGoal.trim()) {
      setErrorMsg("Please specify your desired Path Title or Target Goal.");
      return;
    }

    if (!goalDetails.trim()) {
      setErrorMsg("Please provide your Goal Details & Focus Areas.");
      return;
    }

    if (!userEmail) {
      setErrorMsg("User email is required. Please make sure you are logged in.");
      return;
    }

    try {
      setLoadingSubmit(true);
      const payload = {
        userEmail,
        userName,
        userId: user?.id || user?._id || userProfile?._id || null,
        targetGoal: targetGoal.trim(),
        targetInstitution: targetInstitution.trim(),
        sector,
        educationLevel,
        targetTimeline,
        goalDetails: goalDetails.trim(),
        mandatoryRequirements: mandatoryRequirements.trim(),
        specialInstructions: specialInstructions.trim(),
      };

      const res = await axios.post(`${BASE_URL}/api/path-requests/create`, payload);

      if (res.data?.status) {
        if (res.data.isExisting) {
          setActiveTab("my_requests");
          fetchMyRequests();
          return;
        }
        setSubmittedSuccess(true);
        fetchMyRequests();
      } else {
        setErrorMsg(res.data?.message || "Failed to submit request.");
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || err.message || "An error occurred while submitting."
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  // View Path Preview Handler (strictly inspects without enrolling)
  const handleOpenPathPreview = async (req) => {
    if (!req.createdPathId) return;
    setPreviewRequest(req);
    setPreviewPathData(null);
    setPreviewError("");
    setLoadingPreview(true);
    setPreviewActiveStepIdx(0);
    setPreviewActiveViewKey("macro");

    try {
      const res = await axios.get(`${BASE_URL}/api/userpaths/steps?pathId=${req.createdPathId}`);
      if (res.data?.status && res.data.data) {
        setPreviewPathData(res.data.data);
      } else {
        setPreviewError(res.data?.message || "Unable to load pathway details.");
      }
    } catch (err) {
      setPreviewError(
        err.response?.data?.message ||
          err.message ||
          "Failed to fetch pathway preview. The pathway may still be finalizing."
      );
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewRequest(null);
    setPreviewPathData(null);
    setPreviewError("");
  };

  const readyToSelectCount = myRequests.filter((r) => r.status === "created").length;

  return (
    <div className="upr-modal-backdrop" onClick={handleModalClose}>
      <div
        className="upr-modal-window"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="upr-modal-header">
          <div className="upr-header-left">
            <div className="upr-header-icon">
              <FiCompass />
            </div>
            <div className="upr-header-titles">
              <h3>Custom Path Request</h3>
              <p>
                Can't find your target university or degree? Request a personalized pathway curated by Super Admin.
              </p>
            </div>
          </div>
          <button className="upr-close-btn" onClick={handleModalClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* Tab switcher (hidden if viewing path preview) */}
        {!previewRequest && (
          <div className="upr-nav-tabs">
            <button
              className={`upr-tab-btn ${activeTab === "request" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("request");
                setSubmittedSuccess(false);
              }}
            >
              <FiCompass /> Request New Path
            </button>
            <button
              className={`upr-tab-btn ${activeTab === "my_requests" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("my_requests");
                fetchMyRequests();
              }}
            >
              <FiBookmark /> My Requests
              {myRequests.length > 0 && (
                <span className={`upr-badge ${readyToSelectCount > 0 ? "ready-alert" : ""}`}>
                  {readyToSelectCount > 0 ? `${readyToSelectCount} Ready!` : myRequests.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Body */}
        <div className="upr-modal-body">
          {previewRequest ? (
            /* ── VIEW PATH PREVIEW SCREEN ── */
            <div className="upr-preview-container">
              <div className="upr-preview-top-bar">
                <button
                  type="button"
                  className="upr-btn upr-btn--ghost upr-btn--sm"
                  onClick={handleClosePreview}
                >
                  <FiArrowLeft /> Back to My Requests
                </button>
                <span className="upr-preview-badge">
                  <FiCheckCircle /> Ready for Enrollment
                </span>
              </div>

              {loadingPreview ? (
                <div className="upr-preview-loading">
                  <div className="pfm-spinner" />
                  <span>Loading full pathway details and learning views...</span>
                </div>
              ) : previewError ? (
                <div className="upr-preview-error">
                  <FiAlertCircle />
                  <p>{previewError}</p>
                  <button
                    type="button"
                    className="upr-btn upr-btn--ghost"
                    onClick={handleClosePreview}
                  >
                    Return to My Requests
                  </button>
                </div>
              ) : previewPathData ? (
                (() => {
                  const p = previewPathData.path || previewPathData;
                  const stList = previewPathData.steps || p.steps || [];
                  const activeStep = stList[previewActiveStepIdx] || stList[0] || {};
                  const viewKey = previewActiveViewKey; // "macro" | "micro" | "nano"

                  const formattedTitle = formatStepTitle(activeStep.name, previewActiveStepIdx);

                  const viewName =
                    activeStep[`${viewKey}_name`] ||
                    activeStep[viewKey]?.name ||
                    activeStep.name ||
                    `Step ${previewActiveStepIdx + 1}`;
                  const viewDesc =
                    activeStep[`${viewKey}_description`] ||
                    activeStep[viewKey]?.desc ||
                    activeStep.description ||
                    "";
                  const viewInstructions =
                    activeStep[`${viewKey}_instructions`] ||
                    activeStep[viewKey]?.instructions ||
                    "";
                  const viewDuration =
                    activeStep[`${viewKey}_length`] ||
                    activeStep[viewKey]?.duration ||
                    activeStep.duration ||
                    "";
                  const viewAccess =
                    activeStep[`${viewKey}_access`] ||
                    activeStep[viewKey]?.access ||
                    "free";
                  const viewMarketplace =
                    activeStep[`${viewKey}_marketplace`] ||
                    activeStep[viewKey]?.marketplace ||
                    [];

                  return (
                    <div className="upr-preview-content">
                      {/* Pathway Hero Overview - Soft Lavender/Indigo Pastel Card */}
                      <div className="upr-preview-hero">
                        <div className="hero-main">
                          <h3>{p.nameOfPath || p.name || previewRequest.targetGoal}</h3>
                          <p>{p.description || previewRequest.goalDetails}</p>
                        </div>
                        <div className="hero-meta-chips">
                          {p.destination_institution && (
                            <span className="chip"><FiBookOpen /> {p.destination_institution}</span>
                          )}
                          {p.destination_degree && (
                            <span className="chip"><FiAward /> {p.destination_degree}</span>
                          )}
                          {p.program && <span className="chip"><FiLayers /> {p.program}</span>}
                          {p.sector && <span className="chip"><FiBriefcase /> {p.sector}</span>}
                          {(p.duration?.years || p.length) && (
                            <span className="chip">
                              <FiClock /> {p.duration?.years ? `${p.duration.years} Years` : `${p.length} Days`}
                            </span>
                          )}
                          <span className="chip chip-curated">
                            <FiCheckCircle /> {stList.length} Curated Milestones
                          </span>
                        </div>
                      </div>

                      {/* Step Navigation Tabs */}
                      <div className="upr-preview-steps-bar">
                        <span className="steps-bar-title">Curated Milestones:</span>
                        <div className="steps-pill-list">
                          {stList.map((st, sIdx) => {
                            const pillTitle = formatStepTitle(st.name, sIdx);
                            return (
                              <button
                                key={sIdx}
                                type="button"
                                className={`step-nav-btn ${previewActiveStepIdx === sIdx ? "active" : ""}`}
                                onClick={() => setPreviewActiveStepIdx(sIdx)}
                              >
                                <span className="num">{sIdx + 1}</span>
                                <span className="name">{pillTitle}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Step Details & 3 Learning Views */}
                      <div className="upr-preview-step-card">
                        <div className="step-card-header">
                          <div className="step-header-left">
                            <span className="step-order-badge">Milestone {previewActiveStepIdx + 1}</span>
                            <h4 className="step-title-text">{formattedTitle}</h4>
                          </div>
                          {activeStep.duration && (
                            <span className="step-dur-badge">
                              <FiClock /> {activeStep.duration}
                            </span>
                          )}
                        </div>

                        {activeStep.description && (
                          <div className="upr-pastel-block upr-pastel-slate">
                            <div className="block-label"><FiInfo /> Milestone Overview</div>
                            <div className="block-content">{activeStep.description}</div>
                          </div>
                        )}

                        {/* 3 Learning Views Tabs */}
                        <div className="upr-learning-views-tabs">
                          {[
                            { key: "macro", label: "Macro View", tag: "Foundational / Free" },
                            { key: "micro", label: "Micro View", tag: "Intermediate / Structured" },
                            { key: "nano", label: "Nano View", tag: "Advanced / Expert" },
                          ].map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              className={`view-tab-btn view-${v.key} ${previewActiveViewKey === v.key ? "active" : ""}`}
                              onClick={() => setPreviewActiveViewKey(v.key)}
                            >
                              <strong>{v.label}</strong>
                              <span>{v.tag}</span>
                            </button>
                          ))}
                        </div>

                        {/* View Content Display - Pastel Sections */}
                        <div className="upr-view-display">
                          {/* Access Tier & Duration Pastel Row */}
                          <div className="upr-pastel-meta-bar">
                            <div className="meta-left">
                              <span className="view-title-pill">{viewName}</span>
                              <span className={`access-pill access-${viewAccess.toLowerCase()}`}>
                                <FiCheckCircle /> {viewAccess.toUpperCase()} ACCESS
                              </span>
                            </div>
                            {viewDuration && (
                              <span className="dur-badge">
                                <FiClock /> Duration: {viewDuration}
                              </span>
                            )}
                          </div>

                          {/* Overview Pastel Box */}
                          {viewDesc && (
                            <div className="upr-pastel-block upr-pastel-indigo">
                              <div className="block-label"><FiInfo /> Overview</div>
                              <div className="block-content">{viewDesc}</div>
                            </div>
                          )}

                          {/* Focus Objectives & Guidance Pastel Box */}
                          {viewInstructions && (
                            <div className="upr-pastel-block upr-pastel-fuchsia">
                              <div className="block-label"><FiCompass /> Focus Objectives & Guidance</div>
                              <div className="block-content">{viewInstructions}</div>
                            </div>
                          )}

                          {/* Marketplace Recommendations if any */}
                          {Array.isArray(viewMarketplace) && viewMarketplace.length > 0 && (
                            <div className="upr-pastel-block upr-pastel-market">
                              <div className="block-label">
                                <FiShoppingBag /> Recommended Marketplace Resources ({viewMarketplace.length})
                              </div>
                              <div className="upr-market-cards-grid">
                                {viewMarketplace.map((item, mIdx) => {
                                  const cat = (item.role || item.category || "vendor").toLowerCase();
                                  return (
                                    <div key={mIdx} className={`upr-market-card card-${cat}`}>
                                      <div className="mc-top">
                                        <span className="mc-role">
                                          {cat === "mentor" ? <FiUser /> : cat === "distributor" ? <FiTrendingUp /> : cat === "institution" ? <FiAward /> : <FiShoppingBag />}
                                          {item.role || item.category || "Vendor"}
                                        </span>
                                        <span className="mc-cost">{item.cost || "Free"}</span>
                                      </div>
                                      <strong className="mc-name">{item.name}</strong>
                                      {item.duration && (
                                        <span className="mc-dur"><FiClock /> {item.duration}</span>
                                      )}
                                      {item.goal && <p className="mc-goal">{item.goal}</p>}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Super Admin Response Notes if present */}
                      {previewRequest.adminNotes && (
                        <div className="upr-pastel-block upr-pastel-admin-note">
                          <div className="block-label">
                            <FiCheckCircle /> Super Admin Feedback & Note
                          </div>
                          <div className="block-content">{previewRequest.adminNotes}</div>
                        </div>
                      )}

                      {/* Preview Action Footer */}
                      <div className="upr-preview-actions-footer">
                        <button
                          type="button"
                          className="upr-btn upr-btn--ghost"
                          onClick={handleClosePreview}
                        >
                          <FiArrowLeft /> Back to My Requests
                        </button>
                        <button
                          type="button"
                          className="upr-btn upr-btn--success"
                          disabled={selectingPathId === previewRequest.createdPathId}
                          onClick={async () => {
                            if (onSelectCreatedPath) {
                              setSelectingPathId(previewRequest.createdPathId);
                              try {
                                await onSelectCreatedPath(
                                  previewRequest.createdPathId,
                                  previewRequest.createdPathName || previewRequest.targetGoal
                                );
                              } finally {
                                setSelectingPathId(null);
                              }
                            }
                          }}
                        >
                          {selectingPathId === previewRequest.createdPathId
                            ? "Enrolling..."
                            : "Select & Continue with Path"}{" "}
                          <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>
          ) : activeTab === "request" ? (
            submittedSuccess ? (
              <div className="upr-success-splash">
                <div className="splash-icon">
                  <FiCheckCircle />
                </div>
                <h3>Request Sent to Super Admin!</h3>
                <p>
                  Your custom path request for <strong>"{targetGoal}"</strong> has been logged.
                  Our Super Admin curation team will configure the milestones, prerequisites, and resource catalog for you.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button
                    className="upr-btn upr-btn--primary"
                    onClick={() => {
                      setActiveTab("my_requests");
                      setSubmittedSuccess(false);
                      fetchMyRequests();
                    }}
                  >
                    View Status in My Requests
                  </button>
                  <button className="upr-btn upr-btn--ghost" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="upr-form">
                {errorMsg && (
                  <div className="upr-error-alert">
                    <FiAlertCircle /> {errorMsg}
                  </div>
                )}

                <div className="upr-form-grid">
                  {/* 1. Target Goal / Path Title (Full Width) */}
                  <div className="upr-field upr-col-full">
                    <label>
                      <span className="label-title">
                        Target Goal / Path Title <span className="required-star">*</span>
                      </span>
                      <span className="hint-text">(e.g. Stanford University - Computer Science)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University - Computer Science"
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      required
                    />
                  </div>

                  {/* 2. Target Institution (Col 1) */}
                  <div className="upr-field">
                    <label>
                      <span className="label-title">Target Institution / University</span>
                      <span className="hint-text">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={targetInstitution}
                      onChange={(e) => setTargetInstitution(e.target.value)}
                    />
                  </div>

                  {/* 3. Domain / Sector (Col 2 — dropdown only, no duplicate pills) */}
                  <div className="upr-field">
                    <label>
                      <span className="label-title">
                        Domain / Sector <span className="required-star">*</span>
                      </span>
                    </label>
                    <CustomSelect
                      value={sector}
                      onChange={(val) => setSector(val)}
                      options={SECTORS}
                      placeholder="Select sector"
                    />
                  </div>

                  {/* 4. Education Stage (Col 1) */}
                  <div className="upr-field">
                    <label>
                      <span className="label-title">Current / Target Stage</span>
                    </label>
                    <CustomSelect
                      value={educationLevel}
                      onChange={(val) => setEducationLevel(val)}
                      options={EDUCATION_LEVELS}
                      placeholder="Select stage"
                    />
                  </div>

                  {/* 5. Target Timeline (Col 2) */}
                  <div className="upr-field">
                    <label>
                      <span className="label-title">Expected Timeline / Duration</span>
                    </label>
                    <CustomSelect
                      value={targetTimeline}
                      onChange={(val) => setTargetTimeline(val)}
                      options={TIMELINES}
                      placeholder="Select timeline"
                    />
                  </div>

                  {/* 6. Goal Details & Focus Areas (Full Width) */}
                  <div className="upr-field upr-col-full">
                    <label>
                      <span className="label-title">
                        Goal Details & Focus Areas <span className="required-star">*</span>
                      </span>
                    </label>
                    <textarea
                      placeholder="Describe what you want to achieve (e.g., Focus on Artificial Intelligence & Systems, admission requirements, portfolio project guidance, and graduate school preparation)..."
                      value={goalDetails}
                      onChange={(e) => setGoalDetails(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  {/* 7. Mandatory Prerequisites / Requirements (Full Width) */}
                  <div className="upr-field upr-col-full">
                    <label>
                      <span className="label-title">Mandatory Prerequisites / Requirements</span>
                      <span className="hint-text">(e.g. SAT 1500+, AP Calculus, GPA 3.8, Portfolio)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SAT score 1500+, AP Computer Science, GPA 3.8+ or Equivalent"
                      value={mandatoryRequirements}
                      onChange={(e) => setMandatoryRequirements(e.target.value)}
                    />
                  </div>

                  {/* 8. Special Instructions / Preferences (Full Width) */}
                  <div className="upr-field upr-col-full">
                    <label>
                      <span className="label-title">Special Instructions / Preferences</span>
                      <span className="hint-text">(Optional: accreditation, budget preferences, timeline flexibility)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prefer online accredited courses, focus on scholarship pathways, etc."
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                  </div>

                  {/* Requester Summary Note */}
                  <div className="upr-col-full upr-requester-note">
                    <FiInfo style={{ color: "#4f46e5", flexShrink: 0, fontSize: 15 }} />
                    <span>
                      Submitting as <strong>{userName}</strong> (<code>{userEmail || "No Email"}</code>).
                      Super Admin will review and notify you when the pathway is live.
                    </span>
                  </div>
                </div>

                <div className="upr-modal-footer">
                  <div className="upr-footer-note">
                    <FiClock /> Turnaround: typically within 24-48 hours.
                  </div>
                  <div className="upr-actions">
                    <button type="button" className="upr-btn upr-btn--ghost" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="upr-btn upr-btn--primary"
                      disabled={loadingSubmit}
                    >
                      <FiSend /> {loadingSubmit ? "Submitting…" : "Submit Path Request"}
                    </button>
                  </div>
                </div>
              </form>
            )
          ) : (
            /* ── MY REQUESTS VIEW ── */
            <div className="upr-requests-list">
              {loadingRequests ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#94a3b8" }}>
                  <div className="pfm-spinner" style={{ margin: "0 auto 0.75rem" }} />
                  <span style={{ fontSize: "13px" }}>Loading your path requests…</span>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="upr-empty-requests">
                  <div className="upr-empty-icon">
                    <FiCompass />
                  </div>
                  <h4>No Custom Path Requests Yet</h4>
                  <p>
                    Can't find what you're looking for? Submit a request and our Super Admin team will design the pathway.
                  </p>
                  <button
                    className="upr-btn upr-btn--primary"
                    onClick={() => setActiveTab("request")}
                  >
                    Request a Path Now
                  </button>
                </div>
              ) : (
                myRequests.map((req) => {
                  const isCreated = req.status === "created";
                  const isPending = req.status === "pending";
                  const isInProgress = req.status === "in_progress";

                  return (
                    <div
                      key={req._id || req.requestId}
                      className={`upr-request-card status-${req.status}`}
                    >
                      <div className="upr-rc-top">
                        <span className="upr-rc-id">{req.requestId || "REQUEST"}</span>
                        <span className={`upr-status-pill status-${req.status}`}>
                          {isCreated && <FiCheckCircle />}
                          {isPending && <FiClock />}
                          {isInProgress && <FiLayers />}
                          {req.status === "created"
                            ? "Ready & Created"
                            : req.status === "in_progress"
                            ? "Designing Pathway"
                            : req.status === "rejected"
                            ? "Declined"
                            : "Pending Review"}
                        </span>
                      </div>

                      <h4 className="upr-rc-title">{req.targetGoal}</h4>

                      <div className="upr-rc-meta">
                        {req.sector && (
                          <span className="upr-meta-chip"><FiBriefcase /> {req.sector}</span>
                        )}
                        {req.targetInstitution && (
                          <span className="upr-meta-chip"><FiBookOpen /> {req.targetInstitution}</span>
                        )}
                        {req.educationLevel && (
                          <span className="upr-meta-chip"><FiAward /> {req.educationLevel}</span>
                        )}
                        {req.targetTimeline && (
                          <span className="upr-meta-chip"><FiClock /> {req.targetTimeline}</span>
                        )}
                      </div>

                      {req.goalDetails && (
                        <div className="upr-rc-desc">
                          <strong>Goal & Details:</strong> {req.goalDetails}
                        </div>
                      )}

                      {req.mandatoryRequirements && (
                        <div className="upr-rc-prereq">
                          <strong>Mandatory Prerequisites:</strong> {req.mandatoryRequirements}
                        </div>
                      )}

                      {/* Admin Note if fulfilled, replied, or rejected */}
                      {req.adminNotes && (
                        <div className={`upr-admin-response ${req.status === "rejected" ? "upr-admin-response--rejected" : ""}`}>
                          <div className="response-header">
                            {req.status === "rejected" ? (
                              <><FiAlertCircle /> Super Admin Feedback</>
                            ) : (
                              <><FiCheckCircle /> Super Admin Response</>
                            )}
                          </div>
                          <p>{req.adminNotes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="upr-rc-footer">
                        <span className="request-date">
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </span>

                        {isCreated && req.createdPathId && (
                          <div className="upr-rc-actions-pair">
                            <button
                              type="button"
                              className="upr-btn upr-btn--outline"
                              onClick={() => handleOpenPathPreview(req)}
                            >
                              <FiEye /> View Path
                            </button>
                            <button
                              type="button"
                              className="upr-btn upr-btn--success"
                              disabled={selectingPathId === req.createdPathId}
                              onClick={async () => {
                                if (onSelectCreatedPath) {
                                  setSelectingPathId(req.createdPathId);
                                  try {
                                    await onSelectCreatedPath(
                                      req.createdPathId,
                                      req.createdPathName || req.targetGoal
                                    );
                                  } finally {
                                    setSelectingPathId(null);
                                  }
                                }
                              }}
                            >
                              {selectingPathId === req.createdPathId
                                ? "Enrolling..."
                                : "Select & Continue with Path"}{" "}
                              <FiArrowRight />
                            </button>
                          </div>
                        )}

                        {isCreated && !req.createdPathId && (
                          <span style={{ fontSize: "12px", color: "#d97706", fontStyle: "italic" }}>
                            Path created (linking pathway...)
                          </span>
                        )}

                        {req.status === "rejected" && (
                          <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                            Declined by Super Admin
                          </span>
                        )}

                        {!isCreated && req.status !== "rejected" && (
                          <span style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic" }}>
                            {isInProgress
                              ? "Super Admin is actively curating this path"
                              : "Under review by Super Admin"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

