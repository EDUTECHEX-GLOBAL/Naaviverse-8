import React, { useState, useEffect } from "react";
import realtorwhite from "../../static/images/dashboard/realtorwhite.svg";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";

const sidebarMenu1 = [
  { id: 0, display: "CRM",          title: "CRM",          click: true },
  { id: 1, display: "My Services",  title: "My Services",  click: true },
  { id: 2, display: "My Paths",     title: "Paths",        click: true },
  { id: 3, display: "Universities", title: "Universities", click: true },
];

const sidebarMenu2 = [
  { id: 0, display: "Dashboard",   title: "Dashboard",   click: true },
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
  const { accsideNav, setaccsideNav, setispopular } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const menu = admin ? sidebarMenu2 : sidebarMenu1;
    setSelectedMenu(menu);

    const knownTitles = menu.map((m) => m.title);
    if (!accsideNav || !knownTitles.includes(accsideNav)) {
      setaccsideNav(menu[0].title);
    }
  }, [admin]);

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
        boxShadow: "none"
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
        }}
        onClick={() => {
          if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
          setaccsideNav(admin ? "Dashboard" : "CRM");
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
                background: "transparent",
                color: "#64748b",
                paddingLeft: "0",
                borderRadius: "0",
                opacity: each.click ? "1" : "0.25",
                cursor: each.click ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                padding: "12px 16px",
                marginBottom: "4px",
                fontSize: "0.95rem",
                fontWeight: "500",
              }}
              onClick={() => {
                if (!each.click) return;
                setaccsideNav(each.title);
                if (handleChangeAccDashsidebar) {
                  handleChangeAccDashsidebar();
                } else if (isNotOnMainPage) {
                  navigate("/dashboard/accountants");
                }
              }}
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
              onClick={() => {
                if (!ele.click) return;
                setaccsideNav(ele.title);
                if (handleChangeAccDashsidebar) {
                  handleChangeAccDashsidebar();
                } else if (isNotOnMainPage) {
                  navigate("/dashboard/accountants");
                }
              }}
            >
              {ele.title}
            </div>
          ))}
        </div>
      </div>

      {/* ── LOGOUT BUTTON - UPDATED WITH BETTER DESIGN ─────────────────────────────────── */}
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
            e.target.style.background = "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)";
            e.target.style.borderColor = "#f87171";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 2px 8px rgba(220, 38, 38, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)";
            e.target.style.borderColor = "#fecaca";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
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