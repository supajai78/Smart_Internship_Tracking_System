const {
    User, Attendance, LeaveRequest, DailyLog,
    WeeklyReport, Evaluation, Supervision
} = require('../models');

// ==================== DASHBOARD ====================
exports.getDashboard = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id).populate('department');
        const students = await User.find({ role: 'student', teacher: req.user.id })
            .populate('company').populate('major');

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const studentIds = students.map(s => s._id);

        const [todayAttendance, pendingReports] = await Promise.all([
            Attendance.find({ student: { $in: studentIds }, date: { $gte: today } }).populate('student'),
            WeeklyReport.countDocuments({ student: { $in: studentIds }, status: 'submitted' })
        ]);

        const studentsWithStatus = students.map(s => {
            const att = todayAttendance.find(a => a.student._id.toString() === s._id.toString());
            let status = 'absent';
            if (att) { status = att.checkInTime && att.checkOutTime ? 'complete' : att.checkInTime ? 'working' : 'absent'; }
            return { ...s.toObject(), todayStatus: status };
        });

        res.json({
            teacher, students: studentsWithStatus,
            stats: { studentCount: students.length, presentToday: todayAttendance.filter(a => a.checkInTime).length, pendingReports }
        });
    } catch (error) {
        console.error('Teacher Dashboard error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ==================== STUDENTS ====================
exports.getStudents = async (req, res) => {
    try {
        res.json(await User.find({ role: 'student', teacher: req.user.id })
            .populate('company').populate('major').populate('level'));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('major').populate('level').populate('curriculum').populate('company');
        const [attendances, dailyLogs, weeklyReports, evaluations, totalAttendance] = await Promise.all([
            Attendance.find({ student: req.params.id }).sort({ date: -1 }).limit(30),
            DailyLog.find({ student: req.params.id }).sort({ date: -1 }).limit(10),
            WeeklyReport.find({ student: req.params.id }).sort({ weekNumber: -1 }),
            Evaluation.find({ student: req.params.id }).populate('evaluator'),
            Attendance.countDocuments({ student: req.params.id, status: { $in: ['present', 'late'] } })
        ]);
        res.json({ student, attendances, dailyLogs, weeklyReports, evaluations, totalAttendance });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== SUPERVISIONS ====================
exports.getSupervisions = async (req, res) => {
    try {
        res.json(await Supervision.find({ teacher: req.user.id }).populate('company').sort({ visitDate: -1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.getSupervisionFormData = async (req, res) => {
    try {
        const students = await User.find({ role: 'student', teacher: req.user.id }).populate('company');
        const companies = [...new Map(students.filter(s => s.company).map(s => [s.company._id.toString(), s.company])).values()];
        res.json({ companies, students });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createSupervision = async (req, res) => {
    try {
        const { company, visitDate, notes, recommendations, studentsVisited, latitude, longitude } = req.body;
        const doc = await Supervision.create({
            teacher: req.user.id, company, visitDate, notes, recommendations,
            studentsVisited: studentsVisited || [],
            location: latitude && longitude ? { latitude, longitude } : undefined
        });
        res.status(201).json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// ==================== EVALUATIONS ====================
exports.getEvaluations = async (req, res) => {
    try {
        const students = await User.find({ role: 'student', teacher: req.user.id }).populate('major').populate('company');
        const evaluations = await Evaluation.find({ evaluator: req.user.id }).populate('student');
        res.json({ students, evaluations });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createEvaluation = async (req, res) => {
    try {
        const { scores, comment } = req.body;
        const doc = await Evaluation.create({
            student: req.params.studentId, evaluator: req.user.id,
            evaluatorRole: 'teacher', type: 'work', scores, comment
        });
        res.status(201).json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// ==================== WEEKLY REPORTS ====================
exports.getWeeklyReports = async (req, res) => {
    try {
        const students = await User.find({ role: 'student', teacher: req.user.id });
        const studentIds = students.map(s => s._id);
        res.json(await WeeklyReport.find({ student: { $in: studentIds } }).populate('student').sort({ createdAt: -1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.approveWeeklyReport = async (req, res) => {
    try {
        res.json(await WeeklyReport.findByIdAndUpdate(req.params.id,
            { status: 'approved', reviewedBy: req.user.id, reviewedAt: new Date() }, { new: true }));
    } catch (error) { res.status(400).json({ message: error.message }); }
};
