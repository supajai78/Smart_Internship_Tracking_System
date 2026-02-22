const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อระดับชั้น'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'กรุณากรอกรหัสระดับ'],
        unique: true,
        trim: true,
        lowercase: true
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

module.exports = mongoose.model('Level', levelSchema);
