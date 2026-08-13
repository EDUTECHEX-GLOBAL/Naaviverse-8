import axios from "axios";

export const loginApi = async (body) => {
  try {
    const data = await axios.post(
      "https://gxauth.apimachine.com/gx/user/auth/login",
      body
    );
    return data;
  } catch (error) {
    return error;
  }
};

export const registerApp = async ({ email, app_code }) => {
  try {
    const data = await axios.post(
      "https://comms.globalxchange.io/gxb/apps/register/user",
      {
        email,
        app_code,
        fromAppCreation: true,
      }
    );
    return data;
  } catch (error) {
    return error;
  }
};
