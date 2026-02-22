const mongoose = require('mongoose');

const majorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อสาขาวิชา'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'กรุณากรอกรหัสสาขา'],
        unique: true,
        trim: true,
        uppercase: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'กรุณาเลือกแผนกวิชา']
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

module.exports = mongoose.model('Major', majorSchema);
