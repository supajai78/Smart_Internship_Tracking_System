const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'กรุณากรอกชื่อผู้ใช้'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'กรุณากรอกรหัสผ่าน'],
        minlength: [6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร']
    },
    role: {
        type: String,
        enum: ['admin', 'student', 'mentor', 'teacher'],
        required: [true, 'กรุณาเลือกบทบาท']
    },
    firstName: {
        type: String,
        required: [true, 'กรุณากรอกชื่อ'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'กรุณากรอกนามสกุล'],
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    major: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Major'
    },
    level: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Level'
    },
    curriculum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Curriculum'
    },
    section: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section'
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    studentId: {
        type: String,
        trim: true
    },
    lineNotifyToken: {
        type: String
    },
    avatar: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password ก่อนบันทึก
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// เปรียบเทียบ password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Virtual: ชื่อเต็ม
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('User', userSchema);
