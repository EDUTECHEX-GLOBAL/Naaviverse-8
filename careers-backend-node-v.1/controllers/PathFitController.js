const mongoose = require('mongoose');
const pathModel = require('../models/PathModel');
const stepModel = require('../models/StepsModel');
const userModel = require('../models/UsersModel');
const { assessPathFit, assessMultiplePaths } = require('../services/PathFitAssessmentService');

/**
 * GET /api/paths/fit-analysis/:pathId?email=...
 * Single path comprehensive fit analysis (used for View Path Modal / Detail view)
 */
const getSinglePathFit = async (req, res) => {
  try {
    const { pathId } = req.params;
    const email = req.query.email || req.body?.email;

    if (!pathId || !mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({ status: false, message: 'Invalid or missing path ID' });
    }

    const path = await pathModel.findById(pathId).lean();
    if (!path) {
      return res.status(404).json({ status: false, message: 'Path not found' });
    }

    // Fetch user profile if email provided
    let user = null;
    if (email) {
      user = await userModel.findOne({ email: String(email).trim().toLowerCase() }).lean();
    }

    // Fetch steps if path has step IDs
    let steps = [];
    const stepIds = (path.the_ids || []).map((s) => s.step_id).filter(Boolean);
    if (stepIds.length > 0) {
      steps = await stepModel
        .find({ _id: { $in: stepIds }, status: { $ne: 'delete' } })
        .sort({ step_order: 1 })
        .lean();
    }

    const fitAnalysis = assessPathFit(user, path, steps);

    return res.status(200).json({
      status: true,
      message: 'Path fit analysis evaluated successfully',
      data: fitAnalysis,
    });
  } catch (error) {
    console.error('Error evaluating single path fit:', error);
    return res.status(500).json({ status: false, message: 'Internal server error evaluating path fit' });
  }
};

/**
 * POST /api/paths/batch-fit-analysis
 * Batch assessment for Explore Paths card grid
 * Body: { email?: string, profile?: object, pathIds?: string[] }
 */
const getBatchPathFit = async (req, res) => {
  try {
    const { email, profile, pathIds } = req.body;

    let user = profile || null;
    if (!user && email) {
      user = await userModel.findOne({ email: String(email).trim().toLowerCase() }).lean();
    }

    let paths = [];
    if (Array.isArray(pathIds) && pathIds.length > 0) {
      const validIds = pathIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
      paths = await pathModel.find({ _id: { $in: validIds } }).lean();
    } else {
      // If no pathIds specified, assess active paths
      paths = await pathModel.find({ status: 'active' }).limit(100).lean();
    }

    const batchFitResults = assessMultiplePaths(user, paths);

    // Map by pathId for quick frontend lookup
    const resultMap = {};
    batchFitResults.forEach((r) => {
      resultMap[r.pathId] = r;
    });

    return res.status(200).json({
      status: true,
      message: 'Batch path fit evaluated successfully',
      data: resultMap,
      list: batchFitResults,
    });
  } catch (error) {
    console.error('Error evaluating batch path fit:', error);
    return res.status(500).json({ status: false, message: 'Internal server error evaluating batch fit' });
  }
};

module.exports = {
  getSinglePathFit,
  getBatchPathFit,
};
