import React, { useState, useRef, useEffect } from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import history from "./history.svg";

const NavIcon = ({ type, isActive }) => {
  const iconProps = {
    className: "nav-icon",
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: isActive ? "#2273E6" : "#9ca3af",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "home":
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "paths":
      return (
        <svg {...iconProps}>
          <circle cx="5" cy="18" r="2" />
          <circle cx="19" cy="6" r="2" />
          <path d="M5 16 C5 8, 19 16, 19 8" />
        </svg>
      );
    case "journey":
      // Map pin / route — suits "My Journey"
      return (
        <svg {...iconProps}>
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "current-step":
      // Footsteps / play-next — suits "Current Step"
      return (
        <svg {...iconProps}>
          <polyline points="5 12 12 5 19 12" />
          <path d="M12 5v14" />
          <line x1="8" y1="19" x2="16" y2="19" />
        </svg>
      );
    case "transactions":
      // Two arrows up/down — suits "Transactions"
      return (
        <svg {...iconProps}>
          <polyline points="17 1 21 5 17 9" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <polyline points="7 23 3 19 7 15" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...iconProps}>
          <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
          <circle cx="18" cy="15" r="1" fill="currentColor" />
        </svg>
      );
    default:
      return <svg {...iconProps}><circle cx="12" cy="12" r="10" /></svg>;
  }
};

const sidebarMenu1 = [
  { id: 0, title: "Home",  display: "Home",  icon: "home",  path: "/dashboard/users/home" },
  { id: 1, title: "Paths", display: "Paths", icon: "paths", path: "/dashboard/users/paths" },
];

const sidebarMenu2 = [
  { id: 0, title: "My Journey",   display: "My Journey",   icon: "journey",      path: "/dashboard/users/my-journey" },
  { id: 1, title: "Current Step", display: "Current Step", icon: "current-step", path: "/dashboard/users/current-step" },
  { id: 2, title: "Transactions", display: "Transactions", icon: "transactions", path: "/dashboard/users/transactions" },
  { id: 3, title: "Wallet",       display: "Wallet",       icon: "wallet",       path: "/dashboard/users/wallet" },
];

