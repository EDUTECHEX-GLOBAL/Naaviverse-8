const mongoose = require("mongoose");
const PathRequest = require("../models/PathRequestModel");
const Path = require("../models/PathModel");
const Step = require("../models/StepsModel");
const { logEvent } = require("./ActivityController");

// ─────────────────────────────────────────────────────────────────────────────
// 1. CREATE PATH REQUEST (User side)
// ─────────────────────────────────────────────────────────────────────────────
const createPathRequest = async (req, res) => {
  try {
    const {
      userEmail,
      userName,
      userId,
      targetGoal,
      targetInstitution,
      sector,
      educationLevel,
      targetTimeline,
      goalDetails,
      mandatoryRequirements,
      specialInstructions,
    } = req.body;

    if (!userEmail || !userEmail.trim()) {
      return res.status(400).json({
        status: false,
        message: "User email is required to submit a path request.",
      });
    }

    if (!targetGoal || !targetGoal.trim()) {
      return res.status(400).json({
        status: false,
        message: "Target goal / path title is required.",
      });
    }

    const newRequest = new PathRequest({
      userId: userId || null,
      userEmail: userEmail.trim().toLowerCase(),
      userName: userName?.trim() || "Student",
      targetGoal: targetGoal.trim(),
      targetInstitution: targetInstitution?.trim() || "",
      sector: sector?.trim() || "Higher Education",
      educationLevel: educationLevel?.trim() || "Undergraduate",
      targetTimeline: targetTimeline?.trim() || "4 Years",
      goalDetails: goalDetails?.trim() || "",
      mandatoryRequirements: mandatoryRequirements?.trim() || "",
      specialInstructions: specialInstructions?.trim() || "",
      status: "pending",
    });

    const savedRequest = await newRequest.save();

    return res.status(201).json({
      status: true,
      message: "Path request submitted successfully! Super Admin will review and curate this pathway.",
      data: savedRequest,
    });
  } catch (err) {
    console.error("[PathRequestController] Error creating request:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to create path request: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. GET USER'S PATH REQUESTS (User side)
// ─────────────────────────────────────────────────────────────────────────────
const getMyPathRequests = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email query parameter is required.",
      });
    }

    const requests = await PathRequest.find({
      userEmail: email.trim().toLowerCase(),
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      count: requests.length,
      data: requests,
    });
  } catch (err) {
    console.error("[PathRequestController] Error fetching user requests:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch path requests: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. GET ALL PATH REQUESTS (Super Admin side)
// ─────────────────────────────────────────────────────────────────────────────
const getAllPathRequests = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { requestId: { $regex: s, $options: "i" } },
        { targetGoal: { $regex: s, $options: "i" } },
        { targetInstitution: { $regex: s, $options: "i" } },
        { userEmail: { $regex: s, $options: "i" } },
        { userName: { $regex: s, $options: "i" } },
        { sector: { $regex: s, $options: "i" } },
      ];
    }

    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedPage = parseInt(page, 10) || 1;
    const skip = (parsedPage - 1) * parsedLimit;

    const [requests, totalCount, pendingCount, inProgressCount, createdCount, rejectedCount] =
      await Promise.all([
        PathRequest.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(parsedLimit)
          .lean(),
        PathRequest.countDocuments({}),
        PathRequest.countDocuments({ status: "pending" }),
        PathRequest.countDocuments({ status: "in_progress" }),
        PathRequest.countDocuments({ status: "created" }),
        PathRequest.countDocuments({ status: "rejected" }),
      ]);

    return res.status(200).json({
      status: true,
      data: requests,
      counts: {
        total: totalCount,
        pending: pendingCount,
        in_progress: inProgressCount,
        created: createdCount,
        rejected: rejectedCount,
      },
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: totalCount,
      },
    });
  } catch (err) {
    console.error("[PathRequestController] Error fetching all requests:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch path requests: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. GET SINGLE PATH REQUEST DETAILS
// ─────────────────────────────────────────────────────────────────────────────
const getPathRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid request ID" });
    }

    const request = await PathRequest.findById(id).lean();
    if (!request) {
      return res.status(404).json({ status: false, message: "Path request not found" });
    }

    // If linked to an active path, get that path too
    let createdPath = null;
    if (request.createdPathId) {
      createdPath = await Path.findById(request.createdPathId).lean();
    }

    return res.status(200).json({
      status: true,
      data: {
        ...request,
        createdPath,
      },
    });
  } catch (err) {
    console.error("[PathRequestController] Error fetching request by ID:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch request: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. UPDATE STATUS / NOTES (Super Admin side)
// ─────────────────────────────────────────────────────────────────────────────
const updatePathRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid request ID" });
    }

    const updateFields = {};
    if (status) {
      updateFields.status = status;
      if (status === "created" || status === "rejected") {
        updateFields.resolvedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      updateFields.adminNotes = adminNotes;
    }

    const updated = await PathRequest.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return res.status(404).json({ status: false, message: "Path request not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Path request updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("[PathRequestController] Error updating status:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to update request: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. CREATE PATH FROM REQUEST (Super Admin Fulfill Action)
// ─────────────────────────────────────────────────────────────────────────────
const createPathFromRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nameOfPath,
      program,
      destination_institution,
      destination_degree,
      description,
      sector,
      steps = [],
      adminNotes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid request ID" });
    }

    const request = await PathRequest.findById(id);
    if (!request) {
      return res.status(404).json({ status: false, message: "Path request not found" });
    }

    const resolvedPathName = (nameOfPath || request.targetGoal).trim();
    const resolvedInstitution = (destination_institution || request.targetInstitution || "").trim();
    const resolvedProgram = (program || destination_degree || resolvedPathName).trim();
    const adminEmail = req.body.adminEmail || "superadmin@naaviverse.com";

    let targetPath = null;
    if (request.createdPathId) {
      targetPath = await Path.findById(request.createdPathId);
    }

    if (!targetPath) {
      targetPath = new Path({
        email: adminEmail,
        nameOfPath: resolvedPathName,
        name: resolvedPathName,
        description: description?.trim() || request.goalDetails || `Comprehensive academic and career pathway for ${resolvedPathName}`,
        program: resolvedProgram,
        destination_institution: resolvedInstitution,
        destination_degree: destination_degree?.trim() || request.educationLevel || "Undergraduate Degree",
        path_type: "education",
        path_cat: "Degree",
        status: "active", // Make active so user can immediately view and select!
        the_ids: [],
        total_steps: Array.isArray(steps) && steps.length > 0 ? steps.length : 4,
      });
    } else {
      targetPath.nameOfPath = resolvedPathName;
      targetPath.name = resolvedPathName;
      if (description) targetPath.description = description.trim();
      targetPath.program = resolvedProgram;
      targetPath.destination_institution = resolvedInstitution;
      if (destination_degree) targetPath.destination_degree = destination_degree.trim();
      targetPath.status = "active";
    }

    const savedPath = await targetPath.save();

    // Clean up old steps for this path before adding updated steps
    const oldStepIds = (targetPath.the_ids || []).map(s => s.step_id).filter(Boolean);
    if (oldStepIds.length > 0) {
      await Step.deleteMany({
        $or: [{ path_id: savedPath._id }, { _id: { $in: oldStepIds } }],
      });
    } else {
      await Step.deleteMany({ path_id: savedPath._id });
    }

    // 2. Default or provided steps
    const defaultSteps = [
      {
        macro_name: "Step 1: Academic Foundations & Prerequisites",
        macro_description: `Establish strong academic coursework, prerequisite credits, and competitive GPA requirements for ${resolvedPathName}.`,
        macro_length: JSON.stringify({ years: 1, months: 0, days: 0 }),
      },
      {
        macro_name: "Step 2: Core Coursework & Domain Specialization",
        macro_description: `Complete foundational and intermediate subject modules in ${sector || request.sector || "the chosen field"}.`,
        macro_length: JSON.stringify({ years: 1, months: 6, days: 0 }),
      },
      {
        macro_name: "Step 3: Applied Projects, Research & Portfolio",
        macro_description: `Build capstone projects, collaborate on faculty research, and compile an industry-standard portfolio.`,
        macro_length: JSON.stringify({ years: 1, months: 0, days: 0 }),
      },
      {
        macro_name: "Step 4: Admissions, Capstone & Career Placement",
        macro_description: `Finalize applications, internship experience, and transition directly into target institution / professional milestones.`,
        macro_length: JSON.stringify({ years: 0, months: 6, days: 0 }),
      },
    ];

    const stepsToCreate = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps;
    const theIds = [];

    for (let i = 0; i < stepsToCreate.length; i++) {
      const s = stepsToCreate[i];
      const macroData = s.macro || {};
      const microData = s.micro || {};
      const nanoData = s.nano || {};

      const macroName = (s.macro_name || macroData.name || s.name || `Step ${i + 1}`).trim();
      const macroDesc = (s.macro_description || macroData.desc || s.description || "").trim();
      const macroLen = s.macro_length || (typeof macroData.duration === "string" ? macroData.duration : JSON.stringify(macroData.duration || { years: 1, months: 0, days: 0 }));
      const macroAccess = s.macro_access || (macroData.paid ? "paid" : "free") || "free";
      const macroMarketplace = Array.isArray(s.macro_marketplace) ? s.macro_marketplace : (Array.isArray(macroData.marketplace) ? macroData.marketplace : []);

      const microName = (s.micro_name || microData.name || `${macroName} (Structured)`).trim();
      const microDesc = (s.micro_description || microData.desc || macroDesc).trim();
      const microLen = s.micro_length || (typeof microData.duration === "string" ? microData.duration : JSON.stringify(microData.duration || { years: 1, months: 0, days: 0 }));
      const microAccess = s.micro_access || (microData.free ? "free" : "paid") || "paid";
      const microMarketplace = Array.isArray(s.micro_marketplace) ? s.micro_marketplace : (Array.isArray(microData.marketplace) ? microData.marketplace : []);

      const nanoName = (s.nano_name || nanoData.name || `${macroName} (Specialization)`).trim();
      const nanoDesc = (s.nano_description || nanoData.desc || macroDesc).trim();
      const nanoLen = s.nano_length || (typeof nanoData.duration === "string" ? nanoData.duration : JSON.stringify(nanoData.duration || { years: 0, months: 6, days: 0 }));
      const nanoAccess = s.nano_access || (nanoData.free ? "free" : "paid") || "paid";
      const nanoMarketplace = Array.isArray(s.nano_marketplace) ? s.nano_marketplace : (Array.isArray(nanoData.marketplace) ? nanoData.marketplace : []);

      const stepDoc = new Step({
        email: adminEmail,
        name: macroName,
        macro_name: macroName,
        macro_description: macroDesc,
        macro_length: typeof macroLen === "string" ? macroLen : JSON.stringify(macroLen),
        macro_access: macroAccess,
        macro_instructions: s.macro_instructions || macroData.instructions || "",
        macro_marketplace: macroMarketplace,

        micro_name: microName,
        micro_description: microDesc,
        micro_length: typeof microLen === "string" ? microLen : JSON.stringify(microLen),
        micro_access: microAccess,
        micro_instructions: s.micro_instructions || microData.instructions || "",
        micro_marketplace: microMarketplace,

        nano_name: nanoName,
        nano_description: nanoDesc,
        nano_length: typeof nanoLen === "string" ? nanoLen : JSON.stringify(nanoLen),
        nano_access: nanoAccess,
        nano_instructions: s.nano_instructions || nanoData.instructions || "",
        nano_marketplace: nanoMarketplace,

        step_order: i + 1,
        path_id: savedPath._id,
        status: "active",
      });

      const savedStep = await stepDoc.save();
      theIds.push({
        step_id: savedStep._id,
        stepName: savedStep.macro_name,
        stepDescription: savedStep.macro_description,
      });
    }

    // 3. Update Path with the created step IDs
    savedPath.the_ids = theIds;
    savedPath.total_steps = theIds.length;
    await savedPath.save();

    // 4. Update the PathRequest as 'created' and link to the created path
    request.status = "created";
    request.createdPathId = savedPath._id;
    request.createdPathName = savedPath.nameOfPath;
    request.resolvedAt = new Date();
    if (adminNotes) {
      request.adminNotes = adminNotes;
    } else {
      request.adminNotes = `Pathway officially curated and published by Super Admin on ${new Date().toLocaleDateString()}.`;
    }
    await request.save();

    return res.status(200).json({
      status: true,
      message: "Path created successfully and request fulfilled! The user can now select and continue with this path.",
      data: {
        request,
        createdPath: savedPath,
      },
    });
  } catch (err) {
    console.error("[PathRequestController] Error creating path from request:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to create path: " + err.message,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. DELETE PATH REQUEST
// ─────────────────────────────────────────────────────────────────────────────
const deletePathRequest = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid request ID" });
    }

    const deleted = await PathRequest.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Path request not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Path request removed successfully",
    });
  } catch (err) {
    console.error("[PathRequestController] Error deleting request:", err);
    return res.status(500).json({
      status: false,
      message: "Failed to delete request: " + err.message,
    });
  }
};

module.exports = {
  createPathRequest,
  getMyPathRequests,
  getAllPathRequests,
  getPathRequestById,
  updatePathRequestStatus,
  createPathFromRequest,
  deletePathRequest,
};
