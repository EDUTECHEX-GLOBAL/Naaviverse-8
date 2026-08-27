import axios from "axios";

// Base URL for backend
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const Loginservice = async (object, loginType) => {
  try {
    const endpoint =
      loginType === "Users"
        ? `${BASE_URL}/api/auth/login`
        : `${BASE_URL}/api/partner/login`;

    console.log("🔥 Using endpoint:", endpoint);
    console.log("Payload Sent to API:", object);

    const response = await axios.post(endpoint, object, {
      headers: { "Content-Type": "application/json" },
    });

    return response;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error;
  }
};
