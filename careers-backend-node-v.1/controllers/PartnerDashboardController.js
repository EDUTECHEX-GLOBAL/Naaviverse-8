// controllers/partnerDashboard.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// Provides real-time stats for the Partner Home dashboard.
//
// Endpoints served:
//   GET /api/partner-dashboard/stats?email=partner@x.com
//     → { totalSelected, thisWeek, percentChange, paths: [...] }
//
//   GET /api/partner-dashboard/path-users?pathId=xxx&partnerEmail=partner@x.com
//     → enrolled user list for a specific path (for path detail page)
// ─────────────────────────────────────────────────────────────────────────────

const mongoose  = require("mongoose");
const pathModel = require("../models/PathModel");

// ── Lazy-load to avoid circular deps ─────────────────────────────────────────
const getUserPathModel  = () => require("../models/UserPathsModel");
const getPartnerModel   = () => require("../models/PartnerModel");
const getUserModel      = () => require("../models/UsersModel");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — week boundary (last 7 days)
// ─────────────────────────────────────────────────────────────────────────────
function weekAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — month boundary (last 30 days)
// ─────────────────────────────────────────────────────────────────────────────
function monthAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — previous 30-day window (31-60 days ago, for % change)
// ─────────────────────────────────────────────────────────────────────────────
function prevMonthRange() {
  const end   = new Date(); end.setDate(end.getDate() - 30);
  const start = new Date(); start.setDate(start.getDate() - 60);
  return { start, end };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET DASHBOARD STATS
// GET /api/partner-dashboard/stats?email=partner@x.com
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ status: false, message: "email is required" });
    }

    const UserPath = getUserPathModel();

    // ── 1. Fetch all ACTIVE paths belonging to this partner ───────────────
    const partnerPaths = await pathModel
      .find({ email, status: "active" })
      .select("_id nameOfPath path_cat description total_steps the_ids")
      .lean();

    if (!partnerPaths.length) {
      return res.status(200).json({
        status: true,
        data: {
          totalSelected:  0,
          thisWeek:       0,
          percentChange:  0,
          paths:          [],
        },
      });
    }

    const pathIds = partnerPaths.map(p => p._id);

    // ── 2. All-time enrollments per path from userPaths collection ────────
    const allTimeAgg = await UserPath.aggregate([
      { $match: { pathId: { $in: pathIds }, status: "active" } },
      { $group: { _id: "$pathId", count: { $sum: 1 } } },
    ]);

    // ── 2b. Legacy fallback: naavi_users.selectedPath ─────────────────────
    // Count users whose selectedPath is one of our paths but have NO userPaths doc
    const User = getUserModel();
    const pathIdStrings = pathIds.map(id => id.toString());

    // Get all emails already in userPaths for these paths
    const coveredEmailsByPath = await UserPath.aggregate([
      { $match: { pathId: { $in: pathIds }, status: "active" } },
      { $group: { _id: "$pathId", emails: { $addToSet: "$email" } } },
    ]);
    const coveredMap = Object.fromEntries(
      coveredEmailsByPath.map(x => [x._id.toString(), new Set(x.emails)])
    );

    // Find legacy users per path
    const legacyCountMap = {};
    for (const pathId of pathIds) {
      const pid = pathId.toString();
      const covered = coveredMap[pid] || new Set();
      const legacyUsers = await User.find({
        selectedPath: pid,
        email: { $nin: [...covered] },
      }).select("email").lean();
      legacyCountMap[pid] = legacyUsers.length;

      // Backfill silently
      if (legacyUsers.length > 0) {
        const docs = legacyUsers.map(u => ({
          email:          u.email,
          pathId:         pathId,
          status:         "active",
          completedSteps: [],
          currentStep:    "",
        }));
        await UserPath.insertMany(docs, { ordered: false }).catch(() => {});
      }
    }

    // ── 3. This-week enrollments per path ────────────────────────────────
    const weekAgg = await UserPath.aggregate([
      {
        $match: {
          pathId:    { $in: pathIds },
          status:    "active",
          createdAt: { $gte: weekAgo() },
        },
      },
      {
        $group: {
          _id:   "$pathId",
          count: { $sum: 1 },
        },
      },
    ]);

    // ── 4. Completed-steps count per path ────────────────────────────────
    //    completedSteps is an array on each userPath doc; we sum lengths
    const stepsAgg = await UserPath.aggregate([
      {
        $match: {
          pathId: { $in: pathIds },
          status: "active",
        },
      },
      {
        $group: {
          _id:            "$pathId",
          totalCompleted: { $sum: { $size: { $ifNull: ["$completedSteps", []] } } },
        },
      },
    ]);

    // ── 5. Last-30-days total (for % change vs prev 30 days) ─────────────
    const thisMonthTotal = await UserPath.countDocuments({
      pathId:    { $in: pathIds },
      status:    "active",
      createdAt: { $gte: monthAgo() },
    });

    const { start: prevStart, end: prevEnd } = prevMonthRange();
    const prevMonthTotal = await UserPath.countDocuments({
      pathId:    { $in: pathIds },
      status:    "active",
      createdAt: { $gte: prevStart, $lt: prevEnd },
    });

    // ── 6. Grand totals ───────────────────────────────────────────────────
    const allTimeMap  = Object.fromEntries(allTimeAgg.map(x => [x._id.toString(), x.count]));

    // Merge legacy counts into allTimeMap
    for (const [pid, legacyCount] of Object.entries(legacyCountMap)) {
      allTimeMap[pid] = (allTimeMap[pid] || 0) + legacyCount;
    }
    const weekMap     = Object.fromEntries(weekAgg.map(x => [x._id.toString(), x.count]));
    const stepsMap    = Object.fromEntries(stepsAgg.map(x => [x._id.toString(), x.totalCompleted]));

    const totalSelected = allTimeAgg.reduce((s, x) => s + x.count, 0);
    const thisWeek      = weekAgg.reduce((s, x) => s + x.count, 0);

    // % change vs previous 30-day window (avoid divide-by-zero)
    const percentChange = prevMonthTotal === 0
      ? (thisMonthTotal > 0 ? 100 : 0)
      : Math.round(((thisMonthTotal - prevMonthTotal) / prevMonthTotal) * 100);

    // ── 7. Per-path completion rate ───────────────────────────────────────
    //    completion% = avg(completedSteps.length / total_steps * 100) across enrolled users
    const completionRateAgg = await UserPath.aggregate([
      {
        $match: {
          pathId: { $in: pathIds },
          status: "active",
        },
      },
      {
        $group: {
          _id:             "$pathId",
          avgCompleted:    { $avg: { $size: { $ifNull: ["$completedSteps", []] } } },
          enrolledCount:   { $sum: 1 },
        },
      },
    ]);
    const completionRateMap = Object.fromEntries(
      completionRateAgg.map(x => [x._id.toString(), { avgCompleted: x.avgCompleted, enrolled: x.enrolledCount }])
    );

    // ── 8. Build per-path response ────────────────────────────────────────
    const paths = partnerPaths.map(p => {
      const pid          = p._id.toString();
      const enrolled     = allTimeMap[pid]  || 0;
      const weekCount    = weekMap[pid]     || 0;
      const totalSteps   = p.total_steps    || p.the_ids?.length || 1;
      const cr           = completionRateMap[pid];
      const avgDone      = cr?.avgCompleted || 0;
      const completion   = Math.min(100, Math.round((avgDone / totalSteps) * 100));
      const stepsCompleted = stepsMap[pid] || 0;

      return {
        _id:             p._id,
        nameOfPath:      p.nameOfPath,
        category:        p.path_cat || "General",
        status:          "active",
        usersEnrolled:   enrolled,
        thisWeek:        weekCount,
        completion,
        steps:           totalSteps,
        stepsCompleted,
        microLessons:    totalSteps * 4,   // estimated: 4 micro-lessons per step
      };
    });

    // Sort by enrolled desc
    paths.sort((a, b) => b.usersEnrolled - a.usersEnrolled);

    return res.status(200).json({
      status: true,
      data: {
        totalSelected,
        thisWeek,
        percentChange,
        paths,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ status: false, message: "Internal server error", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET PATH ENROLLED USERS (for path detail page)
// GET /api/partner-dashboard/path-users?pathId=xxx&partnerEmail=partner@x.com
// ─────────────────────────────────────────────────────────────────────────────
const getPathEnrolledUsers = async (req, res) => {
  try {
    const { pathId, partnerEmail } = req.query;

    if (!pathId || !partnerEmail) {
      return res.status(400).json({ status: false, message: "pathId and partnerEmail are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({ status: false, message: "Invalid pathId" });
    }

    // Verify this path belongs to this partner
    const path = await pathModel.findOne({
      _id:    pathId,
      email:  partnerEmail,
      status: "active",
    }).lean();

    if (!path) {
      return res.status(404).json({ status: false, message: "Path not found or not owned by this partner" });
    }

    const UserPath = getUserPathModel();
    const User     = getUserModel();

    const pathObjectId = new mongoose.Types.ObjectId(pathId);
    const totalSteps   = path.total_steps || path.the_ids?.length || 1;

    // ── SOURCE 1: userPaths collection (new flow) ─────────────────────────
    const userPathDocs = await UserPath.find({
      pathId: pathObjectId,
      status: "active",
    }).lean();

    // ── SOURCE 2: naavi_users.selectedPath (old flow fallback) ───────────
    // Find users whose selectedPath matches this pathId but have NO userPaths doc
    const alreadyCoveredEmails = new Set(userPathDocs.map(u => u.email));

    const legacyUsers = await User.find({
      selectedPath: pathId.toString(),
    }).select("email name username profilePicture selectedPath createdAt").lean();

    // Filter to only legacy users NOT already in userPaths collection
    const legacyOnly = legacyUsers.filter(u => !alreadyCoveredEmails.has(u.email));

    // ── Backfill: create missing userPaths docs for legacy users ──────────
    // This silently fixes them so next call they appear via Source 1
    if (legacyOnly.length > 0) {
      const backfillDocs = legacyOnly.map(u => ({
        email:          u.email,
        pathId:         pathObjectId,
        status:         "active",
        completedSteps: [],
        currentStep:    "",
        createdAt:      u.createdAt || new Date(),
      }));
      await UserPath.insertMany(backfillDocs, { ordered: false }).catch(err =>
        console.warn("Backfill insertMany partial error (safe to ignore):", err.message)
      );
    }

    // ── Merge both sources ────────────────────────────────────────────────
    // Fetch user details for all emails
    const allEmails  = [
      ...userPathDocs.map(u => u.email),
      ...legacyOnly.map(u => u.email),
    ];
    const users   = await User.find({ email: { $in: allEmails } })
      .select("email name username profilePicture").lean();
    const userMap = Object.fromEntries(users.map(u => [u.email, u]));

    // Build unified list from userPaths docs
    const fromUserPaths = userPathDocs.map(up => {
      const u          = userMap[up.email] || {};
      const doneSteps  = up.completedSteps?.length || 0;
      const completion = Math.min(100, Math.round((doneSteps / totalSteps) * 100));
      const isCompleted = up.currentStep === "completed";
      return {
        email:          up.email,
        name:           u.name || u.username || up.email,
        profilePic:     u.profilePicture || null,
        enrolledAt:     up.createdAt,
        completedSteps: doneSteps,
        totalSteps,
        completion,
        currentStep:    up.currentStep || null,
        isCompleted,
        status: isCompleted ? "completed" : doneSteps > 0 ? "in-progress" : "not-started",
      };
    });

    // Build from legacy users (0 progress since no userPaths doc existed)
    const fromLegacy = legacyOnly.map(u => ({
      email:          u.email,
      name:           u.name || u.username || u.email,
      profilePic:     u.profilePicture || null,
      enrolledAt:     u.createdAt,
      completedSteps: 0,
      totalSteps,
      completion:     0,
      currentStep:    null,
      isCompleted:    false,
      status:         "not-started",
    }));

    const data = [...fromUserPaths, ...fromLegacy];

    if (!data.length) {
      return res.status(200).json({
        status: true,
        total:  0,
        data:   [],
        path: {
          _id:        path._id,
          nameOfPath: path.nameOfPath,
          totalSteps,
        },
      });
    }

    // Sort: highest completion first
    data.sort((a, b) => b.completion - a.completion);

    return res.status(200).json({
      status: true,
      total:  data.length,
      data,
      path: {
        _id:        path._id,
        nameOfPath: path.nameOfPath,
        totalSteps,
      },
    });
  } catch (err) {
    console.error("getPathEnrolledUsers error:", err);
    return res.status(500).json({ status: false, message: "Internal server error", error: err.message });
  }
};

module.exports = {
  getDashboardStats,
  getPathEnrolledUsers,
};