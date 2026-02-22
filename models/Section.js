const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อห้อง'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'กรุณากรอกรหัสห้อง'],
        trim: true,
        uppercase: true
    },
    major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major',
        required: [true, 'กรุณาเลือกสาขาวิชา']
    },
    academicYear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicYear',
        required: [true, 'กรุณาเลือกปีการศึกษา']
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level'
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

// Compound index for uniqueness within academic year
sectionSchema.index({ code: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
