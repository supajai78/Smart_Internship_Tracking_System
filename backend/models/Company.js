const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อสถานประกอบการ'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'กรุณากรอกที่อยู่'],
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    contactPerson: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number,
        required: [true, 'กรุณากรอกละติจูด']
    },
    longitude: {
        type: Number,
        required: [true, 'กรุณากรอกลองจิจูด']
    },
    checkInRadius: {
        type: Number,
        default: 500 // meters
    },
    qrCode: {
        type: String
    },
    qrCodeExpiry: {
        type: Date
    },
    isMOU: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Company', companySchema);
