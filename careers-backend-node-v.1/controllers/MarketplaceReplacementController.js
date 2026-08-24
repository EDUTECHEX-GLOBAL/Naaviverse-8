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
      stepId,
      pathId,
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

    // Find or initialize existing replacement record for this user & step
    let record = await MarketplaceReplacement.findOne({
      userEmail,
      stepId,
      status: "replacement_active",
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
        pathId,
        stepId,
        originalMarketplaceItemId: String(rejectedItemId),
        replacementCount: nextCount,
        feedback: { reasons, message },
        previousRecommendations: updatedHistory,
        whyRecommended,
        status: nextStatus,
      });
    } else {
      record.replacementCount = nextCount;
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
    const filter = email ? { userEmail: email } : {};
    const requests = await MarketplaceAssistance.find(filter).sort({ updatedAt: -1 });

    const formatted = requests.map((r) => ({
      id: r.ticketId || r._id,
      ticketId: r.ticketId,
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName,
      pathId: r.pathId,
      pathName: r.pathName,
      stepId: r.stepId,
      stepName: r.stepName,
      originalMarketplaceItemId: r.originalMarketplaceItemId,
      originalItemName: r.originalItemName,
      replacementCount: r.replacementCount,
      userRequirement: r.userRequirement,
      previousRecommendations: r.previousRecommendations,
      status: r.status,
      assignedAdminId: r.assignedAdminId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({ status: true, requests: formatted });
  } catch (error) {
    console.error("getUserAssistanceRequests error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/marketplace/assistance (Super Admin List)
// ─────────────────────────────────────────────────────────────────────────────
const getAllAssistanceRequests = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    if (search && search.trim()) {
      const q = new RegExp(search.trim(), "i");
      filter.$or = [
        { userName: q },
        { userEmail: q },
        { pathName: q },
        { stepName: q },
        { ticketId: q },
      ];
    }

    const requests = await MarketplaceAssistance.find(filter).sort({ updatedAt: -1 });

    const formatted = requests.map((r) => ({
      id: r.ticketId || r._id,
      ticketId: r.ticketId,
      userId: r.userId,
      userEmail: r.userEmail,
      userName: r.userName,
      pathId: r.pathId,
      pathName: r.pathName,
      stepId: r.stepId,
      stepName: r.stepName,
      originalMarketplaceItemId: r.originalMarketplaceItemId,
      originalItemName: r.originalItemName,
      replacementCount: r.replacementCount,
      userRequirement: r.userRequirement,
      previousRecommendations: r.previousRecommendations,
      status: r.status,
      assignedAdminId: r.assignedAdminId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    res.json({ status: true, requests: formatted });
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
    const request = await MarketplaceAssistance.findOne(buildIdQuery(requestId));

    if (!request) {
      return res.status(404).json({ status: false, message: "Request not found" });
    }

    res.json({
      status: true,
      request: {
        id: request.ticketId || request._id,
        ...request.toObject(),
      },
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

    const request = await MarketplaceAssistance.findOneAndUpdate(
      buildIdQuery(requestId),
      { status, updatedAt: new Date() },
      { new: true }
    );

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
    await MarketplaceAssistance.findOneAndUpdate(
      buildIdQuery(requestId),
      {
        updatedAt: new Date(),
        ...(senderRole === "SUPER_ADMIN" ? { status: "reviewing" } : {}),
      }
    );

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

    await MarketplaceAssistance.findOneAndUpdate(
      buildIdQuery(requestId),
      { status: "reviewing", updatedAt: new Date() }
    );

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
