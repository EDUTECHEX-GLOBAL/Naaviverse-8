const express = require("express");
const Client = require("../models/ClientModel");
const Purchase = require("../models/PurchaseModel");

// ADD THESE 3 NEW LINES
const Path     = require("../models/PathModel");
const UserPath = require("../models/UserPathsModel");
const User     = require("../models/UsersModel");

const router = express.Router();

/* ---------------------------------------
   ADD CLIENT
---------------------------------------- */
router.post("/clients/add", async (req, res) => {
  try {
    const client = await Client.create(req.body);

    res.json({
      status: true,
      message: "Client created successfully",
      data: client
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   GET ALL CLIENTS OF COUNSELLOR
---------------------------------------- */
router.get("/clients", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    if (!creatorEmail) {
      return res.json({ status: false, message: "creatoremail is required" });
    }

    // ── 1. Manually added clients (existing behaviour) ───────────────────
    const manualClients = await Client.find({ creatorEmail }).populate("purchaseDetails").lean();

    // ── 2. Users who selected this partner's paths ───────────────────────
    const partnerPaths = await Path.find({ email: creatorEmail, status: "active" }).lean();

    let pathClients = [];
    if (partnerPaths.length) {
      const partnerPathIds = partnerPaths.map(p => p._id);

      const userPaths = await UserPath.find({
        pathId: { $in: partnerPathIds },
        status: "active",
      }).lean();

      if (userPaths.length) {
        const uniqueEmails = [...new Set(userPaths.map(up => up.email))];

        // Don't duplicate users already in manualClients
        const manualEmails = new Set(manualClients.map(c => c.email));
        const newEmails = uniqueEmails.filter(e => !manualEmails.has(e));

        if (newEmails.length) {
          const users = await User.find({ email: { $in: newEmails } }).lean();

          const pathCountMap = {};
          for (const up of userPaths) {
            if (newEmails.includes(up.email)) {
              pathCountMap[up.email] = (pathCountMap[up.email] || 0) + 1;
            }
          }

          pathClients = users.map(u => ({
            _id:             u._id,
            name:            u.username || u.name || u.email,
            email:           u.email,
            phoneNumber:     u.phone || u.phoneNumber || "—",
            country:         u.country || "—",
            createdAt:       u.createdAt,
            purchases:       pathCountMap[u.email] || 0,
            purchaseDetails: [],
            source:          "path",
          }));
        }
      }
    }

    // ── 3. Normalise manual clients to same shape ────────────────────────
    const normalisedManual = manualClients.map(c => ({
      ...c,
      purchases: c.purchaseDetails?.length || 0,
      source:    "manual",
    }));

    // ── 4. Merge and return ──────────────────────────────────────────────
    const allClients = [...normalisedManual, ...pathClients];

    return res.json({ status: true, total: allClients.length, data: allClients });

  } catch (err) {
    console.error("CRM /clients error:", err);
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   ADD PURCHASE
---------------------------------------- */
router.post("/purchases/add", async (req, res) => {
  try {
    // 1️⃣ Create purchase
    const purchase = await Purchase.create(req.body);

    // 2️⃣ Link purchase to client document
    if (req.body.clientId) {
      await Client.findByIdAndUpdate(
        req.body.clientId,
        { $push: { purchaseDetails: purchase._id } },
        { new: true }
      );
    }

    res.json({
      status: true,
      message: "Purchase added successfully",
      data: purchase
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   GET ALL PURCHASES OF COUNSELLOR
---------------------------------------- */
router.get("/purchases", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    const purchases = await Purchase.find({ creatorEmail })
      .populate("clientId", "name email phoneNumber country");

    res.json({ status: true, data: purchases });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;