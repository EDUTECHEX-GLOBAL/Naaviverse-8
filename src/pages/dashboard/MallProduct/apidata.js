import axios from 'axios';
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
// ADD THIS ⬇⬇⬇ REQUIRED FOR CURRENCY SELECTOR UI
export const getOfficialCurrencies = async () => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/currencies`
    );
    return response;
  } catch (error) {
    return error.response;
  }
};

export const coinData = async () => {
  return { data: { coins_data: [] } };
};


// VAULT: Add currency for a user
// export const coinData = async (email, object) => {
//   try {
//     const response = await axios.post(
//       `${BASE_URL}/api/vault/coins/add`,
//       { email, ...object }
//     );
//     return response;
//   } catch (error) {
//     return error.response;
//   }
// };



export const buyProduct = (object) => {
  try {
    const response = axios.post(
      `https://comms.globalxchange.io/gxb/product/buy`,
      object
    );
    return response;
  } catch (error) {
    return error.response;
  }
};

export const allLicenses = (email) => {
  try {
    const response = axios.get(
      `https://comms.globalxchange.io/coin/vault/user/license/get?email=${email}`
    );
    return response;
  } catch (error) {
    return error.response;
  }
};
