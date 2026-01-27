import React, { useState } from "react";
import realtorwhite from "../../static/images/dashboard/realtorwhite.svg";
import "./accDashsidebar.scss";
import { useStore } from "../store/store.ts";
import { useNavigate } from "react-router-dom";
// import logo from "./logo.svg";
import logo from "./naavilogo.png";

const sidebarMenu1 = [
  {
    id: 0,
    display: "CRM",
    title: "CRM",
    click: true,
    path: "/dashboard/accountants",
  },
  {
    id: 1,
    display: "My Paths",
    title: "Paths",
    click: true,
    path: "/dashboard/accountants/paths",
  },
  {
    id: 2,
    display: "My Steps",
    title: "Steps",
    click: true,
    path: "/dashboard/accountants/steps",
  },
  {
    id: 3,
    display: "My Services",
    title: "My Services",
    click: true,
    path: "/dashboard/accountants/services",
  },
];

const sidebarMenu2 = [
  {
    id: 0,
    display: "CRM",
    title: "CRM",
    click: true,
  },
  {
    id: 1,
    display: "Paths",
    title: "Paths",
    click: true,
  },

];

const sidebarMenu3 = [
  // {
  //   id: 0,
  //   title: "Wallet",
  //   click: true,
  // },
  // {
  //   id: 1,
  //   title: "Naavi GPT",
  //   click: true,
  // },
];

const sidebarMenu4 = [
  // {
  //   id: 0,
  //   title: "Wallet",
  //   click: true,
  // },
  // {
  //   id: 1,
  //   title: "Naavi GPT",
  //   click: true,
  // },
];



const AccDashsidebar = ({ isNotOnMainPage, handleChangeAccDashsidebar , admin}) => {
  const selectedMenu = admin ? sidebarMenu2 : sidebarMenu1;

  const { accsideNav, setaccsideNav, setispopular } = useStore();
  const navigate = useNavigate();
  return (
    <div
      className="dashboard-sidebar"
      style={{ overflow: "hidden", padding: "0" }}
    >
      <div
        className="dashboard-left"
        style={{
          padding: "0 2vw",
          height: "70px",
          borderBottom: "0.5px solid #e5e5e5",
          display: "flex",
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
      <div
        style={{
          overflowY: "scroll",
          height: "75vh",
          marginTop: "30px",
          padding: "0 2vw",
        }}
      >
        {/* <div
          style={{
            fontWeight: "600",
            fontSize: "18px",
            marginBottom: "1.5rem",
            color: "#100F0D",
          }}
        >
          Grow
        </div> */}
        <div>
          {selectedMenu?.map((each, i) => {
            return (
              <div
                className="each-sidenav"
                style={{
                  background: accsideNav === each.title ? "#FFFFFF" : "",
                  color: accsideNav === each.title ? "#100F0D" : "",
                  paddingLeft: accsideNav === each.title ? '20px' : '',
                  // boxShadow:
                  //   accsideNav === each.title
                  //     ? "0px 2px 2px rgba(0, 0, 0, 0.25)"
                  //     : "",
                  // fontWeight: accsideNav === each.title ? "700" : "500",
                  borderRadius: accsideNav === each.title ? "35px" : "",
                  opacity: each.click ? "1" : "0.25",
                  cursor: each.click ? "pointer" : "not-allowed",
                }}
                key={i}
                onClick={() => {
  if (!each.click) return;

  // Close sidebar (mobile)
  if (handleChangeAccDashsidebar) {
    handleChangeAccDashsidebar();
  }

  // Update active menu
  setaccsideNav(each.title);

  // 🔥 CHANGE URL BASED ON MENU
  if (each.path) {
    navigate(each.path);
  }
}}

              >
                {each.display}
              </div>
            );
          })}
        </div>
        {/* <div className="sidebar-line"></div>
        <div
          style={{
            fontWeight: "600",
            fontSize: "18px",
            marginBottom: "1.5rem",
            color: "#100F0D",
          }}
        >
          Manage
        </div>
        <div>
          {sidebarMenu2.map((ele, j) => {
            return (
              <div
                className="each-sidenav"
                style={{
                  background: accsideNav === ele.title ? "#FFFFFF" : "",
                  color: accsideNav === ele.title ? "#100F0D" : "",
                  paddingLeft: accsideNav === ele.title ? "20px" : "",
                  // boxShadow:
                  //   accsideNav === ele.title
                  //     ? "0px 2px 2px rgba(0, 0, 0, 0.25)"
                  //     : "",
                  borderRadius: accsideNav === ele.title ? "35px" : "",
                  opacity: ele.click ? "1" : "0.25",
                  cursor: ele.click ? "pointer" : "not-allowed",
                  // fontWeight: accsideNav === ele.title ? "700" : "500",
                }}
                key={j}
                onClick={() => {
                  if (ele.click && isNotOnMainPage) {
                    navigate("/dashboard/accountants");
                  } else if (ele.click) {
                    setaccsideNav(ele.title);
                  }
                }}
              >
                {ele.title}
              </div>
            );
          })}
        </div> */}
        {/* <div className="sidebar-line"></div> */}
        {/* <div
          style={{
            fontWeight: "600",
            fontSize: "18px",
            marginBottom: "1.5rem",
            color: "#100F0D",
          }}
        >
          Tools
        </div> */}
        <div>
          {sidebarMenu3.map((ele, j) => {
            return (
              <div
                className="each-sidenav"
                style={{
                  background: accsideNav === ele.title ? "#FFFFFF" : "",
                  color: accsideNav === ele.title ? "#100F0D" : "",
                  paddingLeft: accsideNav === ele.title ? "20px" : "",
                  // boxShadow:
                  //   accsideNav === ele.title
                  //     ? "0px 2px 2px rgba(0, 0, 0, 0.25)"
                  //     : "",
                  borderRadius: accsideNav === ele.title ? "35px" : "",
                  opacity: ele.click ? "1" : "0.25",
                  cursor: ele.click ? "pointer" : "not-allowed",
                  // fontWeight: accsideNav === ele.title ? "700" : "500",
                }}
                key={j}
                onClick={() => {
                  if (handleChangeAccDashsidebar) {
                    handleChangeAccDashsidebar();
                    setaccsideNav(ele.title);
                  } else if (ele.click && isNotOnMainPage) {
                    navigate("/dashboard/accountants");
                  } else if (ele.click) {
                    setaccsideNav(ele.title);
                  }
                }}
              >
                {ele.title}
              </div>
            );
          })}
        </div>
      </div>
      {!admin &&
      <div
        className="side-btn"
        style={{
          background: "#59A2DD",
          borderRadius: "35px",
          padding: "15px 0px",
          color: "#FFF",
          width: "15vw",
          textAlign: "center",
          position: "fixed",
          bottom: "20px",
          cursor: "pointer",
          left: "2.5vw",
        }}
        onClick={() => setispopular(true)}
      >
        Add New
      </div>}
    </div>
  );
};

export default AccDashsidebar;
