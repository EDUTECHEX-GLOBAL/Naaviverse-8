import React, { useState, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";
import pathIcon from '../../assets/images/assets/naavi-icon2.webp';
import stepIcon from '../../assets/images/assets/naavi-icon1.webp';
// ✅ URL map for each section
const ROUTE_MAP = {
  Overview:      "/admin/dashboard/accountants",
  CRM:           "/admin/dashboard/crm",
  Subscriptions: "/admin/dashboard/subscriptions",
  Paths:         "/admin/dashboard/paths?tab=active",
  Steps:         "/admin/dashboard/steps?tab=active",
  Marketplace:   "/admin/dashboard/marketplace",
};

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Overview: ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  CRM: ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Subscriptions: ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
 Paths: ({ color }) => (
  <img
    src={pathIcon}
    alt="paths"
    width="17"
    height="17"
    style={{ objectFit: "contain", opacity: color === "#2273E6" ? 1 : 0.55 }}
  />
),
  Steps: ({ color }) => (
  <img
    src={stepIcon}
    alt="steps"
    width="17"
    height="17"
    style={{ objectFit: "contain", opacity: color === "#2273E6" ? 1 : 0.55 }}
  />
),
  Marketplace: ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  "My Services": ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Universities: ({ color }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  ),
};

const getIcon = (title, color) => {
  const IconComp = Icons[title];
  return IconComp ? <IconComp color={color} /> : null;
};

// ── Menu definitions ────────────────────────────────────────────────────────
const sidebarMenu1 = [
  { id: 0, display: "CRM",          title: "CRM",          click: true },
  { id: 1, display: "My Services",  title: "My Services",  click: true },
  { id: 2, display: "My Paths",     title: "Paths",        click: true },
  { id: 3, display: "Universities", title: "Universities", click: true },
];

const sidebarMenu2 = [
  { id: 0, display: "Overview",       title: "Overview",       click: true },
  { id: 1, display: "CRM",            title: "CRM",            click: true },
  { id: 2, display: "Subscriptions",  title: "Subscriptions",  click: true },
  { id: 3, display: "Paths",          title: "Paths",          click: true },
  { id: 4, display: "Steps",          title: "Steps",          click: true },
  { id: 5, display: "Marketplace",    title: "Marketplace",    click: true },
];

const sidebarMenu3 = [];

