const mongoose = require("mongoose");
const MarketplaceReplacement = require("../models/MarketplaceReplacementModel");
const MarketplaceAssistance = require("../models/MarketplaceAssistanceModel");
const MarketplaceAssistanceMessage = require("../models/MarketplaceAssistanceMessageModel");
const MarketplaceItem = require("../models/MarketplaceModel");
const { getRankedMarketplaceItems } = require("../services/MarketplaceRankingService");

function buildIdQuery(requestId) {
  if (!requestId) return { _id: null };
  const queries = [{ ticketId: String(requestId) }];
  if (mongoose.Types.ObjectId.isValid(requestId)) {
    queries.push({ _id: requestId });
  }
  return { $or: queries };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/marketplace/replacement
// ─────────────────────────────────────────────────────────────────────────────
const submitReplacement = async (req, res) => {
  try {
    const {
      userEmail,
      userId,
      userName,
      stepId,
      stepName,
      pathId,
      pathName,
      rejectedItemId,
      reasons = [],
      message = "",
      availableItems = [],
    } = req.body;

    if (!userEmail || !stepId || !rejectedItemId) {
      return res.status(400).json({
        status: false,
        message: "userEmail, stepId, and rejectedItemId are required",
      });
    }

    // Resolve pathName and stepName if missing (especially for manual/custom paths)
    let resolvedPathName = pathName || "";
    let resolvedStepName = stepName || "";

    if (!resolvedPathName && pathId) {
      try {
        const idObj = mongoose.Types.ObjectId.isValid(pathId) ? new mongoose.Types.ObjectId(pathId) : pathId;
        const p =
          (await mongoose.connection.db.collection("paths").findOne({ _id: idObj })) ||
          (await mongoose.connection.db.collection("userpaths").findOne({ _id: idObj }));
        resolvedPathName = p?.title || p?.name || p?.pathName || "";
      } catch (e) {}
    }

    if (!resolvedStepName && stepId) {
      try {
        const idObj = mongoose.Types.ObjectId.isValid(stepId) ? new mongoose.Types.ObjectId(stepId) : stepId;
        const s =
          (await mongoose.connection.db.collection("steps").findOne({ _id: idObj })) ||
          (await mongoose.connection.db.collection("career_steps").findOne({ _id: idObj })) ||
          (await mongoose.connection.db.collection("educationsteps").findOne({ _id: idObj }));
        resolvedStepName = s?.title || s?.name || s?.step_name || "";
      } catch (e) {}
    }

    // Find or initialize existing replacement record for this user & step
    let record = await MarketplaceReplacement.findOne({
      userEmail,
      stepId,
      status: { $in: ["replacement_active", "admin_requested", "max_replacements_reached"] },
    });

    let currentCount = record ? record.replacementCount : 0;
    let nextCount = Math.min(3, currentCount + 1);

    const rejectedItemDoc = await MarketplaceItem.findById(rejectedItemId).lean();
    const rejectedItemName = rejectedItemDoc?.name || "Marketplace Service";

    const prevRecommendations = record ? record.previousRecommendations : [];
    const alreadyRejectedIds = prevRecommendations.map((p) => String(p.marketplaceItemId));
    const allRejectedIds = Array.from(new Set([...alreadyRejectedIds, String(rejectedItemId)]));

    // Fetch available active items for the step/path
    let candidates = [];
    if (stepId && stepId.length === 24) {
      candidates = await getRankedMarketplaceItems(
        { step_id: stepId, status: "active" },
        { searchQuery: message, pathId, stepId }
      );
    }

    // Fallback to provided available items if database query yielded few
    if (candidates.length <= allRejectedIds.length && Array.isArray(availableItems) && availableItems.length > 0) {
      candidates = availableItems;
    }

    // Exclude previously rejected items
    const pool = candidates.filter((item) => !allRejectedIds.includes(String(item._id || item.id)));

    // Apply smart feedback scoring signals
    const scoredPool = pool.map((item) => {
      let score = Number(item.naavi_score || item.marketplace_score || 80);
      const isFree = !item.cost || String(item.cost).toLowerCase() === "0" || String(item.cost).toLowerCase() === "free";
      const cost = parseInt(String(item.cost || 0).replace(/\D/g, ""), 10) || 0;

      if (reasons.includes("too_expensive")) {
        if (isFree) score += 35;
        else if (cost <= 10000) score += 20;
        else score -= 30;
      }

      if (reasons.includes("offline_preferred")) {
        if (item.category === "institution" || item.role === "INSTITUTE") score += 25;
      }

      if (reasons.includes("online_preferred")) {
        if (item.category === "course" || item.category === "vendor") score += 25;
      }

      if (reasons.includes("rating_not_suitable")) {
        const rating = Number(item.average_rating || 4.0);
        if (rating >= 4.5) score += 20;
      }

      return { item, score };
    });

    scoredPool.sort((a, b) => b.score - a.score);
    const replacement = scoredPool[0]?.item || pool[0] || null;

    // Generate transparency tags
    const whyRecommended = [];
    if (reasons.includes("too_expensive")) {
      const isFree = !replacement?.cost || String(replacement?.cost).toLowerCase() === "0";
      whyRecommended.push(isFree ? "✓ 100% Free resource" : "✓ Significantly lower budget");
    }
    if (reasons.includes("offline_preferred")) {
      whyRecommended.push("✓ Fits offline / in-person format");
    }
    if (reasons.includes("online_preferred")) {
      whyRecommended.push("✓ 100% Online flexible access");
    }
    if (reasons.includes("rating_not_suitable") || reasons.includes("wrong_level")) {
      whyRecommended.push("✓ Top-rated alternative with verified outcomes");
    }
    if (whyRecommended.length === 0) {
      whyRecommended.push("✓ High relevance score for your current step");
    }

    const updatedHistory = [
      ...prevRecommendations,
      {
        marketplaceItemId: String(rejectedItemId),
        itemName: rejectedItemName,
        replacementNumber: nextCount,
        timestamp: new Date(),
      },
    ];

    const nextStatus = nextCount >= 3 ? "max_replacements_reached" : "replacement_active";

    if (!record) {
      record = await MarketplaceReplacement.create({
        userId: userId || userEmail,
        userEmail,
        userName: userName || "Student",
        pathId,
        pathName: resolvedPathName || "Manual Learning Path",
        stepId,
        stepName: resolvedStepName || "Learning Step",
        originalMarketplaceItemId: String(rejectedItemId),
        originalItemName: rejectedItemName,
        replacementCount: nextCount,
        feedback: { reasons, message },
        previousRecommendations: updatedHistory,
        whyRecommended,
        status: nextStatus,
      });
    } else {
      record.replacementCount = nextCount;
      if (userName) record.userName = userName;
      if (resolvedPathName) record.pathName = resolvedPathName;
      if (resolvedStepName) record.stepName = resolvedStepName;
      if (rejectedItemName) record.originalItemName = rejectedItemName;
      record.feedback = { reasons, message };
      record.previousRecommendations = updatedHistory;
      record.whyRecommended = whyRecommended;
      record.status = nextStatus;
      await record.save();
    }

    return res.json({
      status: true,
      replacementCount: nextCount,
      replacementItem: replacement,
      whyRecommended,
      record,
    });
  } catch (error) {
    console.error("submitReplacement error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marketplace/replacement/:stepId
// ─────────────────────────────────────────────────────────────────────────────
const getReplacementHistory = async (req, res) => {
  try {
    const { stepId } = req.params;
    const { email } = req.query;

    const record = await MarketplaceReplacement.findOne({
      userEmail: email,
      stepId,
    }).sort({ updatedAt: -1 });

    res.json({ status: true, data: record || null });
  } catch (error) {
    console.error("getReplacementHistory error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/marketplace/assistance (Create ticket)
// ─────────────────────────────────────────────────────────────────────────────
const createAssistanceRequest = async (req, res) => {
  try {
    const {
      userEmail,
      userId,
      userName,
      pathId,
      pathName,
      stepId,
      stepName,
      originalMarketplaceItemId,
      originalItemName,
      reasons = [],
      message = "",
      previousRecommendations = [],
    } = req.body;

    const ticketId = `ast-${Date.now()}`;

    const request = await MarketplaceAssistance.create({
      ticketId,
      userId: userId || userEmail,
      userEmail,
      userName: userName || "Student",
      pathId,
      pathName,
      stepId,
      stepName,
      originalMarketplaceItemId,
      originalItemName,
      replacementCount: 3,
      userRequirement: { reasons, message },
      previousRecommendations,
      status: "pending",
    });

    // Create initial user message in the thread
    if (message && message.trim()) {
      await MarketplaceAssistanceMessage.create({
        requestId: ticketId,
        senderId: userId || userEmail,
        senderRole: "USER",
        senderName: userName || "Student",
        message: message.trim(),
      });
    }

    // Update replacement record status to admin_requested
    await MarketplaceReplacement.findOneAndUpdate(
      { userEmail, stepId },
      { status: "admin_requested" }
    ).catch(() => {});

    res.json({ status: true, request });
  } catch (error) {
    console.error("createAssistanceRequest error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marketplace/assistance/user
// ─────────────────────────────────────────────────────────────────────────────
const getUserAssistanceRequests = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email || email === "undefined" || email === "null") {
      return res.json({ status: true, requests: [] });
    }

    const emailRegex = new RegExp(`^${email.trim()}$`, "i");

    // 1. Fetch assistance requests (escalations)
    const assistanceRequests = await MarketplaceAssistance.find({
      userEmail: emailRegex,
    }).sort({ updatedAt: -1 }).lean();

    const formattedAssistance = assistanceRequests.map((r) => ({
      id: r.ticketId || String(r._id),
      ticketId: r.ticketId,
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName || "Student",
      pathId: r.pathId,
      pathName: r.pathName || "Learning Path",
      stepId: r.stepId,
      stepName: r.stepName || "Learning Step",
      originalMarketplaceItemId: r.originalMarketplaceItemId,
      originalItemName: r.originalItemName,
      replacementCount: r.replacementCount || 3,
      userRequirement: r.userRequirement || { reasons: [], message: "" },
      previousRecommendations: r.previousRecommendations || [],
      status: r.status,
      assignedAdminId: r.assignedAdminId,
      recommendedService: r.recommendedService || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isEscalated: true,
    }));

    // Step+Email set to prevent duplicates if escalated
    const escalatedKeys = new Set(
      assistanceRequests.map((r) => `${r.userEmail?.toLowerCase()}_${r.stepId}`)
    );

    // 2. Fetch replacement requests (from "Find a Better Match" - manual paths & standard paths)
    const replacementRequests = await MarketplaceReplacement.find({
      userEmail: emailRegex,
    }).sort({ updatedAt: -1 }).lean();

    const formattedReplacements = [];
    for (const r of replacementRequests) {
      const key = `${r.userEmail?.toLowerCase()}_${r.stepId}`;
      if (escalatedKeys.has(key)) {
        continue;
      }

      let pName = r.pathName;
      let sName = r.stepName;

      if (!pName && r.pathId) {
        try {
          const idObj = mongoose.Types.ObjectId.isValid(r.pathId) ? new mongoose.Types.ObjectId(r.pathId) : r.pathId;
          const p =
            (await mongoose.connection.db.collection("paths").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("userpaths").findOne({ _id: idObj }));
          pName = p?.title || p?.name || p?.pathName || "";
        } catch (e) {}
      }

      if (!sName && r.stepId) {
        try {
          const idObj = mongoose.Types.ObjectId.isValid(r.stepId) ? new mongoose.Types.ObjectId(r.stepId) : r.stepId;
          const s =
            (await mongoose.connection.db.collection("steps").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("career_steps").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("educationsteps").findOne({ _id: idObj }));
          sName = s?.title || s?.name || s?.step_name || "";
        } catch (e) {}
      }

      let mappedStatus = "pending";
      if (r.status === "resolved") mappedStatus = "resolved";
      else if (r.status === "closed") mappedStatus = "closed";
      else if (r.status === "reviewing") mappedStatus = "reviewing";
      else if (r.status === "replacement_active" || r.status === "admin_requested") mappedStatus = "pending";

      const repId = `Rep-${String(r._id).slice(-12).toUpperCase()}`;

      formattedReplacements.push({
        id: `rep-${r._id}`,
        ticketId: repId,
        userId: r.userId || r.userEmail,
        userEmail: r.userEmail,
        userName: r.userName || (r.userEmail ? r.userEmail.split("@")[0] : "Student"),
        pathId: r.pathId,
        pathName: pName || "Manual Learning Path",
        stepId: r.stepId,
        stepName: sName || "Learning Step",
        originalMarketplaceItemId: r.originalMarketplaceItemId,
        originalItemName: r.originalItemName || r.previousRecommendations?.[0]?.itemName || "Marketplace Recommendation",
        replacementCount: r.replacementCount || 1,
        userRequirement: {
          reasons: r.feedback?.reasons || [],
          message:
            r.feedback?.message ||
            (r.feedback?.reasons?.length
              ? `Student requested replacement: ${r.feedback.reasons.join(", ")}`
              : "Replacement requested by student."),
        },
        previousRecommendations: (r.previousRecommendations || []).map((x) => x.itemId || x),
        status: mappedStatus,
        assignedAdminId: null,
        recommendedService: null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        isEscalated: false,
      });
    }

    const combined = [...formattedAssistance, ...formattedReplacements].sort(
      (a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );

    res.json({ status: true, requests: combined });
  } catch (error) {
    console.error("getUserAssistanceRequests error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/marketplace/assistance (Super Admin List - All Requests & Escalations)
// ─────────────────────────────────────────────────────────────────────────────
const getAllAssistanceRequests = async (req, res) => {
  try {
    const { status, search } = req.query;

    // 1. Fetch assistance requests (escalations)
    const assistanceFilter = {};
    if (status && status !== "all") assistanceFilter.status = status;

    const assistanceRequests = await MarketplaceAssistance.find(assistanceFilter).sort({ updatedAt: -1 }).lean();

    const formattedAssistance = assistanceRequests.map((r) => ({
      id: r.ticketId || String(r._id),
      ticketId: r.ticketId,
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName || "Student",
      pathId: r.pathId,
      pathName: r.pathName || "Learning Path",
      stepId: r.stepId,
      stepName: r.stepName || "Learning Step",
      originalMarketplaceItemId: r.originalMarketplaceItemId,
      originalItemName: r.originalItemName,
      replacementCount: r.replacementCount || 3,
      userRequirement: r.userRequirement || { reasons: [], message: "" },
      previousRecommendations: r.previousRecommendations || [],
      status: r.status,
      assignedAdminId: r.assignedAdminId,
      recommendedService: r.recommendedService || null,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isEscalated: true,
    }));

    // Step+Email set for escalated tickets to prevent duplicate row
    const escalatedKeys = new Set(
      assistanceRequests.map((r) => `${r.userEmail?.toLowerCase()}_${r.stepId}`)
    );

    // 2. Fetch replacement requests (from "Find a Better Match" - manual paths & standard paths)
    const repFilter = {};
    if (status && status !== "all") {
      if (status === "pending" || status === "reviewing") {
        repFilter.status = { $in: ["replacement_active", "admin_requested", "max_replacements_reached", status] };
      } else {
        repFilter.status = status;
      }
    }

    const replacementRequests = await MarketplaceReplacement.find(repFilter).sort({ updatedAt: -1 }).lean();

    const formattedReplacements = [];
    for (const r of replacementRequests) {
      const key = `${r.userEmail?.toLowerCase()}_${r.stepId}`;
      if (escalatedKeys.has(key)) {
        // Skip duplicate if an assistance request ticket already handles this user & step
        continue;
      }

      let pName = r.pathName;
      let sName = r.stepName;

      if (!pName && r.pathId) {
        try {
          const idObj = mongoose.Types.ObjectId.isValid(r.pathId) ? new mongoose.Types.ObjectId(r.pathId) : r.pathId;
          const p =
            (await mongoose.connection.db.collection("paths").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("userpaths").findOne({ _id: idObj }));
          pName = p?.title || p?.name || p?.pathName || "";
        } catch (e) {}
      }

      if (!sName && r.stepId) {
        try {
          const idObj = mongoose.Types.ObjectId.isValid(r.stepId) ? new mongoose.Types.ObjectId(r.stepId) : r.stepId;
          const s =
            (await mongoose.connection.db.collection("steps").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("career_steps").findOne({ _id: idObj })) ||
            (await mongoose.connection.db.collection("educationsteps").findOne({ _id: idObj }));
          sName = s?.title || s?.name || s?.step_name || "";
        } catch (e) {}
      }

      let mappedStatus = "pending";
      if (r.status === "resolved") mappedStatus = "resolved";
      else if (r.status === "closed") mappedStatus = "closed";
      else if (r.status === "reviewing") mappedStatus = "reviewing";
      else if (r.status === "replacement_active" || r.status === "admin_requested") mappedStatus = "pending";

      const repId = `Rep-${String(r._id).slice(-12).toUpperCase()}`;

      formattedReplacements.push({
        id: `rep-${r._id}`,
        ticketId: repId,
        userId: r.userId || r.userEmail,
        userEmail: r.userEmail,
        userName: r.userName || (r.userEmail ? r.userEmail.split("@")[0] : "Student"),
        pathId: r.pathId,
        pathName: pName || "Manual Learning Path",
        stepId: r.stepId,
        stepName: sName || "Learning Step",
        originalMarketplaceItemId: r.originalMarketplaceItemId,
        originalItemName: r.originalItemName || r.previousRecommendations?.[0]?.itemName || "Marketplace Recommendation",
        replacementCount: r.replacementCount || 1,
        userRequirement: {
          reasons: r.feedback?.reasons || [],
          message:
            r.feedback?.message ||
            (r.feedback?.reasons?.length
              ? `Student requested replacement: ${r.feedback.reasons.join(", ")}`
              : "Replacement requested by student."),
        },
        previousRecommendations: (r.previousRecommendations || []).map((p) => ({
          id: p.marketplaceItemId,
          name: p.itemName,
        })),
        status: mappedStatus,
        assignedAdminId: null,
        recommendedService: null,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        isEscalated: false,
      });
    }

    let combined = [...formattedAssistance, ...formattedReplacements];

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      combined = combined.filter(
        (r) =>
          r.userName?.toLowerCase().includes(q) ||
          r.userEmail?.toLowerCase().includes(q) ||
          r.pathName?.toLowerCase().includes(q) ||
          r.stepName?.toLowerCase().includes(q) ||
          r.ticketId?.toLowerCase().includes(q) ||
          r.id?.toLowerCase().includes(q)
      );
    }

    combined.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    res.json({ status: true, requests: combined });
  } catch (error) {
    console.error("getAllAssistanceRequests error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/marketplace/assistance/:requestId
// ─────────────────────────────────────────────────────────────────────────────
const getAssistanceRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;
    let request = null;

    if (requestId.startsWith("rep-")) {
      const realId = requestId.replace("rep-", "");
      const r = await MarketplaceReplacement.findById(realId).lean();
      if (r) {
        request = {
          id: `rep-${r._id}`,
          ticketId: `Rep-${String(r._id).slice(-12).toUpperCase()}`,
          userId: r.userId || r.userEmail,
          userEmail: r.userEmail,
          userName: r.userName || "Student",
          pathId: r.pathId,
          pathName: r.pathName || "Manual Learning Path",
          stepId: r.stepId,
          stepName: r.stepName || "Learning Step",
          originalMarketplaceItemId: r.originalMarketplaceItemId,
          originalItemName: r.originalItemName || "Marketplace Service",
          replacementCount: r.replacementCount || 1,
          userRequirement: {
            reasons: r.feedback?.reasons || [],
            message: r.feedback?.message || "",
          },
          previousRecommendations: (r.previousRecommendations || []).map((p) => ({
            id: p.marketplaceItemId,
            name: p.itemName,
          })),
          status: r.status === "replacement_active" ? "pending" : r.status,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }
    } else {
      const doc = await MarketplaceAssistance.findOne(buildIdQuery(requestId));
      if (doc) {
        request = {
          id: doc.ticketId || doc._id,
          ...doc.toObject(),
        };
      }
    }

    if (!request) {
      return res.status(404).json({ status: false, message: "Request not found" });
    }

    res.json({
      status: true,
      request,
    });
  } catch (error) {
    console.error("getAssistanceRequestById error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/marketplace/assistance/:requestId/status
// ─────────────────────────────────────────────────────────────────────────────
const updateAssistanceStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    let request = null;

    if (requestId.startsWith("rep-")) {
      const realId = requestId.replace("rep-", "");
      request = await MarketplaceReplacement.findByIdAndUpdate(
        realId,
        { status, updatedAt: new Date() },
        { new: true }
      );
    } else {
      request = await MarketplaceAssistance.findOneAndUpdate(
        buildIdQuery(requestId),
        { status, updatedAt: new Date() },
        { new: true }
      );
    }

    if (!request) {
      return res.status(404).json({ status: false, message: "Request not found" });
    }

    res.json({ status: true, request });
  } catch (error) {
    console.error("updateAssistanceStatus error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST & GET Messages
// ─────────────────────────────────────────────────────────────────────────────
const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { senderId, senderRole, senderName, message, attachments = [], recommendedService = null } = req.body;

    const newMsg = await MarketplaceAssistanceMessage.create({
      requestId,
      senderId,
      senderRole,
      senderName,
      message,
      attachments,
      recommendedService,
    });

    // Auto-update request timestamp & status
    if (requestId.startsWith("rep-")) {
      const realId = requestId.replace("rep-", "");
      await MarketplaceReplacement.findByIdAndUpdate(realId, {
        updatedAt: new Date(),
        ...(senderRole === "SUPER_ADMIN" ? { status: "reviewing" } : {}),
      });
    } else {
      await MarketplaceAssistance.findOneAndUpdate(
        buildIdQuery(requestId),
        {
          updatedAt: new Date(),
          ...(senderRole === "SUPER_ADMIN" ? { status: "reviewing" } : {}),
        }
      );
    }

    res.json({
      status: true,
      message: {
        id: newMsg._id,
        ...newMsg.toObject(),
      },
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const messages = await MarketplaceAssistanceMessage.find({ requestId }).sort({ createdAt: 1 });

    const formatted = messages.map((m) => ({
      id: m._id,
      requestId: m.requestId,
      senderId: m.senderId,
      senderRole: m.senderRole,
      senderName: m.senderName,
      message: m.message,
      attachments: m.attachments,
      recommendedService: m.recommendedService,
      createdAt: m.createdAt,
    }));

    res.json({ status: true, messages: formatted });
  } catch (error) {
    console.error("getMessages error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/marketplace/assistance/:requestId/recommend
// ─────────────────────────────────────────────────────────────────────────────
const recommendService = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminId, adminName, service, note = "" } = req.body;

    const messageText = note
      ? `Our team reviewed your requirements and recommends: **${service.name}**.\n\n${note}`
      : `Our team reviewed your requirements and recommends: **${service.name}**.`;

    const newMsg = await MarketplaceAssistanceMessage.create({
      requestId,
      senderId: adminId || "admin_super",
      senderRole: "SUPER_ADMIN",
      senderName: adminName || "Super Admin",
      message: messageText,
      recommendedService: service,
    });

    if (requestId.startsWith("rep-")) {
      const realId = requestId.replace("rep-", "");
      await MarketplaceReplacement.findByIdAndUpdate(realId, {
        status: "reviewing",
        recommendedService: service,
        updatedAt: new Date(),
      });
    } else {
      await MarketplaceAssistance.findOneAndUpdate(
        buildIdQuery(requestId),
        {
          status: "reviewing",
          recommendedService: service,
          updatedAt: new Date(),
        }
      );
    }

    res.json({ status: true, message: newMsg });
  } catch (error) {
    console.error("recommendService error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  submitReplacement,
  getReplacementHistory,
  createAssistanceRequest,
  getUserAssistanceRequests,
  getAllAssistanceRequests,
  getAssistanceRequestById,
  updateAssistanceStatus,
  sendMessage,
  getMessages,
  recommendService,
};
