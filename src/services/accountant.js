import axios from "axios";

/**
 * --------------------------------------------------
 *  SAFE PLACEHOLDER HELPERS (No real API calls)
 * --------------------------------------------------
 */

const dummyResponse = (data = null) =>
  Promise.resolve({ data, success: true });

const dummyList = () =>
  Promise.resolve({ data: [], success: true });

/**
 * --------------------------------------------------
 *  OLD DEAD GX API FUNCTIONS (KEEP AS-IS)
 * --------------------------------------------------
 */

export const GetAllSpecialties = () => dummyList();
export const GetAllAccountants = () => dummyList();
export const GetAllAccountantsForOneSpecialty = () => dummyList();
export const FollowBrand = () => dummyResponse();
export const UnfollowBrand = () => dummyResponse();
export const GetFollowList = () => dummyList();
export const GetFollowersPerAccount = () => dummyList();
export const GetAutomatedServices = () => dummyList();
export const GetAllCustomerLicenses = () => dummyList();
export const GetLogServices = () => dummyList();
export const GetAllAccountantsWithoutFollowers = () => dummyList();
export const DeleteServiceFunction = () => dummyResponse();
export const addCompPlanFunction = () => dummyResponse();
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
/**
 * --------------------------------------------------
 *  REAL NAAVIVERSE APIs (DIRECT LOCALHOST URLs)
 * --------------------------------------------------
 */

export const GetCategoriesAcc = () => {
  return axios.get(`${BASE_URL}/api/categories`);
};

export const GetAllCurrencies = () => {
  return axios.get(`${BASE_URL}/api/currencies`);
};

export const CreatePopularService = (object) => {
  return axios.post(`${BASE_URL}/api/services/add`, object);
};

export const CheckStatusAccountant = async (email) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/partner/get?email=${email}`
    );
    return res.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};

export const CheckStatusNaaviProfile = async (email) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/users/get?email=${email}`
    );
    return res.data;
  } catch (err) {
    return { success: false, error: err.message };
  }
};
