const express = require("express");
const Client = require("../models/ClientModel");
const Purchase = require("../models/PurchaseModel");
const Payment = require("../models/PaymentModel");
const Path = require("../models/PathModel");
const UserPath = require("../models/UserPathsModel");
const User = require("../models/UsersModel");
const MarketplaceItem = require("../models/MarketplaceModel");
const { validatePersonName } = require("../utils/emailValidator");

const router = express.Router();

/* ---------------------------------------
   ADD CLIENT (Manual)
---------------------------------------- */
router.post("/clients/add", async (req, res) => {
  try {
    if (req.body.name !== undefined) {
      const nameVal = validatePersonName(req.body.name, "Client name");
      if (!nameVal.isValid) {
        return res.status(400).json({ status: false, message: nameVal.message });
      }
      req.body.name = nameVal.cleanName;
    }
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
   GET ALL CLIENTS OF PARTNER / COUNSELLOR
   Includes:
   1. Users who selected the partner's paths
   2. Manual clients added by the partner
   Enriched with:
   - Selected path titles & progress
   - Real marketplace purchases & spending
---------------------------------------- */
router.get("/clients", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    if (!creatorEmail) {
      return res.json({ status: false, message: "creatoremail is required" });
    }

    const emailRegex = new RegExp(
      "^" + String(creatorEmail).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
      "i"
    );

    // ── 1. Partner's paths & marketplace items ──────────────────────────
    const [partnerPaths, mktItems] = await Promise.all([
      Path.find({ email: emailRegex }).lean(),
      MarketplaceItem.find({ partner_email: emailRegex }).lean(),
    ]);

    const partnerPathIds = partnerPaths.map((p) => p._id);
    const pathMap = Object.fromEntries(
      partnerPaths.map((p) => [String(p._id), p])
    );

    const mktItemIds = mktItems.map((m) => String(m._id));
    const mktItemMap = Object.fromEntries(
      mktItems.map((m) => [String(m._id), m])
    );

    // ── 2. All marketplace transactions for this partner ────────────────
    const [partnerPayments, partnerPurchases] = await Promise.all([
      Payment.find({
        $or: [
          { partnerEmail: emailRegex },
          { productId: { $in: mktItemIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
      Purchase.find({
        $or: [
          { creatorEmail: emailRegex },
          { productId: { $in: mktItemIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // Group purchases by buyer email
    const userPurchasesMap = {};
    const addPurchaseToUser = (email, pur) => {
      if (!email) return;
      const key = String(email).toLowerCase().trim();
      if (!userPurchasesMap[key]) userPurchasesMap[key] = [];
      userPurchasesMap[key].push(pur);
    };

    partnerPayments.forEach((p) => {
      const item = mktItemMap[p.productId];
      addPurchaseToUser(p.userEmail, {
        _id: p._id,
        productName: p.productName || item?.name || "Marketplace Item",
        productId: p.productId,
        category: item?.category || p.tier || "vendor",
        amount: Number(p.amount) || 0,
        currency: p.currency || "INR",
        status: (p.status || "pending").toLowerCase(),
        date: p.createdAt,
        orderId: p.razorpayOrderId || "—",
        source: "payment",
      });
    });

    partnerPurchases.forEach((p) => {
      const item = mktItemMap[p.productId];
      addPurchaseToUser(p.clientEmail || p.creatorEmail, {
        _id: p._id,
        productName: p.productName || item?.name || "Marketplace Item",
        productId: p.productId,
        category: item?.category || "vendor",
        amount: Number(p.amount) || 0,
        currency: "INR",
        status: (p.status || "paid").toLowerCase() === "completed" ? "paid" : (p.status || "paid").toLowerCase(),
        date: p.date || p.createdAt,
        orderId: p.razorpayOrderId || "—",
        source: "purchase",
      });
    });

    // ── 3. Manual clients ───────────────────────────────────────────────
    const manualClients = await Client.find({ creatorEmail: emailRegex })
      .populate("purchaseDetails")
      .lean();

    // ── 4. Users who selected this partner's paths ──────────────────────
    let pathClients = [];
    if (partnerPathIds.length > 0) {
      // Find UserPath records
      const userPaths = await UserPath.find({
        pathId: { $in: partnerPathIds },
        status: "active",
      })
        .sort({ createdAt: -1 })
        .lean();

      // Also check legacy selectedPath in naavi_users
      const pathIdStrings = partnerPathIds.map((id) => String(id));
      const legacyUsers = await User.find({
        selectedPath: { $in: pathIdStrings },
      })
        .select("email username name phone phoneNumber country createdAt")
        .lean();

      // Collect user emails
      const enrolledUserMap = {};

      // Process userPaths
      for (const up of userPaths) {
        if (!up.email) continue;
        const em = String(up.email).toLowerCase().trim();
        if (!enrolledUserMap[em]) {
          enrolledUserMap[em] = {
            email: up.email,
            paths: [],
            earliestDate: up.createdAt || new Date(),
          };
        }
        const pDoc = pathMap[String(up.pathId)];
        if (pDoc) {
          enrolledUserMap[em].paths.push({
            pathId: pDoc._id,
            nameOfPath: pDoc.nameOfPath || pDoc.name || "Career Path",
            category: pDoc.path_cat || "General",
            type: pDoc.path_type || "career",
            enrolledAt: up.createdAt,
            completedStepsCount: (up.completedSteps || []).length,
            totalSteps: pDoc.total_steps || pDoc.the_ids?.length || 5,
            currentStep: up.currentStep || "",
            status: up.status,
          });
        }
        if (up.createdAt && new Date(up.createdAt) < new Date(enrolledUserMap[em].earliestDate)) {
          enrolledUserMap[em].earliestDate = up.createdAt;
        }
      }

      // Process legacy users
      for (const lu of legacyUsers) {
        if (!lu.email) continue;
        const em = String(lu.email).toLowerCase().trim();
        if (!enrolledUserMap[em]) {
          const pDoc = pathMap[String(lu.selectedPath)];
          enrolledUserMap[em] = {
            email: lu.email,
            paths: pDoc
              ? [
                  {
                    pathId: pDoc._id,
                    nameOfPath: pDoc.nameOfPath || pDoc.name || "Career Path",
                    category: pDoc.path_cat || "General",
                    type: pDoc.path_type || "career",
                    enrolledAt: lu.createdAt,
                    completedStepsCount: 0,
                    totalSteps: pDoc.total_steps || pDoc.the_ids?.length || 5,
                    currentStep: "",
                    status: "active",
                  },
                ]
              : [],
            earliestDate: lu.createdAt || new Date(),
          };
        }
      }

      const enrolledEmails = Object.keys(enrolledUserMap);

      // Don't duplicate clients already in manualClients
      const manualEmails = new Set(
        manualClients.map((c) => (c.email || "").toLowerCase().trim())
      );
      const newEmails = enrolledEmails.filter((e) => !manualEmails.has(e));

      if (newEmails.length > 0) {
        const users = await User.find({
          email: {
            $in: newEmails.map((e) => new RegExp("^" + e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i")),
          },
        }).lean();

        const userLookup = {};
        users.forEach((u) => {
          if (u.email) userLookup[u.email.toLowerCase().trim()] = u;
        });

        pathClients = newEmails.map((em) => {
          const enrollment = enrolledUserMap[em];
          const u = userLookup[em] || {};
          const userPurchases = userPurchasesMap[em] || [];
          const paidPurchases = userPurchases.filter(
            (p) => p.status === "paid" || p.status === "completed"
          );
          const totalSpent = paidPurchases.reduce(
            (acc, p) => acc + (Number(p.amount) || 0),
            0
          );

          return {
            _id: u._id || enrollment.paths[0]?.pathId || em,
            name: u.username || u.name || em.split("@")[0],
            email: u.email || enrollment.email || em,
            phoneNumber: u.phone || u.phoneNumber || "—",
            country: u.country || "India",
            createdAt: enrollment.earliestDate || u.createdAt || new Date(),
            joinedAt: enrollment.earliestDate || u.createdAt || new Date(),
            pathsCount: enrollment.paths.length,
            selectedPaths: enrollment.paths,
            purchases: userPurchases.length,
            paidPurchasesCount: paidPurchases.length,
            totalSpent,
            purchaseList: userPurchases,
            source: "path",
          };
        });
      }
    }

    // ── 5. Normalise manual clients ─────────────────────────────────────
    const normalisedManual = manualClients.map((c) => {
      const em = (c.email || "").toLowerCase().trim();
      const userPurchases = userPurchasesMap[em] || [];
      const paidPurchases = userPurchases.filter(
        (p) => p.status === "paid" || p.status === "completed"
      );
      const totalSpent = paidPurchases.reduce(
        (acc, p) => acc + (Number(p.amount) || 0),
        0
      );

      return {
        ...c,
        name: c.name || c.email?.split("@")[0] || "Client",
        phoneNumber: c.phoneNumber || c.phone || "—",
        country: c.country || "India",
        pathsCount: 0,
        selectedPaths: [],
        purchases: userPurchases.length || c.purchaseDetails?.length || 0,
        paidPurchasesCount: paidPurchases.length,
        totalSpent,
        purchaseList: userPurchases.length > 0 ? userPurchases : (c.purchaseDetails || []),
        source: "manual",
      };
    });

    // ── 6. Merge and return sorted by newest first ──────────────────────
    const allClients = [...pathClients, ...normalisedManual].sort((a, b) => {
      return new Date(b.createdAt || b.joinedAt || 0) - new Date(a.createdAt || a.joinedAt || 0);
    });

    return res.json({
      status: true,
      total: allClients.length,
      data: allClients,
    });
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
    const purchase = await Purchase.create(req.body);

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
      data: purchase,
    });
  } catch (err) {
    res.json({ status: false, message: err.message });
  }
});

/* ---------------------------------------
   GET ALL PURCHASES OF PARTNER / COUNSELLOR
   Pulls purchases from:
   1. Payment collection (Razorpay marketplace transactions)
   2. Purchase collection
   Enriched with:
   - Buyer details (name, email, phone, country)
   - Marketplace item title, category & layer
---------------------------------------- */
router.get("/purchases", async (req, res) => {
  try {
    const creatorEmail = req.query.creatoremail;

    if (!creatorEmail) {
      return res.json({ status: false, message: "creatoremail is required" });
    }

    const emailRegex = new RegExp(
      "^" + String(creatorEmail).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
      "i"
    );

    // 1. Fetch partner's marketplace items
    const mktItems = await MarketplaceItem.find({ partner_email: emailRegex }).lean();
    const mktItemIds = mktItems.map((it) => String(it._id));
    const mktItemMap = Object.fromEntries(
      mktItems.map((it) => [String(it._id), it])
    );

    // 2. Fetch payments & purchases matching this partner
    const [rawPayments, rawPurchases] = await Promise.all([
      Payment.find({
        $or: [
          { partnerEmail: emailRegex },
          { productId: { $in: mktItemIds } },
        ],
      })
        .sort({ createdAt: -1 })
        .lean(),
      Purchase.find({
        $or: [
          { creatorEmail: emailRegex },
          { productId: { $in: mktItemIds } },
        ],
      })
        .populate("clientId", "name email phoneNumber country")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    // 3. Find buyer user details
    const buyerEmails = [
      ...new Set([
        ...rawPayments.map((p) => (p.userEmail || "").toLowerCase().trim()).filter(Boolean),
        ...rawPurchases.map((p) => (p.clientEmail || p.creatorEmail || "").toLowerCase().trim()).filter(Boolean),
      ]),
    ];

    const users = buyerEmails.length
      ? await User.find({
          email: {
            $in: buyerEmails.map((e) => new RegExp("^" + e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i")),
          },
        })
          .select("email username name phone phoneNumber country profilePicture")
          .lean()
      : [];

    const userLookup = {};
    users.forEach((u) => {
      if (u.email) userLookup[u.email.toLowerCase().trim()] = u;
    });

    const formattedList = [];
    const seenTx = new Set();

    // Map Payment records
    rawPayments.forEach((p) => {
      const em = (p.userEmail || "").toLowerCase().trim();
      const u = userLookup[em] || {};
      const item = mktItemMap[p.productId];

      const clientName =
        u.username ||
        u.name ||
        (p.userEmail ? p.userEmail.split("@")[0] : "Client");

      const txKey = p.razorpayPaymentId || String(p._id);
      if (seenTx.has(txKey)) return;
      seenTx.add(txKey);

      formattedList.push({
        _id: p._id,
        clientName,
        clientEmail: p.userEmail,
        phoneNumber: u.phone || u.phoneNumber || "—",
        country: u.country || "India",
        product: p.productName || item?.name || "Marketplace Item",
        productId: p.productId,
        category: item?.category || p.tier || "vendor",
        layer: item?.layer || p.tier || "micro",
        amount: Number(p.amount) || 0,
        currency: p.currency || "INR",
        billingFrequency: p.billingMethod
          ? p.billingMethod.charAt(0).toUpperCase() + p.billingMethod.slice(1)
          : "One-Time",
        status: (p.status || "pending").toLowerCase(),
        date: p.createdAt,
        createdAt: p.createdAt,
        orderId: p.razorpayOrderId || "—",
        paymentId: p.razorpayPaymentId || "—",
        source: "payment",
      });
    });

    // Map Purchase records
    rawPurchases.forEach((p) => {
      const em = (p.clientEmail || p.creatorEmail || "").toLowerCase().trim();
      const u = userLookup[em] || {};
      const item = mktItemMap[p.productId];

      const txKey = p.razorpayPaymentId || p.razorpayOrderId || String(p._id);
      if (seenTx.has(txKey)) return;
      seenTx.add(txKey);

      const clientName =
        p.clientName ||
        p.clientId?.name ||
        u.username ||
        u.name ||
        (em ? em.split("@")[0] : "Client");

      const rawStatus = (p.status || "paid").toLowerCase();
      const status =
        rawStatus === "completed" || rawStatus === "paid" ? "paid" : rawStatus;

      formattedList.push({
        _id: p._id,
        clientName,
        clientEmail: p.clientEmail || p.creatorEmail || em,
        phoneNumber:
          p.clientId?.phoneNumber || u.phone || u.phoneNumber || "—",
        country: p.clientId?.country || u.country || "India",
        product: p.productName || item?.name || "Marketplace Item",
        productId: p.productId,
        category: item?.category || "vendor",
        layer: item?.layer || "micro",
        amount: Number(p.amount) || 0,
        currency: "INR",
        billingFrequency: p.billingFrequency || "One-Time",
        status,
        date: p.date || p.createdAt,
        createdAt: p.createdAt || p.date,
        orderId: p.razorpayOrderId || "—",
        paymentId: p.razorpayPaymentId || "—",
        source: "purchase",
      });
    });

    // Sort by latest first
    formattedList.sort(
      (a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0)
    );

    return res.json({
      status: true,
      total: formattedList.length,
      data: formattedList,
    });
  } catch (err) {
    console.error("CRM /purchases error:", err);
    res.json({ status: false, message: err.message });
  }
});

module.exports = router;