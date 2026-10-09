import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiCompass,
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiLayers,
  FiArrowRight,
  FiX,
  FiInfo,
  FiBookmark,
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
      // Auto-extract institution if query has "University" or "College" or "Stanford"
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
  const fetchMyRequests = async () => {
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
  };

  useEffect(() => {
    if (isOpen) {
      fetchMyRequests();
      setSubmittedSuccess(false);
      setErrorMsg("");
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  const handleSectorQuickClick = (sec) => {
    setSector(sec);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!targetGoal.trim()) {
      setErrorMsg("Please specify your desired Path Title or Target Goal.");
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
        setSubmittedSuccess(true);
        // Refresh list
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

  const readyToSelectCount = myRequests.filter((r) => r.status === "created").length;

  return (
    <div className="upr-modal-backdrop" onClick={onClose}>
      <div
        className={`upr-modal-window ${activeTab === "my_requests" ? "upr-modal-window--wide" : ""}`}
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
          <button className="upr-close-btn" onClick={onClose} aria-label="Close modal">
            <FiX />
          </button>
        </div>

        {/* Tab switcher */}
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

        {/* Body */}
        <div className="upr-modal-body">
          {activeTab === "request" ? (
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
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
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
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      padding: "0.75rem 1rem",
                      borderRadius: "10px",
                      fontSize: "0.825rem",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <FiAlertCircle /> {errorMsg}
                  </div>
                )}

                <div className="upr-form-grid">
                  {/* Target Goal / Title */}
                  <div className="upr-field upr-col-full">
                    <label>
                      Target Goal / Path Title <span className="required-star">*</span>
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

                  {/* Target Institution */}
                  <div className="upr-field">
                    <label>
                      Target Institution / University
                      <span className="hint-text">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stanford University"
                      value={targetInstitution}
                      onChange={(e) => setTargetInstitution(e.target.value)}
                    />
                  </div>

                  {/* Sector / Industry */}
                  <div className="upr-field">
                    <label>
                      Domain / Sector <span className="required-star">*</span>
                    </label>
                    <select value={sector} onChange={(e) => setSector(e.target.value)}>
                      {SECTORS.map((sec) => (
                        <option key={sec} value={sec}>
                          {sec}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Sector Chips */}
                  <div className="upr-col-full" style={{ marginTop: "-0.4rem" }}>
                    <div className="upr-quick-sectors">
                      {SECTORS.slice(0, 5).map((sec) => (
                        <span
                          key={sec}
                          className={`sector-pill ${sector === sec ? "selected" : ""}`}
                          onClick={() => handleSectorQuickClick(sec)}
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Education Stage */}
                  <div className="upr-field">
                    <label>Current / Target Stage</label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    >
                      {EDUCATION_LEVELS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Timeline */}
                  <div className="upr-field">
                    <label>Expected Timeline / Duration</label>
                    <select
                      value={targetTimeline}
                      onChange={(e) => setTargetTimeline(e.target.value)}
                    >
                      {TIMELINES.map((tl) => (
                        <option key={tl} value={tl}>
                          {tl}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Goal Details & Focus Areas */}
                  <div className="upr-field upr-col-full">
                    <label>
                      Goal Details & Focus Areas <span className="required-star">*</span>
                    </label>
                    <textarea
                      placeholder="Describe what you want to achieve (e.g., Focus on Artificial Intelligence & Systems, admission requirements, portfolio project guidance, and graduate school preparation)..."
                      value={goalDetails}
                      onChange={(e) => setGoalDetails(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  {/* Mandatory Requirements / Prerequisites */}
                  <div className="upr-field upr-col-full">
                    <label>
                      Mandatory Prerequisites / Requirements
                      <span className="hint-text">(e.g. SAT 1500+, AP Calculus, GPA 3.8, Portfolio)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SAT score 1500+, AP Computer Science, GPA 3.8+ or Equivalent"
                      value={mandatoryRequirements}
                      onChange={(e) => setMandatoryRequirements(e.target.value)}
                    />
                  </div>

                  {/* Requester Summary */}
                  <div className="upr-col-full upr-requester-note">
                    <FiInfo style={{ color: "#4f46e5", flexShrink: 0, fontSize: 13 }} />
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
            /* My Requests View */
            <div className="upr-requests-list">
              {loadingRequests ? (
                <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "#94a3b8" }}>
                  <div className="pfm-spinner" style={{ margin: "0 auto 0.5rem" }} />
                  <span style={{ fontSize: "11.5px" }}>Loading your path requests…</span>
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
                        {req.sector && <span className="upr-meta-chip">{req.sector}</span>}
                        {req.targetInstitution && (
                          <span className="upr-meta-chip">🏛 {req.targetInstitution}</span>
                        )}
                        {req.educationLevel && (
                          <span className="upr-meta-chip">{req.educationLevel}</span>
                        )}
                        {req.targetTimeline && (
                          <span className="upr-meta-chip">⏱ {req.targetTimeline}</span>
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

                      {/* Admin Note if fulfilled or replied */}
                      {req.adminNotes && (
                        <div className="upr-admin-response">
                          <div className="response-header">
                            <FiCheckCircle /> Super Admin Response
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
                          <button
                            className="upr-btn upr-btn--success"
                            onClick={() => {
                              if (onSelectCreatedPath) {
                                onSelectCreatedPath(req.createdPathId, req.createdPathName || req.targetGoal);
                              }
                            }}
                          >
                            Select & Continue with Path <FiArrowRight />
                          </button>
                        )}

                        {!isCreated && (
                          <span style={{ fontSize: "10.5px", color: "#64748b", fontStyle: "italic" }}>
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
