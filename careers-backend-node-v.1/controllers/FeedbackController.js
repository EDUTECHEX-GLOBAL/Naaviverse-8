const axios = require("axios");
const mongoose = require("mongoose");
const Feedback = require("../models/FeedbackModel");
const Path = require("../models/PathModel");
const Step = require("../models/StepsModel");

const AGENT_API_URL = process.env.AGENT_API_URL || "https://naaviverse-naaviverse-path.hf.space";

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
    } = req.body;

    if (!type || !studentEmail || !pathId || !stepId || !action) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: type, studentEmail, pathId, stepId, action",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pathId) || !mongoose.Types.ObjectId.isValid(stepId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid pathId or stepId format",
      });
    }

    // 1. Create a pending local feedback document
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
      status: "pending",
    });
    await feedback.save();

    // 2. Fetch references to resolve details for payload
    const pathDoc = await Path.findById(feedback.pathId).lean();
    const stepDoc = await Step.findById(feedback.stepId).lean();

    if (!pathDoc) {
      feedback.status = "failed";
      await feedback.save();
      return res.status(404).json({ status: false, message: "Path not found" });
    }

    if (!stepDoc) {
      feedback.status = "failed";
      await feedback.save();
      return res.status(404).json({ status: false, message: "Step not found" });
    }

    // 3. Forward to Naav Agent depending on the feedback type
    if (type === "marketplace") {
      const payload = {
        student_email: studentEmail,
        path_id: pathId.toString(),
        path_name: pathDoc.nameOfPath || pathDoc.name || "AI Path",
        step_id: typeof stepDoc.step_order === "number" ? stepDoc.step_order : 1,
        step_title: stepDoc.name || `Step ${stepDoc.step_order || 1}`,
        provider_name: providerName || "Resource",
        provider_type: providerType || "vendor",
        action: comment ? `comment: ${comment}` : action,
      };

      console.log(`[FeedbackSync] Forwarding marketplace feedback to agent:`, payload);

      try {
        await axios.post(`${AGENT_API_URL}/api/marketplace-feedback`, payload, { timeout: 10000 });
        feedback.status = "synced";
        await feedback.save();
      } catch (err) {
        console.error("Error forwarding marketplace feedback to Naav Agent:", err.message);
        feedback.status = "failed";
        await feedback.save();
      }
    } else if (type === "step") {
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

      const marketplacePayload = {
        student_email: studentEmail,
        path_id: pathId.toString(),
        path_name: pathDoc.nameOfPath || pathDoc.name || "AI Path",
        step_id: typeof stepDoc.step_order === "number" ? stepDoc.step_order : 1,
        step_title: stepDoc.name || `Step ${stepDoc.step_order || 1}`,
        provider_name: `Step View: ${viewType || "macro"}`,
        provider_type: "step",
        action: comment ? `comment: ${comment}` : action,
      };

      console.log(`[FeedbackSync] Forwarding step feedback to both feedbacks & marketplace agent endpoints`);

      try {
        await Promise.all([
          axios.post(`${AGENT_API_URL}/api/feedbacks`, feedbacksPayload, { timeout: 10000 }),
          axios.post(`${AGENT_API_URL}/api/marketplace-feedback`, marketplacePayload, { timeout: 10000 })
        ]);
        feedback.status = "synced";
        await feedback.save();
      } catch (err) {
        console.error("Error forwarding step feedback to agent endpoints:", err.message);
        feedback.status = "failed";
        await feedback.save();
      }
    }

    return res.json({
      status: true,
      message: "Feedback logged successfully",
      data: {
        id: feedback._id,
        syncStatus: feedback.status,
      },
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

module.exports = {
  createFeedback,
};
