import axios from "axios";
 
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
 
export const GetWalletBalance = (email) =>
  axios.get(`${BASE_URL}/api/wallet/balance`, { params: { email } });
 
export const GetWalletTxns = (email) =>
  axios.get(`${BASE_URL}/api/wallet/txns`, { params: { email } });
 
export const AddWalletCredits = (payload) =>
  axios.post(`${BASE_URL}/api/wallet/credit`, payload);
 
export const DeductWalletCredits = (payload) =>
  axios.post(`${BASE_URL}/api/wallet/deduct`, payload);
 
export const ApplyWelcomeBonus = (email) =>
  axios.post(`${BASE_URL}/api/wallet/welcome-bonus`, { email });