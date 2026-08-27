// Package Imports
import React, { useEffect, useState, useContext } from "react";

// CSS Imports
import "./globalSidebar.scss";

// Context Imports
import { GlobalContex } from "../../globalContext";

// Image Imports
import Lock from "../../static/images/icons/lock.svg";
import { ReactComponent as Collapse_img } from "../../static/images/icons/collapse.svg";
import { ReactComponent as Collapse1_img } from "../../static/images/icons/collapse1.svg";
import { useNavigate } from "react-router-dom";
import PubMainImg from "../../assets/MainPageImgs/PubMainImg.svg";
import defaultImg from "../../static/images/icons/app_placeholder.png";


const GlobalSidebar = ({ globalMenu }) => {
  const {
    collapse,
    setCollapse,
    loginData,
    setLoginData,
    selectedApp,
    setModalOpen,
    setSelectedApp,
    login,
    setLogin,
    authorDetail,
    publicationDetail,
    selectedPublication,
    MainMenu,
    allPublications
  } = useContext(GlobalContex);

  const navigate = useNavigate();

  // localStorage.removeItem("selectedApp");


  useEffect(() => {
    const lastPart = window.location.pathname.split("/").pop();
    // console.log(lastPart, "location");

    if (localStorage.getItem("selectedApp") && selectedApp === null) {
      setSelectedApp(JSON.parse(localStorage.getItem("selectedApp")));
      setSelectedApp(MainMenu[0]);
    } else if (localStorage.getItem("selectedApp")) {
      localStorage.setItem("selectedApp", JSON.stringify(MainMenu[0]));

    }
  }, [selectedApp, setSelectedApp, MainMenu, globalMenu]);

  // useEffect(() => {
  //   const lastPart = window.location.pathname.split("/").pop();
  //   console.log(lastPart, "location");
  //   if(lastPart === "admin" || lastPart === "authors"){
  //     window.location.reload();
  //   }
  // }, []);

  return (
    <>
      {!collapse ? (
        <div
          // className="sidebar"
          className={loginData ? "sidebar-loggedin" : "sidebar-loggedout"}
          style={{
            height: "100vh",
            opacity: loginData ? 1 : 0,
          }}
        >
          <div className="globalItem" onClick={(e) => {
            setSelectedApp(MainMenu[0]);
            navigate(`/${MainMenu[0].appName}`);
          }} style={{
            cursor: "pointer",
            opacity: 1,
            border: selectedApp?.appName === MainMenu[0].appName ? "solid 0.5px #e7e7e7" : "",
          }}>
            <img src={MainMenu[0].appLogo} alt="naaviImg" style={{ width: "35px" }} />
            <div className="hoveredData1">
              {MainMenu[0].DispName}
            </div>
          </div>
          <div
            style={{
              // minHeight: loginData
              //   ? window.innerHeight - 110
              //   : window.innerHeight,
              overflowY: "scroll",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {globalMenu.map((item, index) => {
              console.log(item?.appLogo, "item");
              return (
                <div
                  key={index}
                  className="globalItem"
                  style={{
                    opacity: selectedApp?.appName === item.appName ? 1 : 0.3,
                    border: selectedApp?.appName === item.appName ? "solid 0.5px #e7e7e7" : ""
                  }}
                  onClick={(e) => {
                    if (loginData) {
                      if (
                        item.appName === "Authors" ||
                        item.appName === "Publishers" ||
                        item.appName === "Classrooms"
                      ) {
                        // if (selectedApp?.appName === item.appName) {
                        if (authorDetail !== null && authorDetail !== undefined && allPublications !== null && allPublications !== undefined && allPublications.length > 0) {
                          setSelectedApp(item);
                          navigate(`/${item.appName}`);
                        }
                        // }
                      }
                    } else {
                      if (
                        item.appName === "Authors" ||
                        item.appName === "Publishers"
                      ) {
                        if (selectedApp?.appName === item.appName) {
                          setSelectedApp(item);
                          navigate(`/${item.appName}`);
                        }
                      }
                    }
                  }}
                >
                  <img src={item?.appLogo} alt="" style={{ width: "30px" }} />
                </div>
              );
            })}
          </div>

          {loginData ? (
            <div className="lock">
              <div className="bottomIcon">
                <div
                  style={{
                    height: "70px",
                    // background: "red",
                    // borderTop: "solid 1px #e7e7e7",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0px 30px",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <div className="shadowHover">
                      {loginData?.user.profile_img ? (
                        <img
                          onClick={(e) => setModalOpen(true)}
                          src={loginData?.user.profile_img}
                          alt=""
                          width="37px"
                          height="37px"
                          style={{ borderRadius: "50%", cursor: "pointer" }}
                        />
                      ) : (
                        <img
                          onClick={(e) => setModalOpen(true)}
                          src={defaultImg}
                          alt=""
                          width="37px"
                          style={{ borderRadius: "50%", cursor: "pointer" }}
                        />
                      )}
                    </div>

                    {/* <div style={{ paddingLeft: "9px" }}>
                      <div className="name">{loginData?.user.name}</div>
                      <div className="email">{loginData?.user.email}</div>
                    </div> */}
                  </div>
                </div>
              </div>
              <div
                className="bottomIcon"
                onClick={(e) => {
                  localStorage.clear();
                  // window.location.reload();
                  navigate('/dashboard');
                }}
              >
                <img src={Lock} alt="" />
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      {/* {loginData ? (
        <div className="collapseButton" onClick={(e) => setCollapse(!collapse)}>
          {collapse ? (
            <Collapse1_img fill="white" stroke="none" />
          ) : (
            <Collapse_img fill="white" stroke="none" />
          )}
        </div>
      ) : (
        ""
      )} */}
    </>
  );
};

export default GlobalSidebar;
