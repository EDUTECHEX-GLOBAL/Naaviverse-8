import React, { useState, useEffect, useContext } from "react";

import pasteIcon from "../../assets/images/pasteIcon.svg";
// import { GlobalContex } from '../../globalContext';
import { RegistrationContext } from "../../../../RegistrationContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PreStepOne = () => {
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
  } = useContext(RegistrationContext);
  // const navigate = useNavigate();
  const navigate = useNavigate();
  const [affType, setAffType] = useState(true);
  const [noAffFound, setNoAffFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempPass, setTempPass] = useState("");

  const [validEmail, setValidEmail] = useState(false);
  // const [validPassword, setValidPassword] = useState(false);

  const [wrongCred, setWrongCred] = useState(false);

  const varifyTempDetails = () => {
    setLoading(true);
    axios
      .post(`https://gxauth.apimachine.com/gx/user/auth/login`, {
        email: tempEmail,
        password: tempPass,
      })
      .then(({ data }) => {
        if (data.status === false && data.authChallenge === true) {
          setAuthId(data?.authChallenge_id);
          setTempUsername(data?.username);
          setChallengeName(data?.challengeName);
          setSession(data?.session);
          setStep("step2");
          setLoading(false);
        } else {
          setLoading(false);
          setTempEmail("");
          setTempPass("");
          setWrongCred(true);
        }
      });
  };

  useEffect(() => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/.test(tempEmail)) {
      setValidEmail(true);
    } else {
      setValidEmail(false);
    }
    // let validEmailReg = new RegExp("/^w+([.-]?w+)*@w+([.-]?w+)*(.ww+)+$/");
    // if (validEmailReg.test(tempEmail)) {
    //   setValidEmail(true);
    // } else {
    //   setValidEmail(false);
    // }
  }, [tempEmail]);

  // useEffect(() => {
  //   let strongPassword = new RegExp(
  //     "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  //   );
  //   if (strongPassword.test(tempPass)) {
  //     setValidPassword(true);
  //   } else {
  //     setValidPassword(false);
  //   }
  // }, [tempPass]);

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
            {wrongCred ? (
              <span style={{ color: "red" }}>
                Incorrect username or password.
              </span>
            ) : (
              <span>
                Please Enter The Temporary Login Credentials You Recieved When
                You Were Pre-Registered
              </span>
            )}
          </div>
          <div className="stepOneInput">
            <input
              type="text"
              placeholder="Email..."
              value={tempEmail}
              onChange={(e) => {
                setTempEmail(e.target.value);
              }}
            />
            {/* {tempEmail ? (
              <div>
                {validEmail ? (
                  <div className="greenDot"></div>
                ) : (
                  <div className="redDot"></div>
                )}
              </div>
            ) : (
              ''
            )} */}
          </div>
          <br />
          <div className="stepOneInput">
            <input
              type="password"
              placeholder="Password..."
              value={tempPass}
              onChange={(e) => {
                setTempPass(e.target.value);
              }}
            />
            {/* {tempPass ? (
              <div>
                {validPassword ? (
                  <div className="greenDot"></div>
                ) : (
                  <div className="redDot"></div>
                )}
              </div>
            ) : (
              ""
            )} */}
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
                // navigate(`/${initialPath}`);
              }}
            >
              Go Back
            </div>

            <div
              className="colouredButton"
              style={{
                opacity: tempEmail && tempPass && !loading ? 1 : 0.3,
                background:
                  appData !== null && appData !== undefined
                    ? `#${appData?.color_codes[0]?.primarycolourcode}`
                    : "#176AB4",
              }}
              onClick={(e) => {
                if (tempEmail && tempPass && !loading) {
                  varifyTempDetails();
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
              Step 2
            </div>
            <div className="stepSubtitle">Enter Temporary Credentials</div>
          </div>
          <div>
            <div className="stepOneInput">
              <input
                type="email"
                placeholder="Email..."
                value={tempEmail}
                onChange={(e) => {
                  setTempEmail(e.target.value);
                }}
              />
              {tempEmail ? (
                <div>
                  {validEmail ? (
                    <div className="greenDot"></div>
                  ) : (
                    <div className="redDot"></div>
                  )}
                </div>
              ) : (
                ""
              )}
            </div>
            <br />
            <div className="stepOneInput">
              <input
                type="password"
                placeholder="Password..."
                value={tempPass}
                onChange={(e) => {
                  setTempPass(e.target.value);
                }}
              />
              {/* {tempPass ? (
              <div>
                {validPassword ? (
                  <div className="greenDot"></div>
                ) : (
                  <div className="redDot"></div>
                )}
              </div>
            ) : (
              ""
            )} */}
            </div>
          </div>

          <div style={{ padding: "5vh 0px" }}>
            {wrongCred ? (
              <span style={{ color: "red" }}>
                Incorrect username or password.
              </span>
            ) : (
              <span>
                Please Enter The Temporary Login Credentials You Recieved When
                You Were Pre-Registered
              </span>
            )}
          </div>

          <div className="halfButtons">
            <div
              onClick={(e) => {
                setStep("");
                // navigate(`/${initialPath}`);
                navigate(`/register`);
              }}
            >
              Back
            </div>
            <div
              onClick={(e) => {
                if (tempEmail && tempPass && !loading) {
                  varifyTempDetails();
                }
              }}
              style={{
                opacity: tempEmail && tempPass && !loading ? 1 : 0.3,
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

export default PreStepOne;
