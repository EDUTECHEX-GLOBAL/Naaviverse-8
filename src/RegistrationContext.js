import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

export const RegistrationContext = createContext();

const RegistrationContextProvider = (props) => {
  const [step, setStep] = useState("");
  const [appData, setAppData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");

  const [partnerType, setPartnerType] = useState("");   // ⭐ NEW FIELD

  const [pin, setPin] = useState("");
  const [pinMisMatch, setPinMisMatch] = useState(false);
  const [createAccountLoading, setCreateAccountLoading] = useState(false);

  const [authId, setAuthId] = useState(null);
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // ------------------------------------------------
  //   STEP 1: Create Account
  // ------------------------------------------------
  const handleCreateAccount = async () => {
    try {
      setCreateAccountLoading(true);

      const { data } = await axios.post(
        `${BASE_URL}/api/partner/signup`,
        {
          username: userName,
          email: userEmail,
          
          password: userPassword,
          partnerType: partnerType   // ⭐ SEND TO BACKEND
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (data.success) {
        setAuthId(data.partner.id);
        setStep("step7");
      }
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
    } finally {
      setCreateAccountLoading(false);
    }
  };

  // ------------------------------------------------
  //   STEP 2: Verify OTP
  // ------------------------------------------------
  const confirmEmail = async () => {
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/partner/verifyotp`,
        {
          email: userEmail,
          otp: pin,
        }
      );

      if (data.success) {
        setStep("step9");
      } else {
        setPinMisMatch(true);
        setStep("step7");
      }
    } catch (err) {
      console.error("OTP verification error:", err.response?.data || err.message);
      setPinMisMatch(true);
    }
  };

  // ------------------------------------------------
  //   OPTIONAL: Fetch appData from your backend
  //   (Replace this with your own API if needed)
  // ------------------------------------------------
useEffect(() => {
  // 🔒 Disabled for now – backend API not available
  // TODO: Enable this when /api/apps/:appCode is implemented in backend

  setAppData(null);
  setLoading(false);

  /*
  axios
    .get(`${BASE_URL}/api/apps/naavi`)
    .then(({ data }) => {
      setAppData(data);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  */
}, []);


  const value = {
    step,
    setStep,
    loading,
    setLoading,
    appData,

    userEmail,
    setUserEmail,
    userName,
    setUserName,
    userPassword,
    setUserPassword,

    partnerType,          // ⭐ EXPOSED
    setPartnerType,       // ⭐ EXPOSED

    pin,
    setPin,
    pinMisMatch,

    createAccountLoading,

    handleCreateAccount,
    confirmEmail,

    authId,
  };

  return (
    <RegistrationContext.Provider value={value}>
      {props.children}
    </RegistrationContext.Provider>
  );
};

export default RegistrationContextProvider;
