const serviceModel = require('../models/services.model');
const mongoose = require('mongoose');

// ================== ADD SERVICE ==================
const addService = async (req, res) => {
    console.log('Request to add service:', req.body);

    let createService = {
        productcreatoremail: req.body.productcreatoremail,
        name: req.body.product_name,
        icon: req.body.product_icon,
        description: req.body.full_description,
        chargingtype: req.body.billingType || "default",
        revenue_account: req.body.revenue_account,
        client_app: req.body.client_app,
        product_category_code: req.body.product_category_code,
        sub_category_code: req.body.sub_category_code,
        custom_product_label: req.body.custom_product_label,
        points_creation: req.body.points_creation,
        sub_text: req.body.sub_text,
        first_purchase: req.body.first_purchase,
        grace_period: req.body.grace_period || 0,
        first_retry: req.body.first_retry || 0,
        second_retry: req.body.second_retry || 0,
        staking_allowed: req.body.staking_allowed,
        staking_details: req.body.staking_details,
        billing_cycle: {},
        serviceProvider: req.body.serviceProvider || "",
        access: req.body.access || "",
        goal: req.body.goal || "",
        grade: req.body.gradeData || [],
        financialSituation: req.body.financialData || "",
        stream: req.body.stream || "",
        cost: req.body.cost || 0,
        price: req.body.price || 0,
        discountType: req.body.discountType || "",
        discountAmount: req.body.discountAmount || 0,
        duration: req.body.duration || 0,
        features: req.body.features || [],
        status: req.body.status || "active",
        outcome: req.body.outcome || "",
        type: req.body.type || "",
        iterations: req.body.iterations || [],
    };

    // ✅ Save step_id (IMPORTANT!)
    if (req.body.step_id) {
        createService.step_id = req.body.step_id;
    }

    // Payment plans
    if (req.body.billing_cycle?.monthly) {
        createService.billing_cycle.monthly = {
            price: req.body.billing_cycle.monthly.price || 0,
            coin: req.body.billing_cycle.monthly.coin,
        };
    }

    if (req.body.billing_cycle?.annual) {
        createService.billing_cycle.annual = {
            price: req.body.billing_cycle.annual.price || 0,
            coin: req.body.billing_cycle.annual.coin,
        };
    }

    try {
        let service = await serviceModel.create(createService);
        return res.json({
            status: true,
            message: "Service created successfully",
            data: service,
        });
    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({
            status: false,
            message: "Internal error while creating service",
            error: error.message,
        });
    }
};

// ================== GET SERVICES BY CREATOR ==================
const getServices = async (req, res) => {
    if (!req.query.productcreatoremail) {
        return res.json({ status: false, message: "Product creator email required" });
    }
    try {
        let services = await serviceModel.find({ productcreatoremail: req.query.productcreatoremail });
        if (!services.length) {
    return res.status(200).json({
        status: true,
        data: []
    });
}


        return res.json({
            status: true,
            total: services.length,
            message: "Service data found",
            data: services,
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error fetching services",
            error: error.message,
        });
    }
};

// ================== UPDATE SERVICE ==================
const updateService = async (req, res) => {
    let updateData = req.body;
    let updated = await serviceModel.findOneAndUpdate(
        { _id: req.params.id },
        updateData,
        { new: true }
    );

    if (!updated) return res.json({ status: false, message: "Not found" });

    return res.json({ status: true, message: "Service updated", data: updated });
};

// ================== DELETE SERVICE ==================
const deleteService = async (req, res) => {
    let deleted = await serviceModel.findOneAndDelete({ _id: req.params.id });
    if (!deleted) return res.json({ status: false, message: "Not found" });

    return res.json({ status: true, message: "Service deleted", data: deleted });
};

// ================== RESTORE SERVICE ==================
const restoreService = async (req, res) => {
    let restored = await serviceModel.findOneAndUpdate(
        { _id: req.params.id, status: "delete" },
        { status: "active" },
        { new: true }
    );

    if (!restored) return res.json({ status: false, message: "Not found" });

    return res.json({ status: true, message: "Service restored", data: restored });
};

// ================== GET SERVICES BY STEP (CRITICAL) ==================
const getServicesByStep = async (req, res) => {
    try {
        const { step_id } = req.query;

        if (!step_id) {
            return res.status(400).json({ status: false, message: "step_id is required" });
        }

        const services = await serviceModel.find({ step_id });

        // ✅ Always return 200 & empty list if no services
        if (!services.length) {
            return res.status(200).json({
                status: true,
                data: []
            });
        }

        return res.json({ status: true, data: services });

    } catch (error) {
        console.error("Error fetching services by step:", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};


module.exports = {
    addService,
    getServices,
    updateService,
    deleteService,
    restoreService,
    getAllServices: getServices,  // reuse
    updateServiceIcon: updateService,
    getServicesByStep
};
