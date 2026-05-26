import axios from "axios";

/**
 * GET REGISTERED APPS
 */
export const getRegisteredApp = () => {
  const userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const email = userDetails?.email;

  if (!email) {
    console.warn("Admin email not found, skipping getRegisteredApp");
    return Promise.resolve({ data: [] });
  }

  return axios.get(`/api/applications?email=${email}`);
};

/**
 * GET USER DETAILS
 */
export const getUserDetails = () => {
  const userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const email = userDetails?.email;

  if (!email) {
    console.warn("Admin email not found, skipping getUserDetails");
    return Promise.resolve({ data: null });
  }

  return axios.get(`/api/users/user-details?email=${email}`);
};

/**
 * GET ALL BANKERS
 */
export const fetchAllBankers = () => {
  return axios.get(`/api/bankers`);
};

/**
 * GET ALL COINS
 */
export const fetchAllCoins = () => {
  return axios.get(`/api/currencies`);
};


/**
 * FOREX CONVERSION
 */
export const conversionAPI = (buy, from) => {
  if (!buy || !from) return Promise.resolve({ data: null });

  return axios.get(`/api/convert?buy=${buy}&from=${from}`);
};

/**
 * GET CMC PRICES
 */
export const allCoinsConversion = (coin) => {
  if (!coin) return Promise.resolve({ data: null });

  return axios.get(`/api/cmc?convert=${coin}`);
};

/**
 * GET BOND INTEREST LOGS
 */
export const bondEarningList = (email, coin) => {
  if (!email || !coin) return Promise.resolve({ data: [] });

  return axios.get(`/api/bond-earnings?email=${email}&coin=${coin}`);
};

/**
 * GET MONEY MARKET EARNINGS
 */
export const moneyMarketList = (email, app, coin) => {
  if (!email || !app || !coin) return Promise.resolve({ data: [] });

  return axios.get(
    `/api/money-market?email=${email}&app_code=${app}&coin=${coin}`
  );
};
