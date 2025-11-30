import React, { useState, useEffect } from "react";
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
  },
  {
    id: 1,
    display: "My Services",
    title: "My Services",
    click: true,
  },
  {
    id: 2,
    display: "My Paths",
    title: "Paths",
    click: true,
  },

  { 
    id: 3, 
    display: "Universities", 
    title: "Universities", 
    click: true 
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
  {
    id: 2,
    display: "Steps",
    title: "Steps",
    click: true,
  },
  {
    id: 3,
    display: "Services",
    title: "Services",
    click: true,
  },

   { 
      id: 4, 
      display: "Universities",
      title: "Universities", 
      click: true 
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



const AdminAccDashsidebar = ({ isNotOnMainPage, handleChangeAccDashsidebar , admin}) => {
 const [selectedMenu, setSelectedMenu] = useState([]);

useEffect(() => {
  setSelectedMenu(admin ? sidebarMenu2 : sidebarMenu1);
}, [admin]);

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
                  if (handleChangeAccDashsidebar) {
                    handleChangeAccDashsidebar();
                    setaccsideNav(each.title);
                  } else if (each.click && isNotOnMainPage) {
                    navigate("/dashboard/accountants");
                  } else if (each.click) {
                    setaccsideNav(each.title);
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
      
    </div>
  );
};

export default AdminAccDashsidebar;
