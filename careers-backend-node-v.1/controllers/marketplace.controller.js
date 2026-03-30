const marketplaceModel = require("../models/marketplace.model");
const stepModel = require("../models/steps.model");

/**
 * POST /api/marketplace/add
 * Creates a new marketplace item AND pushes its _id into the step's
 * [layer]_marketplace array. The item is immediately "attached" to the step.
 */
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

    return res.json({ status: true, data: item });
  } catch (error) {
    console.error("addMarketplaceItem error:", error);
    res.status(500).json({ status: false, message: error.message });
  }
};

/**
 * GET /api/marketplace/step/:step_id?layer=macro|micro|nano
 * Returns all marketplace items attached to a specific step (and optionally layer).
 * Used to populate the "ATTACHED" section in the admin panel.
 */
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

/**
 * GET /api/marketplace/admin/get-all?layer=macro|micro|nano
 * Returns ALL active marketplace items for a given layer (no unattached filter).
 * The frontend computes "available" by subtracting already-attached items.
 */
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

/**
 * PATCH /api/marketplace/link-step
 * Body: { item_id, step_id }   (step_id can be null to detach)
 *
 * Updates the marketplace item's step_id field.
 * The step's [layer]_marketplace array is managed separately via
 * PUT /api/steps/update/:id from the frontend.
 */
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