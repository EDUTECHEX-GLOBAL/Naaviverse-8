import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStore } from "../../components/store/store.ts";
import Dashsidebar from "../../components/dashsidebar/dashsidebar";
import { LoadingAnimation1 } from "../../components/LoadingAnimation1";
import LevelOneModal from "./LevelOneModal";
import LevelTwoModal from "./LevelTwoModal";
import LevelThreeModal from "./LevelThreeModal";
import lg1 from "../login/favicon3.png";
import "./UserProfile.css";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#d97706" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6V12L16 14" strokeLinecap="round" />
  </svg>
);

const XCircleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="#dc2626" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M15 9L9 15M9 9L15 15" strokeLinecap="round" />
  </svg>
);

const updateUserLocalStorage = (status) => {
  try {
    const existing = JSON.parse(localStorage.getItem("user") || "{}");
    localStorage.setItem("user", JSON.stringify({ ...existing, approvalStatus: status }));
  } catch {}
};

const UserProfile = () => {
  const navigate       = useNavigate();
  const { setsideNav } = useStore();

  const [profileData,    setProfileData]    = useState(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [showCreation,   setShowCreation]   = useState(null);
  const [openBox,        setOpenBox]        = useState(null);
  const [editingLevel,   setEditingLevel]   = useState(null);
  const [userDetails,    setUserDetails]    = useState(null);
  const [profileDataId,  setProfileDataId]  = useState(null);

  const [approvalStatus,    setApprovalStatus]    = useState("");
  const [rejectionReason,   setRejectionReason]   = useState("");
  const [isLoadingApproval, setIsLoadingApproval] = useState(true);

  useEffect(() => {
    setsideNav("");
    const user = getUserFromStorage();
    setUserDetails(user);
  }, []);

  useEffect(() => {
    if (userDetails?.email) fetchProfileData();
  }, [userDetails]);

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const email    = userDetails?.email;
      const response = await axios.get(`${BASE_URL}/api/users/get/${email}`);
      const result   = response.data;

      if (result?.status && result?.data) {
        const data = result.data;
        setProfileData(data);
        setProfileDataId(data._id);

        const isComplete =
          data.isProfileCompleted === true ||
          (data.name && data.username && data.phoneNumber &&
           data.school && data.personality);

        setShowCreation(!isComplete);

        if (isComplete) {
          await checkApprovalStatus(email, data);
        } else {
          setApprovalStatus("");
          setIsLoadingApproval(false);
        }
      } else {
        setProfileData(null);
        setShowCreation(true);
        setApprovalStatus("");
        setIsLoadingApproval(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileData(null);
      setShowCreation(true);
      setApprovalStatus("");
      setIsLoadingApproval(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkApprovalStatus = async (email, profile) => {
    setIsLoadingApproval(true);
    try {
      const cached = getUserFromStorage()?.approvalStatus;
      if (cached === "approved") {
        setApprovalStatus("approved");
        updateUserLocalStorage("approved");
        setIsLoadingApproval(false);
        return;
      }

      const res        = await axios.get(
        `${BASE_URL}/api/approvals/status?email=${email}&role=User`
      );
      const liveStatus = res.data?.data?.status;
      const reason     = res.data?.data?.reason
                      || res.data?.data?.rejectionReason || "";

      if (liveStatus === "approved") {
        setApprovalStatus("approved");
        updateUserLocalStorage("approved");
      } else if (liveStatus === "rejected") {
        setRejectionReason(reason);
        setApprovalStatus("rejected");
        updateUserLocalStorage("rejected");
      } else if (liveStatus === "pending") {
        setApprovalStatus("pending");
        updateUserLocalStorage("pending");
      } else {
        try {
          await axios.post(`${BASE_URL}/api/approvals/create`, {
            role:         "User",
            email,
            businessName: profile.name     || "",
            firstName:    profile.name     || "",
            country:      profile.country  || "",
            type:         profile.userType || "Student",
          });
        } catch (e) {
          console.warn("Could not auto-create approval:", e?.message);
        }
        setApprovalStatus("pending");
        updateUserLocalStorage("pending");
      }
    } catch (err) {
      console.warn("Approval API error:", err?.message);
      setApprovalStatus("pending");
      updateUserLocalStorage("pending");
    } finally {
      setIsLoadingApproval(false);
    }
  };

  const handleLevelSaved = async () => {
    setEditingLevel(null);
    await fetchProfileData();
    toast.success("Profile updated successfully!");
  };

  const handleCreationComplete = async () => {
    await fetchProfileData();
  };

  const toggleBox = (level) => {
    if (openBox === level) { setOpenBox(null); setEditingLevel(null); }
    else { setOpenBox(level); setEditingLevel(null); }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading || showCreation === null || isLoadingApproval) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-body">
          <Dashsidebar
            approvalStatus={approvalStatus}
            isProfileIncomplete={true}
          />
          <div className="dashboard-screens">
            <div className="up-loading-container">
              <LoadingAnimation1 icon={lg1} width={200} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Profile creation flow ────────────────────────────────────────────────
  if (showCreation) {
    return (
      <div className="dashboard-main">
        <div className="dashboard-body">
          <Dashsidebar
            approvalStatus={approvalStatus}
            isProfileIncomplete={true}
          />
          <div className="dashboard-screens">
            <ProfileCreationFlow
              userDetails={userDetails}
              existingProfileId={profileDataId}
              onComplete={handleCreationComplete}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Determine if read-only (pending or rejected) ─────────────────────────
  const isReadOnly = approvalStatus === "pending" || approvalStatus === "rejected";

  // ── Top review banner (replaces the old fullscreen overlay) ─────────────
  const ReviewBanner = () => {
    const isPending  = approvalStatus === "pending";
    const isRejected = approvalStatus === "rejected";

    return (
      <div style={{
        background:   isPending ? "#fffbeb" : "#fef2f2",
        border:       `1px solid ${isPending ? "#fde68a" : "#fecaca"}`,
        borderRadius: "12px",
        padding:      "16px 20px",
        marginBottom: "24px",
        display:      "flex",
        alignItems:   "flex-start",
        gap:          "14px",
      }}>
        {/* Icon */}
        <div style={{ flexShrink: 0, marginTop: "2px" }}>
          {isPending ? <ClockIcon /> : <XCircleIcon />}
        </div>

        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize:   "15px",
            fontWeight: "700",
            color:      isPending ? "#92400e" : "#991b1b",
            marginBottom: "4px",
          }}>
            {isPending ? "Profile Under Review" : "Application Not Approved"}
          </div>
          <div style={{
            fontSize:   "13px",
            color:      isPending ? "#b45309" : "#b91c1c",
            lineHeight: "1.6",
          }}>
            {isPending
              ? "Your profile has been submitted and is awaiting admin approval. All fields are read-only until approved. This usually takes 1–2 business days."
              : (rejectionReason
                  ? `Your application was not approved. Reason: ${rejectionReason}`
                  : "Your application was not approved. Please contact support.")}
          </div>
          {/* Support link */}
          <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af" }}>
            Need help?{" "}
            <a href="mailto:support@naavi.com"
              style={{ color: "#59A2DD", textDecoration: "none", fontWeight: "600" }}>
              support@naavi.com
            </a>
          </div>
        </div>

        {/* Status pill */}
        <div style={{
          flexShrink:   0,
          display:      "inline-flex",
          alignItems:   "center",
          gap:          "6px",
          padding:      "6px 14px",
          borderRadius: "30px",
          fontSize:     "12px",
          fontWeight:   "600",
          whiteSpace:   "nowrap",
          background:   isPending ? "#fffbeb" : "#fef2f2",
          color:        isPending ? "#92400e" : "#991b1b",
          border:       `1px solid ${isPending ? "#fde68a" : "#fecaca"}`,
        }}>
          {isPending ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6V12L16 14" strokeLinecap="round" />
              </svg>
              Pending Approval
            </>
          ) : "Not Approved"}
        </div>
      </div>
    );
  };

  // ── Profile accordion cards ──────────────────────────────────────────────
  return (
    <div className="dashboard-main">
      <div className="dashboard-body">
        {/* ✅ isProfileIncomplete=false — approval status controls sidebar locking */}
        <Dashsidebar
          approvalStatus={approvalStatus}
          isProfileIncomplete={false}
        />
        <div className="dashboard-screens">
          <div className="up-profile-container">

            {/* ✅ NEW: Review banner at top when pending/rejected — no more fullscreen overlay */}
            {isReadOnly && <ReviewBanner />}

            <div className="up-page-header">
              <h1 className="up-page-title">My Profile</h1>
              <p className="up-page-sub">
                Your Naavi journey profile — all levels completed
              </p>
            </div>

            <div className="up-cards-stack">

              {/* ── CARD 1 ── */}
              <div className={`up-card ${openBox === 1 ? "up-card--open" : ""}`}>
                <div className="up-card-header" onClick={() => toggleBox(1)}>
                  <div className="up-card-header-left">
                    <div className="up-card-badge up-badge--1">1</div>
                    <div>
                      <div className="up-card-title">Level 1 — Basic Info</div>
                      <div className="up-card-subtitle">Personal & contact details</div>
                    </div>
                  </div>
                  <div className="up-card-header-right">
                    <span className="up-status-chip up-chip--done">✓ Completed</span>
                    <span className={`up-chevron ${openBox === 1 ? "up-chevron--up" : ""}`}>›</span>
                  </div>
                </div>
                {openBox === 1 && (
                  <div className="up-card-body">
                    {editingLevel === 1 ? (
                      <LevelOneModal inline userDetails={userDetails}
                        existingData={profileData}
                        onClose={() => setEditingLevel(null)}
                        onComplete={handleLevelSaved} />
                    ) : (
                      <>
                        <div className="up-info-grid">
                          <InfoItem label="Profile Picture">
                            {profileData.profilePicture ? (
                              <img src={profileData.profilePicture}
                                alt="Profile" className="up-avatar" />
                            ) : (
                              <div className="up-avatar-placeholder">
                                {profileData.name?.charAt(0)?.toUpperCase() || "U"}
                              </div>
                            )}
                          </InfoItem>
                          <InfoItem label="Full Name"   value={profileData.name} />
                          <InfoItem label="Email"       value={profileData.email} />
                          <InfoItem label="Username"    value={profileData.username} />
                          <InfoItem label="User Type"   value={profileData.userType} />
                          <InfoItem label="Phone"       value={profileData.phoneNumber} />
                          <InfoItem label="Country"     value={profileData.country} />
                          <InfoItem label="State"       value={profileData.state} />
                          <InfoItem label="City"        value={profileData.city} />
                          <InfoItem label="Postal Code" value={profileData.postalCode} />
                        </div>
                        {/* ✅ Hide Edit button when read-only (pending/rejected) */}
                        {!isReadOnly && (
                          <button className="up-edit-btn"
                            onClick={() => setEditingLevel(1)}>
                            Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── CARD 2 ── */}
              <div className={`up-card up-card--2 ${openBox === 2 ? "up-card--open" : ""}`}>
                <div className="up-card-header" onClick={() => toggleBox(2)}>
                  <div className="up-card-header-left">
                    <div className="up-card-badge up-badge--2">2</div>
                    <div>
                      <div className="up-card-title">Level 2 — Academic Info</div>
                      <div className="up-card-subtitle">School, grade & financial details</div>
                    </div>
                  </div>
                  <div className="up-card-header-right">
                    <span className="up-status-chip up-chip--done">✓ Completed</span>
                    <span className={`up-chevron ${openBox === 2 ? "up-chevron--up" : ""}`}>›</span>
                  </div>
                </div>
                {openBox === 2 && (
                  <div className="up-card-body">
                    {editingLevel === 2 ? (
                      <LevelTwoModal inline profileDataId={profileDataId}
                        existingData={profileData}
                        onClose={() => setEditingLevel(null)}
                        onComplete={handleLevelSaved} />
                    ) : (
                      <>
                        <div className="up-info-grid">
                          <InfoItem label="School"              value={profileData.school} />
                          <InfoItem label="Grade"               value={profileData.grade} />
                          <InfoItem label="Curriculum"          value={profileData.curriculum} />
                          <InfoItem label="Stream"              value={profileData.stream} />
                          <InfoItem label="Performance"         value={profileData.performance} />
                          <InfoItem label="Financial Situation" value={profileData.financialSituation} />
                          <InfoItem label="LinkedIn"            value={profileData.linkedin} fullWidth />
                        </div>
                        {/* ✅ Hide Edit button when read-only (pending/rejected) */}
                        {!isReadOnly && (
                          <button className="up-edit-btn up-edit-btn--2"
                            onClick={() => setEditingLevel(2)}>
                            Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* ── CARD 3 ── */}
              <div className={`up-card up-card--3 ${openBox === 3 ? "up-card--open" : ""}`}>
                <div className="up-card-header" onClick={() => toggleBox(3)}>
                  <div className="up-card-header-left">
                    <div className="up-card-badge up-badge--3">3</div>
                    <div>
                      <div className="up-card-title">Level 3 — Personality Info</div>
                      <div className="up-card-subtitle">Your interests & personality type</div>
                    </div>
                  </div>
                  <div className="up-card-header-right">
                    <span className="up-status-chip up-chip--done">✓ Completed</span>
                    <span className={`up-chevron ${openBox === 3 ? "up-chevron--up" : ""}`}>›</span>
                  </div>
                </div>
                {openBox === 3 && (
                  <div className="up-card-body">
                    {editingLevel === 3 ? (
                      <LevelThreeModal inline profileDataId={profileDataId}
                        existingData={profileData}
                        onClose={() => setEditingLevel(null)}
                        onComplete={handleLevelSaved} />
                    ) : (
                      <>
                        <div className="up-info-grid">
                          <InfoItem label="Personality Type"
                            value={profileData.personality} fullWidth />
                        </div>
                        {/* ✅ Hide Edit button when read-only (pending/rejected) */}
                        {!isReadOnly && (
                          <button className="up-edit-btn up-edit-btn--3"
                            onClick={() => setEditingLevel(3)}>
                            Edit
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

// ── Info Item ────────────────────────────────────────────────────────────────
const InfoItem = ({ label, value, children, fullWidth }) => (
  <div className={`up-info-item ${fullWidth ? "up-info-item--full" : ""}`}>
    <span className="up-info-label">{label}</span>
    {children
      ? <div className="up-info-value">{children}</div>
      : <span className="up-info-value">{value && value !== "" ? value : "—"}</span>
    }
  </div>
);

// ── Profile Creation Flow ────────────────────────────────────────────────────
const ProfileCreationFlow = ({ userDetails, existingProfileId, onComplete }) => {
  const [step,          setStep]          = useState(1);
  const [profileDataId, setProfileDataId] = useState(existingProfileId || null);

  const handleLevel1Done = (id) => { if (id) setProfileDataId(id); setStep(2); };
  const handleLevel2Done = () => setStep(3);
  const handleLevel3Done = async () => { await onComplete(); };

  const STEP_LABELS = ["Basic Info", "Academic", "Personality"];

  return (
    <div className="up-creation-page">
      <div className="up-creation-modal">
        <div className="up-creation-header">
          <div className="up-creation-logo-row">
            <span className="up-creation-brand">Complete Your Naavi Profile</span>
          </div>
          <p className="up-creation-hint">
            Fill in all 3 steps to unlock your personalised career paths.
          </p>
        </div>

        <div className="up-creation-steps">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`up-step-pill
                ${step === s ? "up-step-pill--active" : ""}
                ${step > s  ? "up-step-pill--done"   : ""}`}>
                <span className="up-step-num">{step > s ? "✓" : s}</span>
                <span className="up-step-label">{STEP_LABELS[s - 1]}</span>
              </div>
              {s < 3 && (
                <div className={`up-step-connector
                  ${step > s ? "up-step-connector--done" : ""}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="up-creation-body">
          {step === 1 && (
            <LevelOneModal inline creation
              userDetails={userDetails}
              existingData={null}
              existingDocId={profileDataId}
              onClose={null}
              onComplete={handleLevel1Done} />
          )}
          {step === 2 && (
            <LevelTwoModal inline creation
              profileDataId={profileDataId}
              existingData={null}
              onClose={null}
              onComplete={handleLevel2Done} />
          )}
          {step === 3 && (
            <LevelThreeModal inline creation
              profileDataId={profileDataId}
              existingData={null}
              onClose={null}
              onComplete={handleLevel3Done} />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;