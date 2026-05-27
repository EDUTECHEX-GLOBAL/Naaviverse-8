import React from "react";

import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RegistrationContext } from "../../../../RegistrationContext";

// import { GlobalContex } from '../globalContext';

const AffStepNine = () => {
  const { userName, appData } = useContext(RegistrationContext);
  const navigate = useNavigate();
  return (
    <>
      <div
        style={{
          fontSize: "20px",
          color: "#464B4E",
          textAlign: "center",
          height: "50vh",
          padding: "30px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div>
          Congratulations <span style={{ fontWeight: 700 }}>{userName},</span>
          Your Account Has Been Created Successfully
        </div>
        <br />
        <div
          style={{
            width: "200px",
            height: "50px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              appData !== null && appData !== undefined
                ? `#${appData?.color_codes[0]?.primarycolourcode}`
                : "#176AB4",
            color: "white",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={(e) => window.open("https://naavi.network/login")}
        >
          Login
        </div>
      </div>
    </>
  );
};

export default AffStepNine;
