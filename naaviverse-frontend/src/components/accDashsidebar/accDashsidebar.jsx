import React, { useState, useRef, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";

// URL map for navigation
const ROUTE_MAP = {
  Home: "/dashboard/accountants/home",
  CRM: "/dashboard/accountants",
  Paths: "/dashboard/accountants/paths",
  Steps: "/dashboard/accountants/steps",
  Marketplace: "/dashboard/accountants/marketplace",
  Profile: "/dashboard/accountants/profile",
  
};

// ─── SVG Icons (Grey by default, blue on hover/active) ───────────────────────

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
    case "home":
      return (
        <svg {...iconProps}>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "crm":
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M17 3.5a4 4 0 0 1 0 7" />
          <path d="M21 7.5a4 4 0 0 0-4-4" />
        </svg>
      );
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
    case "steps":
      return (
        <svg {...iconProps}>
          <path d="M8 6h13" />
          <path d="M8 12h13" />
          <path d="M8 18h13" />
          <circle cx="4" cy="6" r="2" />
          <circle cx="4" cy="12" r="2" />
          <circle cx="4" cy="18" r="2" />
        </svg>
      );
    case "marketplace":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case "profile":
      return (
        <svg {...iconProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return <svg {...iconProps}><circle cx="12" cy="12" r="10" /></svg>;
  }
};

// Menu definitions with icons
const sidebarMenu = [
  { id: 0, display: "Home", title: "Home", icon: "home", click: true, path: "/dashboard/accountants/home" },
  { id: 1, display: "CRM", title: "CRM", icon: "crm", click: true, path: "/dashboard/accountants" },
  { id: 2, display: "My Paths", title: "Paths", icon: "paths", click: true, path: "/dashboard/accountants/paths" },
  { id: 3, display: "My Steps", title: "Steps", icon: "steps", click: true, path: "/dashboard/accountants/steps" },
  { id: 4, display: "Marketplace", title: "Marketplace", icon: "marketplace", click: true, path: "/dashboard/accountants/marketplace" },
];

const AccDashsidebar = ({ isNotOnMainPage, handleChangeAccDashsidebar, admin, accStatus, isOpen, onClose }) => {
  const { accsideNav, setaccsideNav, setispopular } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Get partner details from localStorage
  const userDetails = JSON.parse(localStorage.getItem("partner") || "{}");
  const fullName = userDetails?.businessName || userDetails?.fullName || "Partner";
  const userInitial = fullName.charAt(0).toUpperCase();
  const userEmail = userDetails?.email || "";

  // Lock state for unapproved accounts
  const partnerStatus = accStatus || userDetails?.approvalStatus;
  const isLocked = partnerStatus !== "approved";

  // Check if a nav item is active based on current URL
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle navigation
  const handleNavClick = (each) => {
    if (!each.click || isLocked) return;
    setaccsideNav(each.title);
    if (each.path) navigate(each.path);
    if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
    if (onClose) onClose();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`dashboard-sidebar ${isOpen ? "open" : ""}`}
      style={{
        overflow: "hidden",
        padding: "0",
        width: "240px",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
        background: "#ffffff",
        boxShadow: "none",
      }}
    >
      {/* Logo Section */}
      <div
        className="dashboard-left"
        style={{
          padding: "0 20px",
          height: "70px",
          borderBottom: "0.5px solid #eef2f6",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          if (!isLocked) {
            setaccsideNav("Home");
            navigate("/dashboard/accountants/home");
          }
        }}
      >
        <img
          className="dashboard-logo"
          src={logo}
          alt="Naavi"
          style={{ width: "60%" }}
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
        {sidebarMenu.map((each, i) => {
          const active = isActive(each.path);
          const itemClickable = each.click && !isLocked;

          return (
            <div
              key={i}
              className={`each-sidenav ${active ? "active" : ""}`}
              style={{
                background: active ? "rgba(34, 115, 230, 0.08)" : "transparent",
                color: active ? "#2273E6" : "#334155",
                fontWeight: active ? "600" : "500",
                borderRadius: "10px",
                padding: "10px 14px",
                marginBottom: "6px",
                fontSize: "0.9rem",
                opacity: itemClickable || active ? "1" : "0.5",
                cursor: itemClickable ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
              title={isLocked ? "Your account is pending admin approval" : ""}
              onClick={() => handleNavClick(each)}
            >
              <NavIcon type={each.icon} isActive={active} />
              <span>{each.display}</span>
            </div>
          );
        })}
      </div>

      {/* Bottom Section - Add Button + Profile */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #eef2f6",
          background: "#ffffff",
          marginTop: "auto",
        }}
      >
        {/* Add New Button */}
        <div
          title={isLocked ? "Your account is pending admin approval" : ""}
          style={{
            background: "#f8fafc",
            borderRadius: "10px",
            padding: "10px 14px",
            textAlign: "center",
            cursor: isLocked ? "not-allowed" : "pointer",
            opacity: isLocked ? "0.5" : "1",
            marginBottom: "16px",
            fontSize: "0.85rem",
            fontWeight: "500",
            color: "#2273E6",
            border: "1px solid #e2e8f0",
            transition: "all 0.2s ease",
          }}
          onClick={() => {
            if (isLocked) return;
            if (onClose) onClose();
            setTimeout(() => setispopular(true), 300);
          }}
          onMouseEnter={(e) => {
            if (!isLocked) {
              e.currentTarget.style.background = "#eff6ff";
              e.currentTarget.style.borderColor = "#bfdbfe";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLocked) {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }
          }}
        >
          + Add New
        </div>

        {/* Profile Section with Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "1px solid #eef2f6",
              transition: "all 0.2s ease",
            }}
            onClick={() => {
              if (!isLocked) {
                navigate("/dashboard/accountants/profile");
                setaccsideNav("Profile");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
              {/* Avatar */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, #2273E6 0%, #1a5bc4 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginRight: "10px",
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>

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
                  {fullName}
                </div>
                {isLocked && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "500",
                      color: partnerStatus === "rejected" ? "#ef4444" : "#f59e0b",
                      marginTop: "2px",
                    }}
                  >
                    {partnerStatus === "rejected"
                      ? "Rejected"
                      : partnerStatus === "pending"
                      ? "Pending Approval"
                      : "Profile Required"}
                  </div>
                )}
              </div>
            </div>

            {/* Three Dots Menu Trigger */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              style={{
                padding: "6px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                backgroundColor: showDropdown ? "#f1f5f9" : "transparent",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2" fill="#64748b" />
                <circle cx="20" cy="12" r="2" fill="#64748b" />
                <circle cx="4" cy="12" r="2" fill="#64748b" />
              </svg>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "0",
                right: "0",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "6px",
                zIndex: 1000,
                border: "1px solid #eef2f6",
              }}
            >
            

              <div style={{ height: "1px", backgroundColor: "#eef2f6", margin: "4px 0" }} />

              {/* Logout */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: "500",
                  gap: "10px",
                  transition: "all 0.15s ease",
                }}
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
                }}
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
  );
};

export default AccDashsidebar;