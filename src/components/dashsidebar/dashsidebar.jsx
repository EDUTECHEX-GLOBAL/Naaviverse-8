import React from "react";
import "./dashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import logo from '../../assets/images/logo/naavi_final_logo2.png';
import history from "./history.svg";

/* ================= MENU CONFIG ================= */

const sidebarMenu1 = [
  {
    id: 0,
    title: "Paths",
    path: "/dashboard/users",
  },
];

const sidebarMenu2 = [
  {
    id: 0,
    title: "My Journey",
    path: "/dashboard/users/my-journey",
  },
  {
    id: 1,
    title: "Current Step",
    path: "/dashboard/users/current-step",
  },
  {
    id: 2,
    title: "Transactions",
    path: "/dashboard/users/transactions",
  },
];

/* ================= COMPONENT ================= */

const Dashsidebar = ({ isNotOnMainPage, handleChange }) => {
  const { sideNav, setsideNav, setBuy } = useStore();
  const navigate = useNavigate();

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

  /* ================= HANDLER ================= */

  const handleNavigation = (title, path) => {
    // Reset step-related states
    setCurrentStepData("");
    setCurrentStepDataLength("");
    setCurrentStepDataPathId("");
    setTransactionSelected(false);
    setTransactionData([]);

    // Update sidebar state
    setsideNav(title);

    // Navigate
    navigate(path);
  };

  return (
    <div className="dashboard-sidebar1" style={{ overflow: "hidden" }}>
      {/* ================= LOGO ================= */}
      <div className="logo-border">
        <div
          className="dashboard-left"
          onClick={() => {
            setsideNav("Paths");
            navigate("/dashboard/users");
          }}
        >
          <img
            className="dashboard-logo"
            src={logo}
            alt="logo"
            style={{ width: "50%" }}
          />
        </div>
      </div>

      {/* ================= MENU ================= */}
      <div
        style={{
          overflowY: "scroll",
          height: "calc(100% - 70px)",
        }}
      >
        {/* ----------- DISCOVER ----------- */}
        <div style={{ padding: "0 2vw" }}>
          {sidebarMenu1.map((each) => (
            <div
              key={each.id}
              className="each-sidenav"
              style={{
                background: sideNav === each.title ? "#FFFFFF" : "",
                color: sideNav === each.title ? "#100F0D" : "",
                paddingLeft: sideNav === each.title ? "20px" : "",
                borderRadius: sideNav === each.title ? "35px" : "",
              }}
              onClick={() => handleNavigation(each.title, each.path)}
            >
              {each.title}
            </div>
          ))}
        </div>

        {/* ----------- MANAGE ----------- */}
        <div style={{ padding: "0 2vw" }}>
          {sidebarMenu2.map((ele) => (
            <div
              key={ele.id}
              className="each-sidenav"
              style={{
                background: sideNav === ele.title ? "#FFFFFF" : "",
                color: sideNav === ele.title ? "#100F0D" : "",
                paddingLeft: sideNav === ele.title ? "20px" : "",
                borderRadius: sideNav === ele.title ? "35px" : "",
              }}
              onClick={() => handleNavigation(ele.title, ele.path)}
            >
              {ele.title}
            </div>
          ))}
        </div>

        {/* ----------- HISTORY ----------- */}
        {checkForHistory && (
          <div className="history-div">
            <div className="history-box">
              <img src={history} alt="history" />
              <div style={{ fontSize: "0.8rem" }}>
                You viewed the following path:
              </div>
              <div className="history-details">
                <div className="font1" style={{ fontWeight: "500" }}>
                  {preLoginHistoryData?.destination_institution}
                </div>
                <div className="font1">{preLoginHistoryData?.program}</div>
                <div className="pathId-text">
                  <span style={{ fontWeight: "600" }}>pathid:</span>{" "}
                  {preLoginHistoryData?._id}
                </div>
              </div>
              <div
                className="open-btn"
                onClick={() => {
                  setPathItemSelected(true);
                  setSelectedPathItem(preLoginHistoryData);
                  localStorage.setItem(
                    "selectedPath",
                    JSON.stringify(preLoginHistoryData?.nameOfPath)
                  );
                  navigate("/dashboard/users/my-journey");
                }}
              >
                Open
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashsidebar;
