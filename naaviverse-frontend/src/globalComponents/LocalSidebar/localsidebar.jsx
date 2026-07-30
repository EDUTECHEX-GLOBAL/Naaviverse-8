// Package Imports
import React, { useContext, useState } from "react";
import axios from "axios";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

// CSS Imports
import "./localSidebar.scss";

// Context Imports
import { GlobalContex } from "../../globalContext";

// Image Imports
import lock from "../../static/images/icons/lock.svg";
import defaultImg from "../../static/images/icons/app_placeholder.png";
import { useEffect } from "react";
import AdminModal from "../AdminModal/adminmodal";

const LocalSidebar = ({ localMenu }) => {
  const {
    selectedApp,
    collapse,
    setCollapse,
    loginData,
    setModalOpen,
    modalOpen,
    tabs,
    setTabs,
    selectedTab,
    setSelectedTab,
    bankerEmail,
    licenseCheck,
    setLicenseCheck,
  } = useContext(GlobalContex);

  const [rightClikedOn, setRightClikedOn] = useState(null);
  const [tabsOpac, setTabsOpac] = useState(1);

  useEffect(() => {
    const lastPart = window.location.pathname.split("/").pop();
    //   console.log(lastPart, "location");
    // setTabs([localMenu[0]]);
    setTabs([]);
    if (lastPart === "Authors") {
      setSelectedTab(localMenu[1]);
    } else {
      setSelectedTab(localMenu[0]);
    }
    // setDataLoading(true);
    // axios
    //   .get(
    //     `https://comms.globalxchange.io/coin/vault/user/license/get?product_id=MCBE1774c9ea1241T1665669204289&license_status=active&email=${bankerEmail}`
    //   )
    //   .then((res) => {

    //     if (
    //       res.data.productLicenses[0]?.licenses[0]?.license_status === "active"
    //     ) {
    //       setLicenseCheck(
    //         res.data.productLicenses[0]?.licenses[0]?.license_status
    //       );
    //       if (lastPart === "Authors") {
    //         setSelectedTab(localMenu[1]);
    //       } else {
    //         setSelectedTab(localMenu[0]);
    //       }
    //     } else {
    //       if (lastPart === "Authors") {
    //         setSelectedTab(localMenu[1]);
    //       } else {
    //         setSelectedTab(localMenu[0]);
    //       }
    //       setLicenseCheck("");
    //     }

    // setLicenseData(res.data.productLicenses);
    // });
    // setBankerEmail(loginData?.user?.email);
  }, [loginData, bankerEmail]);

  // const handleSelectedTab = (item) => {
  //   if (tabs.length > 1) {
  //     // setTabs([...tabs, item]);
  //     var index = tabs.indexOf(selectedApp);

  //     if (tabs.find((o) => o.menuName === item.menuName) !== -1) {
  //       //
  //       setSelectedTab(item);
  //     } else {
  //       // tabs.forEach(function (o, i) {
  //       //   if (o == selectedTab) tabs[i] = item;
  //       // });
  //       const index = tabs.indexOf((o) => o.menuName === item.menuName);
  //       tabs.splice(index, 1, item);
  //       setSelectedTab(tabs[index]);
  //     }
  //   } else {
  //     const index = tabs.indexOf((o) => o.menuName === item.menuName);
  //     tabs.splice(index, 1, item);
  //     setSelectedTab(item);
  //   }
  // };

  const handleAddTab = (e, data) => {
    // if (licenseCheck === "active") {
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
    // }
  };

  const handleReplaceTab1 = (e, data) => {
    // if (licenseCheck === "active") {
    const index = tabs.indexOf((o) => o.menuName === data.info.menuName);
    tabs.splice(index, 1, data.info);
    setSelectedTab(data.info);
  };
  // };

  const handleReplaceTab = (item) => {
    // console.log("license-check ", licenseCheck)
    // if (licenseCheck === "active") {
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
    // }
  };

  return (
    <>
      {!collapse ? (
        <div className="localsidebar">
          <div className="localSidebarLogo">
            {/* <img
              style={{ cursor: "pointer" }}
              src={selectedApp?.appFullLogo}
              alt=""
              width="70%"
              onClick={(e) => setCollapse(true)}
            /> */}
            <div className="localSidebarText">{selectedApp?.DispName}</div>
          </div>
          <div
            style={{
              flexGrow: 1,
              // height: window.innerHeight - 140,
              overflowY: "scroll",
            }}
          >
            {localMenu?.map((item) => {
              return (
                <ContextMenuTrigger id="same_unique_identifier">
                  <div
                    className={"menuItem00" + (selectedTab?.menuName === item.menuName ? " menuActive" : "")}
                    onContextMenu={(e) => setRightClikedOn(item)}
                    onClick={(e) => handleReplaceTab(item)}
                  // style={{
                  //   opacity:
                  //     item.menuName === "GXT Marketplace" ? 1 : tabsOpac,
                  // }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {/* <div className="menuIcon">
                        <img src={item.menuIcon} alt="" />
                      </div> */}
                      <div
                        className="menuName"
                        style={{ color: selectedApp?.appTextColor }}
                      >
                        {item.menuName.split(" ")[0]}&nbsp;
                        {item.menuName.split(" ")[1]}
                      </div>
                    </div>
                    {/* {selectedTab?.menuName === item.menuName ? (
                      <div
                        className="selected"
                      >
                      </div>
                    ) : (
                      ""
                    )} */}
                  </div>
                </ContextMenuTrigger>
              );
            })}
          </div>
          {/* <div
            style={{
              height: "70px",
              // background: "red",
              borderTop: "solid 1px #e7e7e7",
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

              <div style={{ paddingLeft: "9px" }}>
                <div className="name">{loginData?.user.name}</div>
                <div className="email">{loginData?.user.email}</div>
              </div>
            </div>
          </div> */}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: "85px",
            height: "100vh",
            borderRight: "solid 1px #e7e7e7",
          }}
        >
          <div
            style={{
              height: "80px",
              // background: "red",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0px 30px",
              borderBottom: "solid 1px #e7e7e7",
            }}
          >
            <img
              style={{ cursor: "pointer" }}
              src={selectedApp?.appLogo}
              alt=""
              width="50px"
              onClick={(e) => setCollapse(true)}
            />
          </div>
          <div
            style={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: window.innerHeight / 2,
              overflowY: "scroll",
            }}
          >
            {localMenu.map((item) => {
              return (
                <div
                  className={"menuItem " + (selectedTab?.menuName === item.menuName ? "menuCollapseActive":"") }
                  onContextMenu={(e) => setRightClikedOn(item)}
                  onClick={(e) => handleReplaceTab(item)}
                >
                  <div>&nbsp;</div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      opacity: item.enabled ? 1 : 0.3,
                    }}
                  >
                    <div className="menuIcon">
                      <img src={item.menuIcon} alt="" />
                    </div>
                  </div>
                  {/* {selectedTab?.menuName === item.menuName ? (
                    <div
                      className="selected"
                      style={{ background: selectedApp.appColor }}
                    >
                      &nbsp;
                    </div>
                  ) : (
                    <div>&nbsp;</div>
                  )} */}
                </div>
              );
            })}
          </div>
          <div
            style={{
              height: "70px",
              // background: "red",
              borderTop: "solid 1px #e7e7e7",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              // padding: "0px 30px",
              width: "100%",
            }}
          >
            <div
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                localStorage.clear();
              }}
            >
              <img src={lock} alt="" />
            </div>
          </div>
        </div >
      )}

<ContextMenu id="same_unique_identifier">
  <MenuItem data={{ info: rightClikedOn }} onClick={handleReplaceTab1}>
    Open in Current Tab
  </MenuItem>
  <MenuItem data={{ info: rightClikedOn }} onClick={handleAddTab}>
    Open in New Tab
  </MenuItem>
  <MenuItem data={{ info: "bar" }}>Close Menu</MenuItem>
  {/* <MenuItem divider /> */}
  {/* <MenuItem data={{ foo: "bar" }} onClick={handleClick}>
          ContextMenu Item 3
        </MenuItem> */}
</ContextMenu>

{
  modalOpen && (
    <AdminModal
      onClose={() => setModalOpen(false)}
      onSuccess={() => setModalOpen(false)}
    />
  )
}
    </>
  );
};

export default LocalSidebar;
