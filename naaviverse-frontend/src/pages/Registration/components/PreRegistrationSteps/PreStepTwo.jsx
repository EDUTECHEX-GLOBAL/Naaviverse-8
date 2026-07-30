import React, { useState, useEffect, useContext } from "react";

import { RegistrationContext } from "../../../../RegistrationContext";

const PreStepTwo = () => {
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

  const [affType, setAffType] = useState(true);
  const [noAffFound, setNoAffFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);

  useEffect(() => {
    let strongPassword = new RegExp(
      "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
    );
    if (strongPassword.test(newPassword)) {
      setValidPassword(true);
    } else {
      setValidPassword(false);
    }
  }, [newPassword]);

  return (
    <>
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
          <div className="stepOneTitle">Please Create A Password</div>

          <div className="stepOneInput">
            <input
              type="password"
              placeholder="***********************"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
            {newPassword ? (
              <div>
                {validPassword ? (
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
                setStep("step1");
                // navigate(`/${initialPath}`);
              }}
            >
              Go Back
            </div>

            <div
              className="colouredButton"
              style={{
                opacity: validPassword && !loading ? 1 : 0.3,
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
              onClick={(e) => {
                if (validPassword && !loading) {
                  setStep("step3");
                }
              }}
            >
              {!loading ? "Proceed" : "Loading..."}
            </div>
          </div>
        </div>
      </div>

      <div className="mobileRightSection">
        <div style={{ position: "relative", height: window.innerHeight - 220 }}>
          <div className="mobileHeader">
            <div
              className="stepTitle"
              style={{
                color: `#${appData?.color_codes[0]?.primarycolourcode}`,
              }}
            >
              Step 3
            </div>
            <div className="stepSubtitle">Create A Password</div>
          </div>

          <div className="stepOneInput">
            <input
              type="password"
              placeholder="Password..."
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
            {newPassword ? (
              <div>
                {validPassword ? (
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
                setStep("step1");
              }}
            >
              Back
            </div>
            <div
              onClick={(e) => {
                if (validPassword && !loading) {
                  setStep("step3");
                }
              }}
              style={{
                opacity: validPassword && !loading ? 1 : 0.3,
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
    </>
  );
};

export default PreStepTwo;
