import React, { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { APP_USER_TOKEN } from "../config";

export const MainContext = createContext();

function MainContextProvider({ children }) {
  const [email, setEmail] = useState(
    localStorage.getItem("nvestBankLoginAccount") || ""
  );
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("nvestBankAccessToken") || ""
  );
  const [idToken, setIdToken] = useState(
    localStorage.getItem("nvestBankIdToken") || ""
  );

  useEffect(() => {
    localStorage.setItem("nvestBankLoginAccount", email);
  }, [email]);
  useEffect(() => {
    localStorage.setItem("nvestBankAccessToken", accessToken);
  }, [accessToken]);
  useEffect(() => {
    localStorage.setItem("nvestBankIdToken", idToken);
  }, [idToken]);

  const userLoginHandler = (paramEmail, paramAccessToken, paramIdToken) => {
    if (paramEmail && paramAccessToken && paramIdToken) {
      setEmail(paramEmail);
      setAccessToken(paramAccessToken);
      setIdToken(paramIdToken);
    }
    if (!paramEmail || !paramAccessToken || !paramIdToken) {
      Cookies.remove(APP_USER_TOKEN);
      localStorage.clear();
    }
  };

  return (
    <MainContext.Provider
      value={{
        userLoginHandler,
        email,
        token: idToken,
        accessToken,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}

export default MainContextProvider;
