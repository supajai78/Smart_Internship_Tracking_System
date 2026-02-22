const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// หน้า Login
router.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    res.render('auth/login', {
        title: 'เข้าสู่ระบบ',
        layout: 'layouts/auth'
    });
});

// ดำเนินการ Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // หา User
        const user = await User.findOne({ username });
        if (!user) {
            req.flash('error_msg', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            return res.redirect('/auth/login');
        }

        // ตรวจสอบรหัสผ่าน
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            req.flash('error_msg', 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            return res.redirect('/auth/login');
        }

        // สร้าง Session
        req.session.user = {
            id: user._id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatar: user.avatar
        };

        req.flash('success_msg', 'เข้าสู่ระบบสำเร็จ');
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        res.redirect('/auth/login');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

module.exports = router;
