import React, { useState, useRef, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";
import pathIcon from '../../assets/images/assets/naavi-icon2.webp';
import stepIcon from '../../assets/images/assets/naavi-icon1.webp';
const ROUTE_MAP = {
  Home: "/dashboard/accountants/home",
  CRM: "/dashboard/accountants",
  Paths: "/dashboard/accountants/paths",
  Steps: "/dashboard/accountants/steps",
  Marketplace: "/dashboard/accountants/marketplace",
  Profile: "/dashboard/accountants/profile",
};

const NavIcon = ({ type, isActive }) => {
  const iconProps = {
    className: "partner-nav-icon",
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
   case "paths":
  return (
    <img
      src={pathIcon}
      alt="paths"
      width="20"
      height="20"
      style={{ objectFit: "contain", opacity: isActive ? 1 : 0.55 }}
    />
  );
   case "steps":
  return (
    <img
      src={stepIcon}
      alt="steps"
      width="20"
      height="20"
      style={{ objectFit: "contain", opacity: isActive ? 1 : 0.55 }}
    />
  );
    case "marketplace":
      return (
        <svg {...iconProps}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
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

  const userDetails = JSON.parse(localStorage.getItem("partner") || "{}");
  const fullName = userDetails?.businessName || userDetails?.fullName || "Partner";
  const userInitial = fullName.charAt(0).toUpperCase();
  const userEmail = userDetails?.email || "";

  const partnerStatus = accStatus || userDetails?.approvalStatus;
  const isLocked = partnerStatus !== "approved";

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavClick = (each) => {
    if (!each.click || isLocked) return;
    setaccsideNav(each.title);
    if (each.path) navigate(each.path);
    if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
    if (onClose) onClose();
  };

  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

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
    <div className={`partner-dashboard-sidebar ${isOpen ? "open" : ""}`}>
      {/* Logo Section */}
      <div
        className="partner-dashboard-left"
        onClick={() => {
          if (!isLocked) {
            setaccsideNav("Home");
            navigate("/dashboard/accountants/home");
          }
        }}
      >
        <img
          className="partner-dashboard-logo"
          src={logo}
          alt="Naavi"
        />
      </div>

      {/* Navigation Items */}
      <div className="partner-sidebar-menu-scrollable">
        {sidebarMenu.map((each, i) => {
          const active = isActive(each.path);
          const itemClickable = each.click && !isLocked;

          return (
            <div
              key={i}
              className={`partner-each-sidenav ${active ? "active" : ""} ${!itemClickable ? "locked" : ""}`}
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
      <div className="partner-profile-section">
        {/* Add New Button */}
        <div
          className={`partner-add-new-btn ${isLocked ? "locked" : ""}`}
          title={isLocked ? "Your account is pending admin approval" : ""}
          onClick={() => {
            if (isLocked) return;
            if (onClose) onClose();
            setTimeout(() => setispopular(true), 300);
          }}
        >
          + Add New
        </div>

        {/* Profile Section with Dropdown */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <div
            className="partner-profile-row"
            onClick={() => {
              if (!isLocked) {
                navigate("/dashboard/accountants/profile");
                setaccsideNav("Profile");
              }
            }}
          >
            <div className="partner-profile-info">
              <div className="partner-avatar">
                {userInitial}
              </div>

              <div className="partner-profile-details">
                <div className="partner-profile-name">
                  {fullName}
                </div>
                {isLocked && (
                  <div
                    className="partner-profile-status"
                    style={{ color: partnerStatus === "rejected" ? "#ef4444" : "#f59e0b" }}
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
              className="partner-dots-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
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
            <div className="partner-dropdown-menu">
              <div className="partner-dropdown-divider" />
              <div
                className="partner-logout-item"
                onClick={() => {
                  setShowDropdown(false);
                  handleLogout();
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