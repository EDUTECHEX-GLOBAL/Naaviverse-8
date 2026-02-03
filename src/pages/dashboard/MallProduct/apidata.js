import axios from 'axios';

// ADD THIS ⬇⬇⬇ REQUIRED FOR CURRENCY SELECTOR UI
export const getOfficialCurrencies = async () => {
  try {
    const response = await axios.get(
      "http://localhost:4545/api/currencies"
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
//       "http://localhost:4545/api/vault/coins/add",
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
