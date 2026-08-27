import React, { useContext, useState } from "react";
import styles from "./navbar.module.scss";

import bars from "../../../static/images/nav/bars.svg";
import cross from "../../../static/images/nav/cross.svg";
import logo from "../../../static/images/logos/MainLogo.svg";
import downarrow from "../../../static/images/downarrow.svg";
// import { GlobalContex } from "../../globalContext";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/store.ts";

const NavBar = () => {
  const {
    isOpen,
    setOpen,
    mobMenuOpen,
    setmobMenuOpen,
    selectedNav,
    setselectedNav,
    loginType, setLoginType
  } = useStore();
  const navigate = useNavigate();
  //   const {
  //     selectedHomeMenu,
  //     setSelectedHomeMenu,
  //     showMobileMenu,
  //     setShowMobileMenu,
  //     setSelectedApp,
  //     globalMenu,
  //     dropDown,
  //     setdropDown,
  //     dropDownSelectedSub,
  //     setdropDownSelectedSub,
  //   } = useContext(GlobalContex);
  const [selectedMenu, setSelectedMenu] = useState("About");

  return (
    <>
      {/* <div className={styles.topNav}>
        <div>
          <div onClick={() => window.open("http://insider.indianinvestor.com", "_blank")} className={styles.leftMove}>
                        <div className={styles.goBack}>Back To Insider</div>
                    </div>
        </div>
        <div>
          <div onClick={() => window.open("http://taxchains.com", "_blank")}>
            TaxChains
          </div>
          <div
          // onClick={() => window.open("http://indianinvestor.com", "_blank")}
          >
            Accountants.io Is Apart of The{" "}
            <span
              style={{ fontWeight: 800 }}
              onClick={() => window.open("http://airevolution.app", "_blank")}
            >
              Ai Revolution
            </span>
          </div>
        </div>
      </div> */}
      <div className={styles.container}>
        <div className={styles.leftSide}>
          {/* <img src={bars} alt="" /> */}
          <div className={styles.logo}>
            <img
              src={logo}
              alt="logo"
              onClick={() => {
                //   setdropDown(false);
                //   setdropDownSelectedSub("");
                //   setSelectedHomeMenu("How It Works");
                navigate("/");
              }}
            />
          </div>
          <div className={styles.dropbox} onClick={() => setOpen(!isOpen)}>
            <div className={styles.line}> </div>
            <div className={styles.dropDown}>
              <div className={styles.dropDownText1}>
                BY&nbsp;<span className={styles.dropDownText2}>AIR</span>
                &nbsp;&nbsp;
              </div>
              <div
                className={styles.dropDownArrowbox}
                style={{ transform: isOpen ? "rotate(180deg)" : "" }}
              >
                <img className={styles.dropDownArrow} src={downarrow} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div></div>
        <div className={styles.rightSide}>
          {/* <div
            // style={{ color: "#1F304F", fontWeight: 700 }}
            // onClick={(e) => {
            //   setSelectedHomeMenu("How It Works");
            //   navigate("/howitworks");
            //   // if (dropDown && dropDownSelectedSub == "How It Works") {
            //   //   setdropDown(false);
            //   // } else {
            //   //   setdropDown(true);
            //   // }
            //   // setdropDownSelectedSub("How It Works");
            //   setdropDownSelectedSub("");
            //   setdropDown(false);
            // }}
            style={{
              color: "#1F304F",
              fontWeight: selectedNav === "About" ? "700" : "400",
            }}
            onClick={() => {
              setselectedNav("About");
              navigate("/");
            }}
          >
            About
            <div
              className={styles.navSelectedSub}
              //   style={{
              //     display:
              //       selectedHomeMenu != "How It Works" &&
              //         dropDownSelectedSub == "How It Works"
              //         ? "block"
              //         : "",
              //   }}
            ></div>
          </div> */}
          {/* <div
            onClick={(e) => {
              setSelectedHomeMenu("Setup");
              // navigate("/howitworks");
              if (dropDown && dropDownSelectedSub == "Setup") {
                setdropDown(false);
              } else {
                setdropDown(true);
              }
              setdropDownSelectedSub("Setup");
            }}
            style={{
              fontWeight: selectedHomeMenu === "Setup" && dropDown ? 700 : "",
            }}
          >
            Setup
            <div
              className={styles.navSelectedSub}
              style={{
                display:
                  selectedHomeMenu != "Setup" && dropDownSelectedSub == "Setup"
                    ? "block"
                    : "",
              }}
            ></div>
          </div> */}
          <div
            onClick={() => {
              navigate("/directory");
              setselectedNav("Directory");
            }}
            style={{
              color: "#100F0D",
              fontWeight: selectedNav === "Directory" ? "700" : "400",
              marginRight:"30px"
            }}
          >
            Directory
          </div>
          <div style={{ cursor: "not-allowed", marginRight:"50px" }}>Products</div>
          {/* <div style={{ cursor: "not-allowed" }}>Signature Suite</div>
          <div style={{ cursor: "not-allowed" }}>Affiliates</div> */}
          {/* <div
            onClick={(e) => {
              setSelectedHomeMenu("Capitalization");
              navigate("/capitalization");
              // if (dropDown && dropDownSelectedSub == "Capitalization") {
              //   setdropDown(false);
              // } else {
              //   setdropDown(true);
              // }
              // setdropDownSelectedSub("Capitalization");
              setdropDownSelectedSub("");
              setdropDown(false);
            }}
            style={{
              fontWeight: selectedHomeMenu === "Capitalization" ? 700 : "",
            }}
          >
            Capitalization
            <div
              className={styles.navSelectedSub}
              style={{
                display:
                  selectedHomeMenu != "Capitalization" &&
                    dropDownSelectedSub == "Capitalization"
                    ? "block"
                    : "",
              }}
            ></div>
          </div> */}
          <div
            className={styles.button1}
            style={{ color: "white", width: 'unset', padding: '0 25px' }}
            onClick={() => {
              // setSelectedApp(globalMenu[0]);
              setLoginType("Users")
              navigate("/login");
              // setdropDownSelectedSub("");
              // setdropDown(false);
            }}
          >
            For Users
          </div>
          <div
            className={styles.button}
            style={{ color: "white", width: 'unset', padding: '0 30px' }}
            onClick={() => {
              // setSelectedApp(globalMenu[0]);
              navigate("/login");
              // setdropDownSelectedSub("");
              // setdropDown(false);
            }}
          >
            For Accountants
          </div>
        </div>
      </div>
      <div className={styles.mobileContainer}>
        <div>
          <div>
            <img
              className={styles.moblogos}
              src={logo}
              alt="mobilelogo"
              // onClick={() => {
              //   setdropDown(false);
              //   setdropDownSelectedSub("");
              //   setSelectedHomeMenu("How It Works");
              //   navigate("/howitworks");
              // }}
            />
          </div>
          <div className={styles.dropbox} onClick={() => setOpen(!isOpen)}>
            <div className={styles.line}> </div>
            <div className={styles.dropDown}>
              <div className={styles.dropDownText1}>
                BY&nbsp;<span className={styles.dropDownText2}>AIR</span>
                &nbsp;&nbsp;
              </div>
              <div
                className={styles.dropDownArrowbox}
                style={{ transform: isOpen ? "rotate(180deg)" : "" }}
              >
                <img className={styles.dropDownArrow} src={downarrow} alt="" />
              </div>
            </div>
          </div>
        </div>
        <div onClick={(e) => setmobMenuOpen(!mobMenuOpen)}>
          <img src={!mobMenuOpen ? bars : cross} alt="" />
        </div>
      </div>
    </>
  );
};

export default NavBar;
