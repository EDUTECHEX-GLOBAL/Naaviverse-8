const marketplaceModel = require("../models/marketplace.model");
const stepModel = require("../models/steps.model");

/* =====================================
   ADD MARKETPLACE ITEM
===================================== */

const addMarketplaceItem = async (req, res) => {
  try {

    const {
      name,
      role,
      layer,
      step_id,
      path_id,
      partner_email,
      access,
      cost,
      goal,
      outcomes,
      duration,
      iterations,
      discount,
      features
    } = req.body;

    if (!step_id || !layer) {
      return res.status(400).json({
        status: false,
        message: "step_id and layer are required"
      });
    }

    /* 1️⃣ Create marketplace item */

    const item = await marketplaceModel.create({
      name,
      role,
      layer,
      step_id,
      path_id,
      partner_email,
      access,
      cost,
      goal,
      outcomes,
      duration,
      iterations,
      discount,
      features,
      status: "active"
    });

    /* 2️⃣ Push into step layer */

    const layerField = `${layer}_marketplace`;

    await stepModel.findByIdAndUpdate(
      step_id,
      {
        $push: {
          [layerField]: item
        }
      },
      { new: true }
    );

    return res.json({
      status: true,
      message: "Marketplace item added to step",
      data: item
    });

  } catch (error) {

    console.error("Add marketplace error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to create marketplace item"
    });
  }
};


/* =====================================
   GET MARKETPLACE ITEMS (BY PARTNER)
===================================== */

const getMarketplaceItems = async (req, res) => {

  try {

    const email = req.query.email;

    if (!email) {
      return res.json({
        status: false,
        message: "Email required"
      });
    }

    const items = await marketplaceModel
      .find({
        partner_email: email,
        status: "active"
      })
      .sort({ createdAt: -1 });

    return res.json({
      status: true,
      data: items
    });

  } catch (error) {

    console.error("Get marketplace error:", error);

    return res.status(500).json({
      status: false,
      message: "Failed to fetch marketplace items"
    });
  }
};


/* =====================================
   GET MARKETPLACE ITEMS BY STEP
===================================== */

const getMarketplaceItemsByStep = async (req, res) => {

  try {

    const step_id = req.params.step_id;

    const items = await marketplaceModel.find({
      step_id,
      status: "active"
    });

    return res.json({
      status: true,
      data: items
    });

  } catch (error) {

    return res.status(500).json({
      status: false
    });

  }

};
/* =====================================
   GET ALL MARKETPLACE ITEMS (ADMIN)
===================================== */
const getAllMarketplaceItems = async (req, res) => {
  try {
    const items = await marketplaceModel
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("step_id", "name title") // Populate step details if needed
      .populate("path_id", "name title"); // Populate path details if needed

    return res.json({
      status: true,
      data: items
    });

  } catch (error) {
    console.error("Get all marketplace error:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch marketplace items"
    });
  }
};

module.exports = {
  addMarketplaceItem,
  getMarketplaceItems,
  getMarketplaceItemsByStep,
  getAllMarketplaceItems
};