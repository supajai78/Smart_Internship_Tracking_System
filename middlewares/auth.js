    // Middleware สำหรับตรวจสอบว่า Login แล้ว
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error_msg', 'กรุณาเข้าสู่ระบบก่อน');
    res.redirect('/auth/login');
};

// Middleware สำหรับตรวจสอบว่ายังไม่ได้ Login
const isGuest = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }
    res.redirect('/');
};

// Middleware สำหรับตรวจสอบ Role
const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error_msg', 'กรุณาเข้าสู่ระบบก่อน');
            return res.redirect('/auth/login');
        }

        if (!roles.includes(req.session.user.role)) {
            req.flash('error_msg', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
            return res.redirect('/');
        }

        next();
    };
};

// Middleware สำหรับ Admin เท่านั้น
const isAdmin = hasRole('admin');

// Middleware สำหรับ Student เท่านั้น
const isStudent = hasRole('student');

// Middleware สำหรับ Mentor เท่านั้น
const isMentor = hasRole('mentor');

// Middleware สำหรับ Teacher เท่านั้น
const isTeacher = hasRole('teacher');

module.exports = {
    isAuthenticated,
    isGuest,
    hasRole,
    isAdmin,
    isStudent,
    isMentor,
    isTeacher
};
