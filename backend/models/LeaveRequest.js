const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['sick', 'personal'],
        required: [true, 'กรุณาเลือกประเภทการลา']
    },
    startDate: {
        type: Date,
        required: [true, 'กรุณาเลือกวันที่เริ่มลา']
    },
    endDate: {
        type: Date,
        required: [true, 'กรุณาเลือกวันที่สิ้นสุด']
    },
    reason: {
        type: String,
        required: [true, 'กรุณากรอกเหตุผลการลา'],
        trim: true
    },
    attachment: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectReason: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Virtual: จำนวนวันลา
leaveRequestSchema.virtual('days').get(function () {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
});

// Virtual: ประเภทการลาเป็นภาษาไทย
leaveRequestSchema.virtual('typeThai').get(function () {
    return this.type === 'sick' ? 'ลาป่วย' : 'ลากิจ';
});

// Virtual: สถานะเป็นภาษาไทย
leaveRequestSchema.virtual('statusThai').get(function () {
    switch (this.status) {
        case 'pending': return 'รอการอนุมัติ';
        case 'approved': return 'อนุมัติแล้ว';
        case 'rejected': return 'ไม่อนุมัติ';
        default: return this.status;
    }
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
