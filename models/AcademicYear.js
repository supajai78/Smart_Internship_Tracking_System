const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'กรุณากรอกชื่อปีการศึกษา'],
        trim: true
    },
    year: {
        type: Number,
        required: [true, 'กรุณากรอกปี พ.ศ.']
    },
    semester: {
        type: Number,
        enum: [1, 2],
        required: [true, 'กรุณาเลือกภาคเรียน']
    },
    startDate: {
        type: Date,
        required: [true, 'กรุณาเลือกวันเริ่มต้นฝึกงาน']
    },
    endDate: {
        type: Date,
        required: [true, 'กรุณาเลือกวันสิ้นสุดฝึกงาน']
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Virtual: ชื่อปีการศึกษาเต็ม
academicYearSchema.virtual('fullName').get(function () {
    return `${this.semester}/${this.year}`;
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
