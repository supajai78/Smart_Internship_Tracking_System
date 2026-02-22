const express = require('express');
const router = express.Router();

// หน้าแรก - Redirect ไปหน้า Login
router.get('/', (req, res) => {
    if (req.session.user) {
        // ถ้า Login แล้ว redirect ตาม role
        const role = req.session.user.role;
        switch (role) {
            case 'admin':
                return res.redirect('/admin/dashboard');
            case 'student':
                return res.redirect('/student/dashboard');
            case 'mentor':
                return res.redirect('/mentor/dashboard');
            case 'teacher':
                return res.redirect('/teacher/dashboard');
            default:
                return res.redirect('/auth/login');
        }
    }
    res.redirect('/auth/login');
});

module.exports = router;
