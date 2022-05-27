const mongoose = require('mongoose');

const launchesSchema = mongoose.Schema({
    flightNumber: {
        type: Number,
        required: true,
        default: 100,

    },
    mission: {
        type: String,
        required: true,
    },
    rocket: {
        type: String,
        required: true,
    },
    launchDate: {
        type: Date,
        required: true
    },
    target: {
        type: String,

    },


    upcoming: {
        type: Boolean,
        required: true
    },
    success: {
        type: Boolean,
        required: true,
        default: true,
    },
    customers:
    {
        type: [String],
    },

});

// Connects launchesSchema with "launches" collection

module.exports = mongoose.model('Launch', launchesSchema);