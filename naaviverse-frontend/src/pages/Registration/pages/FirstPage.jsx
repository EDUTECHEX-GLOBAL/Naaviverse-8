import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { RegistrationContext } from "../../../RegistrationContext";
import LeftComponent from "../components/LeftComponent";
import RightComponent from "../components/RightComponent";
import Skeleton from "react-loading-skeleton";
// import { BankContext } from "../../../context/Context";

const FirstPage = () => {
  const {
    appData,
    setAffData,
    setStep,
    loadingRight,
    setLoadingRight,
    setAffType,
  } = useContext(RegistrationContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const splitArr = pathname.split("/");

  // const { appUserToken } = useContext(BankContext);

  // useEffect(() => {
  //   if (appUserToken) {
  //     navigate("/app");
  //   }
  // }, []);

  useEffect(() => {
    console.log(splitArr[3], "kjwbekdwe");
    if (splitArr[3]) {
      setLoadingRight(true);
      axios
        .get(`https://comms.globalxchange.io/user/profile/data/get`, {
          params: {
            username: splitArr[3],
          },
        })
        .then(({ data }) => {
          if (data.status) {
            setAffData(data.usersData[0]);
            setStep("step3");
            setLoadingRight(false);
          } else {
            setStep("");
            navigate("register/affiliate");
            setLoadingRight(false);
          }
        });
    }
  }, []);

  useEffect(() => {
    if (splitArr[2] === "by-myself") {
      setStep("step3");
      setAffType(false);
    }
  }, [splitArr[2]]);

  return (
    <>
      <div className="App">
        {appData !== null && appData !== undefined ? (
          <div className="myGrid">
            <div
              style={{
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
            >
              <LeftComponent lastRoute={splitArr[2]} />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
              }}
            >
              {!loadingRight ? (
                <RightComponent lastRoute={splitArr[2]} />
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "70vh",
                  }}
                >
                  <div
                    className="loader"
                    style={{
                      borderTop: `16px solid #${appData?.color_codes[0]?.primarycolourcode}`,
                      borderBottom: `16px solid #${appData?.color_codes[0]?.primarycolourcode}`,
                    }}
                  ></div>
                  <div
                    style={{
                      padding: "20px",
                      fontWeight: 600,
                      color: `#${appData?.color_codes[0]?.primarycolourcode}`,
                    }}
                  >
                    Fetching Affiliate Data ...
                  </div>
                </div>
              )}
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
                <div className="stepOneInput">
                  <Skeleton
                    width="100%"
                    height="30px"
                    style={{ borderRadius: "10px" }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: "30px",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Skeleton
                      width="200px"
                      height="60px"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Skeleton
                      width="200px"
                      height="60px"
                      style={{ borderRadius: "10px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="mobileHome">
          <div className="mobileLogoSection">
            <img
              src={appData?.data?.color_logo}
              alt=""
              style={{ width: "100%" }}
            />
          </div>
          <RightComponent lastRoute={splitArr[2]} />
        </div>
      </div>
    </>
  );
};

export default FirstPage;
