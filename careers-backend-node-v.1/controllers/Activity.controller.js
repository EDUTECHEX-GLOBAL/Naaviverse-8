const Activity  = require("../models/Activity.model");
const userModel = require("../models/users.model");
const mongoose  = require("mongoose");

// ── GET /api/activity/users ───────────────────────────────────────────────────
const getActivityUsers = async (req, res) => {
  try {
    const records = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (!records.length) {
      return res.json({ status: true, data: [] });
    }

    const emails = [...new Set(records.map((r) => r.email))];

    const users = await userModel
      .find({ email: { $in: emails } })
      .select("email name city status createdAt")
      .lean();

    const userByEmail = {};
    users.forEach((u) => {
      // Store by lowercase so lookups are case-insensitive
      userByEmail[u.email.toLowerCase()] = u;
    });

    const grouped = {};
    records.forEach((rec) => {
      const key = rec.email.toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(rec);
    });

    const result = emails.map((email) => {
      const user   = userByEmail[email.toLowerCase()] || {};
      const events = grouped[email.toLowerCase()] || [];

    // REPLACE:
const displayName = (user.name && user.name.trim()) ? user.name.trim() : email;
const nameParts   = displayName.split(" ").filter(Boolean);
const initials    =
  nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

      const mappedEvents = events.map((ev) => {
        const time = formatTime(ev.createdAt);
        switch (ev.type) {
          case "login":
            return {
              type:      "login",
              time,
              title:     ev.title || "Logged in",
              desc:      ev.desc  || "Session started",
              chipLabel: "Session start",
            };
          case "explore":
  return {
    type:      "explore",
    time,
    title:     ev.pathName ? `Browsed: ${ev.pathName}` : ev.title || "Browsing learning paths",
    desc:      ev.pathName ? `User explored "${ev.pathName}"` : ev.desc || "",
    chipLabel: "Browsing",
    pathName:  ev.pathName || "",
  };
          case "path":
            return {
              type:      "path",
              time,
              title:     ev.title    || `Selected: ${ev.pathName}`,
              desc:      ev.desc     || `Enrolled in ${ev.pathName}`,
              chipLabel: "Enrolled",
              pathName:  ev.pathName || "",
            };
          case "step":
            return {
              type:      "step",
              time,
              title:     ev.pathName ? `${ev.pathName} → ${ev.stepName}` : ev.title,
              desc:      ev.desc  || "",
              chipLabel: ev.status === "completed" ? "Completed" : "In Progress",
              pathName:  ev.pathName  || "",
              stepName:  ev.stepName  || "",
              microStep: ev.microStep || "",
            };
          case "market":
            return {
              type:      "market",
              time,
              title:     ev.title    || "Purchased from Marketplace",
              desc:      ev.itemName ? `Bought: "${ev.itemName}" · ${ev.itemCost}` : ev.desc,
              chipLabel: "Purchase",
            };
          default:
            return {
              type:      ev.type,
              time,
              title:     ev.title || "",
              desc:      ev.desc  || "",
              chipLabel: ev.type,
            };
        }
      });

    const timelineEvents = [...mappedEvents].reverse();

return {
  id:         user._id?.toString() || email,
  name:       user.name || email,
  email,
  initials,
  status:     events.length > 0 ? "active" : "idle",
  joinedDays: user.createdAt ? timeAgo(user.createdAt) : "—",
  events:     timelineEvents,        // oldest→newest for journey timeline
  lastEvent:  mappedEvents[0],       // most recent for table "Last Event" column
};
    });

    return res.json({ status: true, data: result });
  } catch (err) {
    console.error("getActivityUsers error:", err);
    return res.status(500).json({ status: false, message: "Error fetching activity users" });
  }
};


// ── POST /api/activity/log ────────────────────────────────────────────────────
const logActivity = async (req, res) => {
  try {
    const {
      userId, email, type,
      pathId, pathName, stepId, stepName, microStep,
      title, desc, itemName, itemCost, status,
    } = req.body;

    if (!email || !type) {
      return res.status(400).json({ status: false, message: "email and type are required" });
    }

    const validTypes = ["login", "explore", "path", "market", "step"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ status: false, message: `type must be one of: ${validTypes.join(", ")}` });
    }

    // ✅ FIX: case-insensitive resolve — no longer fails on email case mismatch
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) {
      return res.status(400).json({
        status:  false,
        message: "No user found for this email. Please register or log in first.",
      });
    }

    const activity = await Activity.create({
      userId:    resolvedUserId,
      email:     email.toLowerCase(),   // ✅ normalise stored email
      type,
      pathId:    pathId  && mongoose.Types.ObjectId.isValid(pathId)  ? pathId  : null,
      stepId:    stepId  && mongoose.Types.ObjectId.isValid(stepId)  ? stepId  : null,
      pathName:  pathName  || "",
      stepName:  stepName  || "",
      microStep: microStep || "",
      title:     title     || "",
      desc:      desc      || "",
      itemName:  itemName  || "",
      itemCost:  itemCost  || "",
      status:    status    || "completed",
    });

    return res.json({ status: true, data: activity });
  } catch (err) {
    console.error("logActivity error:", err);
    return res.status(500).json({ status: false, message: "Error logging activity", error: err.message });
  }
};


// ── Internal helper — call directly from other controllers ────────────────────
// Never throws. Silently skips if something goes wrong.
const logActivityInternal = async ({
  email, type, userId,
  pathId, pathName, stepId, stepName, microStep,
  title, desc, itemName, itemCost, status,
}) => {
  try {
    const resolvedUserId = await resolveUserId(userId, email);
    if (!resolvedUserId) return;

    await Activity.create({
      userId:    resolvedUserId,
      email:     email.toLowerCase(),   // ✅ normalise stored email
      type,
      pathId:    pathId  && mongoose.Types.ObjectId.isValid(pathId)  ? pathId  : null,
      stepId:    stepId  && mongoose.Types.ObjectId.isValid(stepId)  ? stepId  : null,
      pathName:  pathName  || "",
      stepName:  stepName  || "",
      microStep: microStep || "",
      title:     title     || "",
      desc:      desc      || "",
      itemName:  itemName  || "",
      itemCost:  itemCost  || "",
      status:    status    || "completed",
    });
  } catch (err) {
    console.error("logActivityInternal error:", err.message);
    // Never throw — must never break the main flow
  }
};


// ── Shared helper ─────────────────────────────────────────────────────────────
// ✅ FIX: case-insensitive email lookup so "User@Gmail.com" matches "user@gmail.com"
async function resolveUserId(userId, email) {
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    return new mongoose.Types.ObjectId(userId);
  }
  if (email) {
    const user = await userModel
      .findOne({ email: { $regex: new RegExp(`^${escapeRegex(email)}$`, "i") } })
      .select("_id")
      .lean();
    return user ? user._id : null;
  }
  return null;
}

// Escape special regex characters in email string (e.g. dots, plus signs)
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function formatTime(date) {
  const now      = new Date();
  const d        = new Date(date);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  const timeStr  = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;
  return `${diffDays} days ago, ${timeStr}`;
}

function timeAgo(date) {
  const diffDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0)  return "today";
  if (diffDays === 1)  return "1 day ago";
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 14)  return "1 week ago";
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

module.exports = { getActivityUsers, logActivity, logActivityInternal };