const Dashsidebar = ({ isNotOnMainPage, handleChange, approvalStatus, isProfileIncomplete }) => {
  const { sideNav, setsideNav } = useStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [imgError,       setImgError]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const logoutMenuRef = useRef(null);

  const isApprovalLocked = approvalStatus === "pending" || approvalStatus === "rejected";
  const isLocked         = isApprovalLocked || !!isProfileIncomplete;
  const isOnProfilePage  = location.pathname === "/dashboard/users/profile";

  const {
    checkForHistory, preLoginHistoryData,
    setPathItemSelected, setSelectedPathItem,
    setCurrentStepData, setCurrentStepDataLength, setCurrentStepDataPathId,
    setTransactionSelected, setTransactionData,
  } = useCoinContextData();

  const getUserFromStorage = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const userDetails  = getUserFromStorage();
  const rawName      = userDetails?.name || userDetails?.fullName || localStorage.getItem("userName") || "";
  const firstName    = rawName.split(" ")[0] || (userDetails?.email || "User").split("@")[0];
  const userInitial  = firstName.charAt(0).toUpperCase() || "U";
  const profilePic   = localStorage.getItem("userProfilePic") || userDetails?.profilePicture || userDetails?.profilePicURL || null;

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (title, path) => {
    if (isLocked) return;
    setCurrentStepData("");
    setCurrentStepDataLength("");
    setCurrentStepDataPathId("");
    setTransactionSelected(false);
    setTransactionData([]);
    setsideNav(title);
    navigate(path);
    setShowLogoutMenu(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    ["authToken", "user", "partner", "userType", "userProfilePic"].forEach((k) => localStorage.removeItem(k));
    navigate("/login", { replace: true });
  };

  const handleProfileClick = () => {
    if (isLocked) return;
    setsideNav("Profile");
    navigate("/dashboard/users/profile");
    setShowLogoutMenu(false);
    setMobileOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(e.target)) {
        setShowLogoutMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile burger */}
      <button
        className={`mobile-menu-btn ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(v => !v)}
        aria-label="Toggle navigation menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={() => { setMobileOpen(false); setShowLogoutMenu(false); }}
      />

      {/* Profile-incomplete overlay */}
      {isProfileIncomplete && !isOnProfilePage && (
        <div className="profile-overlay">
          <div className="profile-overlay-card">
            <div className="profile-overlay-icon">👤</div>
            <div className="profile-overlay-title">Complete Your Profile First</div>
            <div className="profile-overlay-divider" />
            <div className="profile-overlay-message">
              You need to complete all <strong>3 levels</strong> of your Naavi profile before accessing the platform.
            </div>
            <div className="profile-overlay-button" onClick={() => { navigate("/dashboard/users/profile"); setShowLogoutMenu(false); setMobileOpen(false); }}>
              Complete Profile →
            </div>
            <div>
              <span className="profile-overlay-logout" onClick={handleLogout}>Log out instead</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <div className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""}`}>

        {/* Logo */}
        <div
          className="dashboard-left"
          style={{ cursor: isLocked ? "default" : "pointer" }}
          onClick={() => {
            if (!isLocked) { setsideNav("Home"); navigate("/dashboard/users/home"); setMobileOpen(false); }
          }}
        >
          <img className="dashboard-logo" src={logo} alt="Naavi" />
        </div>

        {/* Nav */}
        <div className="sidebar-menu-scrollable" style={{ padding: "0 12px" }}>

          {/* Menu group 1 + 2 combined — no divider, no extra gap */}
          {[...sidebarMenu1, ...sidebarMenu2].map((each) => {
            const active = isActive(each.path);
            return (
              <div
                key={each.id + each.title}
                className={`each-sidenav ${active ? "active" : ""} ${isLocked ? "locked" : ""}`}
                onClick={() => handleNavigation(each.title, each.path)}
              >
                <NavIcon type={each.icon} isActive={active} />
                <span>{each.display}</span>
              </div>
            );
          })}

          {checkForHistory && !isLocked && (
            <div className="history-div">
              <div className="history-box">
                <img src={history} alt="history" />
                <div className="history-label">You viewed the following path:</div>
                <div className="history-details">
                  <div className="history-title">{preLoginHistoryData?.destination_institution}</div>
                  <div className="history-program">{preLoginHistoryData?.program}</div>
                  <div className="pathId-text"><span>pathid:</span> {preLoginHistoryData?._id}</div>
                </div>
                <div className="open-btn" onClick={() => {
                  setPathItemSelected(true);
                  setSelectedPathItem(preLoginHistoryData);
                  localStorage.setItem("selectedPath", JSON.stringify(preLoginHistoryData?.nameOfPath));
                  navigate("/dashboard/users/my-journey");
                  setMobileOpen(false);
                }}>
                  Open
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile ── */}
        <div className="sidebar-profile-section">
          <div style={{ position: "relative" }} ref={logoutMenuRef}>

            <div className="sidebar-profile-row">
              <div
                className="sidebar-profile-info"
                style={{ cursor: isLocked ? "default" : "pointer" }}
                onClick={handleProfileClick}
              >
                {profilePic && !imgError ? (
                  <img
                    src={profilePic}
                    alt={firstName}
                    onError={() => setImgError(true)}
                    className="sidebar-avatar-img"
                  />
                ) : (
                  <div className="sidebar-avatar-initials">{userInitial}</div>
                )}
                <div className="sidebar-profile-name-wrap">
                  <div className="sidebar-profile-name">{firstName}</div>
                  {isLocked && (
                    <div
                      className="sidebar-profile-status"
                      style={{ color: approvalStatus === "rejected" ? "#ef4444" : "#f59e0b" }}
                    >
                      {approvalStatus === "rejected" ? "Rejected" : approvalStatus === "pending" ? "Pending Approval" : "Profile Required"}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="sidebar-dots-btn"
                onClick={(e) => { e.stopPropagation(); setShowLogoutMenu(v => !v); }}
              >
                •••
              </div>
            </div>

            {showLogoutMenu && (
              <div className="sidebar-logout-menu">
                <div className="sidebar-logout-item" onClick={handleLogout}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashsidebar;