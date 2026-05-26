import React from "react";
import { useContext } from "react";
import { GlobalContex } from "../../globalContext";
import GlobalSidebar from "../GlobalSidebar/globalsidebar";
import "./mobileMenu.scss";

import lock from "../../static/images/icons/lock.svg";
import defaultImg from "../../static/images/icons/app_placeholder.png";
import { ReactComponent as Collapse_img } from  "../../static/images/collapse.svg";
import { ReactComponent as Collapse1_img } from "../../static/images/collapse1.svg";

const MobileMenu = () => {
  const {
    globalMenu,
    web3Menu,
    selectedApp,
    selectedTab,
    loginData,
    tabs,
    setTabs,
    setSelectedTab,
    setShowMobileMenu,
  } = useContext(GlobalContex);

  const handleAddTab = (e, data) => {
    console.log("inside addtab", "wkejbkwe");
    console.log(
      tabs.find((o) => o.menuName === data.info.menuName),
      "jhgbwbed"
    );

    if (tabs.length > 0) {
      if (tabs.find((o) => o.menuName === data.info.menuName) === undefined) {
        setTabs([...tabs, data.info]);
      } else {
        setSelectedTab(data.info);
      }
    } else {
      if (selectedTab.menuName !== data.info.menuName) {
        setTabs([selectedTab, data.info]);
      }
    }
  };

  const handleReplaceTab1 = (e, data) => {
    const index = tabs.indexOf((o) => o.menuName === data.info.menuName);
    tabs.splice(index, 1, data.info);
    setSelectedTab(data.info);
  };

  const handleReplaceTab = (item) => {
    if (
      tabs.findIndex((o) => o.menuName === item.menuName) < 0 ||
      tabs.length < 1
    ) {
      const index = tabs.findIndex((o) => o.menuName === selectedTab.menuName);
      console.log(
        tabs.findIndex((o) => o.menuName === selectedTab.menuName),
        selectedTab,
        "jhwgjwhe"
      );
      tabs.splice(index, 1, item);
      setSelectedTab(tabs.length < 1 ? tabs[index] : item);
    } else {
      setSelectedTab(item);
    }
  };

  return (
    <>
      <div className="mobileMenuGrid">
        <div className="leftView">
          <div>
            {globalMenu.map((item) => {
              return (
                <img
                  src={item?.appLogo}
                  alt=""
                  style={{
                    width: "30px",
                    padding: "30px 0px",
                    opacity: selectedApp?.appName === item.appName ? 1 : 0.3,
                  }}
                />
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderTop: "0.5px solid #e7e7e7",
            }}
          >
            <img src={lock} alt="" style={{ width: "20px" }} />
          </div>
        </div>
        <div className="rightView">
          <div
            onClick={(e) => setShowMobileMenu(false)}
            style={{
              position: "absolute",
              top: "9.2vh",
              left: "20vw",
              border: "0.5px solid #e7e7e7",
              borderRadius: "50%",
              height: "25px",
              width: "25px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "white",
            }}
          >
            <Collapse1_img fill={selectedApp?.appColor} stroke="none" />
          </div>
          <div style={{ borderBottom: "0.5px solid #e7e7e7", padding: "20px" }}>
            <img
              style={{ cursor: "pointer", width: "70%" }}
              src={selectedApp?.appFullLogo}
              alt=""
              //   onClick={(e) => setCollapse(true)}
            />
          </div>
          <div style={{ paddingTop: "10px" }}>
            {web3Menu.map((item) => {
              return (
                <div
                  className="menuItem00"
                  //   onContextMenu={(e) => setRightClikedOn(item)}
                  onClick={(e) => {
                    handleReplaceTab(item);
                    setShowMobileMenu(false);
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      opacity: item.enabled ? 1 : 0.3,
                    }}
                  >
                    {/* <div className="menuIcon">
                      <img src={item.menuIcon} alt="" />
                    </div> */}
                    <div className="menuName">{item.menuName}</div>
                  </div>
                  {selectedTab?.menuName === item.menuName ? (
                    <div
                      className="selected"
                      style={{ background: selectedApp.appColor }}
                    >
                      &nbsp;
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              //   alignItems: "center",
              borderTop: "0.5px solid #e7e7e7",
              paddingLeft: "20px",
            }}
          >
            <div style={{ display: "flex" }}>
              <div className="shadowHover">
                {loginData?.user.profile_img ? (
                  <img
                    // onClick={(e) => setModalOpen(true)}
                    src={loginData?.user.profile_img}
                    alt=""
                    width="37px"
                    height="37px"
                    style={{ borderRadius: "50%", cursor: "pointer" }}
                  />
                ) : (
                  <img
                    // onClick={(e) => setModalOpen(true)}
                    src={defaultImg}
                    alt=""
                    width="37px"
                    style={{ borderRadius: "50%", cursor: "pointer" }}
                  />
                )}
              </div>

              <div style={{ paddingLeft: "9px" }}>
                <div className="name">{loginData?.user.name}</div>
                <div className="email">{loginData?.user.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
