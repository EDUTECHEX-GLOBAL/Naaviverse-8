import React, { useState, useContext } from "react";
import "./login.scss";
import { loginApi, registerApp } from "./api";
import { useNavigate } from "react-router-dom";
import { APP_USER_TOKEN } from "../../config";
import Cookies from "js-cookie";
import { MainContext } from "../../context/Context";
import { useAppContextDetails } from "../../context/AppContext";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { GlobalContex } from "../../globalContext";

//images
import googlelogo from "../../static/images/googlelogo.svg";

const DashboardLoginPage = () => {
  const { selectedApp, setLoginData, globalMenu, setBankerEmail } =
    useContext(GlobalContex);
  const { userLoginHandler } = useContext(MainContext);
  const { appFullLogo, websiteTitle, websiteDescription } =
    useAppContextDetails();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logginin, setLoggingin] = useState(false);

  const handleLoginSuccess = (data) => {
    userLoginHandler(email, data?.accessToken, data?.idToken);
    localStorage.setItem("bankerEmailNew", data?.user.email);
    localStorage.setItem("TokenId", data?.idToken);
    localStorage.setItem("loginData", JSON.stringify(data));
    setLoginData(data);
    setBankerEmail(data?.user?.email);
    registerApp({ email, app_code: "naavi" });
    registerApp({ email, app_code: "ice" });
    localStorage.setItem("username", data?.user?.username);
    Cookies.set(APP_USER_TOKEN, data?.idToken);
    navigate("/Publishers");
    // navigate(`/${selectedApp?.appName}`)
  };

  const attemptLogin = () => {
    setLoggingin(true);
    let obj = {
      email,
      password,
    };
    loginApi(obj).then((response) => {
      let result = response?.data;
      if (result?.status) {
        setLoggingin(false);
        handleLoginSuccess(result);
      }
    });
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>{websiteTitle}</title>
        <meta name="description" content={websiteDescription} />
      </Helmet>
      <div className="loginPage-wrapper">
        <div className="loginPage-leftSide">
          <img src={appFullLogo} alt="" className="login-logo" />
          <input
            type="text"
            className="login-input1"
            placeholder="Email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <div className="login-input2">
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <div className="forgot-password-div">
            <div>Forgot Password</div>
          </div>
          <div
            className="login-Btn"
            onClick={() => {
              attemptLogin();
            }}
            style={{ opacity: logginin ? "0.25" : "1" }}
          >
            {logginin ? "Loading..." : "Login"}
          </div>
          <div className="google-Btn">
            <img src={googlelogo} alt="" />
            <div>Continue With Google</div>
          </div>
          <div className="register-div" onClick={(e) => navigate("/register")}>
            <p>Click Here To Register With Email</p>
          </div>
        </div>

        <div className="loginPage-rightSide">
          <div className="img-div"></div>
        </div>
      </div>
    </HelmetProvider>
  );
};

export default DashboardLoginPage;
