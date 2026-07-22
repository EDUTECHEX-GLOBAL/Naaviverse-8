const marketplaceModel = require("../models/MarketplaceModel");
const stepModel = require("../models/StepsModel");
const {
  getRankedMarketplaceItems,
  trackMarketplaceEvent,
  recalculateAllMarketplaceScores,
} = require("../services/MarketplaceRankingService");

// ✅ Activity logging
const { logEvent } = require("./ActivityController");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — fetch partner display info from email
// ─────────────────────────────────────────────────────────────────────────────
async function getPartnerInfo(email) {
  try {
    if (!email) return { displayName: "Partner", partnerType: "" };
    const Partner = require('../models/PartnerModel');
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
      category, access, cost, goal, outcomes, duration, iterations, discount, features
    } = req.body;

    if (!step_id || !layer) {
      return res.status(400).json({ status: false, message: "step_id and layer are required" });
    }

    const item = await marketplaceModel.create({
      name, role, layer, step_id, path_id, partner_email,
      category, access, cost, goal, outcomes, duration, iterations,
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
    const { layer, category } = req.query;
    const filter = { step_id, status: "active" };
    if (layer) filter.layer = layer;
    if (category) filter.category = category;
    const items = await getRankedMarketplaceItems(filter);
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
    if (req.query.category) filter.category = req.query.category;
    if (req.query.partner_email) filter.partner_email = req.query.partner_email.trim();
    const items = await getRankedMarketplaceItems(filter);
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

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/marketplace/admin/update/:id
// Updates an existing marketplace item. Logs "listing" event.
// ─────────────────────────────────────────────────────────────────────────────
const updateMarketplaceItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.__v;
    
    // Find the original item before update for logging
    const originalItem = await marketplaceModel.findById(id);
    if (!originalItem) {
      return res.status(404).json({ 
        status: false, 
        message: "Marketplace item not found" 
      });
    }
    
    // Update the item
    const updatedItem = await marketplaceModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    // ✅ Log marketplace listing updated
    if (updatedItem?.partner_email) {
      const { displayName, partnerType } = await getPartnerInfo(updatedItem.partner_email);
      logEvent({
        role:        "partner",
        email:       updatedItem.partner_email,
        displayName,
        partnerType,
        eventType:   "listing",
        title:       `Marketplace Listing Updated: ${updatedItem.name || "Item"}`,
        desc:        `Updated "${updatedItem.name || "Item"}" (${updatedItem.layer} · ${updatedItem.access || "free"}) in marketplace`,
      }).catch(err => console.error("logEvent updateMarketplaceItem error:", err));
    }
    
    return res.json({ 
      status: true, 
      message: "Item updated successfully",
      data: updatedItem 
    });
  } catch (error) {
    console.error("updateMarketplaceItem error:", error);
    res.status(500).json({ 
      status: false, 
      message: error.message 
    });
  }
};

// GET /api/marketplace/rankings?layer=macro|micro|nano&category=mentor
const getMarketplaceRankings = async (req, res) => {
  try {
    const filter = { status: "active" };
    if (req.query.step_id) filter.step_id = req.query.step_id;
    if (req.query.layer) filter.layer = req.query.layer;
    if (req.query.category) filter.category = req.query.category;

    const items = await getRankedMarketplaceItems(filter);
    return res.json({ status: true, data: items });
  } catch (err) {
    console.error("getMarketplaceRankings error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// POST /api/marketplace/analytics
const updateMarketplaceAnalytics = async (req, res) => {
  try {
    const {
      service_id,
      serviceId,
      marketplaceItemId,
      action,
      value,
      rating,
      partner_email,
    } = req.body;

    const itemId = service_id || serviceId || marketplaceItemId;
    if (!itemId || !action) {
      return res.status(400).json({
        status: false,
        message: "service_id and action are required",
      });
    }

    const analytics = await trackMarketplaceEvent({
      serviceId: itemId,
      action,
      value,
      rating,
      partnerEmail: partner_email,
    });

    if (!analytics) {
      return res.status(404).json({ status: false, message: "Marketplace item not found" });
    }

    return res.json({ status: true, data: analytics });
  } catch (err) {
    console.error("updateMarketplaceAnalytics error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// POST /api/marketplace/recalculate
const recalculateMarketplaceRankings = async (req, res) => {
  try {
    const rankedItems = await recalculateAllMarketplaceScores();
    return res.json({ status: true, data: rankedItems });
  } catch (err) {
    console.error("recalculateMarketplaceRankings error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// GET /api/marketplace/:id
const getMarketplaceItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: false, message: "Invalid ID format" });
    }
    const item = await marketplaceModel.findById(id).lean();
    if (!item) {
      return res.status(404).json({ status: false, message: "Marketplace item not found" });
    }
    
    // Enrich with dynamic checkoutType based on registered partner
    const Partner = require("../models/PartnerModel");
    if (item.partner_email) {
      const partner = await Partner.findOne({ email: item.partner_email.trim() }).select("partnerId").lean();
      if (partner) {
        item.checkoutType = "external";
        item.partnerId = partner.partnerId;
      } else {
        item.checkoutType = "internal";
      }
    } else {
      item.checkoutType = "internal";
    }
    
    return res.json({ status: true, data: item });
  } catch (err) {
    console.error("getMarketplaceItemById error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

// GET /api/marketplace/partner/:partnerId
const getMarketplaceByPartnerId = async (req, res) => {
  try {
    const { partnerId } = req.params;
    if (!partnerId) {
      return res.status(400).json({ status: false, message: "partnerId is required" });
    }

    const Partner = require("../models/PartnerModel");
    const partner = await Partner.findOne({ partnerId: partnerId.trim() }).lean();
    if (!partner) {
      return res.status(404).json({ status: false, message: "Partner not found" });
    }

    // Find all active marketplace items for this partner
    const items = await marketplaceModel.find({
      partner_email: partner.email,
      status: "active"
    }).lean();

    // Enrich all items with dynamic fields
    const enrichedItems = items.map(item => {
      return {
        ...item,
        checkoutType: "external",
        partnerId: partner.partnerId
      };
    });

    return res.json({
      status: true,
      partner: {
        partnerId: partner.partnerId,
        businessName: partner.businessName || partner.username,
        email: partner.email,
        website: partner.website,
        firstName: partner.firstName,
        lastName: partner.lastName
      },
      data: enrichedItems
    });
  } catch (err) {
    console.error("getMarketplaceByPartnerId error:", err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

module.exports = {
  addMarketplaceItem,
  getMarketplaceItemsByStep,
  getAllMarketplaceItems,
  getMarketplaceRankings,
  updateMarketplaceAnalytics,
  recalculateMarketplaceRankings,
  linkMarketplaceToStep,
  updateMarketplaceItem, // ✅ Export the new function
  getMarketplaceItemById,
  getMarketplaceByPartnerId,
};
