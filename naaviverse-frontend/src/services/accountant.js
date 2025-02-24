import axios from "axios";

////Get all specialties

export const GetAllSpecialties = () => {
  try {
    const response = axios.get(
      `https://teller2.apimachine.com/banker/categories`,
      {
        params: {
          mainCategory: "accountants",
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

////Get all accountants

export const GetAllAccountants = async (userEmail) => {
  try {
    const response = await axios.get(
      `https://teller2.apimachine.com/admin/allBankers?followerEmail=${userEmail}&category=education%20consultants`
      // {
      //   params: {
      //       category:"accountants"
      //   }
      // }
    );
    return response;
  } catch (error) {
    return error;
  }
};

////Get all accountants for one specialty

export const GetAllAccountantsForOneSpecialty = (object) => {
  try {
    const response = axios.get(
      `https://teller2.apimachine.com/admin/allBankers`,
      {
        params: object,
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

////Follow brand

export const FollowBrand = (object, data) => {
  try {
    const response = axios.post(
      `https://teller2.apimachine.com/banker/follow`,
      object,
      {
        headers: {
          email: data.email,
          token: data.idToken,
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

//Get Automated Services

export const GetAutomatedServices = (object) => {
  try {
    const response = axios.post(
      `https://comms.globalxchange.io/gxb/product/price/with/fees/get`,
      object
    );
    return response;
  } catch (error) {
    return error;
  }
};

//  Get following list for logged in user

export const GetFollowList = (mailId) => {
  try {
    const response = axios.get(
      `https://teller2.apimachine.com/banker/followingList`,
      {
        params: {
          email: mailId,
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

// Get followers for one accountant

export const GetFollowersPerAccount = async (mailId) => {
  try {
    const response = await axios.get(
      `https://teller2.apimachine.com/banker/followersList?email=${mailId}`
      // {
      //   params: {
      //     email: userDetails.user.email
      //   }
      // }
    );
    return response;
  } catch (error) {
    return error;
  }
};

// Get categories acc

export const GetCategoriesAcc = () => {
  try {
    const response = axios.get(
      `https://comms.globalxchange.io/gxb/product/category/get`
    );
    return response;
  } catch (error) {
    return error;
  }
};

// Get all customer licenses for logged in user

export const GetAllCustomerLicenses = (mailId) => {
  try {
    const response = axios.get(
      `https://comms.globalxchange.io/coin/vault/user/license/get`,
      {
        params: {
          email: mailId,
        },
      }
    );
    return response;
  } catch (error) {
    return error;
  }
};

// Get services for logged in user

export const GetLogServices = (mailId) => {
  return new Promise((resolve, reject) => {
    // Your asynchronous code here, such as making an API request
    // Example:
    axios
      .get(
        `https://comms.globalxchange.io/gxb/product/get?product_created_by=${mailId}`
      )
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// const GetLogServices =  () => {
//   try{
//     const response =  axios.get(`https://comms.globalxchange.io/gxb/product/get?product_created_by=${mailId}`);
//     return response;
//   }catch(error){
//     return error
//   }
// }

//Get all currencies

export const GetAllCurrencies = () => {
  try {
    const response = axios.get(
      `https://comms.globalxchange.io/coin/vault/get/all/coins`
    );
    return response;
  } catch (error) {
    return error;
  }
};

// is popular create service submit

export const CreatePopularService = (object) => {
  try {
    const response = axios.post(
      `/api/services/add`,
      object
    );
    return response;
  } catch (error) {
    return error;
  }
};

// Check status of an accountant for logged in user

export const CheckStatusAccountant = async (mailId) => {
  try {
    console.log("Checking status for email:", mailId);
    
    const response = await axios.get(`/api/partner/get?email=${mailId}`);
    console.log("API Response:", response.data);

    const result = response?.data;

    if (result.success && result.data) {
      return { success: true, data: result.data };
    } else {
      console.log("Profile incomplete or missing. Reason:", result.message);
      return { success: false, message: result.message, missingFields: result.missingFields || [] };
    }
  } catch (error) {
    console.error("CheckStatusAccountant error:", error);
    return { success: false, error: error.message };
  }
};


// Unfollow a brand

export const UnfollowBrand = async (object, data) => {
  try {
    const response = await axios.post(
      "https://teller2.apimachine.com/banker/unfollow",
      object,
      {
        headers: {
          email: data.email,
          token: data.idToken,
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error, "UnfollowBrand error");
    return error;
  }
};

export const GetAllAccountantsWithoutFollowers = async () => {
  try {
    const response = await axios.get(
      `https://teller2.apimachine.com/admin/allBankers?category=education consultants`
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const DeleteServiceFunction = async (obj) => {
  try {
    const response = await axios.post(
      `https://comms.globalxchange.io/gxb/product/delete`,
      obj
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const addCompPlanFunction = async (body) => {
  try {
    const data = await axios.post(
      'https://comms.globalxchange.io/gxb/product/commission/fees/set',
      body
    );
    return data;
  } catch (err) {
    console.error(err);
  }
};


// check status of naavi profile

export const CheckStatusNaaviProfile = async (mailId) => {
  // console.log(mailId, 'mailId')
  try {
    const response = await axios.get(
      `/api/users/get?email=${mailId}`
    );
    return response;
  } catch (error) {
    console.log(error, "CheckStatusNaaviProfile error");
    return error;
  }
};
