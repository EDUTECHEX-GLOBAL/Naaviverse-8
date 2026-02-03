import React from "react";
import { useContext } from "react";
import GlobalSidebar from "../../globalComponents/GlobalSidebar/globalsidebar";
import LocalSidebar from "../../globalComponents/LocalSidebar/localsidebar";
import { GlobalContex } from "../../globalContext";

import TabsLayout from "../../globalComponents/TabsLayout";
// import AdminModal from "../../globalComponents/AdminModal";
import MobileMenu from "../../globalComponents/MobileMenu/mobilemenu";
import "../commonAppCss.scss";



import Web3Dashboard from "./Web3Dashboard";

const Publishers = () => {
  const {
    collapse,
    setTabs,
    setSelectedTab,
    selectedTab,
    loginData,
    setBankerEmail,
    modalOpen,
    setModalOpen,
    localMenu,
    globalMenu,
    mcbMenu,
    web3Menu,
    setDispdraw,
    showMobileMenu,
    tabSelected,
    setTabSelected,
  } = useContext(GlobalContex);

  // const openside = (e) => {
  //   themail = e.currentTarget.id;
  //   value.setselectemail(e.currentTarget.id);
  //   value.setdispdraw("TranslateX(0%)");
  //   value.settriggerevent("none");
  // };

  const conditionalPages = () => {
    switch (selectedTab?.menuName) {
      case "Management":
        return (
          <Web3Dashboard
            tabSelected={tabSelected}
            setTabSelected={setTabSelected}
          />
        );
      default:
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: 700,
              fontSize: "20px",
              height: "70vh",
            }}
          >
            Coming Soon
          </div>
        );
        break;
    }
  };

  return (
    <>
      <div className="desktopWrapper">
        <div className={collapse ? "grid-cap-collapsed" : "grid-cap"}>
          <GlobalSidebar globalMenu={globalMenu} />
          <LocalSidebar localMenu={web3Menu} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <TabsLayout />
            <div style={{ height: "100%" }}>{conditionalPages()}</div>
          </div>
        </div>
      </div>
      {/* {showMobileMenu ? (
        <MobileMenu />
      ) : (
        <div className="mobileWrapper">
          <TabsLayout />
          <div style={{}}>{conditionalPages()}</div>
        </div>
      )} */}
    </>
  );
};

export default Publishers;
