const {
    User, Attendance, LeaveRequest, DailyLog, WeeklyReport
} = require('../models');

// ==================== HELPER ====================
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==================== DASHBOARD ====================
exports.getDashboard = async (req, res) => {
    try {
        const student = await User.findById(req.user.id)
            .populate('company').populate('curriculum').populate('teacher');

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        const [todayAttendance, monthlyAttendance, totalAttendance, pendingLeaves, totalDailyLogs] = await Promise.all([
            Attendance.findOne({ student: req.user.id, date: { $gte: today } }),
            Attendance.countDocuments({ student: req.user.id, date: { $gte: thisMonth }, status: { $in: ['present', 'late'] } }),
            Attendance.countDocuments({ student: req.user.id, status: { $in: ['present', 'late'] } }),
            LeaveRequest.countDocuments({ student: req.user.id, status: 'pending' }),
            DailyLog.countDocuments({ student: req.user.id })
        ]);

        const requiredDays = student.curriculum ? student.curriculum.internshipDuration : 60;
        const progress = Math.min(100, Math.round((totalAttendance / requiredDays) * 100));

        res.json({
            student,
            stats: { todayAttendance, monthlyAttendance, totalAttendance, requiredDays, progress, pendingLeaves, totalDailyLogs }
        });
    } catch (error) {
        console.error('Student Dashboard error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ==================== ATTENDANCE ====================
exports.getAttendance = async (req, res) => {
    try {
        const student = await User.findById(req.user.id).populate('company');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayAttendance = await Attendance.findOne({ student: req.user.id, date: { $gte: today } });
        const attendanceHistory = await Attendance.find({ student: req.user.id }).sort({ date: -1 }).limit(30);
        res.json({ student, company: student.company, todayAttendance, attendanceHistory });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.checkIn = async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        const student = await User.findById(req.user.id).populate('company');

        if (!student.company) return res.json({ success: false, message: 'ไม่พบข้อมูลสถานประกอบการ' });

        if (method === 'gps' && student.company.latitude && student.company.longitude) {
            const distance = calculateDistance(latitude, longitude, student.company.latitude, student.company.longitude);
            if (distance > (student.company.checkInRadius || 500)) {
                return res.json({ success: false, message: `คุณอยู่ห่างจากสถานประกอบการ ${Math.round(distance)} เมตร` });
            }
        }

        const today = new Date(); today.setHours(0, 0, 0, 0);
        let attendance = await Attendance.findOne({ student: req.user.id, date: { $gte: today } });

        if (attendance && attendance.checkInTime) return res.json({ success: false, message: 'คุณได้ลงเวลาเข้างานแล้ววันนี้' });

        const now = new Date();
        const status = now.getHours() >= 9 ? 'late' : 'present';

        if (attendance) {
            attendance.checkInTime = now;
            attendance.checkInMethod = method;
            attendance.checkInLocation = { latitude, longitude };
            attendance.status = status;
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                student: req.user.id, date: today, checkInTime: now,
                checkInMethod: method, checkInLocation: { latitude, longitude }, status
            });
        }

        res.json({ success: true, message: status === 'late' ? 'ลงเวลาเข้างานสำเร็จ (สาย)' : 'ลงเวลาเข้างานสำเร็จ', time: now.toLocaleTimeString('th-TH') });
    } catch (error) { console.error(error); res.json({ success: false, message: 'เกิดข้อผิดพลาด' }); }
};

exports.checkOut = async (req, res) => {
    try {
        const { latitude, longitude, method } = req.body;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const attendance = await Attendance.findOne({ student: req.user.id, date: { $gte: today } });

        if (!attendance || !attendance.checkInTime) return res.json({ success: false, message: 'คุณยังไม่ได้ลงเวลาเข้างาน' });
        if (attendance.checkOutTime) return res.json({ success: false, message: 'คุณได้ลงเวลาออกงานแล้ววันนี้' });

        const now = new Date();
        attendance.checkOutTime = now;
        attendance.checkOutMethod = method;
        attendance.checkOutLocation = { latitude, longitude };
        await attendance.save();

        res.json({ success: true, message: 'ลงเวลาออกงานสำเร็จ', time: now.toLocaleTimeString('th-TH') });
    } catch (error) { console.error(error); res.json({ success: false, message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== LEAVE REQUESTS ====================
exports.getLeaveRequests = async (req, res) => {
    try {
        res.json(await LeaveRequest.find({ student: req.user.id }).populate('approvedBy').sort({ createdAt: -1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createLeaveRequest = async (req, res) => {
    try {
        const { type, startDate, endDate, reason } = req.body;
        res.status(201).json(await LeaveRequest.create({ student: req.user.id, type, startDate, endDate, reason }));
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// ==================== DAILY LOGS ====================
exports.getDailyLogs = async (req, res) => {
    try { res.json(await DailyLog.find({ student: req.user.id }).sort({ date: -1 }).limit(30)); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createDailyLog = async (req, res) => {
    try {
        const { date, workDescription, hoursWorked } = req.body;
        const existing = await DailyLog.findOne({ student: req.user.id, date: new Date(date) });
        if (existing) return res.status(400).json({ message: 'คุณได้บันทึกงานวันนี้ไปแล้ว' });
        res.status(201).json(await DailyLog.create({ student: req.user.id, date, workDescription, hoursWorked: hoursWorked || 8 }));
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.updateDailyLog = async (req, res) => {
    try {
        const { workDescription, hoursWorked } = req.body;
        const doc = await DailyLog.findOneAndUpdate({ _id: req.params.id, student: req.user.id }, { workDescription, hoursWorked }, { new: true });
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

// ==================== WEEKLY REPORTS ====================
exports.getWeeklyReports = async (req, res) => {
    try { res.json(await WeeklyReport.find({ student: req.user.id }).sort({ weekNumber: -1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createWeeklyReport = async (req, res) => {
    try { res.status(201).json(await WeeklyReport.create({ ...req.body, student: req.user.id, status: 'submitted' })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};
