const serviceModel = require('../models/services.model');
const axios = require('axios');

const addService = async (req, res) => {
    console.log('Request to add service:', req.body);

    // Initialize the createService object
    let createService = {
        productcreatoremail: req.body.productcreatoremail,
        name: req.body.name,
        icon: req.body.icon,
        description: req.body.description,
        chargingtype: req.body.chargingtype,
        chargingCurrency: { coin: req.body.first_purchase?.coin }, 
        billing_cycle: {}
    };

    // Check and add monthly billing information if it exists
    if (req.body.billing_cycle?.monthly) {
        createService.billing_cycle.monthly = {
            price: req.body.billing_cycle.monthly.price, // Monthly price
            coin: req.body.billing_cycle.monthly.coin // Monthly currency
        };
    }

    // Check and add annual billing information if it exists
    if (req.body.billing_cycle?.annual) {
        createService.billing_cycle.annual = {
            price: req.body.billing_cycle.annual.price, // Annual price
            coin: req.body.billing_cycle.annual.coin // Annual currency
        };
    }

    // Check and add one-time billing information if it exists
    if (req.body.billing_cycle?.lifetime) {
        createService.billing_cycle.lifetime = {
            price: req.body.billing_cycle.lifetime.price, // One-time price
            coin: req.body.billing_cycle.lifetime.coin // One-time currency
        };
    }

    // Add other service attributes
    createService.serviceProvider = req.body.serviceProvider;
    createService.access = req.body.access;
    createService.goal = req.body.goal;
    createService.grade = req.body.gradeData;
    createService.financialSituation = req.body.financialData;
    createService.stream = req.body.stream;
    createService.cost = req.body.cost;
    createService.price = req.body.price; // Consider if this should be dynamic based on billing type
    createService.discountType = req.body.discountType;
    createService.discountAmount = req.body.discountAmount;
    createService.duration = req.body.duration;
    createService.features = req.body.features;
    createService.status = req.body.status;
    createService.outcome = req.body.outcome;
    createService.type = req.body.type;
    createService.iterations = req.body.iterations;

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
            message: 'Service created',
            data: step
        });
        
    } catch (error) {
        console.error("Error creating service:", error);
        return res.status(500).json({
            status: false,
            message: 'Internal server error while creating service'
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

module.exports = {
    addService,
    getServices,
    updateService,
    deleteService,
    restoreService,
    getAllServices,
}
