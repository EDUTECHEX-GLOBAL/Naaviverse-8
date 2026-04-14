const marketplaceModel = require("../models/marketplace.model");
const stepModel = require("../models/steps.model");

// ✅ Activity logging
const { logEvent } = require("./Activity.controller");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — fetch partner display info from email
// ─────────────────────────────────────────────────────────────────────────────
async function getPartnerInfo(email) {
  try {
    if (!email) return { displayName: "Partner", partnerType: "" };
    const Partner = require('../models/partner.model');
    const partner = await Partner.findOne({ email }).select('businessName username partnerType').lean();
    return {
      displayName: partner?.businessName || partner?.username || email,
      partnerType: partner?.partnerType || "",
    };
  } catch (_) {
    return { displayName: email, partnerType: "" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/marketplace/add
// Creates a new marketplace item AND pushes its _id into the step's
// [layer]_marketplace array. Logs "listing" event.
// ─────────────────────────────────────────────────────────────────────────────
const addMarketplaceItem = async (req, res) => {
  try {
    const {
      name, role, layer, step_id, path_id, partner_email,
      access, cost, goal, outcomes, duration, iterations, discount, features
    } = req.body;

    if (!step_id || !layer) {
      return res.status(400).json({ status: false, message: "step_id and layer are required" });
    }

    const item = await marketplaceModel.create({
      name, role, layer, step_id, path_id, partner_email,
      access, cost, goal, outcomes, duration, iterations,
      discount, features, status: "active"
    });

    // Push this item's _id into the step's [layer]_marketplace array
    await stepModel.findByIdAndUpdate(
      step_id,
      { $push: { [`${layer}_marketplace`]: item._id } }
    );

    // ✅ Log marketplace listing created
    if (partner_email) {
      const { displayName, partnerType } = await getPartnerInfo(partner_email);
      logEvent({
        role:        "partner",
        email:       partner_email,
        displayName,
        partnerType,
        eventType:   "listing",
        title:       `Marketplace Listing Added: ${name || "New Item"}`,
        desc:        `Added "${name || "New Item"}" (${layer} · ${access || "free"}) to marketplace`,
      }).catch(err => console.error("logEvent addMarketplaceItem error:", err));
    }

    return res.json({ status: true, data: item });
  } catch (error) {
    console.error("addMarketplaceItem error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marketplace/step/:step_id?layer=macro|micro|nano
// ─────────────────────────────────────────────────────────────────────────────
const getMarketplaceItemsByStep = async (req, res) => {
  try {
    const { step_id } = req.params;
    const { layer } = req.query;
    const filter = { step_id, status: "active" };
    if (layer) filter.layer = layer;
    const items = await marketplaceModel.find(filter);
    res.json({ status: true, data: items });
  } catch (err) {
    console.error("getMarketplaceItemsByStep error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/marketplace/admin/get-all?layer=macro|micro|nano
// ─────────────────────────────────────────────────────────────────────────────
const getAllMarketplaceItems = async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.layer) filter.layer = req.query.layer;
    const items = await marketplaceModel.find(filter).sort({ createdAt: -1 });
    res.json({ status: true, data: items });
  } catch (err) {
    console.error("getAllMarketplaceItems error:", err);
    res.status(500).json({ status: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/marketplace/link-step
// Links/unlinks a marketplace item to/from a step. Logs "listing" event.
// ─────────────────────────────────────────────────────────────────────────────
const linkMarketplaceToStep = async (req, res) => {
  try {
    const { item_id, step_id } = req.body;

    if (!item_id) {
      return res.status(400).json({ status: false, message: "item_id is required" });
    }

    const updated = await marketplaceModel.findByIdAndUpdate(
      item_id,
      { step_id: step_id || null },
      { new: true }
    );

    // ✅ Log listing linked/unlinked activity
    if (updated?.partner_email) {
      const { displayName, partnerType } = await getPartnerInfo(updated.partner_email);
      const action = step_id ? "Linked to Step" : "Unlinked from Step";
      logEvent({
        role:        "partner",
        email:       updated.partner_email,
        displayName,
        partnerType,
        eventType:   "listing",
        title:       `Marketplace Item ${action}: ${updated.name || "Item"}`,
        desc:        `"${updated.name || "Item"}" ${step_id ? "linked to a step" : "unlinked from step"}`,
      }).catch(err => console.error("logEvent linkMarketplaceToStep error:", err));
    }

    return res.json({ status: true, data: updated });
  } catch (error) {
    console.error("linkMarketplaceToStep error:", error);
    return res.status(500).json({ status: false, message: "Failed to link marketplace item" });
  }
};

module.exports = {
  addMarketplaceItem,
  getMarketplaceItemsByStep,
  getAllMarketplaceItems,
  linkMarketplaceToStep,
};