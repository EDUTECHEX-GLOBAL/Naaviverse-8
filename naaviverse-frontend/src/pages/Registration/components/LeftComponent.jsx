import React from "react";
import { useContext } from "react";
import { RegistrationContext } from "../../../RegistrationContext";

const LeftComponent = ({ lastRoute }) => {
  const { step, setStep } = useContext(RegistrationContext);

  const conditionalAffDialogue = () => {
    switch (step) {
      case "step2":
        return <span>Confirm Your Affiliate</span>;
      case "step3":
        return <span>Time To Choose A Username</span>;
      case "step4":
        return <span>Tell Us A Bit About Yourself</span>;
      case "step5":
        return <span>Time To Secure Your Account</span>;
      case "step6":
        return <span>Time To Secure Your Account</span>;
      case "step7":
        return <span>Lets Verify Your Email</span>;
      case "step9":
        return <span>Account Creation Success</span>;

      default:
        return <span>That’s Great. We Love Our Affiliates</span>;
    }
  };

  const conditionalDialogue = () => {
    if (lastRoute === "affiliate") {
      return conditionalAffDialogue();
    } else if (lastRoute === "pre-registered") {
      return conditionalPreRegisteredDialogue();
    } else if (lastRoute === "by-myself") {
      return conditionalAffDialogue();
    }
  };

  const conditionalPreRegisteredDialogue = () => {
    switch (step) {
      case "step2":
        return <span>Time To Secure Your Account</span>;
      case "step3":
        return <span>Time To Secure Your Account</span>;
      default:
        return <span>You Are 50% Of The Way There</span>;
    }
  };

  return (
    <>
      <div className="leftDialogue">{conditionalDialogue()}</div>
    </>
  );
};

export default LeftComponent;
