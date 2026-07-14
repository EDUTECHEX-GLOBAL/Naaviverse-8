const axios = require("axios");
const mongoose = require("mongoose");
const Feedback = require("../models/FeedbackModel");
const Path = require("../models/PathModel");
const Step = require("../models/StepsModel");

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
    } = req.body;

    if (!type || !studentEmail || !action) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: type, studentEmail, action",
      });
    }

    // ── MARKETPLACE FEEDBACK ─────────────────────────────────────────────────
    // Fields: student | path name | step context | item name (provider) | action
    if (type === "marketplace") {
      const payload = {
        student_email: studentEmail,
        path_id:       pathId   || "direct",
        path_name:     req.body.pathName || "Marketplace",             // PATHWAY column
        step_id:       0,
        step_title:    req.body.stepName || "Marketplace",             // MILESTONE STEP column (step context)
        provider_name: providerName || "Resource",                    // PROVIDER column (item name)
        provider_type: providerType || "vendor",                      // PROVIDER sub  (item category)
        action:        mapActionLabel(action, comment),
      };

      console.log(`[FeedbackSync] Marketplace feedback → agent:`, payload);

      try {
        await axios.post(`${AGENT_API_URL}/api/marketplace-feedback`, payload, { timeout: 10000 });
        return res.json({ status: true, message: "Marketplace feedback logged successfully" });
      } catch (err) {
        console.error("Error forwarding marketplace feedback to agent:", err.message);
        return res.status(500).json({ status: false, message: "Failed to forward to agent" });
      }
    }


    // ── STEP FEEDBACK ────────────────────────────────────────────────────────
    // Requires valid pathId + stepId for DB lookup
    if (!pathId || !stepId) {
      return res.status(400).json({
        status: false,
        message: "Step feedback requires pathId and stepId",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(pathId) || !mongoose.Types.ObjectId.isValid(stepId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid pathId or stepId format",
      });
    }

    // 1. Save local feedback record
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

    // 2. Fetch path and step details
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

    // 3. Build payloads for Agent
    const pathCreatorEmail = pathDoc.email || "agent@naaviverse.com";

    // Payload for /api/feedbacks (AI curation memory)
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

    // Payload for /api/marketplace-feedback (Student Clicks table)
    // MILESTONE STEP = step name | PROVIDER = which view (Macro View / Micro View / Nano View)
    const viewLabelReadable = `${(viewType || "macro").charAt(0).toUpperCase() + (viewType || "macro").slice(1)} View`;
    const stepName = stepDoc.name || `Step ${stepDoc.step_order || 1}`;

    const marketplacePayload = {
      student_email: studentEmail,
      path_id:       pathId.toString(),
      path_name:     pathDoc.nameOfPath || pathDoc.name || "AI Path",
      step_id:       typeof stepDoc.step_order === "number" ? stepDoc.step_order : 1,
      step_title:    stepName,          // MILESTONE STEP → actual step name
      provider_name: viewLabelReadable, // PROVIDER top   → "Macro View" / "Micro View" / "Nano View"
      provider_type: "step",            // PROVIDER sub   → "step"
      action:        mapActionLabel(action, comment),
    };

    console.log(`[FeedbackSync] Forwarding step feedback to Agent (feedbacks + marketplace-feedback)`);

    // 4. Forward to Agent
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
      message: "Feedback logged successfully",
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

module.exports = {
  createFeedback,
};
