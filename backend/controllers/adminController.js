const {
    User, AcademicYear, Department, Major, Level,
    Curriculum, Company, Section, Attendance
} = require('../models');

// ==================== DASHBOARD ====================
exports.getDashboard = async (req, res) => {
    try {
        const [studentCount, teacherCount, mentorCount, companyCount, departmentCount, activeYear] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            User.countDocuments({ role: 'mentor' }),
            Company.countDocuments({ isActive: true }),
            Department.countDocuments({ isActive: true }),
            AcademicYear.findOne({ isActive: true })
        ]);

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: today }, status: { $in: ['present', 'late'] }
        });

        const studentByDept = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ['$dept.name', 'ไม่ระบุ'] }, count: 1 } }
        ]);

        const internshipStatus = [
            { name: 'กำลังฝึกงาน', count: Math.floor(studentCount * 0.6) },
            { name: 'รออนุมัติ', count: Math.floor(studentCount * 0.3) },
            { name: 'ฝึกงานเสร็จสิ้น', count: studentCount - Math.floor(studentCount * 0.9) }
        ];

        res.json({
            stats: { studentCount, teacherCount, mentorCount, companyCount, departmentCount, todayAttendance },
            activeYear,
            chartData: { studentByDept, internshipStatus }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// ==================== ACADEMIC YEARS ====================
exports.getAcademicYears = async (req, res) => {
    try { res.json(await AcademicYear.find().sort({ year: -1, semester: -1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createAcademicYear = async (req, res) => {
    try {
        const { year, semester, startDate, endDate, isActive } = req.body;
        if (isActive) await AcademicYear.updateMany({}, { isActive: false });
        const doc = await AcademicYear.create({
            name: `${semester}/${year}`, year: parseInt(year), semester: parseInt(semester),
            startDate, endDate, isActive: !!isActive
        });
        res.status(201).json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getAcademicYear = async (req, res) => {
    try {
        const doc = await AcademicYear.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateAcademicYear = async (req, res) => {
    try {
        const { year, semester, startDate, endDate, isActive } = req.body;
        if (isActive) await AcademicYear.updateMany({}, { isActive: false });
        const doc = await AcademicYear.findByIdAndUpdate(req.params.id, {
            name: `${semester}/${year}`, year: parseInt(year), semester: parseInt(semester),
            startDate, endDate, isActive: !!isActive
        }, { new: true });
        res.json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteAcademicYear = async (req, res) => {
    try { await AcademicYear.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== DEPARTMENTS ====================
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 }).lean();
        const majorCounts = await Major.aggregate([
            { $match: { isActive: true } }, { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);
        const countMap = {};
        majorCounts.forEach(m => { countMap[m._id.toString()] = m.count; });
        departments.forEach(d => { d.majorCount = countMap[d._id.toString()] || 0; });
        res.json(departments);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createDepartment = async (req, res) => {
    try {
        const doc = await Department.create({
            name: req.body.name, code: req.body.code,
            description: req.body.description, isActive: !!req.body.isActive
        });
        res.status(201).json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getDepartment = async (req, res) => {
    try {
        const doc = await Department.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        const majors = await Major.find({ department: req.params.id }).sort({ name: 1 });
        res.json({ department: doc, majors });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateDepartment = async (req, res) => {
    try {
        const doc = await Department.findByIdAndUpdate(req.params.id, {
            name: req.body.name, code: req.body.code,
            description: req.body.description, isActive: !!req.body.isActive
        }, { new: true });
        res.json(doc);
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteDepartment = async (req, res) => {
    try { await Department.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== MAJORS ====================
exports.getMajors = async (req, res) => {
    try { res.json(await Major.find().populate('department').sort({ name: 1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createMajor = async (req, res) => {
    try { res.status(201).json(await Major.create(req.body)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getMajor = async (req, res) => {
    try {
        const doc = await Major.findById(req.params.id).populate('department');
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateMajor = async (req, res) => {
    try { res.json(await Major.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteMajor = async (req, res) => {
    try { await Major.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== SECTIONS ====================
exports.getSections = async (req, res) => {
    try {
        res.json(await Section.find()
            .populate({ path: 'major', populate: { path: 'department' } })
            .populate('academicYear').populate('level').sort({ code: 1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createSection = async (req, res) => {
    try {
        const doc = await Section.create({
            name: req.body.name, code: req.body.code,
            major: req.body.major || undefined,
            academicYear: req.body.academicYear || undefined,
            level: req.body.level || undefined,
            description: req.body.description
        });
        res.status(201).json(doc);
    } catch (error) {
        if (error.code === 11000) return res.status(400).json({ message: 'รหัสห้องนี้มีอยู่แล้ว' });
        res.status(400).json({ message: error.message });
    }
};

exports.getSection = async (req, res) => {
    try {
        const section = await Section.findById(req.params.id)
            .populate({ path: 'major', populate: { path: 'department' } })
            .populate('academicYear').populate('level');
        if (!section) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        const students = await User.find({ role: 'student', section: req.params.id })
            .populate('company').sort({ studentId: 1, firstName: 1 });
        res.json({ section, students });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateSection = async (req, res) => {
    try { res.json(await Section.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteSection = async (req, res) => {
    try { await Section.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== LEVELS ====================
exports.getLevels = async (req, res) => {
    try { res.json(await Level.find().sort({ name: 1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createLevel = async (req, res) => {
    try { res.status(201).json(await Level.create(req.body)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getLevel = async (req, res) => {
    try {
        const doc = await Level.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateLevel = async (req, res) => {
    try { res.json(await Level.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteLevel = async (req, res) => {
    try { await Level.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== CURRICULUMS ====================
exports.getCurriculums = async (req, res) => {
    try { res.json(await Curriculum.find().populate('level').sort({ name: 1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createCurriculum = async (req, res) => {
    try { res.status(201).json(await Curriculum.create(req.body)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getCurriculum = async (req, res) => {
    try {
        const doc = await Curriculum.findById(req.params.id).populate('level');
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateCurriculum = async (req, res) => {
    try { res.json(await Curriculum.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteCurriculum = async (req, res) => {
    try { await Curriculum.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== COMPANIES ====================
exports.getCompanies = async (req, res) => {
    try { res.json(await Company.find().sort({ name: 1 })); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createCompany = async (req, res) => {
    try { res.status(201).json(await Company.create(req.body)); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.getCompany = async (req, res) => {
    try {
        const doc = await Company.findById(req.params.id);
        if (!doc) return res.status(404).json({ message: 'ไม่พบข้อมูล' });
        res.json(doc);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.updateCompany = async (req, res) => {
    try { res.json(await Company.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
    catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteCompany = async (req, res) => {
    try { await Company.findByIdAndDelete(req.params.id); res.json({ message: 'ลบสำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

// ==================== USERS ====================
exports.getUsers = async (req, res) => {
    try {
        res.json(await User.find().select('-password')
            .populate('department').populate('company').populate('section')
            .sort({ role: 1, firstName: 1 }));
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.getUserFormData = async (req, res) => {
    try {
        const [departments, majors, levels, curriculums, companies, teachers, sections, academicYears] = await Promise.all([
            Department.find({ isActive: true }).sort({ name: 1 }),
            Major.find({ isActive: true }).populate('department').sort({ name: 1 }),
            Level.find({ isActive: true }).sort({ name: 1 }),
            Curriculum.find({ isActive: true }).populate('level'),
            Company.find({ isActive: true }).sort({ name: 1 }),
            User.find({ role: 'teacher' }).select('firstName lastName').sort({ firstName: 1 }),
            Section.find({ isActive: true }).populate('major').populate('academicYear').sort({ code: 1 }),
            AcademicYear.find().sort({ year: -1, semester: -1 })
        ]);
        res.json({ departments, majors, levels, curriculums, companies, teachers, sections, academicYears });
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password')
            .populate('department').populate('major').populate('company')
            .populate('section').populate('level').populate('curriculum').populate('teacher');
        if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        res.json(user);
    } catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};

exports.createUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        Object.keys(userData).forEach(key => {
            if (userData[key] === '' || userData[key] === null || userData[key] === undefined) delete userData[key];
        });
        const user = await User.create(userData);
        res.status(201).json({ message: 'เพิ่มผู้ใช้สำเร็จ', user: { ...user.toObject(), password: undefined } });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        Object.keys(userData).forEach(key => {
            if (userData[key] === '' || userData[key] === null || userData[key] === undefined) delete userData[key];
        });
        if (!userData.password) delete userData.password;
        res.json(await User.findByIdAndUpdate(req.params.id, userData, { new: true }).select('-password'));
    } catch (error) { res.status(400).json({ message: error.message }); }
};

exports.deleteUser = async (req, res) => {
    try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'ลบผู้ใช้สำเร็จ' }); }
    catch (error) { res.status(500).json({ message: 'เกิดข้อผิดพลาด' }); }
};
