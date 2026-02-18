const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
        required: true
    },
    fees: {
        type: Number,
        required: true
    },
    experience: {
        type: Number
    },
    availableSlots: [{
        day: String,
        startTime: String,
        endTime: String
    }]
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