// ── Component ───────────────────────────────────────────────────────────────
const AdminAccDashsidebar = ({
  isNotOnMainPage,
  handleChangeAccDashsidebar,
  admin,
}) => {
  const [selectedMenu, setSelectedMenu] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { accsideNav, setaccsideNav } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const menu = admin ? sidebarMenu2 : sidebarMenu1;
    setSelectedMenu(menu);

    const currentPath = location.pathname;
    const matched = menu.find(
      (m) => ROUTE_MAP[m.title]?.split("?")[0] === currentPath
    );
    if (matched) {
      setaccsideNav(matched.title);
    } else {
      const knownTitles = menu.map((m) => m.title);
      if (!accsideNav || !knownTitles.includes(accsideNav)) {
        setaccsideNav(menu[0].title);
      }
    }
  }, [admin, location.pathname]);

  const isActive = (title) => {
    const route = ROUTE_MAP[title];
    if (!route) return accsideNav === title;
    return location.pathname === route.split("?")[0];
  };

  const handleNavClick = (each) => {
    if (!each.click) return;
    setaccsideNav(each.title);
    setMobileOpen(false); // close on mobile after click
    const route = ROUTE_MAP[each.title];
    if (route) {
      navigate(route);
    } else if (handleChangeAccDashsidebar) {
      handleChangeAccDashsidebar();
    } else if (isNotOnMainPage) {
      navigate("/dashboard/accountants");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <>
      {/* ── Logo ── */}
      <div
        className="dashboard-left"
        style={{
          padding: "0 20px",
          height: "70px",
          borderBottom: "0.5px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <img
          className="dashboard-logo"
          src={logo}
          alt="Naavi"
          style={{ width: "60%" }}
          onClick={() => {
            const defaultTitle = admin ? "Overview" : "CRM";
            setaccsideNav(defaultTitle);
            navigate(ROUTE_MAP[defaultTitle]);
            setMobileOpen(false);
          }}
        />
        {/* Close button — mobile only */}
        <button
          className="sidebar-mobile-close"
          onClick={() => setMobileOpen(false)}
          style={{
            display: "none", // shown via CSS on mobile
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            color: "#64748b",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* ── Nav items ── */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
          marginTop: "20px",
          padding: "0 12px",
        }}
      >
        <div>
          {selectedMenu?.map((each, i) => {
            const active = isActive(each.title);
            const color = active ? "#2273E6" : "#64748b";
            return (
              <div
                key={i}
                className="each-sidenav"
                style={{
                  background:   active ? "rgba(34, 115, 230, 0.1)" : "transparent",
                  color,
                  fontWeight:   active ? "600" : "500",
                  borderRadius: active ? "8px" : "0",
                  opacity:      each.click ? "1" : "0.25",
                  cursor:       each.click ? "pointer" : "not-allowed",
                  transition:   "all 0.2s ease",
                  padding:      "12px 16px",
                  marginBottom: "4px",
                  fontSize:     "0.95rem",
                  display:      "flex",
                  alignItems:   "center",
                  gap:          "10px",
                }}
                onClick={() => handleNavClick(each)}
              >
                {getIcon(each.title, color)}
                {each.display}
              </div>
            );
          })}
        </div>

        <div>
          {sidebarMenu3.map((ele, j) => (
            <div
              key={j}
              className="each-sidenav"
              style={{
                background:   "transparent",
                color:        "#64748b",
                opacity:      ele.click ? "1" : "0.25",
                cursor:       ele.click ? "pointer" : "not-allowed",
                transition:   "all 0.2s ease",
                padding:      "12px 16px",
                marginBottom: "4px",
                fontSize:     "0.95rem",
                fontWeight:   "500",
                display:      "flex",
                alignItems:   "center",
                gap:          "10px",
              }}
              onClick={() => handleNavClick(ele)}
            >
              {getIcon(ele.title, "#64748b")}
              {ele.title}
            </div>
          ))}
        </div>
      </div>

      {/* ── Logout ── */}
      <div
        style={{
          padding:    "10px 14px",
          borderTop:  "1px solid #e5e5e5",
          background: "#ffffff",
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            width:          "100%",
            padding:        "8px 12px",
            background:     "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            color:          "#dc2626",
            border:         "1px solid #fecaca",
            borderRadius:   "8px",
            fontSize:       "0.85rem",
            fontWeight:     "500",
            cursor:         "pointer",
            transition:     "all 0.2s ease",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            gap:            "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background  = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
            e.currentTarget.style.borderColor = "#f87171";
            e.currentTarget.style.transform   = "translateY(-1px)";
            e.currentTarget.style.boxShadow   = "0 2px 8px rgba(220, 38, 38, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background  = "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)";
            e.currentTarget.style.borderColor = "#fecaca";
            e.currentTarget.style.transform   = "translateY(0)";
            e.currentTarget.style.boxShadow   = "none";
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════
          MOBILE TOPBAR — only visible on mobile
      ═══════════════════════════════════════════════ */}
      <div className="sidebar-mobile-topbar">
        <button
          className="sidebar-hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <span />
          <span />
          <span />
        </button>
        <img src={logo} alt="Naavi" className="sidebar-mobile-logo" />
      </div>

      {/* ═══════════════════════════════════════════════
          DESKTOP SIDEBAR — hidden on mobile
      ═══════════════════════════════════════════════ */}
      <div
        className="dashboard-sidebar sidebar-desktop"
        style={{
          overflow:   "hidden",
          padding:    "0",
          width:      "210px",
          flexShrink: 0,
          position:   "relative",
          zIndex:     100,
          background: "#ffffff",
          boxShadow:  "none",
          display:    "flex",
          flexDirection: "column",
          height:     "100vh",
        }}
      >
        <SidebarContent />
      </div>

      {/* ═══════════════════════════════════════════════
          MOBILE OVERLAY
      ═══════════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══════════════════════════════════════════════
          MOBILE DRAWER
      ═══════════════════════════════════════════════ */}
      <div className={`sidebar-mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <SidebarContent />
      </div>

      {/* ═══════════════════════════════════════════════
          INLINE STYLES (injected once)
      ═══════════════════════════════════════════════ */}
      <style>{`
        /* ── Mobile topbar ── */
        .sidebar-mobile-topbar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          background: #ffffff;
          border-bottom: 1px solid #e5e5e5;
          align-items: center;
          padding: 0 16px;
          gap: 14px;
          z-index: 200;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .sidebar-mobile-logo {
          height: 28px;
          width: auto;
          object-fit: contain;
        }

        /* Hamburger button */
        .sidebar-hamburger {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
        }
        .sidebar-hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #374151;
          border-radius: 2px;
          transition: all 0.2s ease;
        }
        .sidebar-hamburger:hover span {
          background: #2273E6;
        }

        /* ── Desktop sidebar ── */
        .sidebar-desktop {
          display: flex !important;
        }

        /* ── Mobile drawer ── */
        .sidebar-mobile-drawer {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 240px;
          height: 100vh;
          background: #ffffff;
          z-index: 300;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0,0,0,0.12);
          transform: translateX(-100%);
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .sidebar-mobile-drawer.open {
          transform: translateX(0);
        }

        /* ── Overlay ── */
        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          z-index: 299;
          backdrop-filter: blur(2px);
        }

        /* ── Close button inside drawer ── */
        .sidebar-mobile-close {
          display: none !important;
        }

        /* ════════════════════════════════════
           MOBILE BREAKPOINT  ≤ 768px
        ════════════════════════════════════ */
        @media (max-width: 768px) {
          /* Show topbar */
          .sidebar-mobile-topbar {
            display: flex;
          }

          /* Hide desktop sidebar */
          .sidebar-desktop {
            display: none !important;
          }

          /* Show mobile drawer */
          .sidebar-mobile-drawer {
            display: flex;
          }

          /* Show overlay when drawer open */
          .sidebar-overlay {
            display: block;
          }

          /* Show close button inside drawer header */
          .sidebar-mobile-close {
            display: flex !important;
          }

          /* Push page content down so topbar doesn't overlap */
          .dashboard-body,
          .dashboard-screens,
          .admin-steps-container,
          .dashboard-main > *:not(.sidebar-mobile-topbar) {
            padding-top: 56px;
          }
        }
      `}</style>
    </>
  );
};

export default AdminAccDashsidebar;