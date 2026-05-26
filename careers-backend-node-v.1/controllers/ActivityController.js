// controllers/Activity.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED activity controller — handles BOTH users and partners.
//
// Exports:
//   logEvent            ← internal function, imported by partners.controller.js
//                          and any other controller (users, paths, marketplace)
//   logActivity         ← HTTP POST /api/activity/log  (used by frontend activityLogger.js)
//   getActivityUsers    ← HTTP GET  /api/activity/users
//   getActivityPartners ← HTTP GET  /api/activity/partners
// ─────────────────────────────────────────────────────────────────────────────

const Activity  = require("../models/Activity.model");
const userModel = require("../models/users.model");
const mongoose  = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// CHIP MAPS
// ─────────────────────────────────────────────────────────────────────────────
const USER_CHIP_MAP = {
  login:   { chipClass: "activity-chip-login",   chipLabel: "Session start" },
  explore: { chipClass: "activity-chip-explore", chipLabel: "Browsing"      },
  path:    { chipClass: "activity-chip-path",    chipLabel: "Enrolled"      },
  step:    { chipClass: "activity-chip-path",    chipLabel: "In Progress"   },
  market:  { chipClass: "activity-chip-market",  chipLabel: "Purchase"      },
};

const PARTNER_CHIP_MAP = {
  login:    { chipClass: "activity-chip-login",   chipLabel: "Login"     },
  publish:  { chipClass: "activity-chip-path",    chipLabel: "Published" },
  listing:  { chipClass: "activity-chip-market",  chipLabel: "Listing"   },
  approval: { chipClass: "activity-chip-explore", chipLabel: "Approval"  },
  invite:   { chipClass: "activity-chip-market",  chipLabel: "Invite"    },
  message:  { chipClass: "activity-chip-explore", chipLabel: "Message"   },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function makeInitials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatEventTime(date) {
  const now      = new Date();
  const d        = new Date(date);
  const diffDays = Math.floor((now - d) / 86400000);
  const timeStr  = d.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
  if (now.toDateString() === d.toDateString()) return `Today, ${timeStr}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (yesterday.toDateString() === d.toDateString()) return `Yesterday, ${timeStr}`;
  return `${diffDays} days ago, ${timeStr}`;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX: computeStatus — replaces the Mongoose virtual for .lean() queries
//
//   active  → last event < 24 hours ago
//   idle    → last event 24 hours → 5 days ago
//   offline → last event 5+ days ago  OR  never logged
//
// This is used for BOTH users and partners.
// ─────────────────────────────────────────────────────────────────────────────
function computeStatus(lastEventAt) {
  if (!lastEventAt) return "offline";
  const diffMin = (Date.now() - new Date(lastEventAt).getTime()) / 60000;
  if (diffMin < 1440)         return "active";   // < 24 hours
  if (diffMin < 60 * 24 * 5)  return "idle";     // 24 hours → 5 days
  return "offline";                              // 5+ days
}

// ─────────────────────────────────────────────────────────────────────────────
// ✅ FIX: computeJoinedDays — replaces the Mongoose virtual for .lean() queries
// Used for BOTH users and partners.
// ─────────────────────────────────────────────────────────────────────────────
function computeJoinedDays(joinedAt) {
  if (!joinedAt) return "unknown";
  const diffDays = Math.floor((Date.now() - new Date(joinedAt).getTime()) / 86400000);
  if (diffDays === 0)  return "today";
  if (diffDays === 1)  return "1 day ago";
  if (diffDays < 7)   return `${diffDays} days ago`;
  if (diffDays < 30)  return `${Math.floor(diffDays / 7)} week(s) ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} month(s) ago`;
  return `${Math.floor(diffDays / 365)} year(s) ago`;
}

// Resolve a userId from either an explicit id or an email lookup
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

// ─────────────────────────────────────────────────────────────────────────────
// logEvent  (INTERNAL — call from any controller, never throws)
// ─────────────────────────────────────────────────────────────────────────────
const logEvent = async ({
  role,
  email,
  displayName = "",
  partnerType = "",
  eventType,
  title,
  desc       = "",
  chipLabel  = "",
  actorId    = null,
  pathId     = null,
  pathName   = "",
  stepId     = null,
  stepName   = "",
  microStep  = "",
  itemName   = "",
  itemCost   = "",
  status     = "completed",
}) => {
  try {
    if (!role || !email || !eventType || !title) {
      console.warn("logEvent: missing required field (role/email/eventType/title)");
      return;
    }

    const chipMap = role === "partner" ? PARTNER_CHIP_MAP : USER_CHIP_MAP;
    const chip    = chipMap[eventType] || chipMap.login;

    const newEvent = {
      type:      eventType,
      title,
      desc,
      chipLabel: chipLabel || chip.chipLabel,
      chipClass: chip.chipClass,
      pathId:    pathId && mongoose.Types.ObjectId.isValid(pathId) ? pathId : null,
      stepId:    stepId && mongoose.Types.ObjectId.isValid(stepId) ? stepId : null,
      pathName,
      stepName,
      microStep,
      itemName,
      itemCost,
      status,
    };

    await Activity.findOneAndUpdate(
      { actorEmail: email.toLowerCase(), role },
      {
        $setOnInsert: { joinedAt: new Date() },
        $set: {
          displayName: displayName || email,
          initials:    makeInitials(displayName || email),
          partnerType: partnerType || "",
          lastEventAt: new Date(),
          ...(actorId ? { actorId } : {}),
        },
        $push: {
          events: { $each: [newEvent], $slice: -50 },
        },
      },
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error("logEvent error:", err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/activity/users
// ✅ FIXED: uses .lean() (no virtuals) + computeStatus/computeJoinedDays
// ─────────────────────────────────────────────────────────────────────────────
const getActivityUsers = async (req, res) => {
  try {
    const records = await Activity.find({ role: "user" })
      .lean()                          // ✅ plain JS objects — fast
      .sort({ lastEventAt: -1 })
      .limit(200);

    // ✅ Sort using computeStatus (virtuals don't work on lean objects)
    const ORDER = { active: 0, idle: 1, offline: 2 };
    records.sort((a, b) => {
      const sa = ORDER[computeStatus(a.lastEventAt)] ?? 2;
      const sb = ORDER[computeStatus(b.lastEventAt)] ?? 2;
      if (sa !== sb) return sa - sb;
      return (new Date(b.lastEventAt) || 0) - (new Date(a.lastEventAt) || 0);
    });

    const data = records.map((r) => {
      const events = (r.events || [])
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((ev) => {
          const time = formatEventTime(ev.createdAt);
          switch (ev.type) {
            case "login":
              return {
                type: "login", time,
                title:     ev.title || "Logged in",
                desc:      ev.desc  || "Session started",
                chipLabel: ev.chipLabel || "Session start",
                chipClass: ev.chipClass,
              };
            case "explore":
              return {
                type: "explore", time,
                title:     ev.pathName ? `Browsed: ${ev.pathName}` : ev.title || "Browsing learning paths",
                desc:      ev.pathName ? `User explored "${ev.pathName}"` : ev.desc || "",
                chipLabel: ev.chipLabel || "Browsing",
                chipClass: ev.chipClass,
                pathName:  ev.pathName || "",
              };
            case "path":
              return {
                type: "path", time,
                title:     ev.title    || `Selected: ${ev.pathName}`,
                desc:      ev.desc     || `Enrolled in ${ev.pathName}`,
                chipLabel: ev.chipLabel || "Enrolled",
                chipClass: ev.chipClass,
                pathName:  ev.pathName || "",
              };
            case "step":
              return {
                type: "step", time,
                title:     ev.pathName ? `${ev.pathName} → ${ev.stepName}` : ev.title,
                desc:      ev.desc || "",
                chipLabel: ev.status === "completed" ? "Completed" : "In Progress",
                chipClass: ev.chipClass,
                pathName:  ev.pathName  || "",
                stepName:  ev.stepName  || "",
                microStep: ev.microStep || "",
              };
            case "market":
              return {
                type: "market", time,
                title:     ev.title    || "Purchased from Marketplace",
                desc:      ev.itemName ? `Bought: "${ev.itemName}" · ${ev.itemCost}` : ev.desc,
                chipLabel: ev.chipLabel || "Purchase",
                chipClass: ev.chipClass,
              };
            default:
              return {
                type: ev.type, time,
                title:     ev.title || "",
                desc:      ev.desc  || "",
                chipLabel: ev.chipLabel || ev.type,
                chipClass: ev.chipClass || "",
              };
          }
        });

      const lastEvent = events.length > 0 ? events[events.length - 1] : null;

      return {
        id:          r._id,
        name:        r.displayName || r.actorEmail,
        email:       r.actorEmail,
        initials:    r.initials || makeInitials(r.displayName || r.actorEmail),
        status:      computeStatus(r.lastEventAt),      // ✅ FIXED
        joinedDays:  computeJoinedDays(r.joinedAt),     // ✅ FIXED
        lastEventAt: r.lastEventAt,
        events,
        lastEvent,
      };
    });

    return res.json({ status: true, data });
  } catch (err) {
    console.error("getActivityUsers error:", err);
    return res.status(500).json({ status: false, message: "Error fetching user activity" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/activity/partners
// ✅ FIXED: uses .lean() (no virtuals) + computeStatus/computeJoinedDays
// ─────────────────────────────────────────────────────────────────────────────
const getActivityPartners = async (req, res) => {
  try {
    const records = await Activity.find({ role: "partner" })
      .lean()                          // ✅ plain JS objects — fast
      .sort({ lastEventAt: -1 })
      .limit(200);

    // ✅ Sort using computeStatus (virtuals don't work on lean objects)
    const ORDER = { active: 0, idle: 1, offline: 2 };
    records.sort((a, b) => {
      const sa = ORDER[computeStatus(a.lastEventAt)] ?? 2;
      const sb = ORDER[computeStatus(b.lastEventAt)] ?? 2;
      if (sa !== sb) return sa - sb;
      return (new Date(b.lastEventAt) || 0) - (new Date(a.lastEventAt) || 0);
    });

    const data = records.map((r) => {
      const events = (r.events || [])
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((ev) => ({
          type:      ev.type,
          title:     ev.title,
          desc:      ev.desc,
          chipLabel: ev.chipLabel,
          chipClass: ev.chipClass,
          time:      formatEventTime(ev.createdAt),
        }));

      const lastEvent = events.length > 0 ? events[events.length - 1] : null;

      return {
        id:          r._id,
        name:        r.displayName || r.actorEmail,
        email:       r.actorEmail,
        initials:    r.initials || makeInitials(r.displayName || r.actorEmail),
        type:        r.partnerType,
        status:      computeStatus(r.lastEventAt),      // ✅ FIXED
        joinedDays:  computeJoinedDays(r.joinedAt),     // ✅ FIXED
        lastEventAt: r.lastEventAt,
        events,
        lastEvent,
      };
    });

    return res.json({ status: true, data });
  } catch (err) {
    console.error("getActivityPartners error:", err);
    return res.status(500).json({ status: false, message: "Error fetching partner activity" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/activity/log  (HTTP — called by frontend activityLogger.js for USERS)
// ─────────────────────────────────────────────────────────────────────────────
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

    const validUserTypes = ["login", "explore", "path", "market", "step"];
    if (!validUserTypes.includes(type)) {
      return res.status(400).json({
        status: false,
        message: `type must be one of: ${validUserTypes.join(", ")}`,
      });
    }

    const resolvedId = await resolveUserId(userId, email);
    let displayName  = email;

    if (resolvedId) {
      const user = await userModel.findById(resolvedId).select("name").lean();
      if (user?.name) displayName = user.name;
    }

    const autoTitle =
      title ||
      (type === "login"   ? "Logged in"                          :
       type === "explore" ? `Browsed: ${pathName || "a path"}`   :
       type === "path"    ? `Enrolled: ${pathName || "a path"}`  :
       type === "step"    ? `Step: ${stepName || "a step"}`      :
       type === "market"  ? `Purchased: ${itemName || "an item"}`:
       type);

    await logEvent({
      role: "user",
      email,
      displayName,
      actorId: resolvedId,
      eventType: type,
      title: autoTitle,
      desc:  desc || "",
      pathId, pathName, stepId, stepName, microStep,
      itemName, itemCost, status,
    });

    return res.json({ status: true, message: "Activity logged" });
  } catch (err) {
    console.error("logActivity error:", err);
    return res.status(500).json({ status: false, message: "Error logging activity", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/activity/partners/log  (HTTP — manual partner event from frontend)
// ─────────────────────────────────────────────────────────────────────────────
const logPartnerActivity = async (req, res) => {
  try {
    const { email, eventType, title, desc, displayName, partnerType, chipLabel } = req.body;

    if (!email || !eventType || !title) {
      return res.status(400).json({
        status: false,
        message: "email, eventType and title are required",
      });
    }

    const validPartnerTypes = ["login", "publish", "listing", "approval", "invite", "message"];
    if (!validPartnerTypes.includes(eventType)) {
      return res.status(400).json({
        status: false,
        message: `eventType must be one of: ${validPartnerTypes.join(", ")}`,
      });
    }

    await logEvent({ role: "partner", email, displayName, partnerType, eventType, title, desc, chipLabel });
    return res.json({ status: true, message: "Partner event logged" });
  } catch (err) {
    console.error("logPartnerActivity error:", err);
    return res.status(500).json({ status: false, message: "Error logging partner activity" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// logActivityInternal  (backwards compat alias — used by user controllers)
// ─────────────────────────────────────────────────────────────────────────────
const logActivityInternal = async ({
  email, type, userId,
  pathId, pathName, stepId, stepName, microStep,
  title, desc, itemName, itemCost, status,
}) => {
  let displayName = email;
  try {
    const resolvedId = await resolveUserId(userId, email);
    if (resolvedId) {
      const user = await userModel.findById(resolvedId).select("name").lean();
      if (user?.name) displayName = user.name;
    }
  } catch (_) { /* ignore */ }

  await logEvent({
    role: "user",
    email,
    displayName,
    eventType: type,
    title: title || type,
    desc,
    pathId, pathName, stepId, stepName, microStep,
    itemName, itemCost, status,
  });
};

module.exports = {
  logEvent,
  logActivityInternal,
  getActivityUsers,
  getActivityPartners,
  logActivity,
  logPartnerActivity,
};