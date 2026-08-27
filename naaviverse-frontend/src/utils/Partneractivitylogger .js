// src/utils/partnerActivityLogger.js
// ─────────────────────────────────────────────────────────────────────────────
// Call this from the partner portal to log any partner event.
// Reads partner email from localStorage automatically.
//
// Usage examples:
//
//   import logPartnerActivity from "../utils/partnerActivityLogger";
//
//   // On path publish:
//   logPartnerActivity({ eventType: "publish", title: "Published: AI Fundamentals", desc: "Path went live" });
//
//   // On marketplace listing:
//   logPartnerActivity({ eventType: "listing", title: "New listing added", desc: "Python Bootcamp added to marketplace" });
//
//   // On path step created:
//   logPartnerActivity({ eventType: "publish", title: "Step created: Intro to ML", desc: "Added under AI Fundamentals path" });
//
//   // On sending invite:
//   logPartnerActivity({ eventType: "invite", title: "Invite sent", desc: "Invited john@example.com" });
//
// Supported eventTypes:
//   "login" | "publish" | "listing" | "approval" | "invite" | "message"
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

const logPartnerActivity = async ({
  eventType,        // REQUIRED — "login" | "publish" | "listing" | "approval" | "invite" | "message"
  title,            // REQUIRED — short event title shown in timeline
  desc      = "",   // optional longer description
  chipLabel = "",   // optional override for chip label
}) => {
  try {
    // Read partner from localStorage — set during partner login
    const raw     = localStorage.getItem("partner");
    const partner = raw ? JSON.parse(raw) : null;
    const email   = partner?.email;

    if (!email) {
      console.warn("partnerActivityLogger: no partner email in localStorage, skipping log");
      return;
    }

    await axios.post(`${BASE_URL}/api/activity/partners/log`, {
      email,
      eventType,
      title,
      desc,
      chipLabel,
      displayName: partner?.businessName || partner?.username || email,
      partnerType: partner?.partnerType  || "",
    });
  } catch (err) {
    // Always silent — never crash the partner portal
    console.warn("partnerActivityLogger error:", err?.response?.data || err.message);
  }
};

export default logPartnerActivity;