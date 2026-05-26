// controllers/partnerActivity.controller.js
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/partner/activity?email=xxx
// Returns: pathsAdded, listings (marketplace), activeDeals (users on partner's paths)
// ─────────────────────────────────────────────────────────────────────────────

const Path        = require("../models/PathModel");
const Marketplace = require("../models/MarketPlaceModel");
const UserPath    = require("../models/UserPathsModel");
const User        = require("../models/UsersModel");

const getPartnerActivity = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ status: false, message: "email is required" });
    }

    // ── 1. Paths Added ────────────────────────────────────────────────────
    // All paths created by this partner (excluding hard-deleted)
    const paths = await Path.find({
      email,
      status: { $ne: "delete" },
    })
      .select("_id nameOfPath status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const pathsAdded = paths.map((p) => {
      const label     = p.nameOfPath || "Unnamed Path";
      const statusTag = p.status !== "active" ? ` (${p.status})` : "";
      return `${label}${statusTag}`;
    });

    // ── 2. Marketplace Listings ───────────────────────────────────────────
    // All active marketplace items created by this partner
    const marketplaceItems = await Marketplace.find({
      partner_email: email,
      status: "active",
    })
      .select("name layer access createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const listings = marketplaceItems.map((m) => {
      const name   = m.name   || "Unnamed Item";
      const layer  = m.layer  ? ` · ${m.layer}`  : "";
      const access = m.access ? ` (${m.access})` : "";
      return `${name}${layer}${access}`;
    });

    // ── 3. Active Deals ───────────────────────────────────────────────────
    // Users who are actively enrolled in this partner's paths
    let activeDeals = [];

    if (paths.length > 0) {
      const partnerPathIds = paths
        .filter((p) => p.status === "active")  // only live paths
        .map((p) => p._id);

      if (partnerPathIds.length > 0) {
        // Find all active userPath enrollments on partner's paths
        const enrollments = await UserPath.find({
          pathId: { $in: partnerPathIds },
          status: "active",
        })
          .select("email pathId")
          .lean();

        if (enrollments.length > 0) {
          // Get unique user emails
          const uniqueEmails = [...new Set(enrollments.map((e) => e.email))];

          // Fetch user names
          const users = await User.find({ email: { $in: uniqueEmails } })
            .select("email name username")
            .lean();

          const userMap = {};
          for (const u of users) {
            userMap[u.email] = u.name || u.username || u.email;
          }

          // Build path name map for quick lookup
          const pathNameMap = {};
          for (const p of paths) {
            pathNameMap[p._id.toString()] = p.nameOfPath || "Unnamed Path";
          }

          // Format: "Username on PathName"
          activeDeals = enrollments.map((e) => {
            const userName = userMap[e.email] || e.email;
            const pathName = pathNameMap[e.pathId?.toString()] || "a Path";
            return `${userName} on "${pathName}"`;
          });
        }
      }
    }

    // ── 4. Last Seen ──────────────────────────────────────────────────────
    // Most recently created path as proxy for last activity
    const lastActivity = paths[0];
    const lastSeen = lastActivity
      ? new Date(lastActivity.createdAt).toLocaleDateString("en-IN", {
          day:   "numeric",
          month: "short",
          year:  "numeric",
        })
      : "Recently";

    return res.status(200).json({
      status: true,
      data: {
        lastSeen,
        pathsAdded,
        listings,
        activeDeals,
      },
    });
  } catch (error) {
    console.error("getPartnerActivity error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = { getPartnerActivity };