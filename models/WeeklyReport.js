const mongoose = require('mongoose');

const weeklyReportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    weekNumber: {
        type: Number,
        required: [true, 'กรุณากรอกสัปดาห์ที่']
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    summary: {
        type: String,
        trim: true
    },
    dailyLogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DailyLog'
    }],
    status: {
        type: String,
        enum: ['draft', 'submitted', 'reviewed'],
        default: 'draft'
    },
    mentorComment: {
        type: String,
        trim: true
    },
    teacherComment: {
        type: String,
        trim: true
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    submittedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index
weeklyReportSchema.index({ student: 1, weekNumber: 1 });

module.exports = mongoose.model('WeeklyReport', weeklyReportSchema);
