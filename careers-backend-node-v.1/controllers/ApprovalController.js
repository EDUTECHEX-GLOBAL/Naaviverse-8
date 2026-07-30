const Approval = require("../models/ApprovalModel");
const { sendNotificationMail } = require("../middlewares/verifySignUp");

exports.createApproval = async (req, res) => {
  try {
    const { role, email, businessName, type, website,
            firstName, lastName, position, country } = req.body;

    if (!email || !role) {
      return res.status(400).json({ status: false, message: "email and role are required" });
    }

    const normalisedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

    const existing = await Approval.findOne({ email, role: normalisedRole });
    if (existing) {
      return res.json({ status: true, data: existing, message: "Approval record already exists" });
    }

    const date = new Date().toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });

    const approval = await Approval.create({
      role: normalisedRole, email, businessName, type,
      website, firstName, lastName, position, country,
      status: "pending", date,
    });

    res.json({ status: true, data: approval });
  } catch (err) {
    console.error("createApproval error:", err);
    res.status(500).json({ status: false, message: "Error creating approval record" });
  }
};

// ✅ GET approvals — filtered by role if provided
exports.getApprovals = async (req, res) => {
  try {
    const { role } = req.query;

    const query = role
      ? { role: role.charAt(0).toUpperCase() + role.slice(1).toLowerCase() }
      : {};

    const approvals = await Approval.find(query).sort({ createdAt: -1 });
    res.json({ status: true, data: approvals });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching approvals" });
  }
};

// ✅ GET approval status by email + role
exports.getApprovalByEmail = async (req, res) => {
  try {
    const { email, role } = req.query;

    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const normalisedRole = role
      ? role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      : "Partner";

    const approval = await Approval.findOne({ email, role: normalisedRole });

    if (!approval) {
      return res.json({ status: false, message: "No approval record found", data: null });
    }

    res.json({ status: true, data: approval });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching approval status" });
  }
};

const User = require("../models/UsersModel");
const Partner = require("../models/PartnerModel");

// ✅ UPDATE approval status — role-aware email notification & DB status sync
exports.updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updateFields = { status };
    if (reason) updateFields.reason = reason;

    const approval = await Approval.findByIdAndUpdate(id, updateFields, { new: true });

    if (!approval) {
      return res.status(404).json({ status: false, message: "Approval record not found" });
    }

    const isUser    = approval.role?.toLowerCase() === "user";
    const roleLabel = isUser ? "User" : "Partner";
    const greeting  = isUser ? "Dear User" : "Dear Partner";

    if (status === "approved") {
      sendNotificationMail(
        approval.email,
        `Naaviverse ${roleLabel} Approval`,
        `${greeting},<br>Your account has been approved by the admin.<br>You can now login to the platform.`
      );
      if (isUser) {
        await User.findOneAndUpdate({ email: approval.email }, { status: "active", isBlocked: false });
      } else {
        await Partner.findOneAndUpdate({ email: approval.email }, { status: true, isBlocked: false });
      }
    } else if (status === "rejected") {
      sendNotificationMail(
        approval.email,
        `Naaviverse ${roleLabel} Application Update`,
        `${greeting},<br>Unfortunately your application was not approved.<br>${reason ? `Reason: ${reason}` : "Please contact support for more information."}`
      );
    } else if (status === "deactivated") {
      if (isUser) {
        await User.findOneAndUpdate({ email: approval.email }, { status: "inactive", isBlocked: true });
      } else {
        await Partner.findOneAndUpdate({ email: approval.email }, { status: false, isBlocked: true });
      }
    }

    res.json({ status: true, data: approval });
  } catch (err) {
    console.error("updateApproval error:", err);
    res.status(500).json({ status: false, message: "Error updating approval" });
  }
};

// ✅ DEACTIVATE approval & mark user/partner deactivated in DB
exports.deactivateApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await Approval.findByIdAndUpdate(
      id,
      { status: "deactivated" },
      { new: true }
    );

    if (!approval) {
      return res.status(404).json({ status: false, message: "Approval record not found" });
    }

    const isUser = approval.role?.toLowerCase() === "user";
    if (isUser) {
      await User.findOneAndUpdate(
        { email: approval.email },
        { status: "inactive", isBlocked: true }
      );
    } else {
      await Partner.findOneAndUpdate(
        { email: approval.email },
        { status: false, isBlocked: true }
      );
    }

    res.json({ status: true, data: approval, message: "Record deactivated in DB successfully" });
  } catch (err) {
    console.error("deactivateApproval error:", err);
    res.status(500).json({ status: false, message: "Error deactivating record" });
  }
};

// ✅ DELETE approval & delete user/partner from DB
exports.deleteApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const approval = await Approval.findByIdAndDelete(id);

    if (!approval) {
      return res.status(404).json({ status: false, message: "Approval record not found" });
    }

    const isUser = approval.role?.toLowerCase() === "user";
    if (isUser) {
      await User.findOneAndDelete({ email: approval.email });
    } else {
      await Partner.findOneAndDelete({ email: approval.email });
    }

    res.json({ status: true, message: "Record deleted from database successfully", id });
  } catch (err) {
    console.error("deleteApproval error:", err);
    res.status(500).json({ status: false, message: "Error deleting record" });
  }
};
