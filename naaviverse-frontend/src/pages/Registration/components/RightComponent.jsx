import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { RegistrationContext } from "../../../RegistrationContext";
// import { GlobalContex } from '../globalContext';
import DefaultStep from "./DefaultStep";
import AffStepEight from "./AffiliateSteps/AffStepEight";
import AffStepFive from "./AffiliateSteps/AffStepFive";
import AffStepFour from "./AffiliateSteps/AffStepFour";
import AffStepNine from "./AffiliateSteps/AffStepNine";
import AffStepOne from "./AffiliateSteps/AffStepOne";
import AffStepSeven from "./AffiliateSteps/AffStepSeven";
import AffStepSix from "./AffiliateSteps/AffStepSix";
import AffStepThree from "./AffiliateSteps/AffStepThree";
import AffStepTwo from "./AffiliateSteps/AffStepTwo";

import PreStepOne from "./PreRegistrationSteps/PreStepOne";
import PreStepTwo from "./PreRegistrationSteps/PreStepTwo";
import PreStepThree from "./PreRegistrationSteps/PreStepThree";
import PreStepFour from "./PreRegistrationSteps/PreStepFour";

const RightComponent = ({ lastRoute }) => {
  const { step } = useContext(RegistrationContext);

  const conditionalAffContent = () => {
    switch (step) {
      case "step2":
        return <AffStepTwo />;
      case "step3":
        return <AffStepThree lastRoute={lastRoute} />;
      case "step4":
        return <AffStepFour />;
      case "step5":
        return <AffStepFive />;
      case "step6":
        return <AffStepSix lastRoute={lastRoute} />;
      case "step7":
        return <AffStepSeven />;
      case "step8":
        return <AffStepEight />;
      case "step9":
        return <AffStepNine />;
      default:
        return <AffStepOne />;
      // return <StepEight />;
    }
  };

  const conditionalPreRegistrationContent = () => {
    switch (step) {
      case "step2":
        return <PreStepTwo />;
      case "step3":
        return <PreStepThree />;
      case "step4":
        return <PreStepFour />;
      default:
        return <PreStepOne />;
      // return <PreStepFour />;
    }
  };

  const conditionalContent = () => {
    if (lastRoute === "affiliate") {
      return conditionalAffContent();
    } else if (lastRoute === "pre-registered") {
      return conditionalPreRegistrationContent();
    } else if (lastRoute === "by-myself") {
      return conditionalAffContent();
    }
  };

  return <div className="rightWidth">{conditionalContent()}</div>;
};

export default RightComponent;
