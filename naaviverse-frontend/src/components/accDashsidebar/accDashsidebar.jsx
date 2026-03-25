import React, { useState, useRef, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";

// ─── Icons ────────────────────────────────────────────────────────────────────

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
    <path d="M12 3L4 9V21H9V15H15V21H20V9L12 3Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M12 8V11" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CRMIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
    <circle cx="12" cy="8" r="4" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M5 18V16C5 13.7909 6.79086 12 9 12H15C17.2091 12 19 13.7909 19 16V18" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PathsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
    <path d="M12 4V20M4 12H20" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="8" stroke="#3B82F6" strokeWidth="1.5" />
  </svg>
);

const StepsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
    <path d="M6 9L12 4L18 9L12 14L6 9Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 15L12 20L18 15" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const MarketplaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "12px" }}>
    <path d="M4 8H20L18 15H6L4 8Z" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" />
    <circle cx="8" cy="19" r="2" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="16" cy="19" r="2" stroke="#3B82F6" strokeWidth="1.5" />
    <path d="M20 12H22" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: "auto", opacity: 0.4 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 11V7C7 4.2 9.2 2 12 2C14.8 2 17 4.2 17 7V11" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M19.4 15C18.9 16 18.1 16.7 17.2 17.2L19 20.6L15.8 19.5C14.8 20 13.7 20.3 12.5 20.3C11.3 20.3 10.2 20 9.2 19.5L6 20.6L7.8 17.2C6.9 16.7 6.1 16 5.6 15L2 16L4.4 12.5C4.3 12.2 4.2 11.8 4.2 11.5C4.2 11.2 4.3 10.8 4.4 10.5L2 7L5.6 8C6.1 7 6.9 6.3 7.8 5.8L6 2.4L9.2 3.5C10.2 3 11.3 2.7 12.5 2.7C13.7 2.7 14.8 3 15.8 3.5L19 2.4L17.2 5.8C18.1 6.3 18.9 7 19.4 8L23 7L20.6 10.5C20.7 10.8 20.8 11.2 20.8 11.5C20.8 11.8 20.7 12.2 20.6 12.5L23 16L19.4 15Z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 8L12 12M12 12L8 16M12 12H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ThreeDotsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="2" fill="#718096" />
    <circle cx="20" cy="12" r="2" fill="#718096" />
    <circle cx="4" cy="12" r="2" fill="#718096" />
  </svg>
);

// ─── Menu definitions ─────────────────────────────────────────────────────────

const sidebarMenu1 = [
  {
    id: 0,
    display: "Home",
    title: "Home",
    icon: HomeIcon,
    click: true,
    path: "/dashboard/accountants/home",
  },
  {
    id: 1,
    display: "CRM",
    title: "CRM",
    icon: CRMIcon,
    click: true,
    path: "/dashboard/accountants",
  },
  {
    id: 2,
    display: "My Paths",
    title: "Paths",
    icon: PathsIcon,
    click: true,
    path: "/dashboard/accountants/paths",
  },
  {
    id: 3,
    display: "My Steps",
    title: "Steps",
    icon: StepsIcon,
    click: true,
    path: "/dashboard/accountants/steps",
  },
  {
    id: 4,
    display: "Marketplace",
    title: "Marketplace",
    icon: MarketplaceIcon,
    click: true,
    path: "/dashboard/accountants/marketplace",
  },
];

const sidebarMenu2 = [
  { id: 0, display: "CRM", title: "CRM", click: true },
  { id: 1, display: "Paths", title: "Paths", click: true },
];

// ─── Component ────────────────────────────────────────────────────────────────

