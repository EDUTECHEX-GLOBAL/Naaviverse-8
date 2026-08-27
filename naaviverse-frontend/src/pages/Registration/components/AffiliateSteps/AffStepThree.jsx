import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RegistrationContext } from "../../../../RegistrationContext";

import pasteIcon from "../../assets/images/pasteIcon.svg";
// import { GlobalContex } from '../globalContext';

const AffStepThree = ({ lastRoute }) => {
  const {
    setStep,
    appData,
    setPasteContent,
    pasteContent,
    userName,
    setUserName,
    setAffData,
  } = useContext(RegistrationContext);

  const [available, setAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasteData = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setUserName(text);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  useEffect(() => {
    axios
      .get(`https://comms.globalxchange.io/user/profile/data/get`, {
        params: {
          username: userName,
        },
      })
      .then(({ data }) => {
        if (data.status || data.count === 1) {
          setAvailable(false);
        } else {
          setAvailable(true);
        }
      });
  }, [userName]);

  useEffect(() => {
    if (lastRoute === "by-myself") {
      axios
        .get(`https://comms.globalxchange.io/user/profile/data/get`, {
          params: {
            email: appData?.created_by,
          },
        })
        .then(({ data }) => {
          if (data.status) {
            setAffData(data.usersData[0]);
          }
        });
    }
  }, [lastRoute, appData]);

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
        <div className="stepOneTitle">Please Enter A Unique Username</div>
        <div className="stepOneInput">
          <input
            type="text"
            placeholder="Type Username...."
            value={userName}
            onChange={(e) => {
              setPasteContent("");
              setUserName(e.target.value);
            }}
          />
          {userName ? (
            <div>
              {available ? (
                <div className="greenDot"></div>
              ) : (
                <div className="redDot"></div>
              )}
            </div>
          ) : (
            <img
              src={pasteIcon}
              alt=""
              onClick={handlePasteData}
              style={{ cursor: "pointer" }}
            />
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
              console.log(lastRoute, "kwckwe");
              if (lastRoute === "by-myself") {
                setStep("");
                navigate(`/register`);
              } else {
                setStep("step2");
              }
            }}
          >
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
                setStep("step4");
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
              Step 4
            </div>
            <div className="stepSubtitle">Create Username</div>
          </div>
          <div className="stepOneInput">
            <input
              type="text"
              placeholder="Enter Username...."
              value={userName}
              onChange={(e) => {
                setPasteContent("");
                setUserName(e.target.value);
              }}
            />
            {userName ? (
              <div>
                {available ? (
                  <div className="greenDot"></div>
                ) : (
                  <div className="redDot"></div>
                )}
              </div>
            ) : (
              <img
                src={pasteIcon}
                alt=""
                onClick={handlePasteData}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
          <div className="halfButtons" style={{ paddingTop: "5vh" }}>
            <div
              onClick={(e) => {
                console.log(lastRoute, "kwckwe");
                if (lastRoute === "by-myself") {
                  setStep("");
                  navigate(`/register`);
                } else {
                  setStep("step2");
                }
              }}
            >
              Back
            </div>
            <div
              onClick={(e) => {
                if (available) {
                  setStep("step4");
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

export default AffStepThree;
