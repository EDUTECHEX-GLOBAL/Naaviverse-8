import React from "react";
import { useContext } from "react";

import pasteIcon from "../../assets/images/pasteIcon.svg";

import { useState } from "react";
import axios from "axios";
import { RegistrationContext } from "../../../../RegistrationContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const AffStepOne = () => {
  const {
    setStep,
    initialPath,
    appData,
    pasteContent,
    setPasteContent,
    affEmail,
    setAffEmail,
    setAffData,
    affType,
    setAffType,
  } = useContext(RegistrationContext);

  const navigate = useNavigate();

  const [noAffFound, setNoAffFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasteData = () => {
    navigator.clipboard
      .readText()
      .then((text) => {
        setAffEmail(text);
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  };

  const getAffData = () => {
    setLoading(true);
    if (affType) {
      axios
        .get(`https://comms.globalxchange.io/user/profile/data/get`, {
          params: {
            username: affEmail,
          },
        })
        .then(({ data }) => {
          if (data.status) {
            setAffData(data.usersData[0]);
            setStep("step2");
            setPasteContent("");
            setLoading(false);
          } else {
            setNoAffFound(true);
            setLoading(false);
          }
        });
    } else {
      axios
        .get(`https://comms.globalxchange.io/user/profile/data/get`, {
          params: {
            email: affEmail,
          },
        })
        .then(({ data }) => {
          if (data.status) {
            setAffData(data.usersData[0]);
            setStep("step2");
            setPasteContent("");
            setLoading(false);
          } else {
            setNoAffFound(true);
            setLoading(false);
          }
        });
    }
  };

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
          <div className="stepOneTitle">
            {!noAffFound
              ? affType
                ? "Please Enter You’re Affiliate’s NetworkSync Code"
                : "Please Enter You’re Affiliate’s Email"
              : "Sorry We Couldn’t Find An Affiliate WIth That Username"}
          </div>
          <div className="stepOneInput">
            <input
              type="text"
              placeholder={
                affType ? "Ex. Shorupan.." : "Ex. shorupan@gmail.com.."
              }
              value={affEmail}
              onChange={(e) => {
                setPasteContent("");
                setAffEmail(e.target.value);
              }}
            />
            {/* {affEmail ? (
            <div>
              {true ? (
                <div className="greenDot"></div>
              ) : (
                <div className="redDot"></div>
              )}
            </div>
          ) : ( */}
            <img
              src={pasteIcon}
              alt=""
              onClick={handlePasteData}
              style={{ cursor: "pointer" }}
            />
            {/* )} */}
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
                setStep("");
                navigate(`/register`);
              }}
            >
              Go Back
            </div>

            <div
              className="colouredButton"
              style={{
                opacity: affEmail.length > 0 && !loading ? 1 : 0.3,
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
              onClick={(e) => {
                if (affEmail.length > 0) {
                  getAffData();
                }
              }}
            >
              {!loading ? "Proceed" : "Loading..."}
            </div>
          </div>
        </div>
        <div
          className="fixedFooterText"
          onClick={(e) => {
            setAffType(!affType);
            if (noAffFound) {
              setNoAffFound(false);
            }
          }}
        >
          {affType
            ? "Enter Affiliate’s Email Instead"
            : "Enter Affiliate’s NetworkSync Code Instead"}
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
              Step 2
            </div>
            <div className="stepSubtitle">Who Referred You?</div>
          </div>
          <div className="stepOneInput">
            <input
              type="text"
              placeholder={
                affType ? "Ex. Shorupan.." : "Ex. shorupan@gmail.com.."
              }
              value={affEmail}
              onChange={(e) => {
                setPasteContent("");
                setAffEmail(e.target.value);
              }}
            />

            <img
              src={pasteIcon}
              alt=""
              onClick={handlePasteData}
              style={{ cursor: "pointer" }}
            />
            {/* )} */}
          </div>
          {noAffFound ? (
            <div style={{ paddingTop: "90px", color: "red", fontSize: "15px" }}>
              <b>NOTE:</b> No Affiliate found.{" "}
            </div>
          ) : (
            <div
              style={{ padding: "5vh 0px", color: "#999C9A", fontSize: "15px" }}
            >
              <b>NOTE:</b> AffiliateSync Codes Are Case Sensitive.{" "}
            </div>
          )}

          <div className="halfButtons">
            <div
              onClick={(e) => {
                setStep("");
                navigate(`/${initialPath}`);
              }}
            >
              Back
            </div>
            <div
              onClick={(e) => getAffData()}
              style={{
                backgroundColor: `#${appData?.color_codes[0]?.primarycolourcode}`,
                opacity: !loading && affEmail ? 1 : 0.4,
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

export default AffStepOne;
