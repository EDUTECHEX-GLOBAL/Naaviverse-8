import React, { useState, useEffect, useContext } from "react";
import { RegistrationContext } from "../../../../RegistrationContext";
import axios from "axios";

const PreStepThree = () => {
  const {
    setStep,
    initialPath,
    appData,

    authId,
    setAuthId,
    tempEmail,
    setTempEmail,
    tempUsername,
    setTempUsername,
    challengeName,
    setChallengeName,
    session,
    setSession,
    newPassword,
    setNewPassword,
  } = useContext(RegistrationContext);

  const [loading, setLoading] = useState(false);
  const [verifyPassword, setVerifyPassword] = useState("");

  const updateUserPassword = () => {
    setLoading(true);
    axios
      .post(`https://gxauth.apimachine.com/gx/user/auth/login/challenge`, {
        authChallenge_id: authId,
        email: tempEmail,
        username: tempUsername,
        challengeName: challengeName,
        session: session,
        newPassword: verifyPassword,
      })
      .then(({ data }) => {
        if (data.status) {
          setStep("step4");
          setLoading(false);
        }
      });
  };

  return (
    <>
      {!loading ? (
        <div className="desktopUI">
          <div>
            <div>
              {appData !== null && appData !== undefined ? (
                <img
                  src={appData?.data?.color_logo}
                  alt=""
                  style={{ width: "100%" }}
                />
              ) : (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src="https://chatsgx.s3-us-east-2.amazonaws.com/chiranjib.jena@gmail.com/1596869973584.png"
                    alt=""
                    style={{ width: "70px" }}
                  />
                </div>
              )}
            </div>
            <div className="stepOneTitle">Please Confirm Your Password</div>

            <div className="stepOneInput">
              <input
                type="password"
                placeholder="***********************"
                value={verifyPassword}
                onChange={(e) => {
                  setVerifyPassword(e.target.value);
                }}
              />
              {newPassword ? (
                <div>
                  {newPassword === verifyPassword ? (
                    <div className="greenDot"></div>
                  ) : (
                    <div className="redDot"></div>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
            <div
              style={{
                paddingTop: "75px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                className="whiteButton"
                onClick={(e) => {
                  setStep("step2");
                  // navigate(`/${initialPath}`);
                }}
              >
                Go Back
              </div>

              <div
                className="colouredButton"
                style={{
                  opacity: newPassword === verifyPassword && !loading ? 1 : 0.3,
                  background:
                    appData !== null && appData !== undefined
                      ? `#${appData?.color_codes[0]?.primarycolourcode}`
                      : "#176AB4",
                }}
                onClick={(e) => {
                  if (newPassword === verifyPassword && !loading) {
                    updateUserPassword();
                  }
                }}
              >
                {!loading ? "Proceed" : "Loading..."}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="full-loading-wrapper">
            {appData !== null && appData !== undefined ? (
              <img
                src={appData?.data?.color_logo}
                alt=""
                style={{ width: "400px" }}
                className="full-loading-logo"
              />
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="https://chatsgx.s3-us-east-2.amazonaws.com/chiranjib.jena@gmail.com/1596869973584.png"
                  alt=""
                  style={{ width: "70px" }}
                  className="full-loading-logo"
                />
              </div>
            )}
          </div>
          <div
            style={{
              position: "fixed",
              left: 0,
              bottom: 50,
              zIndex: 999,
              width: "100%",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            We Are Updating Your Password
          </div>
        </div>
      )}
      {!loading ? (
        <div className="mobileRightSection">
          <div
            style={{ position: "relative", height: window.innerHeight - 220 }}
          >
            <div className="mobileHeader">
              <div
                className="stepTitle"
                style={{
                  color: `#${appData?.color_codes[0]?.primarycolourcode}`,
                }}
              >
                Step 4
              </div>
              <div className="stepSubtitle">Confirm Your Password</div>
            </div>

            <div className="stepOneInput">
              <input
                type="password"
                placeholder="Password..."
                value={verifyPassword}
                onChange={(e) => {
                  setVerifyPassword(e.target.value);
                }}
              />
              {newPassword ? (
                <div>
                  {newPassword === verifyPassword ? (
                    <div className="greenDot"></div>
                  ) : (
                    <div className="redDot"></div>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="halfButtons" style={{ paddingTop: "5vh" }}>
              <div
                onClick={(e) => {
                  setStep("step2");
                }}
              >
                Back
              </div>
              <div
                onClick={(e) => {
                  if (newPassword === verifyPassword && !loading) {
                    updateUserPassword();
                  }
                }}
                style={{
                  opacity: newPassword === verifyPassword && !loading ? 1 : 0.3,
                  background:
                    appData !== null && appData !== undefined
                      ? `#${appData?.color_codes[0]?.primarycolourcode}`
                      : "#176AB4",
                }}
              >
                {loading ? "Loading..." : "Next"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mobileRightSection">
          <div className="full-loading-wrapper">
            {appData !== null && appData !== undefined ? (
              <img
                src={appData?.data?.color_logo}
                alt=""
                style={{ width: "100%" }}
                className="full-loading-logo"
              />
            ) : (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <img
                  src="https://chatsgx.s3-us-east-2.amazonaws.com/chiranjib.jena@gmail.com/1596869973584.png"
                  alt=""
                  style={{ width: "70px" }}
                  className="full-loading-logo"
                />
              </div>
            )}
          </div>
          <div
            style={{
              position: "fixed",
              left: 0,
              bottom: 50,
              zIndex: 999,
              width: "100%",
              textAlign: "center",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            We Are Updating Your Password
          </div>
        </div>
      )}
    </>
  );
};

export default PreStepThree;
