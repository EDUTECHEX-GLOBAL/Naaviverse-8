import axios from "axios";
import Axios from "axios";
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const login = async (credentials) => {
  try {
    console.log("Payload Sent to API:", credentials); // Debugging step

    const response = await axios.post(`/api/auth/login`, credentials, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the response contains a valid token
    if (response.data.token) {
      console.log("Login successful:", response.data);

      // Save the token to localStorage or sessionStorage
      localStorage.setItem('authToken', response.data.token);
      
      // Optionally, return user details or the token for further use
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      console.error("Invalid credentials or missing token in response");
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    // Enhanced error handling
    const errorMessage = error.response?.data?.message || error.message || "An unexpected error occurred.";
    console.error("Login API Error:", errorMessage);
    
    // Throw a new error with a user-friendly message
    throw new Error(errorMessage);
  }
}

export const getCoinsForApp = (app) => {
  return axios.post(
    `${BASE_URL}/api/vault/coins/<email>`,
    {
      app_code: app,
    }
  );
};


export const liquidAssetList = (data) => {
  return axios.post(
    `${BASE_URL}/vault/txns`,
    { ...data }
  );
};

export const authenticate = () => {
  let email = localStorage.getItem("bankerEmailNew");
  let token = localStorage.getItem("TokenId");

  return axios.post(`https://comms.globalxchange.io/coin/verifyToken`, {
    email: email,
    token: token,
  });
};
export const forgetPasswordRequest = (email) => {
  let config = {
    method: "post",
    url: `https://gxauth.apimachine.com/gx/user/password/forgot/request`,
    data: {
      email: email,
    },
  };
  return axios(config);
};
export const resetPassword = (details) => {
  let config = {
    method: "post",
    url: `https://gxauth.apimachine.com/gx/user/password/forgot/confirm`,
    data: {
      email: details.email,
      code: details.code,
      newPassword: details.newPassword,
    },
  };
  return Axios(config);
};