const Approval = require("../models/approval.model");
const { sendNotificationMail } = require("../middlewares/verifySignUp");

// GET all approvals
exports.getApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find();
    res.json({ status: true, data: approvals });
  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching approvals" });
  }
};

// ✅ NEW: GET approval status by email
exports.getApprovalByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ status: false, message: "Email is required" });
    }

    const approval = await Approval.findOne({ email, role: "Partner" });

    if (!approval) {
      return res.json({ status: false, message: "No approval record found", data: null });
    }

    res.json({
      status: true,
      data: approval  // contains status: "approved" | "pending" | "rejected"
    });

  } catch (err) {
    res.status(500).json({ status: false, message: "Error fetching approval status" });
  }
};

// UPDATE approval status
exports.updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const approval = await Approval.findByIdAndUpdate(id, { status }, { new: true });

    if (status === "approved") {
      sendNotificationMail(
        approval.email,
        "Naaviverse Partner Approval",
        `Dear Partner,<br>Your account has been approved by admin.<br>You can now login to the platform.`
      );
    }

    res.json({ status: true, data: approval });

  } catch (err) {
    res.status(500).json({ status: false, message: "Error updating approval" });
  }
};