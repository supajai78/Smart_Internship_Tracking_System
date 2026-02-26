const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อแผนกวิชา'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'กรุณากรอกรหัสแผนก'],
        unique: true,
        trim: true,
        uppercase: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Department', departmentSchema);
