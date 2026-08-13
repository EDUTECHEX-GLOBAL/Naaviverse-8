const axios = require("axios");
const mongoose = require("mongoose");
const Feedback = require("../models/FeedbackModel");
const Path = require("../models/PathModel");
const Step = require("../models/StepsModel");
const Partner = require("../models/PartnerModel");
const User = require("../models/UsersModel");
const { trackMarketplaceEvent } = require("../services/MarketplaceRankingService");

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8001";

/**
 * Maps internal action keys to human-readable labels for the Agent UI
 */
const mapActionLabel = (action, comment) => {
  if (comment) return `comment: ${comment}`;
  const labels = {
    helpful:     "Helpful",
    notRelevant: "Not relevant",
    comment:     "Comment",
    skip:        "Skip",
  };
  return labels[action] || action;
};

/**
 * Handles recording student feedback locally and forwarding it to the Naav Agent.
 */
const createFeedback = async (req, res) => {
  try {
    const {
      type,
      studentEmail,
      pathId,
      stepId,
      viewType,
      providerName,
      providerType,
      action,
      comment,
      marketplaceItemId,
      service_id,
    } = req.body;

    if (!type || !studentEmail || !action) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: type, studentEmail, action",
      });
    }

    const isValidPathId = pathId && mongoose.Types.ObjectId.isValid(pathId);
    const isValidStepId = stepId && mongoose.Types.ObjectId.isValid(stepId);

    // Fetch path and step details
    let pathDoc = null;
    let stepDoc = null;
    let isPartner = false;
    let pathSource = "AI";
    let ownerId = "path_engine_admin";

    if (isValidPathId) {
      pathDoc = await Path.findById(pathId).lean();
      if (pathDoc) {
        const creatorEmail = (pathDoc.email || "").toLowerCase().trim();
        if (creatorEmail && creatorEmail !== "pathengine.admin@gmail.com") {
          isPartner = true;
          pathSource = "PARTNER";
          ownerId = creatorEmail;
        }
      }
    }

    if (isValidStepId) {
      stepDoc = await Step.findById(stepId).lean();
    }

    // ── MARKETPLACE FEEDBACK ─────────────────────────────────────────────────
    if (type === "marketplace") {
      const analyticsServiceId = marketplaceItemId || service_id;
      let mktOwnerId = (req.body.partner_email || req.body.providerEmail || ownerId || "").toLowerCase().trim();

      if (analyticsServiceId && mongoose.Types.ObjectId.isValid(analyticsServiceId)) {
        const MarketplaceItem = require("../models/MarketplaceModel");
        const mktItem = await MarketplaceItem.findById(analyticsServiceId).select("partner_email name").lean();
        if (mktItem?.partner_email) {
          mktOwnerId = mktItem.partner_email.toLowerCase().trim();
        }
      }

      if (mktOwnerId && mktOwnerId !== "path_engine_admin") {
        isPartner = true;
        pathSource = "PARTNER";
      }

      const payload = {
        student_email: studentEmail,
        path_id:       pathId   || "direct",
        path_name:     req.body.pathName || "Marketplace",
        step_id:       0,
        step_title:    req.body.stepName || "Marketplace",
        provider_name: providerName || "Resource",
        provider_type: providerType || "vendor",
        action:        mapActionLabel(action, comment),
      };

      console.log(`[FeedbackSync] Marketplace feedback [source=${pathSource}, owner=${mktOwnerId}] → agent:`, payload);

      // Save locally so marketplace feedback appears on partner dashboard
      let localFeedback = new Feedback({
        studentEmail,
        type: "marketplace",
        pathId: isValidPathId ? new mongoose.Types.ObjectId(pathId) : null,
        stepId: isValidStepId ? new mongoose.Types.ObjectId(stepId) : null,
        viewType: viewType || null,
        providerName: providerName || "",
        providerType: providerType || "",
        action,
        comment: comment || "",
        path_source: pathSource,
        owner_id: mktOwnerId,
        status: "pending",
      });
      await localFeedback.save();

      if (analyticsServiceId && action !== "skip") {
        const analyticsAction = comment ? "comment" : action;
        const ratingMap = { helpful: 5, comment: 4, notRelevant: 1 };
        const calculatedRating = ratingMap[analyticsAction] || null;
        trackMarketplaceEvent({
          serviceId: analyticsServiceId,
          action: analyticsAction,
          rating: calculatedRating,
        }).catch(err => console.error("Marketplace feedback analytics error:", err.message));
      }

      // Forward to Agent asynchronously without blocking local saving
      if (!isPartner) {
        axios.post(`${AGENT_API_URL}/api/marketplace-feedback`, payload, { timeout: 3000 })
          .then(() => {
            if (localFeedback) {
              localFeedback.status = "synced";
              localFeedback.save().catch(() => {});
            }
          })
          .catch(err => {
            console.warn("Agent async sync notice:", err.message);
          });
      } else {
        localFeedback.status = "synced";
        await localFeedback.save();
      }

      return res.json({ status: true, message: "Marketplace feedback logged successfully", data: localFeedback });
    }

    // ── STEP FEEDBACK ────────────────────────────────────────────────────────
    if (!pathId || !stepId) {
      return res.status(400).json({
        status: false,
        message: "Step feedback requires pathId and stepId",
      });
    }

    if (!isValidPathId || !isValidStepId) {
      return res.status(400).json({
        status: false,
        message: "Invalid pathId or stepId format",
      });
    }

    if (!pathDoc) {
      return res.status(404).json({ status: false, message: "Path not found" });
    }

    if (!stepDoc) {
      return res.status(404).json({ status: false, message: "Step not found" });
    }

    // Save local feedback record
    const feedback = new Feedback({
      studentEmail,
      type,
      pathId: new mongoose.Types.ObjectId(pathId),
      stepId: new mongoose.Types.ObjectId(stepId),
      viewType: viewType || null,
      providerName: providerName || "",
      providerType: providerType || "",
      action,
      comment: comment || "",
      path_source: pathSource,
      owner_id: ownerId,
      status: "pending",
    });
    await feedback.save();

    // If it's a partner path, we do not sync it to the HuggingFace AI agent
    if (isPartner) {
      feedback.status = "synced";
      await feedback.save();
      return res.json({
        status: true,
        message: "Feedback logged successfully for partner",
        data: { id: feedback._id, syncStatus: feedback.status },
      });
    }

    // AI path sync to Agent
    const pathCreatorEmail = pathDoc.email || "agent@naaviverse.com";

    const feedbacksPayload = {
      admin_email: pathCreatorEmail,
      target_goal: pathDoc.nameOfPath || pathDoc.name || "AI Path",
      student_profile: {
        email: studentEmail,
        view_type: viewType || "macro",
        step_title: stepDoc.name || `Step ${stepDoc.step_order || 1}`,
      },
      feedback_text: comment
        ? `[${(viewType || "macro").toUpperCase()} VIEW] ${action.toUpperCase()}: ${comment}`
        : `[${(viewType || "macro").toUpperCase()} VIEW] ${action.toUpperCase()}`,
      category: "step_feedback",
      path_id: pathId.toString(),
    };

    const viewLabelReadable = `${(viewType || "macro").charAt(0).toUpperCase() + (viewType || "macro").slice(1)} View`;
    const stepName = stepDoc.name || `Step ${stepDoc.step_order || 1}`;

    const marketplacePayload = {
      student_email: studentEmail,
      path_id:       pathId.toString(),
      path_name:     pathDoc.nameOfPath || pathDoc.name || "AI Path",
      step_id:       typeof stepDoc.step_order === "number" ? stepDoc.step_order : 1,
      step_title:    stepName,
      provider_name: viewLabelReadable,
      provider_type: "step",
      action:        mapActionLabel(action, comment),
    };

    console.log(`[FeedbackSync] Forwarding step feedback to Agent (feedbacks + marketplace-feedback)`);

    try {
      await Promise.all([
        axios.post(`${AGENT_API_URL}/api/feedbacks`, feedbacksPayload, { timeout: 10000 }),
        axios.post(`${AGENT_API_URL}/api/marketplace-feedback`, marketplacePayload, { timeout: 10000 }),
      ]);
      feedback.status = "synced";
      await feedback.save();
    } catch (err) {
      console.error("Error forwarding step feedback to agent:", err.message);
      feedback.status = "failed";
      await feedback.save();
    }

    return res.json({
      status: true,
      message: "Feedback logged and synced successfully",
      data: { id: feedback._id, syncStatus: feedback.status },
    });

  } catch (err) {
    console.error("createFeedback error:", err);
    return res.status(500).json({
      status: false,
      message: "Error processing student feedback",
      error: err.message,
    });
  }
};

const getFeedbackForPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pathId)) {
      return res.status(400).json({ status: false, message: "Invalid pathId format" });
    }
    const feedbacks = await Feedback.find({ pathId }).sort({ createdAt: -1 }).lean();
    return res.json({ status: true, data: feedbacks });
  } catch (err) {
    console.error("getFeedbackForPath error:", err);
    return res.status(500).json({ status: false, message: "Error fetching feedback", error: err.message });
  }
};

const getPartnerFeedbacks = async (req, res) => {
  try {
    const email = req.query.email || req.query.partnerEmail;
    if (!email) {
      return res.status(400).json({ status: false, message: "Email query param is required" });
    }

    const emailRegex = new RegExp(`^${email.trim()}$`, "i");
    const feedbacks = await Feedback.find({
      owner_id: emailRegex
    }).sort({ createdAt: -1 }).lean();

    const populatedFeedbacks = await Promise.all(feedbacks.map(async (fb) => {
      const pathDoc = fb.pathId ? await Path.findById(fb.pathId).select("nameOfPath name").lean() : null;
      const stepDoc = fb.stepId ? await Step.findById(fb.stepId).select("name step_order").lean() : null;
      const userDoc = await User.findOne({ email: fb.studentEmail?.toLowerCase() }).select("name username phoneNumber country").lean();
      return {
        ...fb,
        pathName: fb.providerName || pathDoc?.nameOfPath || pathDoc?.name || "Marketplace Resource",
        stepName: stepDoc?.name || (fb.providerName ? "Marketplace Resource" : `Step ${stepDoc?.step_order || 1}`),
        studentName: userDoc?.name || userDoc?.username || "Student",
        studentPhone: userDoc?.phoneNumber || "",
        studentCountry: userDoc?.country || ""
      };
    }));

    return res.json({ status: true, data: populatedFeedbacks });
  } catch (err) {
    console.error("getPartnerFeedbacks error:", err);
    return res.status(500).json({ status: false, message: "Error fetching partner feedback", error: err.message });
  }
};

const getPathEngineFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      path_source: "AI"
    }).sort({ createdAt: -1 }).lean();

    const populatedFeedbacks = await Promise.all(feedbacks.map(async (fb) => {
      const pathDoc = await Path.findById(fb.pathId).select("nameOfPath name").lean();
      const stepDoc = await Step.findById(fb.stepId).select("name step_order").lean();
      const userDoc = await User.findOne({ email: fb.studentEmail?.toLowerCase() }).select("name username phoneNumber country").lean();
      return {
        ...fb,
        pathName: pathDoc?.nameOfPath || pathDoc?.name || "AI Path",
        stepName: stepDoc?.name || `Step ${stepDoc?.step_order || 1}`,
        studentName: userDoc?.name || userDoc?.username || "Student",
        studentPhone: userDoc?.phoneNumber || "",
        studentCountry: userDoc?.country || ""
      };
    }));

    return res.json({ status: true, data: populatedFeedbacks });
  } catch (err) {
    console.error("getPathEngineFeedbacks error:", err);
    return res.status(500).json({ status: false, message: "Error fetching AI feedback", error: err.message });
  }
};

const getAdminFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 }).lean();

    const populatedFeedbacks = await Promise.all(feedbacks.map(async (fb) => {
      const pathDoc = await Path.findById(fb.pathId).select("nameOfPath name email").lean();
      const stepDoc = await Step.findById(fb.stepId).select("name step_order").lean();
      const userDoc = await User.findOne({ email: fb.studentEmail?.toLowerCase() }).select("name username phoneNumber country").lean();
      return {
        ...fb,
        pathName: pathDoc?.nameOfPath || pathDoc?.name || "Path",
        stepName: stepDoc?.name || `Step ${stepDoc?.step_order || 1}`,
        pathCreatorEmail: pathDoc?.email || "",
        studentName: userDoc?.name || userDoc?.username || "Student",
        studentPhone: userDoc?.phoneNumber || "",
        studentCountry: userDoc?.country || ""
      };
    }));

    return res.json({ status: true, data: populatedFeedbacks });
  } catch (err) {
    console.error("getAdminFeedbacks error:", err);
    return res.status(500).json({ status: false, message: "Error fetching admin feedback", error: err.message });
  }
};

module.exports = {
  createFeedback,
  getFeedbackForPath,
  getPartnerFeedbacks,
  getPathEngineFeedbacks,
  getAdminFeedbacks,
};
