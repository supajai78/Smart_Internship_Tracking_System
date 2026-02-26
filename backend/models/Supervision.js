const mongoose = require('mongoose');

const supervisionSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'กรุณาเลือกวันที่']
    },
    checkInTime: {
        type: Date
    },
    checkInLocation: {
        latitude: Number,
        longitude: Number
    },
    notes: {
        type: String,
        trim: true
    },
    recommendations: {
        type: String,
        trim: true
    },
    studentsVisited: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    images: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Supervision', supervisionSchema);