const AccDashsidebar = ({ isNotOnMainPage, handleChangeAccDashsidebar, admin, accStatus, isOpen, onClose }) => {
  const selectedMenu = admin ? sidebarMenu2 : sidebarMenu1;
  const { accsideNav, setaccsideNav, setispopular } = useStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── Read partner from localStorage ──────────────────────────────────────────
  const userDetails = JSON.parse(localStorage.getItem("partner") || "{}");
  const fullName = userDetails?.businessName || "Partner";
  const userInitial = fullName.charAt(0).toUpperCase();

  // ── 🔒 LOCK FLAG ─────────────────────────────────────────────────────────────
  // Sidebar tabs are disabled unless the account is approved.
  // profileCreated=false  → profile not yet submitted
  // status !== "approved" → pending or rejected
  const partnerStatus = accStatus || userDetails?.approvalStatus;
  const isLocked = partnerStatus !== "approved";
  // ── Logout ───────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("partner");
    localStorage.removeItem("loginEmail");
    navigate("/login");
  };

  // ── Close dropdown on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getActiveBackground = (title) =>
    accsideNav === title ? "#E6F0FF" : "transparent";

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={`dashboard-sidebar${isOpen ? " open" : ""}`}
      style={{
        overflow: "visible",
        padding: "24px 16px 16px",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #EDF2F7",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 8px", marginBottom: "24px" }}>
        <img
          className="dashboard-logo"
          src={logo}
          alt="Naavi"
          style={{ width: "160px", objectFit: "contain", marginBottom: "6px" }}
        />
      </div>

      {/* ── Main Navigation ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 4px", minHeight: 0 }}>
        {selectedMenu?.map((each, i) => {
          const isActive = accsideNav === each.title;
          // 🔒 Each nav item is clickable only when account is approved
          const itemClickable = each.click && !isLocked;

          return (
            <div
              key={i}
              className="each-sidenav"
              title={isLocked ? "Your account is pending admin approval" : ""}
              style={{
                background: getActiveBackground(each.title),
                color: isActive ? "#1A1F36" : "#4A5568",
                padding: "0 16px",
                borderRadius: "10px",
                height: "42px",
                display: "flex",
                alignItems: "center",
                fontWeight: isActive ? "600" : "500",
                fontSize: "14px",
                // 🔒 visual cue: greyed-out + not-allowed when locked
                cursor: itemClickable ? "pointer" : "not-allowed",
                opacity: itemClickable || isActive ? "1" : "0.4",
                marginBottom: "2px",
                transition: "all 0.15s ease",
              }}
              onClick={() => {
                if (!itemClickable) return;
                setaccsideNav(each.title);
                if (each.path) navigate(each.path); // ← Navigate first
                if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
                if (onClose) onClose();
              }}
              onMouseEnter={(e) => {
                if (!isActive && itemClickable)
                  e.currentTarget.style.backgroundColor = "#F7F9FC";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {each.icon && <each.icon />}
              <span>{each.display}</span>
              {/* 🔒 Show lock icon on every restricted tab */}
              {isLocked && <LockIcon />}
            </div>
          );
        })}
      </div>

      {/* ── Bottom Section ─────────────────────────────────────────────────── */}

      <div style={{
        padding: "12px 4px 12px",   /* ✅ reduced padding */
        borderTop: "1px solid #EDF2F7",
        flexShrink: 0,              /* ✅ ADD THIS — prevents bottom from shrinking */
        display: "flex",
        flexDirection: "column",
        gap: "0px",
        backgroundColor: "#FFFFFF", /* ✅ solid background so it never overlaps */
      }}>
        {/* Add Path Button — also locked when pending/rejected */}
        {!admin && (
          <div
            title={isLocked ? "Your account is pending admin approval" : ""}
            style={{
              background: "#F9FAFB", // Very light background
              borderRadius: "24px",
              padding: "4px 14px", // Reduced padding for smaller box
              color: "#2D3748",
              width: "fit-content",
              cursor: isLocked ? "not-allowed" : "pointer",
              opacity: isLocked ? "0.5" : "1",
              marginBottom: "24px", // Reduced margin
              fontSize: "12px", // Slightly smaller font
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              transition: "all 0.2s ease",
              border: "1.5px solid transparent",
              backgroundImage: "linear-gradient(#F9FAFB, #F9FAFB), linear-gradient(135deg, #FFD1DC 0%, #B5EAD7 50%, #C7CEEA 100%)",
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              letterSpacing: "0.3px",
            }}
            onClick={() => {
              if (isLocked) return;
              if (onClose) onClose();          
              setTimeout(() => {
                setispopular(true);            
              }, 300);                         
            }}
            onMouseEnter={(e) => {
              if (isLocked) return;
              e.currentTarget.style.backgroundImage = "linear-gradient(#F3F4F6, #F3F4F6), linear-gradient(135deg, #FFC0CB 0%, #A8E6CF 50%, #B4D0FF 100%)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.04)";
            }}
            onMouseLeave={(e) => {
              if (isLocked) return;
              e.currentTarget.style.backgroundImage = "linear-gradient(#F9FAFB, #F9FAFB), linear-gradient(135deg, #FFD1DC 0%, #B5EAD7 50%, #C7CEEA 100%)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.02)";
            }}
          >
            <span>Add New</span>
          </div>
        )}

        {/* Partner Profile Row with Three Dots */}
        <div style={{ position: "relative", minHeight: "48px" }} ref={dropdownRef}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 10px",
              borderRadius: "10px",
              cursor: "pointer",
              backgroundColor: "transparent",
              border: "1px solid #EDF2F7",
              transition: "all 0.15s ease",
              minHeight: "48px",
            }}
            onClick={() => {
              navigate("/dashboard/accountants/profile");
              setaccsideNav("Profile");
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F7F9FC";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              overflow: "hidden",
              flex: 1,
              minWidth: 0,
            }}>

              {/* Avatar */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "7px",
                  background: "linear-gradient(135deg, #1f304f 0%, #0d6b6e 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#FFFFFF",
                  fontWeight: "600",
                  fontSize: "14px",
                  marginRight: "8px",
                  flexShrink: 0,
                }}
              >
                {userInitial}
              </div>

              {/* Full Name + pending badge */}
              <div style={{
                overflow: "hidden",
                flex: 1,
                minWidth: 0,
              }}>
                <div
                  style={{
                    fontWeight: "600",
                    fontSize: "12px",
                    color: "#1A1F36",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                  }}
                >
                  {fullName}
                </div>
                {/* 🔒 Status badge shown when not approved */}
                {isLocked && (
                  <div
                    style={{
                      fontSize: "10px",
                      fontWeight: "600",
                      color: partnerStatus === "rejected" ? "#EF4444" : "#D97706",
                      marginTop: "1px",
                    }}
                  >
                    {partnerStatus === "rejected"
                      ? "● Rejected"
                      : partnerStatus === "pending"
                        ? "● Pending Approval"
                        : "● Profile Required"}
                  </div>
                )}
              </div>
            </div>

            {/* Three Dots */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              style={{
                padding: "4px",
                borderRadius: "6px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                backgroundColor: showDropdown ? "#F1F5F9" : "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
              }}
              onMouseLeave={(e) => {
                if (!showDropdown)
                  e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ThreeDotsIcon />
            </div>
          </div>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 4px)",
                left: "0",
                right: "0",
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                padding: "4px",
                zIndex: 1000,
                border: "1px solid #EDF2F7",
              }}
            >

              {/* Edit Profile */}
              <div
                style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", color: "#4A5568", fontSize: "13px", fontWeight: "500", gap: "10px", transition: "all 0.15s ease" }}
                onClick={() => { setShowDropdown(false); navigate("/dashboard/accountants/profile/edit"); }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#3B82F6"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#4A5568"; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 3L21 7L7 21H3V17L17 3Z" strokeLinejoin="round" />
                </svg>
                <span>Edit Profile</span>
              </div>
              <div style={{ height: "1px", backgroundColor: "#EDF2F7", margin: "4px 0" }} />

              {/* Logout */}
              <div
                style={{ display: "flex", alignItems: "center", padding: "8px 10px", borderRadius: "6px", cursor: "pointer", color: "#EF4444", fontSize: "13px", fontWeight: "500", gap: "10px", transition: "all 0.15s ease" }}
                onClick={() => { setShowDropdown(false); handleLogout(); }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
              >
                <LogoutIcon />
                <span>Log out</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccDashsidebar;