const pathModel       = require("../models/PathModel");
const marketplaceModel = require("../models/MarketplaceModel");
const Approval        = require("../models/ApprovalModel");

/**
 * GET /api/dashboard/stats
 *
 * Replaces 6 separate API calls from the frontend with one
 * optimised aggregation query per collection.
 *
 * Response shape:
 * {
 *   paths:       { total, active, inactive, pending },
 *   marketplace: { total, institution, mentor, distributor, vendor },
 *   approvals:   { total, approved, pending, rejected }
 * }
 */
const getDashboardStats = async (req, res) => {
  try {

    // ── 1. PATHS ─────────────────────────────────────────────────────────────
    // Count active / inactive / waitingforapproval in one aggregation
    const pathAgg = await pathModel.aggregate([
      {
        $match: {
          status: { $in: ["active", "inactive", "waitingforapproval"] },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const pathMap = { active: 0, inactive: 0, waitingforapproval: 0 };
    pathAgg.forEach(({ _id, count }) => {
      if (_id in pathMap) pathMap[_id] = count;
    });

    const paths = {
      total:    pathMap.active + pathMap.inactive + pathMap.waitingforapproval,
      active:   pathMap.active,
      inactive: pathMap.inactive,
      pending:  pathMap.waitingforapproval,   // UI calls it "pending"
    };

    // ── 2. MARKETPLACE ────────────────────────────────────────────────────────
    // Group by role (case-insensitive) for active items only
    const marketAgg = await marketplaceModel.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: { $toLower: "$role" },   // normalise case
          count: { $sum: 1 },
        },
      },
    ]);

    const marketMap = { institution: 0, mentor: 0, distributor: 0, vendor: 0 };
    let marketTotal = 0;
    marketAgg.forEach(({ _id, count }) => {
      marketTotal += count;
      if (_id in marketMap) marketMap[_id] = count;
    });

    const marketplace = {
      total:       marketTotal,
      institution: marketMap.institution,
      mentor:      marketMap.mentor,
      distributor: marketMap.distributor,
      vendor:      marketMap.vendor,
    };

    // ── 3. APPROVALS ──────────────────────────────────────────────────────────
    // Single aggregation across both Partner + User roles
    const approvalAgg = await Approval.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const approvalMap = { pending: 0, approved: 0, rejected: 0 };
    let approvalTotal = 0;
    approvalAgg.forEach(({ _id, count }) => {
      approvalTotal += count;
      if (_id in approvalMap) approvalMap[_id] = count;
    });

    const approvals = {
      total:    approvalTotal,
      approved: approvalMap.approved,
      pending:  approvalMap.pending,
      rejected: approvalMap.rejected,
    };

    // ── RESPONSE ──────────────────────────────────────────────────────────────
    return res.json({
      status: true,
      data: { paths, marketplace, approvals },
    });

  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({
      status: false,
      message: "Error fetching dashboard stats",
    });
  }
};

module.exports = { getDashboardStats };
