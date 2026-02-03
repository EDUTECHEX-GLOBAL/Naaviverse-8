import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainContext } from "../../context/Context";
import { useAppContextDetails } from "../../context/AppContext";
import "./postloginpage.scss";

//images
import logo from "../../static/images/logo.svg";

const PostLoginPage = () => {
  const { userLoginHandler, email } = useContext(MainContext);
  const { appFullLogo, websiteTitle, websiteDescription } =
    useAppContextDetails();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate("/dashboard/login");
    }
  }, []);

  const onLogoutClick = () => {
    userLoginHandler();
    navigate("/");
  };

  return (
    <div className="postLoginPage">
      <div className="postLogin-navbar">
        <div className="logo">
          <img
            src={appFullLogo}
            alt="logo"
            style={{ width: "100%", height: "40px" }}
          />
        </div>
        {/* <div className="menu-items">
          <div>
            <p>Paths</p>
          </div>
          <div>
            <p>Explore</p>
          </div>
          <div>
            <p>Products</p>
          </div>
          <div>
            <p>Resources</p>
          </div>
          <div>
            <p>Vendors</p>
          </div>
        </div> */}
        <div className="btns-div">
          <div
            className="gs-Btn"
            onClick={() => {
              onLogoutClick();
            }}
          >
            Logout
          </div>
        </div>
      </div>
      <div className="color-box"></div>
    </div>
  );
};

export default PostLoginPage;
