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
 *  OLD FUNCTIONS (RESTORED AS SAFE PLACEHOLDERS)
 * --------------------------------------------------
 */

// ---- DEAD APIs (Replaced with dummy functions) ----

export const GetAllSpecialties = () => dummyList();

export const GetAllAccountants = () => dummyList();

export const GetAllAccountantsForOneSpecialty = () => dummyList();

export const FollowBrand = () => dummyResponse();

export const UnfollowBrand = () => dummyResponse();

export const GetFollowList = () => dummyList();

export const GetFollowersPerAccount = () => dummyList();

export const GetAutomatedServices = () => dummyList();

export const GetCategoriesAcc = () => dummyList();

export const GetAllCustomerLicenses = () => dummyList();

export const GetLogServices = () => dummyList();

export const GetAllCurrencies = () => dummyList();

export const GetAllAccountantsWithoutFollowers = () => dummyList();

export const DeleteServiceFunction = () => dummyResponse();

export const addCompPlanFunction = () => dummyResponse();

/**
 * --------------------------------------------------
 *  REAL NAAVIVERSE APIs
 * --------------------------------------------------
 */

export const CreatePopularService = (object) => {
  try {
    return axios.post(`/api/services/add`, object);
  } catch (error) {
    return error;
  }
};

export const CheckStatusAccountant = async (mailId) => {
  try {
    const response = await axios.get(`/api/partner/get?email=${mailId}`);
    return response?.data;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const CheckStatusNaaviProfile = async (mailId) => {
  try {
    return await axios.get(`/api/users/get?email=${mailId}`);
  } catch (error) {
    return error;
  }
};
