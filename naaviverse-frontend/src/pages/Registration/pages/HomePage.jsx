import React, { useState, useEffect, useContext } from "react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import DefaultStep from "../components/DefaultStep";
import LeftComponent from "../components/LeftComponent";
import RightComponent from "../components/RightComponent";

import Skeleton from "react-loading-skeleton";
// import { GlobalContex } from '../globalContext';

import affLogo from "../assets/images/affLogo.svg";
import preLogo from "../assets/images/preLogo.svg";
import searchLogo from "../assets/images/searchLogo.svg";
import { useNavigate } from "react-router-dom";
import { RegistrationContext } from "../../../RegistrationContext";

import googleIcon from "./google.svg";

import "../App.scss";
// import { BankContext } from '../../../context/Context';

const RegistrationHomePage = () => {
  const navigate = useNavigate();
  // const { appUserToken } = useContext(BankContext);
  const { setInitialPath, appData, setAppData } =
    useContext(RegistrationContext);

  const [loginMenthod, setLoginMenthod] = useState(null);
  const [authCode, setAuthCode] = useState(null);

  // useEffect(() => {
  //   if (appUserToken) {
  //     navigate('/app');
  //   }
  // }, []);

  useEffect(() => {
    const authorizationCode = new URLSearchParams(window.location.search).get(
      "code"
    );
    if (authorizationCode) {
      setAuthCode(authorizationCode);
    }
  }, []);

  return (
    <>
      <div className="App">
        {appData !== null && appData !== undefined ? (
          <div className="myGrid">
            <div
              style={{
                background: `#${appData?.color_codes[0]?.primarycolourcode}`,
              }}
            >
              <div className="leftDialogue">
                <span>
                  How Did
                  <br />
                  You Hear
                  <br />
                  {appData?.app_name}
                </span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="rightWidth">
                <div>
                  <img
                    src={appData?.data?.color_logo}
                    alt=""
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="stepOneTitle">How Did You Hear About Us?</div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "30px",
                    width: "50%",
                    gap: "50px",
                    margin: "auto",
                  }}
                >
                  <div
                    style={{ textAlign: "center" }}
                    onClick={(e) => navigate("/register/affiliate")}
                  >
                    <div
                      className="smallCard"
                      style={{
                        background: `#${appData?.color_codes[0]?.primarycolourcode}`,
                      }}
                    >
                      <img src={affLogo} alt="" />
                    </div>
                    <div style={{ paddingTop: "20px" }}>Affiliate</div>
                  </div>
                  <div
                    style={{ textAlign: "center" }}
                    onClick={(e) => navigate("/register/pre-registered")}
                  >
                    <div
                      className="smallCard"
                      style={{
                        background: `#${appData?.color_codes[0]?.primarycolourcode}`,
                      }}
                    >
                      <img src={preLogo} alt="" />
                    </div>
                    <div style={{ paddingTop: "20px" }}>Pre-Registered</div>
                  </div>
                  <div
                    style={{ textAlign: "center" }}
                    onClick={(e) => navigate("/register/by-myself")}
                  >
                    <div
                      className="smallCard"
                      style={{
                        background: `#${appData?.color_codes[0]?.primarycolourcode}`,
                      }}
                    >
                      <img src={searchLogo} alt="" />
                    </div>
                    <div style={{ paddingTop: "20px" }}>By Myself</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="myGrid">
            <div style={{ lineHeight: "0px" }}>
              <Skeleton
                width="100%"
                height="100vh"
                style={{ borderRadius: "0px" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="rightWidth">
                <div>
                  <Skeleton
                    width="100%"
                    height="100px"
                    style={{ borderRadius: "0px" }}
                  />
                </div>
                <div className="stepOneTitle">
                  <Skeleton
                    width="90%"
                    height="20px"
                    style={{ borderRadius: "0px" }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "30px",
                    width: "50%",
                    gap: "50px",
                    margin: "auto",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Skeleton
                      width="138px"
                      height="138px"
                      style={{ borderRadius: "0px" }}
                    />
                    <div style={{ paddingTop: "20px" }}>
                      <Skeleton
                        width="120px"
                        height="10px"
                        style={{ borderRadius: "0px" }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Skeleton
                      width="138px"
                      height="138px"
                      style={{ borderRadius: "0px" }}
                    />
                    <div style={{ paddingTop: "20px" }}>
                      <Skeleton
                        width="120px"
                        height="10px"
                        style={{ borderRadius: "0px" }}
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Skeleton
                      width="138px"
                      height="138px"
                      style={{ borderRadius: "0px" }}
                    />
                    <div style={{ paddingTop: "20px" }}>
                      <Skeleton
                        width="120px"
                        height="10px"
                        style={{ borderRadius: "0px" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Version UI */}
        {loginMenthod === null ? (
          <div className="mobileHome">
            <div className="mobileLogoSection">
              <img
                src={appData?.data?.color_logo}
                alt=""
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ padding: "27px" }}>
              <div className="mobileHeader">
                <div
                  className="stepTitle"
                  style={{
                    color: `#${appData?.color_codes[0]?.primarycolourcode}`,
                  }}
                >
                  Registration
                </div>
                <div className="stepSubtitle">How Do You Want To Signup?</div>
              </div>
              <div className="mobileCardWrapper">
                <div onClick={(e) => setLoginMenthod("email")}>
                  <div>Email & Password</div>
                  <div>An Existing Affiliate App User Told You</div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                  onClick={() => {
                    window.open(
                      "https://gxnitrossso.auth.us-east-2.amazoncognito.com/oauth2/authorize?identity_provider=Google&client_id=64fpfg69u1fe6vc4pgalhtju0s&response_type=code&scope=aws.cognito.signin.user.admin+email+openid&redirect_uri=https%3A%2F%2Fmy.aiprowallet.com"
                    );
                  }}
                >
                  <img
                    src={googleIcon}
                    alt=""
                    style={{ width: "2vh", height: "2vh", marginRight: "4%" }}
                  />
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 600,
                      paddingTop: "0px",
                    }}
                  >
                    Continue With Google
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mobileHome">
            <div className="mobileLogoSection">
              <img
                src={appData?.data?.color_logo}
                alt=""
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ padding: "27px" }}>
              <div className="mobileHeader">
                <div
                  className="stepTitle"
                  style={{
                    color: `#${appData?.color_codes[0]?.primarycolourcode}`,
                  }}
                >
                  Step 1
                </div>
                <div className="stepSubtitle">How Did You Hear About Us?</div>
              </div>
              <div className="mobileCardWrapper">
                <div onClick={(e) => navigate("register/affiliate")}>
                  <div>Affiliate</div>
                  <div>An Existing Affiliate App User Told You</div>
                </div>
                <div onClick={(e) => navigate("register/pre-registered")}>
                  <div>I Am Pre-Registered</div>
                  <div>You Have Already Been Signed Up</div>
                </div>
                <div onClick={(e) => navigate("register/by-myself")}>
                  <div>I Have No Idea</div>
                  <div>You Found Us By Yourself</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default RegistrationHomePage;
