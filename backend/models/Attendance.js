const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    checkInMethod: {
        type: String,
        enum: ['gps', 'qr'],
        default: 'gps'
    },
    checkOutMethod: {
        type: String,
        enum: ['gps', 'qr'],
        default: 'gps'
    },
    checkInLocation: {
        latitude: Number,
        longitude: Number
    },
    checkOutLocation: {
        latitude: Number,
        longitude: Number
    },
    status: {
        type: String,
        enum: ['present', 'late', 'absent', 'leave'],
        default: 'absent'
    },
    note: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index สำหรับค้นหาเร็วขึ้น
attendanceSchema.index({ student: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
