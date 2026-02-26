const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: [true, 'กรุณาเลือกวันที่']
    },
    workDescription: {
        type: String,
        required: [true, 'กรุณากรอกรายละเอียดงานที่ทำ'],
        trim: true
    },
    images: [{
        type: String
    }],
    hoursWorked: {
        type: Number,
        min: [0, 'ชั่วโมงทำงานต้องไม่ติดลบ'],
        max: [24, 'ชั่วโมงทำงานต้องไม่เกิน 24']
    }
}, {
    timestamps: true
});

// Index สำหรับค้นหา
dailyLogSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
