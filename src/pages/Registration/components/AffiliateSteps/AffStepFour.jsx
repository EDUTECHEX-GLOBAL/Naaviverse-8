import axios from "axios";
import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { RegistrationContext } from "../../../../RegistrationContext";

import pasteIcon from "../../assets/images/pasteIcon.svg";

const AffStepFour = () => {
  const {
    setStep,
    appData,
    userEmail,
    pasteContent,
    setUserEmail,

    setPasteContent,
  } = useContext(RegistrationContext);
  const [available, setAvailable] = useState(null);

  const handlePasteData = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setUserEmail(text);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  useEffect(() => {
    axios
      .get(`https://comms.globalxchange.io/user/profile/data/get`, {
        params: {
          email: userEmail,
        },
      })
      .then(({ data }) => {
        if (data.count === 1) {
          setAvailable(false);
        } else {
          if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/.test(userEmail)) {
            setAvailable(true);
          } else {
            setAvailable(false);
          }
        }
      });
  }, [userEmail]);

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
        <div className="stepOneTitle">Please Enter Your Email</div>
        <div className="stepOneInput">
          <input
            type="text"
            placeholder="friends@gmail.com...."
            value={userEmail}
            onChange={(e) => {
              setPasteContent("");
              setUserEmail(e.target.value);
            }}
          />
          {userEmail ? (
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
          <div className="whiteButton" onClick={(e) => setStep("step3")}>
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
                setStep("step5");
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
              Step 5
            </div>
            <div className="stepSubtitle">Enter Email</div>
          </div>
          <div className="stepOneInput">
            <input
              type="text"
              placeholder="friends@gmail.com...."
              value={userEmail}
              onChange={(e) => {
                setPasteContent("");
                setUserEmail(e.target.value);
              }}
            />
            {userEmail ? (
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
          <div className="halfButtons" style={{ paddingTop: "5vh" }}>
            <div onClick={(e) => setStep("step3")}>Back</div>
            <div
              onClick={(e) => {
                if (available) {
                  setStep("step5");
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

export default AffStepFour;
