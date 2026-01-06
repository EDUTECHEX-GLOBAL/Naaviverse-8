import axios from "axios";

/**
 * GET REGISTERED APPS
 */
export const getRegisteredApp = () => {
  const userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const email = userDetails?.email;

  return axios.get(`/proxy/applications?email=${email}`);
};

/**
 * GET USER DETAILS
 */
export const getUserDetails = () => {
  const userDetails = JSON.parse(localStorage.getItem("adminuser"));
  const email = userDetails?.email;

  return axios.get(`/proxy/user-details?email=${email}`);
};

/**
 * GET ALL BANKERS
 */
export const fetchAllBankers = () => {
  return axios.get(`/proxy/bankers`);
};

/**
 * GET ALL COINS
 */
export const fetchAllCoins = () => {
  return axios.get(`/proxy/coins`);
};

/**
 * FOREX CONVERSION
 */
export const conversionAPI = (buy, from) => {
  return axios.get(`/proxy/convert?buy=${buy}&from=${from}`);
};

/**
 * GET CMC PRICES
 */
export const allCoinsConversion = (coin) => {
  return axios.get(`/proxy/cmc?convert=${coin}`);
};

/**
 * GET BOND INTEREST LOGS
 */
export const bondEarningList = (email, coin) => {
  return axios.get(`/proxy/bond-earnings?email=${email}&coin=${coin}`);
};

/**
 * GET MONEY MARKET EARNINGS
 */
export const moneyMarketList = (email, app, coin) => {
  return axios.get(
    `/proxy/money-market?email=${email}&app_code=${app}&coin=${coin}`
  );
};
