const {
    User, Attendance, LeaveRequest, DailyLog, Evaluation
} = require('../models');

// ==================== DASHBOARD ====================
exports.getDashboard = async (req, res) => {
    try {
        const mentor = await User.findById(req.user.id).populate('company');
        if (!mentor.company) {
            return res.json({ mentor, students: [], stats: { studentCount: 0, pendingLeaves: 0, todayAttendance: 0 } });
        }

        const students = await User.find({ role: 'student', company: mentor.company._id })
            .populate('major').populate('level');

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const studentIds = students.map(s => s._id);

        const [pendingLeaves, todayAttendance] = await Promise.all([
            LeaveRequest.countDocuments({ student: { $in: studentIds }, status: 'pending' }),
            Attendance.countDocuments({ student: { $in: studentIds }, date: { $gte: today }, status: { $in: ['present', 'late'] } })
        ]);

        res.json({ mentor, students: students.slice(0, 5), stats: { studentCount: students.length, pendingLeaves, todayAttendance } });
    } catch (error) {
        console.error('Mentor Dashboard error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ==================== STUDENTS ====================
exports.getStudents = async (req, res) => {
    try {
        const mentor = await User.findById(req.user.id).populate('company');
        res.json(await User.find({ role: 'student', company: mentor.company?._id || null })
            .populate('major').populate('level').populate('curriculum'));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.getStudent = async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('major').populate('level').populate('curriculum').populate('company').populate('teacher');
        const [attendances, dailyLogs, leaveRequests, totalAttendance] = await Promise.all([
            Attendance.find({ student: req.params.id }).sort({ date: -1 }).limit(30),
            DailyLog.find({ student: req.params.id }).sort({ date: -1 }).limit(10),
            LeaveRequest.find({ student: req.params.id }).sort({ createdAt: -1 }).limit(10),
            Attendance.countDocuments({ student: req.params.id, status: { $in: ['present', 'late'] } })
        ]);
        res.json({ student, attendances, dailyLogs, leaveRequests, totalAttendance });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== LEAVE REQUESTS ====================
exports.getLeaveRequests = async (req, res) => {
    try {
        const mentor = await User.findById(req.user.id).populate('company');
        const students = await User.find({ role: 'student', company: mentor.company?._id || null });
        const studentIds = students.map(s => s._id);
        res.json(await LeaveRequest.find({ student: { $in: studentIds } })
            .populate('student').populate('approvedBy').sort({ createdAt: -1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.approveLeaveRequest = async (req, res) => {
    try {
        await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'approved', approvedBy: req.user.id, approvedAt: new Date()
        });
        const leave = await LeaveRequest.findById(req.params.id);
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            await Attendance.findOneAndUpdate(
                { student: leave.student, date: new Date(d) },
                { status: 'leave' }, { upsert: true }
            );
        }
        res.json({ message: 'อนุมัติใบลาสำเร็จ' });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.rejectLeaveRequest = async (req, res) => {
    try {
        const { rejectReason } = req.body;
        await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status: 'rejected', approvedBy: req.user.id, approvedAt: new Date(), rejectReason
        });
        res.json({ message: 'ไม่อนุมัติใบลา' });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== EVALUATIONS ====================
exports.getEvaluations = async (req, res) => {
    try {
        const mentor = await User.findById(req.user.id).populate('company');
        const students = await User.find({ role: 'student', company: mentor.company?._id || null }).populate('major');
        const evaluations = await Evaluation.find({ evaluator: req.user.id }).populate('student');
        res.json({ students, evaluations });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createEvaluation = async (req, res) => {
    try {
        const { scores, comment } = req.body;
        const doc = await Evaluation.create({
            student: req.params.studentId, evaluator: req.user.id,
            evaluatorRole: 'mentor', type: 'behavior', scores, comment
        });
        res.status(201).json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};
