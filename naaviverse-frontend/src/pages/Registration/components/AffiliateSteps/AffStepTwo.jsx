import React, { useContext } from "react";
import { RegistrationContext } from "../../../../RegistrationContext";

const AffStepTwo = () => {
  const { setStep, appData, affData } = useContext(RegistrationContext);
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
          Confirm If This Is The Person Who Referred You
        </div>
        <div className="stepTwoCard">
          <img
            src={affData?.dynamic?.[0]?.data?.profile_img}
            alt=""
            style={{
              width: "57px",
              height: "57px",
              borderRadius: "50%",
              border: "1px solid #e7e7e7",
            }}
          />

          <div style={{ paddingLeft: "15px" }}>
            <div className="name">
              {affData?.hardCoded?.[0]?.data?.username}
            </div>
            <div className="email">{affData?.hardCoded?.[0]?.data?.email}</div>
          </div>
        </div>
        <div
          style={{
            paddingTop: "75px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="whiteButton" onClick={(e) => setStep("step1")}>
            Go Back
          </div>

          <div
            className="colouredButton"
            style={{
              background:
                appData !== null && appData !== undefined
                  ? `#${appData?.color_codes[0]?.primarycolourcode}`
                  : "#176AB4",
            }}
            onClick={(e) => setStep("step3")}
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
              Step 3
            </div>
            <div className="stepSubtitle">
              Is This The Person Who Referred You?
            </div>
          </div>
          <div className="stepTwoCard">
            <img
              src={affData?.dynamic?.[0]?.data?.profile_img}
              alt=""
              style={{
                width: "57px",
                height: "57px",
                borderRadius: "50%",
                border: "1px solid #e7e7e7",
              }}
            />

            <div style={{ paddingLeft: "15px" }}>
              <div className="name">
                {affData?.hardCoded?.[0]?.data?.username}
              </div>
              <div className="email">
                {affData?.hardCoded?.[0]?.data?.email}
              </div>
            </div>
          </div>
          {/* <div
            style={{ paddingTop: "90px", color: "#999C9A", fontSize: "15px" }}
          >
            <b>NOTE:</b> AffiliateSync Codes Are Case Sensitive.{" "}
          </div> */}
          <div className="halfButtons" style={{ paddingTop: "5vh" }}>
            <div onClick={(e) => setStep("step1")}>Back</div>
            <div
              onClick={(e) => setStep("step3")}
              style={{
                backgroundColor: `#${appData?.color_codes[0]?.primarycolourcode}`,
              }}
            >
              Next
            </div>
          </div>
          {/* <div
            onClick={(e) => setStep("step3")}
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

export default AffStepTwo;
