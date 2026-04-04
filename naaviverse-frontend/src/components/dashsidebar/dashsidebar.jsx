import React, { useState, useRef, useEffect } from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import history from "./history.svg";

// SVG Icons
const NavIcon = ({ type, isActive }) => {
  const iconProps = {
    className: "nav-icon",
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: isActive ? "#2273E6" : "#6B7280",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (type) {
    case "paths":
      return (
        <svg {...iconProps}>
          <polygon points="12 2 22 7 22 17 12 22 2 17 2 7 12 2" />
          <line x1="12" y1="22" x2="12" y2="12" />
          <line x1="22" y1="7" x2="12" y2="12" />
          <line x1="2" y1="7" x2="12" y2="12" />
          <line x1="7" y1="2" x2="7" y2="17" />
          <line x1="17" y1="2" x2="17" y2="17" />
        </svg>
      );
    case "journey":
      return (
        <svg {...iconProps}>
          <path d="M2 12h20" />
          <path d="M12 2v20" />
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    case "current-step":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "transactions":
      return (
        <svg {...iconProps}>
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9h-4m-7 9A9 9 0 0 1 3 12m9 9v-4M3 12a9 9 0 0 1 9-9m-9 9h4m7-9a9 9 0 0 1 9 9" />
          <polyline points="15 9 12 12 9 9" />
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
  { id: 0, title: "Paths", display: "Paths", icon: "paths", path: "/dashboard/users/paths" },
];

const sidebarMenu2 = [
  { id: 0, title: "My Journey", display: "My Journey", icon: "journey", path: "/dashboard/users/my-journey" },
  { id: 1, title: "Current Step", display: "Current Step", icon: "current-step", path: "/dashboard/users/current-step" },
  { id: 2, title: "Transactions", display: "Transactions", icon: "transactions", path: "/dashboard/users/transactions" },
  { id: 3, title: "Wallet", display: "Wallet", icon: "wallet", path: "/dashboard/users/wallet" },
];

const Dashsidebar = ({ isNotOnMainPage, handleChange, approvalStatus, isProfileIncomplete }) => {
  const { sideNav, setsideNav } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoutMenuRef = useRef(null);

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
      return parsed?.user || parsed;
    } catch { return null; }
  };

  const userDetails = getUserFromStorage();
  const rawName = userDetails?.name || userDetails?.fullName || localStorage.getItem("userName") || "";
  const firstName = rawName.split(" ")[0] || (userDetails?.email || "User").split("@")[0];
  const userInitial = firstName.charAt(0).toUpperCase() || "U";
  const profilePic = localStorage.getItem("userProfilePic") || userDetails?.profilePicture || userDetails?.profilePicURL || null;

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

  // Close logout menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (logoutMenuRef.current && !logoutMenuRef.current.contains(event.target)) {
        setShowLogoutMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobile = () => {
    setMobileOpen(false);
    setShowLogoutMenu(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className={`mobile-menu-btn ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen((v) => !v)}
        aria-label="Toggle navigation menu"
      >
        <span />
        <span />
        <span />
      </button>

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? "visible" : ""}`}
        onClick={closeMobile}
      />

      {/* Profile Incomplete Overlay */}
      {isProfileIncomplete && !isOnProfilePage && (
        <div className="profile-overlay">
          <div className="profile-overlay-card">
            <div className="profile-overlay-icon">👤</div>
            <div className="profile-overlay-title">Complete Your Profile First</div>
            <div className="profile-overlay-divider" />
            <div className="profile-overlay-message">
              You need to complete all <strong>3 levels</strong> of your
              Naavi profile before accessing the platform.
            </div>
            <div
              className="profile-overlay-button"
              onClick={() => {
                navigate("/dashboard/users/profile");
                setShowLogoutMenu(false);
                setMobileOpen(false);
              }}
            >
              Complete Profile →
            </div>
            <div>
              <span className="profile-overlay-logout" onClick={handleLogout}>
                Log out instead
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        {/* Logo Section */}
        <div
          className="dashboard-left"
          style={{
            padding: "0 16px",
            height: "70px",
            borderBottom: "0.5px solid #eef2f6",
            display: "flex",
            alignItems: "center",
            cursor: isLocked ? "default" : "pointer",
          }}
          onClick={() => {
            if (!isLocked) {
              setsideNav("Paths");
              navigate("/dashboard/users/paths");
              setMobileOpen(false);
            }
          }}
        >
          <img 
            className="dashboard-logo" 
            src={logo} 
            alt="Naavi" 
            style={{ 
              width: "140px",
              objectFit: "contain" 
            }} 
          />
        </div>

        {/* Navigation Items */}
        <div
          className="sidebar-menu-scrollable"
          style={{
            overflowY: "auto",
            flex: 1,
            marginTop: "20px",
            padding: "0 12px",
          }}
        >
          {/* Menu Section 1 */}
          {sidebarMenu1.map((each) => {
            const active = isActive(each.path);
            const itemClickable = !isLocked;

            return (
              <div
                key={each.id}
                className={`each-sidenav ${active ? "active" : ""}`}
                style={{
                  background: active ? "rgba(34, 115, 230, 0.08)" : "transparent",
                  color: active ? "#2273E6" : "#334155",
                  fontWeight: active ? "600" : "500",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                  opacity: itemClickable ? "1" : "0.5",
                  cursor: itemClickable ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
                onClick={() => handleNavigation(each.title, each.path)}
              >
                <NavIcon type={each.icon} isActive={active} />
                <span>{each.display}</span>
              </div>
            );
          })}

          {/* Menu Section 2 */}
          {sidebarMenu2.map((ele) => {
            const active = isActive(ele.path);
            const itemClickable = !isLocked;

            return (
              <div
                key={ele.id}
                className={`each-sidenav ${active ? "active" : ""}`}
                style={{
                  background: active ? "rgba(34, 115, 230, 0.08)" : "transparent",
                  color: active ? "#2273E6" : "#334155",
                  fontWeight: active ? "600" : "500",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "6px",
                  fontSize: "0.9rem",
                  opacity: itemClickable ? "1" : "0.5",
                  cursor: itemClickable ? "pointer" : "not-allowed",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
                onClick={() => handleNavigation(ele.title, ele.path)}
              >
                <NavIcon type={ele.icon} isActive={active} />
                <span>{ele.display}</span>
              </div>
            );
          })}

          {/* History Section */}
          {checkForHistory && !isLocked && (
            <div className="history-div">
              <div className="history-box">
                <img src={history} alt="history" />
                <div className="history-label">You viewed the following path:</div>
                <div className="history-details">
                  <div className="history-title">{preLoginHistoryData?.destination_institution}</div>
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

        {/* Bottom Section - Profile */}
        <div
          style={{
            padding: "16px 16px",
            borderTop: "1px solid #eef2f6",
            background: "#ffffff",
            marginTop: "auto",
          }}
        >
          <div style={{ position: "relative" }} ref={logoutMenuRef}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                borderRadius: "10px",
                backgroundColor: "transparent",
                border: "1px solid #eef2f6",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Click on avatar/name goes to profile */}
              <div 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  flex: 1, 
                  minWidth: 0,
                  cursor: !isLocked ? "pointer" : "default",
                }}
                onClick={handleProfileClick}
              >
                {/* Avatar */}
                {profilePic && !imgError ? (
                  <img
                    src={profilePic}
                    alt={firstName}
                    onError={() => setImgError(true)}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      marginRight: "10px",
                      flexShrink: 0,
                      border: "1px solid #e2e8f0",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #2273E6 0%, #1a5bc4 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: "600",
                      fontSize: "14px",
                      marginRight: "10px",
                      flexShrink: 0,
                    }}
                  >
                    {userInitial}
                  </div>
                )}

                {/* User Info */}
                <div style={{ overflow: "hidden", flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      fontSize: "13px",
                      color: "#1e293b",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {firstName}
                  </div>
                  {isLocked && (
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "500",
                        color: approvalStatus === "rejected" ? "#ef4444" : "#f59e0b",
                        marginTop: "2px",
                      }}
                    >
                      {approvalStatus === "rejected"
                        ? "Rejected"
                        : approvalStatus === "pending"
                        ? "Pending Approval"
                        : "Profile Required"}
                    </div>
                  )}
                </div>
              </div>

              {/* Three Dots - ONLY for logout */}
              <div
                style={{
                  fontSize: "16px",
                  letterSpacing: "2px",
                  color: "#94a3b8",
                  padding: "4px 6px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogoutMenu(!showLogoutMenu);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9";
                  e.currentTarget.style.color = "#2273E6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                •••
              </div>
            </div>

            {/* Logout Menu - ONLY logout option */}
            {showLogoutMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 8px)",
                  right: "0",
                  backgroundColor: "#ffffff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "6px",
                  zIndex: 1000,
                  border: "1px solid #eef2f6",
                  minWidth: "140px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "#ef4444",
                    fontSize: "13px",
                    fontWeight: "500",
                    transition: "all 0.15s ease",
                  }}
                  onClick={handleLogout}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
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