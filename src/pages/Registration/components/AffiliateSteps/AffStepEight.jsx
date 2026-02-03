import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import OtpInput from "react-otp-input";
import { RegistrationContext } from "../../../../RegistrationContext";

const AffStepEight = () => {
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
          We Are Creating Your {appData?.other_data?.name} Account
        </div>
      </div>
    </>
  );
};

export default AffStepEight;
