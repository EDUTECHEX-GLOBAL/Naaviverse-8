// src/utils/activityLogger.js
// Call this from anywhere in the frontend to log user activity.
// It reads email from localStorage automatically — no need to pass it manually.

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const logActivity = async ({
  type,
  title     = "",
  desc      = "",
  pathId    = null,
  pathName  = "",
  stepId    = null,
  stepName  = "",
  microStep = "",
  itemName  = "",
  itemCost  = "",
  status    = "completed",
}) => {
  try {
    // Read user email from localStorage — set during login
    const raw   = localStorage.getItem("user");
    const user  = raw ? JSON.parse(raw) : null;
    const email = user?.email;

    if (!email) {
      console.warn("activityLogger: no email in localStorage, skipping log");
      return;
    }

    await axios.post(`${BASE_URL}/api/activity/log`, {
      email,
      type,
      title,
      desc,
      pathId,
      pathName,
      stepId,
      stepName,
      microStep,
      itemName,
      itemCost,
      status,
    });
  } catch (err) {
    // Never crash the app — activity logging is always silent
    console.warn("activityLogger error:", err?.response?.data || err.message);
  }
};

export default logActivity;