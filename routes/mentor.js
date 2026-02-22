const express = require('express');
const router = express.Router();
const { isMentor } = require('../middlewares/auth');
const {
    User,
    Company,
    Attendance,
    LeaveRequest,
    DailyLog,
    Evaluation
} = require('../models');

// ใช้ middleware ตรวจสอบว่าเป็น Mentor
router.use(isMentor);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
    try {
        const mentor = await User.findById(req.session.user.id).populate('company');

        if (!mentor.company) {
            return res.render('mentor/dashboard', {
                title: 'แดชบอร์ด',
                mentor,
                students: [],
                stats: { studentCount: 0, pendingLeaves: 0, todayAttendance: 0 }
            });
        }

        // หานักศึกษาในสถานประกอบการเดียวกัน
        const students = await User.find({
            role: 'student',
            company: mentor.company._id
        }).populate('major').populate('level');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const studentIds = students.map(s => s._id);

        const [pendingLeaves, todayAttendance] = await Promise.all([
            LeaveRequest.countDocuments({
                student: { $in: studentIds },
                status: 'pending'
            }),
            Attendance.countDocuments({
                student: { $in: studentIds },
                date: { $gte: today },
                status: { $in: ['present', 'late'] }
            })
        ]);

        res.render('mentor/dashboard', {
            title: 'แดชบอร์ด',
            mentor,
            students: students.slice(0, 5), // แสดง 5 คนล่าสุด
            stats: {
                studentCount: students.length,
                pendingLeaves,
                todayAttendance
            }
        });
    } catch (error) {
        console.error('Mentor Dashboard error:', error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/');
    }
});

// ==================== STUDENTS ====================
router.get('/students', async (req, res) => {
    try {
        const mentor = await User.findById(req.session.user.id).populate('company');

        const students = await User.find({
            role: 'student',
            company: mentor.company ? mentor.company._id : null
        })
            .populate('major')
            .populate('level')
            .populate('curriculum');

        res.render('mentor/students/index', {
            title: 'นักศึกษาในสังกัด',
            students
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/dashboard');
    }
});

// ดูรายละเอียดนักศึกษา
router.get('/students/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('major')
            .populate('level')
            .populate('curriculum')
            .populate('company')
            .populate('teacher');

        const [attendances, dailyLogs, leaveRequests] = await Promise.all([
            Attendance.find({ student: req.params.id }).sort({ date: -1 }).limit(30),
            DailyLog.find({ student: req.params.id }).sort({ date: -1 }).limit(10),
            LeaveRequest.find({ student: req.params.id }).sort({ createdAt: -1 }).limit(10)
        ]);

        // สถิติ
        const totalAttendance = await Attendance.countDocuments({
            student: req.params.id,
            status: { $in: ['present', 'late'] }
        });

        res.render('mentor/students/show', {
            title: 'ข้อมูลนักศึกษา',
            student,
            attendances,
            dailyLogs,
            leaveRequests,
            totalAttendance
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/students');
    }
});

// ==================== LEAVE REQUESTS ====================
router.get('/leave-requests', async (req, res) => {
    try {
        const mentor = await User.findById(req.session.user.id).populate('company');

        const students = await User.find({
            role: 'student',
            company: mentor.company ? mentor.company._id : null
        });
        const studentIds = students.map(s => s._id);

        const leaveRequests = await LeaveRequest.find({
            student: { $in: studentIds }
        })
            .populate('student')
            .populate('approvedBy')
            .sort({ createdAt: -1 });

        res.render('mentor/leave-requests/index', {
            title: 'อนุมัติใบลา',
            leaveRequests
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/dashboard');
    }
});

// อนุมัติใบลา
router.post('/leave-requests/:id/approve', async (req, res) => {
    try {
        await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'approved',
            approvedBy: req.session.user.id,
            approvedAt: new Date()
        });

        // อัปเดต attendance เป็น leave
        const leave = await LeaveRequest.findById(req.params.id);
        const startDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            await Attendance.findOneAndUpdate(
                { student: leave.student, date: new Date(d) },
                { status: 'leave' },
                { upsert: true }
            );
        }

        req.flash('success_msg', 'อนุมัติใบลาสำเร็จ');
        res.redirect('/mentor/leave-requests');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/leave-requests');
    }
});

// ไม่อนุมัติใบลา
router.post('/leave-requests/:id/reject', async (req, res) => {
    try {
        const { rejectReason } = req.body;

        await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'rejected',
            approvedBy: req.session.user.id,
            approvedAt: new Date(),
            rejectReason
        });

        req.flash('success_msg', 'ไม่อนุมัติใบลา');
        res.redirect('/mentor/leave-requests');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/leave-requests');
    }
});

// ==================== EVALUATIONS ====================
router.get('/evaluations', async (req, res) => {
    try {
        const mentor = await User.findById(req.session.user.id).populate('company');

        const students = await User.find({
            role: 'student',
            company: mentor.company ? mentor.company._id : null
        }).populate('major');

        res.render('mentor/evaluations/index', {
            title: 'ประเมินนักศึกษา',
            students
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/dashboard');
    }
});

// ฟอร์มประเมิน
router.get('/evaluations/:studentId/create', async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId).populate('major');

        res.render('mentor/evaluations/create', {
            title: 'ประเมินนักศึกษา',
            student,
            criteria: [
                { name: 'ความรับผิดชอบในงาน', maxScore: 20 },
                { name: 'ความตรงต่อเวลา', maxScore: 20 },
                { name: 'ความสามารถในการทำงาน', maxScore: 20 },
                { name: 'การทำงานร่วมกับผู้อื่น', maxScore: 20 },
                { name: 'การปฏิบัติตามกฎระเบียบ', maxScore: 20 }
            ]
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/evaluations');
    }
});

// บันทึกประเมิน
router.post('/evaluations/:studentId', async (req, res) => {
    try {
        const { scores, comment } = req.body;

        const scoreArray = Object.keys(scores).map(criteria => ({
            criteria,
            maxScore: 20,
            score: parseInt(scores[criteria]) || 0
        }));

        await Evaluation.create({
            student: req.params.studentId,
            evaluator: req.session.user.id,
            evaluatorRole: 'mentor',
            type: 'behavior',
            scores: scoreArray,
            comment
        });

        req.flash('success_msg', 'บันทึกการประเมินสำเร็จ');
        res.redirect('/mentor/evaluations');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/mentor/evaluations');
    }
});

module.exports = router;
