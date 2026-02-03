import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import OtpInput from "react-otp-input";
import { RegistrationContext } from "../../../../RegistrationContext";

const AffStepSeven = () => {
  const {
    setStep,
    appData,
    userPassword,
    pasteContent,
    handlePasteData,
    setPasteContent,
    confirmEmail,
    pin,
    setPin,
    userEmail,
    pinMisMatch,
  } = useContext(RegistrationContext);
  const [available, setAvailable] = useState(null);
  const [verifyPassword, setVerifyPassword] = useState("");

  useEffect(() => {
    if (verifyPassword === userPassword) {
      setAvailable(true);
    } else {
      setAvailable(false);
    }
  }, [verifyPassword]);

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
        <div className="stepOneTitle">
          {pinMisMatch
            ? "Pin Mismatch. Please Type The Correct Pin."
            : `Enter The Code That Just Went To ${userEmail}`}
        </div>
        <div className="otpView">
          <OtpInput
            value={pin}
            onChange={setPin}
            numInputs={6}
            separator={<span>&nbsp;&nbsp;&nbsp;</span>}
            shouldAutoFocus
            containerStyle="otpInputWrapper"
            inputStyle="otpInput"
          />
        </div>
        <div
          style={{
            paddingTop: "75px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="whiteButton">Resend Code</div>

          <div
            className="colouredButton"
            style={{
              background:
                appData !== null && appData !== undefined
                  ? `#${appData?.color_codes[0]?.primarycolourcode}`
                  : "#176AB4",
              opacity: pin.length === 6 ? 1 : 0.5,
            }}
            onClick={(e) => {
              if (pin.length === 6) {
                confirmEmail();
              }
            }}
          >
            Proceed
          </div>
        </div>
      </div>

      {/* Mobile Version */}

      <div className="mobileRightSection">
        <div style={{ position: "relative", height: window.innerHeight - 220 }}>
          <div className="mobileHeader">
            <div
              className="stepTitle"
              style={{
                color: `#${appData?.color_codes[0]?.primarycolourcode}`,
              }}
            >
              Step 8
            </div>
            <div className="stepSubtitle">Confirm Email</div>
          </div>
          <div className="otpView">
            <OtpInput
              value={pin}
              onChange={setPin}
              numInputs={6}
              separator={<span>&nbsp;&nbsp;&nbsp;</span>}
              shouldAutoFocus
              containerStyle="otpInputWrapper"
              inputStyle="otpInput"
            />
          </div>
          <div
            style={{
              paddingTop: "40px",
              fontWeight: 700,
              fontSize: "15px",
              textDecoration: "underline",
            }}
          >
            Resend Code
          </div>

          <div className="halfButtons">
            <div onClick={(e) => setStep("step5")}>Back</div>
            <div
              onClick={(e) => {
                if (pin.length === 6) {
                  confirmEmail();
                }
              }}
              style={{
                backgroundColor: `#${appData?.color_codes[0]?.primarycolourcode}`,
                opacity: pin.length === 6 ? 1 : 0.5,
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

export default AffStepSeven;
