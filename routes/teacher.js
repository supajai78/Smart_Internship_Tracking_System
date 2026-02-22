const express = require('express');
const router = express.Router();
const { isTeacher } = require('../middlewares/auth');
const {
    User,
    Company,
    Attendance,
    LeaveRequest,
    DailyLog,
    WeeklyReport,
    Evaluation,
    Supervision
} = require('../models');

// ใช้ middleware ตรวจสอบว่าเป็น Teacher
router.use(isTeacher);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
    try {
        const teacher = await User.findById(req.session.user.id).populate('department');

        // หานักศึกษาในความดูแล
        const students = await User.find({
            role: 'student',
            teacher: req.session.user.id
        })
            .populate('company')
            .populate('major');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const studentIds = students.map(s => s._id);

        // นับสถิติ
        const [todayAttendance, pendingReports] = await Promise.all([
            Attendance.find({
                student: { $in: studentIds },
                date: { $gte: today }
            }).populate('student'),
            WeeklyReport.countDocuments({
                student: { $in: studentIds },
                status: 'submitted'
            })
        ]);

        // จัด students ตามสถานะ
        const studentsWithStatus = students.map(s => {
            const attendance = todayAttendance.find(a => a.student._id.toString() === s._id.toString());
            let status = 'absent'; // 🔴
            if (attendance) {
                if (attendance.checkInTime && attendance.checkOutTime) {
                    status = 'complete'; // 🟢
                } else if (attendance.checkInTime) {
                    status = 'working'; // 🟡
                }
            }
            return { ...s.toObject(), todayStatus: status };
        });

        res.render('teacher/dashboard', {
            title: 'แดชบอร์ด',
            teacher,
            students: studentsWithStatus,
            stats: {
                studentCount: students.length,
                presentToday: todayAttendance.filter(a => a.checkInTime).length,
                pendingReports
            }
        });
    } catch (error) {
        console.error('Teacher Dashboard error:', error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/');
    }
});

// ==================== STUDENTS ====================
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            teacher: req.session.user.id
        })
            .populate('company')
            .populate('major')
            .populate('level');

        res.render('teacher/students/index', {
            title: 'นักศึกษาในความดูแล',
            students
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/dashboard');
    }
});

// ดูรายละเอียดนักศึกษา
router.get('/students/:id', async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('major')
            .populate('level')
            .populate('curriculum')
            .populate('company');

        const [attendances, dailyLogs, weeklyReports, evaluations] = await Promise.all([
            Attendance.find({ student: req.params.id }).sort({ date: -1 }).limit(30),
            DailyLog.find({ student: req.params.id }).sort({ date: -1 }).limit(10),
            WeeklyReport.find({ student: req.params.id }).sort({ weekNumber: -1 }),
            Evaluation.find({ student: req.params.id }).populate('evaluator')
        ]);

        const totalAttendance = await Attendance.countDocuments({
            student: req.params.id,
            status: { $in: ['present', 'late'] }
        });

        res.render('teacher/students/show', {
            title: 'ข้อมูลนักศึกษา',
            student,
            attendances,
            dailyLogs,
            weeklyReports,
            evaluations,
            totalAttendance
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/students');
    }
});

// ==================== SUPERVISION ====================
router.get('/supervisions', async (req, res) => {
    try {
        const supervisions = await Supervision.find({ teacher: req.session.user.id })
            .populate('company')
            .sort({ visitDate: -1 });

        res.render('teacher/supervisions/index', {
            title: 'บันทึกการนิเทศ',
            supervisions
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/dashboard');
    }
});

router.get('/supervisions/create', async (req, res) => {
    try {
        // หา companies ที่มีนักศึกษาในความดูแล
        const students = await User.find({
            role: 'student',
            teacher: req.session.user.id
        }).populate('company');

        const companies = [...new Set(students.filter(s => s.company).map(s => JSON.stringify(s.company)))].map(c => JSON.parse(c));

        res.render('teacher/supervisions/create', {
            title: 'บันทึกการนิเทศ',
            companies,
            students
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/supervisions');
    }
});

router.post('/supervisions', async (req, res) => {
    try {
        const { company, visitDate, notes, recommendations, studentsVisited, latitude, longitude } = req.body;

        await Supervision.create({
            teacher: req.session.user.id,
            company,
            visitDate,
            notes,
            recommendations,
            studentsVisited: studentsVisited ? (Array.isArray(studentsVisited) ? studentsVisited : [studentsVisited]) : [],
            location: latitude && longitude ? { latitude, longitude } : undefined
        });

        req.flash('success_msg', 'บันทึกการนิเทศสำเร็จ');
        res.redirect('/teacher/supervisions');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/supervisions/create');
    }
});

// ==================== EVALUATIONS ====================
router.get('/evaluations', async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            teacher: req.session.user.id
        }).populate('major').populate('company');

        res.render('teacher/evaluations/index', {
            title: 'ประเมินนักศึกษา',
            students
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/dashboard');
    }
});

router.get('/evaluations/:studentId/create', async (req, res) => {
    try {
        const student = await User.findById(req.params.studentId).populate('major').populate('company');

        res.render('teacher/evaluations/create', {
            title: 'ประเมินนักศึกษา',
            student,
            criteria: [
                { name: 'ความรู้และทักษะในงาน', maxScore: 20 },
                { name: 'การประยุกต์ใช้ความรู้', maxScore: 20 },
                { name: 'ความรับผิดชอบ', maxScore: 20 },
                { name: 'การทำงานเป็นทีม', maxScore: 20 },
                { name: 'การพัฒนาตนเอง', maxScore: 20 }
            ]
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/evaluations');
    }
});

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
            evaluatorRole: 'teacher',
            type: 'work',
            scores: scoreArray,
            comment
        });

        req.flash('success_msg', 'บันทึกการประเมินสำเร็จ');
        res.redirect('/teacher/evaluations');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/evaluations');
    }
});

// ==================== WEEKLY REPORTS ====================
router.get('/weekly-reports', async (req, res) => {
    try {
        const students = await User.find({
            role: 'student',
            teacher: req.session.user.id
        });
        const studentIds = students.map(s => s._id);

        const weeklyReports = await WeeklyReport.find({
            student: { $in: studentIds }
        })
            .populate('student')
            .sort({ createdAt: -1 });

        res.render('teacher/weekly-reports/index', {
            title: 'รายงานรายสัปดาห์',
            weeklyReports
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/teacher/dashboard');
    }
});

module.exports = router;
