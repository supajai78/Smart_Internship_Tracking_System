const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    evaluator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    evaluatorRole: {
        type: String,
        enum: ['mentor', 'teacher'],
        required: true
    },
    type: {
        type: String,
        enum: ['behavior', 'skill', 'report', 'presentation', 'work'],
        required: [true, 'กรุณาเลือกประเภทการประเมิน']
    },
    academicYear: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AcademicYear'
    },
    scores: [{
        criteria: {
            type: String,
            required: true
        },
        maxScore: {
            type: Number,
            required: true
        },
        score: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    totalScore: {
        type: Number,
        min: 0
    },
    maxTotalScore: {
        type: Number,
        min: 0
    },
    comment: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// คำนวณคะแนนรวมก่อนบันทึก
evaluationSchema.pre('save', function (next) {
    if (this.scores && this.scores.length > 0) {
        this.totalScore = this.scores.reduce((sum, item) => sum + item.score, 0);
        this.maxTotalScore = this.scores.reduce((sum, item) => sum + item.maxScore, 0);
    }
    next();
});

// Virtual: เปอร์เซ็นต์คะแนน
evaluationSchema.virtual('percentage').get(function () {
    if (!this.maxTotalScore || this.maxTotalScore === 0) return 0;
    return Math.round((this.totalScore / this.maxTotalScore) * 100);
});

module.exports = mongoose.model('Evaluation', evaluationSchema);
