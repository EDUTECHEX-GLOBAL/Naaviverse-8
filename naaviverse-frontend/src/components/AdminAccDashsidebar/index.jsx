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

// ✅ Fixed duplicate id: 0 on CRM — was causing React key warnings
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

    // ✅ THE CORE FIX:
    // On first load, accsideNav is "" (empty string from the store).
    // Nothing matched any section → "Coming Soon" was shown.
    // Now we set the default to the first menu item's title.
    // For admin=true → "Dashboard" → renders <Dashboard /> in accDashboard.jsx
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
      style={{ overflow: "hidden", padding: "0" }}
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
          style={{ width: "50%" }}
        />
      </div>

      {/* ── Nav items ────────────────────────────────────────────────────── */}
      <div
        style={{
          overflowY: "scroll",
          height: "75vh",
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
                background:   accsideNav === each.title ? "#FFFFFF" : "",
                color:        accsideNav === each.title ? "#100F0D" : "",
                paddingLeft:  accsideNav === each.title ? "20px"    : "",
                borderRadius: accsideNav === each.title ? "35px"    : "",
                opacity: each.click ? "1"       : "0.25",
                cursor:  each.click ? "pointer" : "not-allowed",
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
                background:   accsideNav === ele.title ? "#FFFFFF" : "",
                color:        accsideNav === ele.title ? "#100F0D" : "",
                paddingLeft:  accsideNav === ele.title ? "20px"    : "",
                borderRadius: accsideNav === ele.title ? "35px"    : "",
                opacity: ele.click ? "1"       : "0.25",
                cursor:  ele.click ? "pointer" : "not-allowed",
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
    </div>
  );
};

export default AdminAccDashsidebar;