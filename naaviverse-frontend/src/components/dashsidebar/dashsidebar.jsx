import React, { useState } from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ added useLocation
import { useCoinContextData } from "../../context/CoinContext";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import history from "./history.svg";

const sidebarMenu1 = [
  { id: 0, title: "Paths", path: "/dashboard/users/paths" },
];

const sidebarMenu2 = [
  { id: 0, title: "My Journey",   path: "/dashboard/users/my-journey"   },
  { id: 1, title: "Current Step", path: "/dashboard/users/current-step" },
  { id: 2, title: "Transactions", path: "/dashboard/users/transactions" },
];

const Dashsidebar = ({ isNotOnMainPage, handleChange, approvalStatus, isProfileIncomplete }) => {
  const { sideNav, setsideNav } = useStore();
  const navigate  = useNavigate();
  const location  = useLocation(); // ✅ get current path
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError]         = useState(false);

  // ✅ Two separate lock conditions
  const isApprovalLocked = approvalStatus === "pending" || approvalStatus === "rejected";
  const isLocked         = isApprovalLocked || !!isProfileIncomplete;

  // ✅ Don't show incomplete overlay when already on profile page
  // UserProfile handles the creation form there directly
  const isOnProfilePage  = location.pathname === "/dashboard/users/profile";

  const {
    checkForHistory,
    preLoginHistoryData,
    setPathItemSelected,
    setSelectedPathItem,
    setCurrentStepData,
    setCurrentStepDataLength,
    setCurrentStepDataPathId,
    setTransactionSelected,
    setTransactionData,
  } = useCoinContextData();

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  };

  const userDetails = getUserFromStorage();

  const rawName   = userDetails?.name || userDetails?.fullName || "";
  const firstName = rawName
    ? rawName.split(" ")[0]
    : (userDetails?.email || "User").split("@")[0];
  const initials  = firstName.charAt(0).toUpperCase() || "U";

  const profilePic = localStorage.getItem("userProfilePic")
                  || userDetails?.profilePicture
                  || userDetails?.profilePicURL
                  || null;

  const handleNavigation = (title, path) => {
    if (isLocked) return;
    setCurrentStepData("");
    setCurrentStepDataLength("");
    setCurrentStepDataPathId("");
    setTransactionSelected(false);
    setTransactionData([]);
    setsideNav(title);
    navigate(path);
    setShowUserMenu(false);
  };

  const handleLogout = () => {
    ["authToken", "user", "partner", "userType", "userProfilePic"]
      .forEach((k) => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    setsideNav("User");
    navigate("/dashboard/users/profile");
    setShowUserMenu(false);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          PROFILE INCOMPLETE OVERLAY
          ✅ Only shows on NON-profile pages
          On /profile page — creation form handles it directly
      ══════════════════════════════════════════════════════════════ */}
      {isProfileIncomplete && !isOnProfilePage && (
        <div style={{
          position:             "fixed",
          inset:                0,
          background:           "rgba(15, 31, 61, 0.55)",
          backdropFilter:       "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex:               9990,
          display:              "flex",
          alignItems:           "center",
          justifyContent:       "center",
        }}>
          <div style={{
            background:    "#ffffff",
            borderRadius:  "24px",
            padding:       "48px 52px",
            maxWidth:      "440px",
            width:         "88%",
            textAlign:     "center",
            boxShadow:     "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            border:        "1.5px solid #e2e8f0",
          }}>

            {/* Icon */}
            <div style={{
              width:          "68px",
              height:         "68px",
              borderRadius:   "50%",
              background:     "linear-gradient(135deg, #0d9488, #0f766e)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              margin:         "0 auto 22px",
              fontSize:       "30px",
              boxShadow:      "0 8px 24px rgba(13,148,136,0.30)",
            }}>
              👤
            </div>

            {/* Title */}
            <div style={{
              fontSize:      "21px",
              fontWeight:    "700",
              color:         "#0f1f3d",
              marginBottom:  "10px",
              letterSpacing: "-0.3px",
              fontFamily:    "'DM Sans', sans-serif",
            }}>
              Complete Your Profile First
            </div>

            {/* Divider */}
            <div style={{
              width:        "44px",
              height:       "3px",
              borderRadius: "4px",
              background:   "linear-gradient(90deg, #0d9488, #6366f1)",
              margin:       "0 auto 16px",
            }} />

            {/* Message */}
            <div style={{
              fontSize:     "14px",
              color:        "#64748b",
              lineHeight:   "1.75",
              marginBottom: "28px",
              fontFamily:   "'DM Sans', sans-serif",
            }}>
              You need to complete all <strong>3 levels</strong> of your
              Naavi profile before accessing the platform.
            </div>

            {/* ✅ CTA — navigates to profile page */}
            <div
              onClick={() => {
                navigate("/dashboard/users/profile");
                setShowUserMenu(false);
              }}
              style={{
                display:      "inline-block",
                padding:      "13px 36px",
                borderRadius: "30px",
                background:   "linear-gradient(135deg, #0d9488, #0f766e)",
                color:        "#ffffff",
                fontSize:     "14px",
                fontWeight:   "700",
                cursor:       "pointer",
                marginBottom: "16px",
                boxShadow:    "0 4px 16px rgba(13,148,136,0.35)",
                fontFamily:   "'DM Sans', sans-serif",
              }}
            >
              Complete Profile →
            </div>

            {/* Logout */}
            <div>
              <span
                onClick={handleLogout}
                style={{
                  fontSize:       "13px",
                  color:          "#94a3b8",
                  cursor:         "pointer",
                  textDecoration: "underline",
                  fontFamily:     "'DM Sans', sans-serif",
                }}
              >
                Log out instead
              </span>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR — always above overlay (zIndex: 99999)
      ══════════════════════════════════════════════════════════════ */}
      <div className="dashboard-sidebar1" style={{ position: "relative", zIndex: 99999 }}>

        {/* ── LOGO ── */}
        <div className="logo-border">
          <div
            className="dashboard-left"
            onClick={() => {
              if (isLocked) return;
              setsideNav("Paths");
              navigate("/dashboard/users/paths");
            }}
            style={{ cursor: isLocked ? "default" : "pointer" }}
          >
            <img className="dashboard-logo" src={logo} alt="logo" />
          </div>
        </div>

        {/* ── MENU ── */}
        <div className="sidebar-menu-container">
          <div className="menu-section">
            {sidebarMenu1.map((each) => (
              <div
                key={each.id}
                className={`each-sidenav ${sideNav === each.title ? "active" : ""}`}
                onClick={() => handleNavigation(each.title, each.path)}
                style={{
                  opacity:       isLocked ? 0.35 : 1,
                  cursor:        isLocked ? "not-allowed" : "pointer",
                  pointerEvents: isLocked ? "none" : "auto",
                  userSelect:    "none",
                }}
              >
                {each.title}
              </div>
            ))}
          </div>

          <div className="menu-section">
            {sidebarMenu2.map((ele) => (
              <div
                key={ele.id}
                className={`each-sidenav ${sideNav === ele.title ? "active" : ""}`}
                onClick={() => handleNavigation(ele.title, ele.path)}
                style={{
                  opacity:       isLocked ? 0.35 : 1,
                  cursor:        isLocked ? "not-allowed" : "pointer",
                  pointerEvents: isLocked ? "none" : "auto",
                  userSelect:    "none",
                }}
              >
                {ele.title}
              </div>
            ))}
          </div>

          {checkForHistory && !isLocked && (
            <div className="history-div">
              <div className="history-box">
                <img src={history} alt="history" />
                <div className="history-label">You viewed the following path:</div>
                <div className="history-details">
                  <div className="history-title">
                    {preLoginHistoryData?.destination_institution}
                  </div>
                  <div className="history-program">{preLoginHistoryData?.program}</div>
                  <div className="pathId-text">
                    <span>pathid:</span> {preLoginHistoryData?._id}
                  </div>
                </div>
                <div
                  className="open-btn"
                  onClick={() => {
                    setPathItemSelected(true);
                    setSelectedPathItem(preLoginHistoryData);
                    localStorage.setItem("selectedPath", JSON.stringify(preLoginHistoryData?.nameOfPath));
                    navigate("/dashboard/users/my-journey");
                  }}
                >
                  Open
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── USER POPUP MENU — always clickable ── */}
        {showUserMenu && (
          <>
            <div className="popup-backdrop" onClick={() => setShowUserMenu(false)} />
            <div className="sidebar-user-popup">
              <div className="sup-item" onClick={handleProfileClick}>
                <span className="sup-icon">👤</span>
                Profile
              </div>
              <div className="sup-divider" />
              <div className="sup-item sup-item--logout" onClick={handleLogout}>
                <span className="sup-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                Log out
              </div>
            </div>
          </>
        )}

        {/* ── BOTTOM USER STRIP — always clickable ── */}
        <div
          className={`sidebar-user-strip ${showUserMenu ? "active" : ""}`}
          onClick={() => setShowUserMenu((v) => !v)}
          style={{ cursor: "pointer" }}
        >
          {profilePic && !imgError ? (
            <img
              src={profilePic}
              alt={firstName}
              onError={() => setImgError(true)}
              style={{
                width:        "36px",
                height:       "36px",
                borderRadius: "50%",
                objectFit:    "cover",
                flexShrink:   0,
                border:       "2px solid #e2e8f0",
              }}
            />
          ) : (
            <div className="sus-avatar">{initials}</div>
          )}
          <div className="sus-name">{firstName}</div>
          <div className="sus-dots">•••</div>
        </div>

      </div>
    </>
  );
};

export default Dashsidebar;