const mongoose = require('mongoose');

const curriculumSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อหลักสูตร'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'กรุณากรอกรหัสหลักสูตร'],
        unique: true,
        trim: true,
        lowercase: true
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level',
        required: [true, 'กรุณาเลือกระดับชั้น']
    },
    internshipDuration: {
        type: Number,
        required: [true, 'กรุณากรอกจำนวนวันฝึกงาน'],
        min: [1, 'จำนวนวันต้องมากกว่า 0']
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

module.exports = mongoose.model('Curriculum', curriculumSchema);
