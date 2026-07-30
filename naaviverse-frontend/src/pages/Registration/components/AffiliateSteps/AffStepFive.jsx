import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { RegistrationContext } from "../../../../RegistrationContext";

import pasteIcon from "../../assets/images/pasteIcon.svg";
// import { GlobalContex } from "../globalContext";

const AffStepFive = () => {
  const {
    setStep,
    appData,
    userPassword,
    setUserPassword,
    pasteContent,
    handlePasteData,
    setPasteContent,
  } = useContext(RegistrationContext);
  const [available, setAvailable] = useState(null);

  useEffect(() => {
    let strongPassword = new RegExp(
      "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
    );
    if (strongPassword.test(userPassword)) {
      setAvailable(true);
    } else {
      setAvailable(false);
    }
  }, [userPassword]);

  return (
    <>
      <div className="desktopUI">
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
            placeholder="Create Password"
            value={userPassword}
            onChange={(e) => {
              setPasteContent("");
              setUserPassword(e.target.value);
            }}
          />
          {userPassword ? (
            <div>
              {available ? (
                <div className="greenDot"></div>
              ) : (
                <div className="redDot"></div>
              )}
            </div>
          ) : (
            <img src={pasteIcon} alt="" onClick={handlePasteData} />
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
          <div className="whiteButton" onClick={(e) => setStep("step4")}>
            Go Back
          </div>

          <div
            className="colouredButton"
            style={{
              background:
                appData !== null && appData !== undefined
                  ? `#${appData?.color_codes[0]?.primarycolourcode}`
                  : "#176AB4",
              opacity: available ? 1 : 0.5,
            }}
            onClick={(e) => {
              if (available) {
                setStep("step6");
                setPasteContent("");
              }
            }}
          >
            Proceed
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
              Step 6
            </div>
            <div className="stepSubtitle">Set Password</div>
          </div>
          <div className="stepOneInput">
            <div className="stepOneInput">
              <input
                type="password"
                placeholder="* * * * * *"
                value={userPassword}
                onChange={(e) => {
                  setPasteContent("");
                  setUserPassword(e.target.value);
                }}
              />
              {userPassword ? (
                <div>
                  {available ? (
                    <div className="greenDot"></div>
                  ) : (
                    <div className="redDot"></div>
                  )}
                </div>
              ) : (
                <img src={pasteIcon} alt="" onClick={handlePasteData} />
              )}
            </div>
          </div>
          <div
            style={{
              paddingTop: "40px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "underline",
            }}
          >
            Password Checklist
          </div>
          <div className="halfButtons" style={{ paddingTop: "5vh" }}>
            <div onClick={(e) => setStep("step4")}>Back</div>
            <div
              onClick={(e) => {
                if (available) {
                  setStep("step6");
                  setPasteContent("");
                }
              }}
              style={{
                backgroundColor: `#${appData?.color_codes[0]?.primarycolourcode}`,
                opacity: available ? 1 : 0.5,
              }}
            >
              Next
            </div>
          </div>
          {/* <div
            // onClick={(e) => getAffData()}
            className="fullButton"
            style={{
              backgroundColor: `#${appData?.color_codes[0]?.primarycolourcode}`,
              // opacity: affEmail?.length > 0 ? 1 : 0.4,
            }}
          >
            Next
          </div> */}
        </div>
      </div>
    </>
  );
};

export default AffStepFive;
