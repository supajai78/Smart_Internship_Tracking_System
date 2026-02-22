const express = require('express');
const router = express.Router();
const { isStudent } = require('../middlewares/auth');
const {
    User,
    Company,
    Attendance,
    LeaveRequest,
    DailyLog,
    WeeklyReport,
    AcademicYear,
    Curriculum
} = require('../models');

// ใช้ middleware ตรวจสอบว่าเป็น Student
router.use(isStudent);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
    try {
        const student = await User.findById(req.session.user.id)
            .populate('company')
            .populate('curriculum')
            .populate('teacher');

        // สถิติการเข้างาน
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [
            todayAttendance,
            monthlyAttendance,
            totalAttendance,
            pendingLeaves,
            totalDailyLogs
        ] = await Promise.all([
            Attendance.findOne({ student: req.session.user.id, date: { $gte: today } }),
            Attendance.countDocuments({
                student: req.session.user.id,
                date: { $gte: thisMonth },
                status: { $in: ['present', 'late'] }
            }),
            Attendance.countDocuments({
                student: req.session.user.id,
                status: { $in: ['present', 'late'] }
            }),
            LeaveRequest.countDocuments({ student: req.session.user.id, status: 'pending' }),
            DailyLog.countDocuments({ student: req.session.user.id })
        ]);

        // คำนวณจำนวนวันที่ต้องฝึกงาน
        const requiredDays = student.curriculum ? student.curriculum.internshipDuration : 60;
        const progress = Math.min(100, Math.round((totalAttendance / requiredDays) * 100));

        res.render('student/dashboard', {
            title: 'แดชบอร์ด',
            student,
            stats: {
                todayAttendance,
                monthlyAttendance,
                totalAttendance,
                requiredDays,
                progress,
                pendingLeaves,
                totalDailyLogs
            }
        });
    } catch (error) {
        console.error('Student Dashboard error:', error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/');
    }
});

// ==================== ATTENDANCE ====================
router.get('/attendance', async (req, res) => {
    try {
        const student = await User.findById(req.session.user.id).populate('company');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayAttendance = await Attendance.findOne({
            student: req.session.user.id,
            date: { $gte: today }
        });

        // ประวัติการลงเวลา 30 วันล่าสุด
        const attendanceHistory = await Attendance.find({ student: req.session.user.id })
            .sort({ date: -1 })
            .limit(30);

        res.render('student/attendance', {
            title: 'ลงเวลาปฏิบัติงาน',
            student,
            company: student.company,
            todayAttendance,
            attendanceHistory
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/dashboard');
    }
});

// GPS Check-in
router.post('/attendance/checkin', async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        const student = await User.findById(req.session.user.id).populate('company');

        if (!student.company) {
            return res.json({ success: false, message: 'ไม่พบข้อมูลสถานประกอบการ' });
        }

        // ตรวจสอบระยะทาง (ถ้าเป็น GPS)
        if (method === 'gps') {
            const distance = calculateDistance(
                latitude, longitude,
                student.company.latitude, student.company.longitude
            );

            if (distance > student.company.checkInRadius) {
                return res.json({
                    success: false,
                    message: `คุณอยู่ห่างจากสถานประกอบการ ${Math.round(distance)} เมตร (อนุญาต ${student.company.checkInRadius} เมตร)`
                });
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // ตรวจสอบว่าลงเวลาแล้วหรือยัง
        let attendance = await Attendance.findOne({
            student: req.session.user.id,
            date: { $gte: today }
        });

        if (attendance && attendance.checkInTime) {
            return res.json({ success: false, message: 'คุณได้ลงเวลาเข้างานแล้ววันนี้' });
        }

        const now = new Date();
        const checkInHour = now.getHours();
        const status = checkInHour >= 9 ? 'late' : 'present'; // สาย = หลัง 9 โมง

        if (attendance) {
            attendance.checkInTime = now;
            attendance.checkInMethod = method;
            attendance.checkInLocation = { latitude, longitude };
            attendance.status = status;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                student: req.session.user.id,
                date: today,
                checkInTime: now,
                checkInMethod: method,
                checkInLocation: { latitude, longitude },
                status
            });
        }

        res.json({
            success: true,
            message: status === 'late' ? 'ลงเวลาเข้างานสำเร็จ (สาย)' : 'ลงเวลาเข้างานสำเร็จ',
            time: now.toLocaleTimeString('th-TH')
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

// GPS Check-out
router.post('/attendance/checkout', async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        const student = await User.findById(req.session.user.id).populate('company');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            student: req.session.user.id,
            date: { $gte: today }
        });

        if (!attendance || !attendance.checkInTime) {
            return res.json({ success: false, message: 'คุณยังไม่ได้ลงเวลาเข้างาน' });
        }

        if (attendance.checkOutTime) {
            return res.json({ success: false, message: 'คุณได้ลงเวลาออกงานแล้ววันนี้' });
        }

        const now = new Date();
        attendance.checkOutTime = now;
        attendance.checkOutMethod = method;
        attendance.checkOutLocation = { latitude, longitude };
        await attendance.save();

        res.json({
            success: true,
            message: 'ลงเวลาออกงานสำเร็จ',
            time: now.toLocaleTimeString('th-TH')
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'เกิดข้อผิดพลาด' });
    }
});

// ==================== LEAVE REQUESTS ====================
router.get('/leave-requests', async (req, res) => {
    try {
        const leaveRequests = await LeaveRequest.find({ student: req.session.user.id })
            .populate('approvedBy')
            .sort({ createdAt: -1 });

        res.render('student/leave-requests/index', {
            title: 'รายการขอลางาน',
            leaveRequests
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/dashboard');
    }
});

router.get('/leave-requests/create', (req, res) => {
    res.render('student/leave-requests/create', { title: 'ขอลางาน' });
});

router.post('/leave-requests', async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;

        await LeaveRequest.create({
            student: req.session.user.id,
            type,
            startDate,
            endDate,
            reason
        });

        req.flash('success_msg', 'ส่งคำขอลางานสำเร็จ');
        res.redirect('/student/leave-requests');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/student/leave-requests/create');
    }
});

// ==================== DAILY LOGS ====================
router.get('/daily-logs', async (req, res) => {
    try {
        const dailyLogs = await DailyLog.find({ student: req.session.user.id })
            .sort({ date: -1 })
            .limit(30);

        res.render('student/daily-logs/index', {
            title: 'บันทึกงานรายวัน',
            dailyLogs
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/dashboard');
    }
});

router.get('/daily-logs/create', (req, res) => {
    res.render('student/daily-logs/create', { title: 'เพิ่มบันทึกรายวัน' });
});

router.post('/daily-logs', async (req, res) => {
    try {
        const { date, workDescription, hoursWorked } = req.body;

        // ตรวจสอบว่ามีบันทึกวันนี้แล้วหรือยัง
        const existing = await DailyLog.findOne({
            student: req.session.user.id,
            date: new Date(date)
        });

        if (existing) {
            req.flash('error_msg', 'คุณได้บันทึกงานวันนี้ไปแล้ว');
            return res.redirect('/student/daily-logs');
        }

        await DailyLog.create({
            student: req.session.user.id,
            date,
            workDescription,
            hoursWorked: hoursWorked || 8
        });

        req.flash('success_msg', 'บันทึกงานสำเร็จ');
        res.redirect('/student/daily-logs');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/daily-logs/create');
    }
});

router.get('/daily-logs/:id/edit', async (req, res) => {
    try {
        const dailyLog = await DailyLog.findOne({
            _id: req.params.id,
            student: req.session.user.id
        });

        if (!dailyLog) {
            req.flash('error_msg', 'ไม่พบข้อมูล');
            return res.redirect('/student/daily-logs');
        }

        res.render('student/daily-logs/edit', { title: 'แก้ไขบันทึก', dailyLog });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/daily-logs');
    }
});

router.post('/daily-logs/:id', async (req, res) => {
    try {
        const { workDescription, hoursWorked } = req.body;

        await DailyLog.findOneAndUpdate(
            { _id: req.params.id, student: req.session.user.id },
            { workDescription, hoursWorked }
        );

        req.flash('success_msg', 'แก้ไขบันทึกสำเร็จ');
        res.redirect('/student/daily-logs');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/daily-logs');
    }
});

// ==================== WEEKLY REPORTS ====================
router.get('/weekly-reports', async (req, res) => {
    try {
        const weeklyReports = await WeeklyReport.find({ student: req.session.user.id })
            .sort({ weekNumber: -1 });

        res.render('student/weekly-reports/index', {
            title: 'รายงานรายสัปดาห์',
            weeklyReports
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/student/dashboard');
    }
});

// ==================== HELPER FUNCTIONS ====================
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

module.exports = router;
