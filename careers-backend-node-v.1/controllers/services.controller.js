const serviceModel = require('../models/services.model');
const axios = require('axios');
const mongoose = require('mongoose');

const addService = async (req, res) => {
    console.log('Request to add service:', req.body);

    // Initialize the createService object with correct mappings
    let createService = {
        productcreatoremail: req.body.productcreatoremail,
        name: req.body.product_name, // Correct field mapping
        icon: req.body.product_icon,
        description: req.body.full_description,
        chargingtype: req.body.billingType || "default", // Ensure billingType is included
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
        billing_cycle: {}, // Initialize billing cycle
    };

    // Add billing cycle details if available
    if (req.body.billing_cycle?.monthly) {
        createService.billing_cycle.monthly = {
            price: req.body.billing_cycle.monthly.price || 0,
            coin: req.body.billing_cycle.monthly.coin,
        };
    }

    if (req.body.billing_cycle?.lifetime) {
        createService.billing_cycle.lifetime = {
            price: req.body.billing_cycle.lifetime.price || 0,
            coin: req.body.billing_cycle.lifetime.coin,
        };
    }

    // Additional service attributes
    createService.serviceProvider = req.body.serviceProvider || "";
    createService.access = req.body.access || "";
    createService.goal = req.body.goal || "";
    createService.grade = req.body.gradeData || [];
    createService.financialSituation = req.body.financialData || "";
    createService.stream = req.body.stream || "";
    createService.cost = req.body.cost || 0;
    createService.price = req.body.price || 0;
    createService.discountType = req.body.discountType || "";
    createService.discountAmount = req.body.discountAmount || 0;
    createService.duration = req.body.duration || 0;
    createService.features = req.body.features || [];
    createService.status = req.body.status || "active";
    createService.outcome = req.body.outcome || "";
    createService.type = req.body.type || "";
    createService.iterations = req.body.iterations || [];

    try {
        let step = await serviceModel.create(createService);

        if (!step) {
            return res.json({
                status: false,
                message: 'Error in creating service',
            });
        }

        return res.json({
            status: true,
            message: 'Service created successfully',
            data: step,
        });

    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while creating service',
            error: error.message,
        });
    }
};


const getServices = async (req, res) => {
    // Check if product creator email is provided
    if (!req.query.productcreatoremail) {
        return res.json({
            status: false,
            message: 'Product creator email is required.',
        });
    }

    try {
        // Fetch services from the database based on the product creator email
        let services = await serviceModel.find({ productcreatoremail: req.query.productcreatoremail });

        // Check if any services were found
        if (services.length === 0) {
            return res.json({
                status: false,
                message: 'No data found for the provided product creator email.',
            });
        }

        // Return the found services
        return res.json({
            status: true,
            total: services.length,
            message: 'Service data found',
            data: services,
        });
        
    } catch (error) {
        console.error("Error fetching services:", error); // Log any errors
        return res.status(500).json({
            status: false,
            message: 'Error fetching services',
            error: error.message,
        });
    }
};

const updateService = async (req, res) => {
    let updateData = {}
    if (req.body.name) updateData.name = req.body.name;
    if (req.body.grade) updateData.grade = req.body.grade;
    if(req.body.description) updateData.description = req.body.description;
    if(req.body.financialSituation) updateData.financialSituation = req.body.financialSituation;
    if(req.body.stream) updateData.stream = req.body.stream;
    if(req.body.serviceProvider) updateData.serviceProvider = req.body.serviceProvider;
    if(req.body.access) updateData.access = req.body.access;
    if(req.body.goal) updateData.goal = req.body.goal;
    if(req.body.icon) updateData.icon = req.body.icon;
    if (req.body.cost) updateData.cost = req.body.cost;
    if (req.body.price) updateData.price = req.body.price;
    if (req.body.discountType) updateData.discountType = req.body.discountType;
    if (req.body.discountAmount) updateData.discountAmount = req.body.discountAmount;
    if (req.body.duration) updateData.duration = req.body.duration;
    if (req.body.features) updateData.features = req.body.features;
    if (req.body.status) updateData.status = req.body.status;
    if (req.body.outcome) updateData.outcome = req.body.outcome;
    if (req.body.type) updateData.type = req.body.type;
    if (req.body.program) updateData.program = req.body.program;

    let updateServiceData = await serviceModel.findOneAndUpdate({ _id: req.params.id}, updateData, { new: true });
    // console.log(updateStepData)
    if (!updateServiceData) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Service updated',
        data: updateServiceData
    })

}

const deleteService = async (req, res) => {
    let deleteServiceData = await serviceModel.findOneAndDelete({ _id: req.params.id }, { status: "delete" }, { new: true });
    if (!deleteServiceData) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Service deleted',
        data: deleteServiceData
    })
}

const restoreService = async (req, res) => {
    let restoreServiceData = await serviceModel.findOneAndUpdate({ _id: req.params.id, status: "delete" }, { status: "active" }, { new: true });
    if (!restoreServiceData) {
        return res.json({
            status: false,
            message: 'Data not found',
        })
    }
    return res.json({
        status: true,
        message: 'Service restored',
        data: restoreServiceData
    })
}


const getAllServices = async (req, res) => {
    const { status } = req.query;

    // Validate the status parameter
    if (!status || (status !== "active" && status !== "inactive")) {
        return res.status(400).json({
            status: false,
            message: 'Status parameter is required and must be either "active" or "inactive".'
        });
    }

    try {
        // Fetch services from the database based on their status
        const services = await serviceModel.find({ status }); // Assuming 'status' is a field in your service model

        // Check if any services were found
        if (services.length === 0) {
            return res.json({
                status: true,
                message: 'No services found for the specified status.',
                data: []
            });
        }

        // Return the found services
        return res.json({
            status: true,
            total: services.length,
            message: 'Service data found',
            data: services,
        });
        
    } catch (error) {
        console.error("Error fetching services:", error); // Log any errors
        return res.status(500).json({
            status: false,
            message: 'Error fetching services',
            error: error.message,
        });
    }
};  

const updateServiceIcon = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { icon } = req.body; // Expecting icon URL in the request body

        if (!icon) {
            return res.status(400).json({ status: false, message: "Icon URL is required" });
        }

        const objectId = new mongoose.Types.ObjectId(serviceId);

        // Find the service using _id and update its icon
        const updatedService = await serviceModel.findByIdAndUpdate(
            objectId, // Find by _id
            { icon, updatedAt: new Date() }, // Update icon and timestamp
            { new: true } // Return updated document
        );
        res.json({ status: true, message: "Icon updated successfully", data: updatedService });

    } catch (error) {
        console.error("Error updating service icon:", error);
        res.status(500).json({ status: false, message: "Internal server error" });
    }
};

module.exports = {
    addService,
    getServices,
    updateService,
    deleteService,
    restoreService,
    getAllServices,
    updateServiceIcon,
}
