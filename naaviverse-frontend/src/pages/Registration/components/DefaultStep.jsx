import React from "react";
import { useContext } from "react";
import { RegistrationContext } from "../../../RegistrationContext";
// import { GlobalContex } from '../globalContext';
import LeftComponent from "./LeftComponent";
import RightComponent from "./RightComponent";

const DefaultStep = () => {
  const { step, setStep } = useContext(RegistrationContext);
  return (
    <>
      <div className="wholecard" onClick={(e) => setStep("step1")}>
        <img
          src={require("../assets/images/img1.png")}
          alt=""
          style={{ height: "25vh", width: "25vh" }}
        />

        <div className="cardRight">
          <div className="title">I Was Referred By An Affiliate</div>
          <div className="subtitle">
            The Initial Fund Offering (IFO) is a system which allows the user to
            invest into a hedge fund manager trustless while at the same t
          </div>
        </div>
      </div>

      <div className="wholecard">
        <img src={require("../assets/images/img2.png")} alt="" />
        <div className="cardRight">
          <div className="title">I Am Already Pre-Registered</div>
          <div className="subtitle">
            The Initial Fund Offering (IFO) is a system which allows the user to
            invest into a hedge fund manager trustless while at the same t
          </div>
        </div>
      </div>
      <div className="wholecard">
        <img src={require("../assets/images/img3.png")} alt="" />
        <div className="cardRight">
          <div className="title">I Have No Idea</div>
          <div className="subtitle">
            The Initial Fund Offering (IFO) is a system which allows the user to
            invest into a hedge fund manager trustless while at the same t
          </div>
        </div>
      </div>
    </>
  );
};

export default DefaultStep;
