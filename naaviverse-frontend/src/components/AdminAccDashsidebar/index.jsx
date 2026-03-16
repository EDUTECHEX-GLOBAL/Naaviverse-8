import React, { useState, useEffect } from "react";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo/naavi_final_logo2.png";

const sidebarMenu1 = [
  { id: 0, display: "CRM",          title: "CRM",         click: true },
  { id: 1, display: "My Services",  title: "My Services", click: true },
  { id: 2, display: "My Paths",     title: "Paths",       click: true },
  { id: 3, display: "Marketplace",  title: "Marketplace", click: true },
];

const sidebarMenu2 = [
  { id: 0, display: "CRM",         title: "CRM",         click: true },
  { id: 1, display: "Paths",       title: "Paths",       click: true },
  { id: 2, display: "Steps",       title: "Steps",       click: true },
  { id: 3, display: "Marketplace", title: "Marketplace", click: true },
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

  useEffect(() => {
    setSelectedMenu(admin ? sidebarMenu2 : sidebarMenu1);
  }, [admin]);

 const handleLogout = () => {
  localStorage.clear();
  navigate("/admin/login");
};

  return (
    <div
      className="dashboard-sidebar"
      style={{ overflow: "hidden", padding: "0" }}
    >
      {/* Logo */}
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
          if (handleChangeAccDashsidebar) {
            handleChangeAccDashsidebar();
            setaccsideNav("CRM");
          }
        }}
      >
        <img
          className="dashboard-logo"
          src={logo}
          alt=""
          style={{ width: "50%" }}
        />
      </div>

      {/* Menu Items */}
      <div
        style={{
          overflowY: "scroll",
          height: "calc(100vh - 70px)",
          padding: "30px 2vw 20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Primary menu */}
        <div>
          {selectedMenu?.map((each, i) => (
            <div
              key={i}
              className="each-sidenav"
              style={{
                background:   accsideNav === each.title ? "#FFFFFF" : "",
                color:        accsideNav === each.title ? "#100F0D" : "",
                paddingLeft:  accsideNav === each.title ? "20px"    : "",
                borderRadius: accsideNav === each.title ? "35px"    : "",
                opacity: each.click ? "1" : "0.25",
                cursor:  each.click ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (!each.click) return;
                setaccsideNav(each.title);
                if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
              }}
            >
              {each.display}
            </div>
          ))}
        </div>

        {/* Secondary menu (currently empty) */}
        <div>
          {sidebarMenu3.map((ele, j) => (
            <div
              key={j}
              className="each-sidenav"
              style={{
                background:   accsideNav === ele.title ? "#FFFFFF" : "",
                color:        accsideNav === ele.title ? "#100F0D" : "",
                paddingLeft:  accsideNav === ele.title ? "20px"    : "",
                borderRadius: accsideNav === ele.title ? "35px"    : "",
                opacity: ele.click ? "1" : "0.25",
                cursor:  ele.click ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (!ele.click) return;
                setaccsideNav(ele.title);
                if (handleChangeAccDashsidebar) handleChangeAccDashsidebar();
              }}
            >
              {ele.title}
            </div>
          ))}
        </div>

        {/* Spacer to push logout to bottom */}
        <div style={{ flex: 1 }} />

        {/* Logout */}
        <div
          style={{
            paddingTop: "16px",
            borderTop: "1px solid #e5e5e5",
          }}
        >
          <div
            className="each-sidenav logout-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "35px",
              cursor: "pointer",
              color: "#ef4444",
              backgroundColor: "#fee2e2",
              transition: "all 0.2s",
            }}
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fecaca";
              e.currentTarget.style.color = "#dc2626";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fee2e2";
              e.currentTarget.style.color = "#ef4444";
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "14px" }}>Logout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccDashsidebar;