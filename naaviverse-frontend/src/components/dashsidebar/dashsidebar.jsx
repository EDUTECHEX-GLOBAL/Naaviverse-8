import React, { useState } from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import history from "./history.svg";

const sidebarMenu1 = [
  { id: 0, title: "Paths", path: "/dashboard/users/paths" },
];

const sidebarMenu2 = [
  { id: 0, title: "My Journey",   path: "/dashboard/users/my-journey" },
  { id: 1, title: "Current Step", path: "/dashboard/users/current-step" },
  { id: 2, title: "Transactions", path: "/dashboard/users/transactions" },
  { id: 3, title: "Wallet",       path: "/dashboard/users/wallet" },
];

const Dashsidebar = ({ isNotOnMainPage, handleChange, approvalStatus, isProfileIncomplete }) => {
  const { sideNav, setsideNav } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imgError, setImgError] = useState(false);

  // ✅ NEW: mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  const isApprovalLocked = approvalStatus === "pending" || approvalStatus === "rejected";
  const isLocked = isApprovalLocked || !!isProfileIncomplete;
  const isOnProfilePage = location.pathname === "/dashboard/users/profile";

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
      const parsed = JSON.parse(raw);
      // ✅ Handle both { user: {...} } and flat { name, email, ... }
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const userDetails = getUserFromStorage();

  const rawName = userDetails?.name || userDetails?.fullName  || localStorage.getItem("userName")|| "";
  const firstName = rawName
    ? rawName.split(" ")[0]
    : (userDetails?.email || "User").split("@")[0];
  const initials = firstName.charAt(0).toUpperCase() || "U";

  const profilePic = localStorage.getItem("userProfilePic")
    || userDetails?.profilePicture
    || userDetails?.profilePicURL
    || null;

  // ✅ Close drawer after navigation on mobile
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
    setMobileOpen(false); // close drawer on mobile
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
    setMobileOpen(false); // close drawer on mobile
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setShowUserMenu(false);
  };

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HAMBURGER BUTTON — mobile only, always visible
      ══════════════════════════════════════════════════════════════ */}
      <button
        className={`mobile-menu-btn ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE BACKDROP — tap outside to close
      ══════════════════════════════════════════════════════════════ */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={closeMobile}
      />

      {/* ══════════════════════════════════════════════════════════════
          PROFILE INCOMPLETE OVERLAY
      ══════════════════════════════════════════════════════════════ */}
      {isProfileIncomplete && !isOnProfilePage && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 31, 61, 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          zIndex: 9990,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "24px",
            padding: "48px 32px",
            maxWidth: "440px",
            width: "88%",
            textAlign: "center",
            boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
            border: "1.5px solid #e2e8f0",
          }}>
            <div style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0d9488, #0f766e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 22px",
              fontSize: "30px",
              boxShadow: "0 8px 24px rgba(13,148,136,0.30)",
            }}>
              👤
            </div>
            <div style={{
              fontSize: "21px",
              fontWeight: "700",
              color: "#0f1f3d",
              marginBottom: "10px",
              letterSpacing: "-0.3px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Complete Your Profile First
            </div>
            <div style={{
              width: "44px",
              height: "3px",
              borderRadius: "4px",
              background: "linear-gradient(90deg, #0d9488, #6366f1)",
              margin: "0 auto 16px",
            }} />
            <div style={{
              fontSize: "14px",
              color: "#64748b",
              lineHeight: "1.75",
              marginBottom: "28px",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              You need to complete all <strong>3 levels</strong> of your
              Naavi profile before accessing the platform.
            </div>
            <div
              onClick={() => {
                navigate("/dashboard/users/profile");
                setShowUserMenu(false);
                setMobileOpen(false);
              }}
              style={{
                display: "inline-block",
                padding: "13px 36px",
                borderRadius: "30px",
                background: "linear-gradient(135deg, #0d9488, #0f766e)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: "700",
                cursor: "pointer",
                marginBottom: "16px",
                boxShadow: "0 4px 16px rgba(13,148,136,0.35)",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Complete Profile →
            </div>
            <div>
              <span
                onClick={handleLogout}
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Log out instead
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          SIDEBAR
          desktop: static in flex row
          mobile:  fixed drawer, slides in/out
      ══════════════════════════════════════════════════════════════ */}
      <div
        className={`dashboard-sidebar1 ${mobileOpen ? "mobile-open" : ""}`}
      >

        {/* ── LOGO ── */}
        <div className="logo-border">
          <div
            className="dashboard-left"
            onClick={() => {
              if (isLocked) return;
              setsideNav("Paths");
              navigate("/dashboard/users/paths");
              setMobileOpen(false);
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
                  opacity: isLocked ? 0.35 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  pointerEvents: isLocked ? "none" : "auto",
                  userSelect: "none",
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
                  opacity: isLocked ? 0.35 : 1,
                  cursor: isLocked ? "not-allowed" : "pointer",
                  pointerEvents: isLocked ? "none" : "auto",
                  userSelect: "none",
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
                    setMobileOpen(false);
                  }}
                >
                  Open
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── USER POPUP MENU ── */}
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
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </span>
                Log out
              </div>
            </div>
          </>
        )}

        {/* ── BOTTOM USER STRIP ── */}
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
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                objectFit: "cover",
                flexShrink: 0,
                border: "2px solid #e2e8f0",
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