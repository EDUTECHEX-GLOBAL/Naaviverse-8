const mongoose = require('mongoose');

const servicesSchema = new mongoose.Schema({
    productcreatoremail: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    chargingtype: { type: String },
    chargingCurrency: { coin: { type: String } },
    
    billing_cycle: {
        monthly: {
            price: { type: Number },
            coin: { type: String }
        },
        annual: {
            price: { type: Number },
            coin: { type: String }
        },
        lifetime: {
            price: { type: Number },
            coin: { type: String }
        }
    },

    serviceProvider: { type: String },
    access: { type: String },
    goal: { type: String },
    icon: { type: String },
    cost: { type: Number },
    price: { type: Number },
    discountType: { type: String },
    discountAmount: { type: Number },
    duration: { type: Number },

    features: { type: [String] },
    iterations: { type: [String] },

    status: { type: String, enum: ['active', 'inactive', 'delete'], default: 'active' },
    outcome: { type: String },
    

   


    grace_period: { type: Number, default: 0 },
    first_retry: { type: Number, default: 0 },
    second_retry: { type: Number, default: 0 },
    staking_allowed: { type: Boolean, default: false },
    staking_details: { type: mongoose.Schema.Types.Mixed, default: {} } // Allows any structure

}, {
    timestamps: true,
});

module.exports = mongoose.model('naavi_services', servicesSchema);
