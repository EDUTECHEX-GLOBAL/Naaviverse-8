import React, { useState, useEffect, useContext } from "react";
import { RegistrationContext } from "../../../../RegistrationContext";
import axios from "axios";

const PreStepFour = () => {
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
  const [verifyPassword, setVarifyPassword] = useState("");

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
    <div className="full-loading-wrapper" style={{ padding: "30vh 32vw" }}>
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
          <div
            className="stepOneTitle"
            style={{
              fontSize: "23px",
              fontWeight: 400,
              lineHeight: "45px",
              paddingTop: "65px",
            }}
          >
            Your Password Has Been Updated. What Would You Like To Do Now?
          </div>

          <div
            style={{
              paddingTop: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              className="whiteButton"
              onClick={(e) =>
                window.open(`https://${appData?.website}`, "_blank")
              }
            >
              Login to {appData?.app_name}
            </div>

            <div
              className="colouredButton"
              style={{
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
              onClick={(e) =>
                window.open(`https://${appData?.website}`, "_blank")
              }
            >
              {appData?.app_name} Website
            </div>
          </div>
        </div>
      </div>

      <div className="mobileRightSection">
        <div
          style={{
            position: "relative",
            height: window.innerHeight - 120,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="mobileHeader">
            <div
              className="stepTitle"
              style={{
                color: `#${appData?.color_codes[0]?.primarycolourcode}`,
              }}
            >
              Success!
            </div>
            <div className="stepSubtitle">
              Your Password Has Been Updated. What Would You Like To Do Now?
            </div>
          </div>

          <div
            className="halfButtons"
            style={{ display: "flex", flexDirection: "column", width: "100%" }}
          >
            <div
              style={{ width: "100%" }}
              onClick={(e) =>
                window.open(`https://${appData?.website}`, "_blank")
              }
            >
              Login to {appData?.app_name}
            </div>
            <br />
            <div
              style={{
                width: "100%",
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
              onClick={(e) =>
                window.open(`https://${appData?.website}`, "_blank")
              }
            >
              {appData?.app_name} Website
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreStepFour;
