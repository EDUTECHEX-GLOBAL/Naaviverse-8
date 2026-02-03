import React from "react";
import { useNavigate } from "react-router-dom";
import { useCoinContextData } from "../../context/CoinContext";
import { useStore } from "../store/store.ts";
import "./navbar.scss";

//images
// import logo from "../../static/images/logo.svg";
import logo from "../../static/images/naavi_finallogo.png"
import hamIcon from "../../static/images/icons/hamIcon.svg";
import cross from "../../static/images/nav/cross.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const { preLoginMenu, setPreLoginMenu, setSchoolSearch } =
    useCoinContextData();
  const { mobMenuOpen, setselectedNav, setmobMenuOpen } = useStore();

  return (
    <>
      <div className="navbar">
        <div className="hamMenu-home">
          <img
            src={!mobMenuOpen ? hamIcon : cross}
            alt=""
            onClick={() => {
              setmobMenuOpen(!mobMenuOpen);
            }}
          />
        </div>
        <div
          className="logo"
          onClick={() => {
            navigate("/");
            setPreLoginMenu("About Us");
            setselectedNav("About Us");
            setmobMenuOpen(false);
          }}
        >
          <img src={logo} alt="logo"  style={{ height: "60px", width: "auto", maxWidth: "170px", objectFit: "contain" }} />
          
        </div>
        <div className="menu-items">
          <div
            onClick={() => {
              navigate("/");
              setPreLoginMenu("About Us");
            }}
          >
            <p
              style={{
                fontWeight: preLoginMenu === "About Us" ? "600" : "",
              }}
            >
              About Us
            </p>
          </div>
          <div
            onClick={() => {
              navigate("/maps");
              setPreLoginMenu("Paths");
            }}
          >
            <p style={{ fontWeight: preLoginMenu === "Paths" ? "600" : "" }}>
              Paths
            </p>
          </div>
          {/* <div
            onClick={() => {
              navigate("/directory/nodes");
              setPreLoginMenu("Partners");
            }}
          >
            <p
              style={{
                fontWeight: preLoginMenu === "Partners" ? "600" : "",
              }}
            >
              Partners
            </p>
          </div>
          <div
            onClick={() => {
              navigate("/services");
              setPreLoginMenu("Services");
            }}
          >
            <p
              style={{
                fontWeight: preLoginMenu === "Services" ? "600" : "",
              }}
            >
              Services
            </p>
          </div> */}
        </div>
        <div className="btns-div">
          <div
            className="gs-Btn"
            onClick={() => {
              navigate("/login");
            }}
          >
            Get Started
          </div>
        </div>
      </div>
      <div className="color-box"></div>
    </>
  );
};

export default Navbar;
