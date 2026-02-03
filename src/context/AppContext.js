import React, { createContext, useContext, useMemo, useState } from "react";
import { useLoadAppDetails } from "../queryHooks";
import { APP_CODE } from "../config/appConfig";
import { MainContext } from "./Context";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const { appByCode, appByCodeLoading } = useLoadAppDetails(APP_CODE);

  const appData = useMemo(
    () => ({
      appName: appByCode?.app_name,
      appCode: APP_CODE,
      appLogo: appByCode?.app_icon,
      appFullLogo: appByCode?.data?.color_logo,
      appColorCode: `#${appByCode?.color_codes?.[0]?.primarycolourcode}`,
      appCurrencyName: appByCode?.data?.currencyname
        ? appByCode?.data?.currencyname
        : "USD",
      appCurrencySymbol: appByCode?.data?.currencyname,
      websiteTitle: appByCode?.data?.website_title,
      websiteDescription: appByCode?.data?.website_description,
      ownerEmail: appByCode?.operatorData?.email,
      registrationLink: appByCode?.registration_link,
      token: appByCode?.shareTokenData?.token,
    }),
    [appByCode]
  );

  const {
    appName,
    appCode,
    appLogo,
    appFullLogo,
    appColorCode,
    appCurrencyName,
    appCurrencySymbol,
    websiteTitle,
    websiteDescription,
    ownerEmail,
    registrationLink,
    token,
  } = appData;

  return (
    <AppContext.Provider
      value={{
        appName,
        appCode,
        appLogo,
        appFullLogo,
        appColorCode,
        appCurrencyName,
        appCurrencySymbol,
        websiteTitle,
        websiteDescription,
        appByCode,
        appDetailsLoading: appByCodeLoading,
        ownerEmail,
        registrationLink,
        token,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;

export const useAppContextDetails = () => useContext(AppContext);
