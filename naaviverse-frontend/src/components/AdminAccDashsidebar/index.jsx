import React, { useState, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ add useLocation
import logo from "../../assets/images/logo/naavi_final_logo2.png";

// ✅ URL map for each section
const ROUTE_MAP = {
  Overview:   "/admin/dashboard/accountants",
  CRM:         "/admin/dashboard/crm",
  Paths:       "/admin/dashboard/paths?tab=active",
  Steps:       "/admin/dashboard/steps?tab=active",
  Marketplace: "/admin/dashboard/marketplace",
};

const sidebarMenu1 = [
  { id: 0, display: "CRM",          title: "CRM",          click: true },
  { id: 1, display: "My Services",  title: "My Services",  click: true },
  { id: 2, display: "My Paths",     title: "Paths",        click: true },
  { id: 3, display: "Universities", title: "Universities", click: true },
];

const sidebarMenu2 = [
  { id: 0, display: "Overview",    title: "Overview",   click: true },
  { id: 1, display: "CRM",         title: "CRM",         click: true },
  { id: 2, display: "Paths",       title: "Paths",       click: true },
  { id: 3, display: "Steps",       title: "Steps",       click: true },
  { id: 4, display: "Marketplace", title: "Marketplace", click: true },
];

const sidebarMenu3 = [];

const AdminAccDashsidebar = ({
  isNotOnMainPage,
  handleChangeAccDashsidebar,
  admin,
}) => {
  const [selectedMenu, setSelectedMenu] = useState([]);
  const { accsideNav, setaccsideNav } = useStore();
  const navigate = useNavigate();
  const location = useLocation(); // ✅

  useEffect(() => {
    const menu = admin ? sidebarMenu2 : sidebarMenu1;
    setSelectedMenu(menu);

    // ✅ Derive active tab from current URL path on mount/navigation
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
  }, [admin, location.pathname]); // ✅ re-run when URL changes

  // ✅ Highlight based on current URL
  const isActive = (title) => {
    const route = ROUTE_MAP[title];
    if (!route) return accsideNav === title;
    return location.pathname === route.split("?")[0];
  };

  const handleNavClick = (each) => {
    if (!each.click) return;
    setaccsideNav(each.title);
    const route = ROUTE_MAP[each.title];
    if (route) {
      navigate(route); // ✅ navigate to URL
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

  return (
    <div
      className="dashboard-sidebar"
      style={{
        overflow: "hidden",
        padding: "0",
        width: "210px",
        flexShrink: 0,
        position: "relative",
        zIndex: 100,
        background: "#ffffff",
        boxShadow: "none",
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────────────────── */}
      <div
        className="dashboard-left"
        style={{
          padding: "0 2vw",
          height: "70px",
          borderBottom: "0.5px solid #e5e5e5",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => {
          const defaultTitle = admin ? "Overview" : "CRM";
          setaccsideNav(defaultTitle);
          navigate(ROUTE_MAP[defaultTitle]);
        }}
      >
        <img
          className="dashboard-logo"
          src={logo}
          alt="Naavi"
          style={{ width: "60%" }}
        />
      </div>

      {/* ── Nav items ────────────────────────────────────────────────────── */}
      <div
        style={{
          overflowY: "scroll",
          height: "calc(100vh - 140px)",
          marginTop: "30px",
          padding: "0 2vw",
        }}
      >
        <div>
          {selectedMenu?.map((each, i) => (
            <div
              key={i}
              className="each-sidenav"
              style={{
                // ✅ Active highlight based on URL
               background: isActive(each.title) ? "rgba(34, 115, 230, 0.1)" : "transparent",
color: isActive(each.title) ? "#2273E6" : "#64748b",
                fontWeight: isActive(each.title) ? "600" : "500",
                borderRadius: isActive(each.title) ? "8px" : "0",
                paddingLeft: "0",
                opacity: each.click ? "1" : "0.25",
                cursor: each.click ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                padding: "12px 16px",
                marginBottom: "4px",
                fontSize: "0.95rem",
              }}
              onClick={() => handleNavClick(each)}
            >
              {each.display}
            </div>
          ))}
        </div>

        <div>
          {sidebarMenu3.map((ele, j) => (
            <div
              key={j}
              className="each-sidenav"
              style={{
                background: "transparent",
                color: "#64748b",
                paddingLeft: "0",
                borderRadius: "0",
                opacity: ele.click ? "1" : "0.25",
                cursor: ele.click ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                padding: "12px 16px",
                marginBottom: "4px",
                fontSize: "0.95rem",
                fontWeight: "500",
              }}
              onClick={() => handleNavClick(ele)}
            >
              {ele.title}
            </div>
          ))}
        </div>
      </div>

      {/* ── Logout ───────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          padding: "10px 14px",
          borderTop: "1px solid #e5e5e5",
          background: "#ffffff",
          marginTop: "auto",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "8px 12px",
            background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
            color: "#dc2626",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
            e.currentTarget.style.borderColor = "#f87171";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(220, 38, 38, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)";
            e.currentTarget.style.borderColor = "#fecaca";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminAccDashsidebar;