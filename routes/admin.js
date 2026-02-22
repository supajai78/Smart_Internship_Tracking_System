const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/auth');
const {
    User,
    AcademicYear,
    Department,
    Major,
    Level,
    Curriculum,
    Company,
    Section,
    Attendance
} = require('../models');

// ใช้ middleware ตรวจสอบว่าเป็น Admin
router.use(isAdmin);

// ==================== DASHBOARD ====================
router.get('/dashboard', async (req, res) => {
    try {
        // นับจำนวนข้อมูลต่างๆ
        const [
            studentCount,
            teacherCount,
            mentorCount,
            companyCount,
            departmentCount,
            activeYear
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'teacher' }),
            User.countDocuments({ role: 'mentor' }),
            Company.countDocuments({ isActive: true }),
            Department.countDocuments({ isActive: true }),
            AcademicYear.findOne({ isActive: true })
        ]);

        // สถิติการเข้างานวันนี้
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttendance = await Attendance.countDocuments({
            date: { $gte: today },
            status: { $in: ['present', 'late'] }
        });

        // Chart Data: นักศึกษาแยกตามแผนก
        const studentByDept = await User.aggregate([
            { $match: { role: 'student' } },
            { $group: { _id: '$department', count: { $sum: 1 } } },
            { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
            { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
            { $project: { name: { $ifNull: ['$dept.name', 'ไม่ระบุ'] }, count: 1 } }
        ]);

        // Chart Data: สถานะการฝึกงาน (Mockup logic for demo, replace with real logic if available)
        const internshipStatus = [
            { name: 'กำลังฝึกงาน', count: Math.floor(studentCount * 0.6) },
            { name: 'รออนุมัติ', count: Math.floor(studentCount * 0.3) },
            { name: 'ฝึกงานเสร็จสิ้น', count: studentCount - Math.floor(studentCount * 0.9) }
        ];

        res.render('admin/dashboard', {
            title: 'Overview',
            stats: {
                studentCount,
                teacherCount,
                mentorCount,
                companyCount,
                departmentCount,
                todayAttendance
            },
            activeYear,
            chartData: {
                studentByDept,
                internshipStatus
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error_msg', 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        res.redirect('/');
    }
});

// ==================== ACADEMIC YEARS ====================
// แสดงรายการ
router.get('/academic-years', async (req, res) => {
    try {
        const academicYears = await AcademicYear.find().sort({ year: -1, semester: -1 });
        res.render('admin/academic-years/index', {
            title: 'จัดการปีการศึกษา',
            academicYears
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

// ฟอร์มเพิ่ม
router.get('/academic-years/create', (req, res) => {
    res.render('admin/academic-years/create', {
        title: 'เพิ่มปีการศึกษา'
    });
});

// บันทึกเพิ่ม
router.post('/academic-years', async (req, res) => {
    try {
        const { year, semester, startDate, endDate, isActive } = req.body;

        // ถ้าตั้งเป็น active ให้ปิด active อื่นก่อน
        if (isActive) {
            await AcademicYear.updateMany({}, { isActive: false });
        }

        await AcademicYear.create({
            name: `${semester}/${year}`,
            year: parseInt(year),
            semester: parseInt(semester),
            startDate,
            endDate,
            isActive: isActive === 'on'
        });

        req.flash('success_msg', 'เพิ่มปีการศึกษาสำเร็จ');
        res.redirect('/admin/academic-years');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/academic-years/create');
    }
});

// ฟอร์มแก้ไข
router.get('/academic-years/:id/edit', async (req, res) => {
    try {
        const academicYear = await AcademicYear.findById(req.params.id);
        if (!academicYear) {
            req.flash('error_msg', 'ไม่พบข้อมูล');
            return res.redirect('/admin/academic-years');
        }
        res.render('admin/academic-years/edit', {
            title: 'แก้ไขปีการศึกษา',
            academicYear
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/academic-years');
    }
});

// บันทึกแก้ไข
router.post('/academic-years/:id', async (req, res) => {
    try {
        const { year, semester, startDate, endDate, isActive } = req.body;

        if (isActive) {
            await AcademicYear.updateMany({}, { isActive: false });
        }

        await AcademicYear.findByIdAndUpdate(req.params.id, {
            name: `${semester}/${year}`,
            year: parseInt(year),
            semester: parseInt(semester),
            startDate,
            endDate,
            isActive: isActive === 'on'
        });

        req.flash('success_msg', 'แก้ไขปีการศึกษาสำเร็จ');
        res.redirect('/admin/academic-years');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/academic-years');
    }
});

// ลบ
router.post('/academic-years/:id/delete', async (req, res) => {
    try {
        await AcademicYear.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบปีการศึกษาสำเร็จ');
        res.redirect('/admin/academic-years');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/academic-years');
    }
});

// ==================== DEPARTMENTS ====================
router.get('/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 }).lean();

        // Get major counts for each department
        const majorCounts = await Major.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$department', count: { $sum: 1 } } }
        ]);

        // Map counts to departments
        const countMap = {};
        majorCounts.forEach(m => { countMap[m._id.toString()] = m.count; });
        departments.forEach(d => { d.majorCount = countMap[d._id.toString()] || 0; });

        res.render('admin/departments/index', {
            title: 'จัดการแผนกวิชา',
            departments
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/departments/create', (req, res) => {
    res.render('admin/departments/create', { title: 'เพิ่มแผนกวิชา' });
});

// View department with its majors
router.get('/departments/:id/view', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        const majors = await Major.find({ department: req.params.id }).sort({ name: 1 });
        res.render('admin/departments/view', {
            title: department.name,
            department,
            majors
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'ไม่พบแผนกวิชา');
        res.redirect('/admin/departments');
    }
});

router.post('/departments', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            isActive: req.body.isActive === 'on' || req.body.isActive === true
        };
        await Department.create(data);
        req.flash('success_msg', 'เพิ่มแผนกวิชาสำเร็จ');
        res.redirect('/admin/departments');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/departments/create');
    }
});

router.get('/departments/:id/edit', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        res.render('admin/departments/edit', { title: 'แก้ไขแผนกวิชา', department });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/departments');
    }
});

router.post('/departments/:id', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            code: req.body.code,
            description: req.body.description,
            isActive: req.body.isActive === 'on' || req.body.isActive === true
        };
        await Department.findByIdAndUpdate(req.params.id, data);
        req.flash('success_msg', 'แก้ไขแผนกวิชาสำเร็จ');
        res.redirect('/admin/departments');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/departments');
    }
});

router.post('/departments/:id/delete', async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบแผนกวิชาสำเร็จ');
        res.redirect('/admin/departments');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/departments');
    }
});

// ==================== MAJORS ====================
router.get('/majors', async (req, res) => {
    try {
        const majors = await Major.find().populate('department').sort({ name: 1 });
        res.render('admin/majors/index', { title: 'จัดการสาขาวิชา', majors });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/majors/create', async (req, res) => {
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.render('admin/majors/create', { title: 'เพิ่มสาขาวิชา', departments });
});

router.post('/majors', async (req, res) => {
    try {
        await Major.create(req.body);
        req.flash('success_msg', 'เพิ่มสาขาวิชาสำเร็จ');
        res.redirect('/admin/majors');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/majors/create');
    }
});

router.get('/majors/:id/edit', async (req, res) => {
    const major = await Major.findById(req.params.id);
    const departments = await Department.find({ isActive: true }).sort({ name: 1 });
    res.render('admin/majors/edit', { title: 'แก้ไขสาขาวิชา', major, departments });
});

router.post('/majors/:id', async (req, res) => {
    try {
        await Major.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'แก้ไขสาขาวิชาสำเร็จ');
        res.redirect('/admin/majors');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/majors');
    }
});

router.post('/majors/:id/delete', async (req, res) => {
    try {
        await Major.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบสาขาวิชาสำเร็จ');
        res.redirect('/admin/majors');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/majors');
    }
});

// ==================== SECTIONS (ห้องเรียน) ====================
router.get('/sections', async (req, res) => {
    try {
        const sections = await Section.find()
            .populate({
                path: 'major',
                populate: { path: 'department' }
            })
            .populate('academicYear')
            .populate('level')
            .sort({ code: 1 });
        res.render('admin/sections/index', { title: 'จัดการห้องเรียน', sections });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/sections/create', async (req, res) => {
    try {
        const majors = await Major.find({ isActive: true }).populate('department').sort({ name: 1 });
        const academicYears = await AcademicYear.find().sort({ year: -1, semester: -1 });
        const levels = await Level.find({ isActive: true }).sort({ name: 1 });
        res.render('admin/sections/create', {
            title: 'เพิ่มห้องเรียน',
            majors,
            academicYears,
            levels
        });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/sections');
    }
});

router.post('/sections', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            code: req.body.code,
            major: req.body.major || undefined,
            academicYear: req.body.academicYear || undefined,
            level: req.body.level || undefined,
            description: req.body.description
        };
        await Section.create(data);
        req.flash('success_msg', 'เพิ่มห้องเรียนสำเร็จ');
        res.redirect('/admin/sections');
    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            req.flash('error_msg', 'รหัสห้องนี้มีอยู่แล้วในปีการศึกษานี้ กรุณาใช้รหัสอื่น');
        } else {
            req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        }
        res.redirect('/admin/sections/create');
    }
});

// View section with students
router.get('/sections/:id/view', async (req, res) => {
    try {
        const section = await Section.findById(req.params.id)
            .populate({
                path: 'major',
                populate: { path: 'department' }
            })
            .populate('academicYear')
            .populate('level');

        if (!section) {
            req.flash('error_msg', 'ไม่พบห้องเรียน');
            return res.redirect('/admin/sections');
        }

        // Find students in this section
        const students = await User.find({
            role: 'student',
            section: req.params.id
        })
            .populate('company')
            .sort({ studentId: 1, firstName: 1 });

        res.render('admin/sections/view', {
            title: section.name,
            section,
            students
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/sections');
    }
});

router.get('/sections/:id/edit', async (req, res) => {
    try {
        const section = await Section.findById(req.params.id);
        const majors = await Major.find({ isActive: true }).populate('department').sort({ name: 1 });
        const academicYears = await AcademicYear.find().sort({ year: -1, semester: -1 });
        const levels = await Level.find({ isActive: true }).sort({ name: 1 });
        res.render('admin/sections/edit', {
            title: 'แก้ไขห้องเรียน',
            section,
            majors,
            academicYears,
            levels
        });
    } catch (error) {
        req.flash('error_msg', 'ไม่พบข้อมูล');
        res.redirect('/admin/sections');
    }
});

router.post('/sections/:id', async (req, res) => {
    try {
        await Section.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'แก้ไขห้องเรียนสำเร็จ');
        res.redirect('/admin/sections');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/sections');
    }
});

router.post('/sections/:id/delete', async (req, res) => {
    try {
        await Section.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบห้องเรียนสำเร็จ');
        res.redirect('/admin/sections');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/sections');
    }
});

// ==================== LEVELS ====================
router.get('/levels', async (req, res) => {
    try {
        const levels = await Level.find().sort({ name: 1 });
        res.render('admin/levels/index', { title: 'จัดการระดับชั้น', levels });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/levels/create', (req, res) => {
    res.render('admin/levels/create', { title: 'เพิ่มระดับชั้น' });
});

router.post('/levels', async (req, res) => {
    try {
        await Level.create(req.body);
        req.flash('success_msg', 'เพิ่มระดับชั้นสำเร็จ');
        res.redirect('/admin/levels');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/levels/create');
    }
});

router.get('/levels/:id/edit', async (req, res) => {
    const level = await Level.findById(req.params.id);
    res.render('admin/levels/edit', { title: 'แก้ไขระดับชั้น', level });
});

router.post('/levels/:id', async (req, res) => {
    try {
        await Level.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'แก้ไขระดับชั้นสำเร็จ');
        res.redirect('/admin/levels');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/levels');
    }
});

router.post('/levels/:id/delete', async (req, res) => {
    try {
        await Level.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบระดับชั้นสำเร็จ');
        res.redirect('/admin/levels');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/levels');
    }
});

// ==================== CURRICULUMS ====================
router.get('/curriculums', async (req, res) => {
    try {
        const curriculums = await Curriculum.find().populate('level').sort({ name: 1 });
        res.render('admin/curriculums/index', { title: 'จัดการหลักสูตร', curriculums });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/curriculums/create', async (req, res) => {
    const levels = await Level.find({ isActive: true }).sort({ name: 1 });
    res.render('admin/curriculums/create', { title: 'เพิ่มหลักสูตร', levels });
});

router.post('/curriculums', async (req, res) => {
    try {
        await Curriculum.create(req.body);
        req.flash('success_msg', 'เพิ่มหลักสูตรสำเร็จ');
        res.redirect('/admin/curriculums');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/curriculums/create');
    }
});

router.get('/curriculums/:id/edit', async (req, res) => {
    const curriculum = await Curriculum.findById(req.params.id);
    const levels = await Level.find({ isActive: true }).sort({ name: 1 });
    res.render('admin/curriculums/edit', { title: 'แก้ไขหลักสูตร', curriculum, levels });
});

router.post('/curriculums/:id', async (req, res) => {
    try {
        await Curriculum.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'แก้ไขหลักสูตรสำเร็จ');
        res.redirect('/admin/curriculums');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/curriculums');
    }
});

router.post('/curriculums/:id/delete', async (req, res) => {
    try {
        await Curriculum.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบหลักสูตรสำเร็จ');
        res.redirect('/admin/curriculums');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/curriculums');
    }
});

// ==================== COMPANIES ====================
router.get('/companies', async (req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        res.render('admin/companies/index', { title: 'จัดการสถานประกอบการ', companies });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/companies/create', (req, res) => {
    res.render('admin/companies/create', { title: 'เพิ่มสถานประกอบการ' });
});

router.post('/companies', async (req, res) => {
    try {
        await Company.create(req.body);
        req.flash('success_msg', 'เพิ่มสถานประกอบการสำเร็จ');
        res.redirect('/admin/companies');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/companies/create');
    }
});

router.get('/companies/:id/edit', async (req, res) => {
    const company = await Company.findById(req.params.id);
    res.render('admin/companies/edit', { title: 'แก้ไขสถานประกอบการ', company });
});

router.post('/companies/:id', async (req, res) => {
    try {
        await Company.findByIdAndUpdate(req.params.id, req.body);
        req.flash('success_msg', 'แก้ไขสถานประกอบการสำเร็จ');
        res.redirect('/admin/companies');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/companies');
    }
});

router.post('/companies/:id/delete', async (req, res) => {
    try {
        await Company.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบสถานประกอบการสำเร็จ');
        res.redirect('/admin/companies');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/companies');
    }
});

// ==================== USERS ====================
router.get('/users', async (req, res) => {
    try {
        const [users, departments, companies] = await Promise.all([
            User.find()
                .populate('department')
                .populate('company')
                .populate('section')
                .sort({ role: 1, firstName: 1 }),
            Department.find({ isActive: true }).sort({ name: 1 }),
            Company.find({ isActive: true }).sort({ name: 1 })
        ]);
        res.render('admin/users/index', { title: 'จัดการผู้ใช้งาน', users, departments, companies });
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/dashboard');
    }
});

router.get('/users/create', async (req, res) => {
    const [departments, majors, levels, curriculums, companies, teachers, sections, academicYears] = await Promise.all([
        Department.find({ isActive: true }).sort({ name: 1 }),
        Major.find({ isActive: true }).populate('department').sort({ name: 1 }),
        Level.find({ isActive: true }).sort({ name: 1 }),
        Curriculum.find({ isActive: true }).populate('level'),
        Company.find({ isActive: true }).sort({ name: 1 }),
        User.find({ role: 'teacher' }).sort({ firstName: 1 }),
        Section.find({ isActive: true }).populate('major').populate('academicYear').sort({ code: 1 }),
        AcademicYear.find().sort({ year: -1, semester: -1 })
    ]);

    res.render('admin/users/create', {
        title: 'เพิ่มผู้ใช้',
        departments, majors, levels, curriculums, companies, teachers, sections, academicYears
    });
});

router.post('/users', async (req, res) => {
    try {
        const userData = { ...req.body };

        // Helper function: ถ้าเป็น array ให้เลือกค่าที่ไม่ว่างเปล่าตัวแรก
        const getValidValue = (value) => {
            if (Array.isArray(value)) {
                return value.find(v => v && v !== '') || null;
            }
            return value;
        };

        // แปลงค่าที่อาจเป็น array
        ['department', 'major', 'section', 'level', 'curriculum', 'company', 'teacher'].forEach(field => {
            if (userData[field]) {
                userData[field] = getValidValue(userData[field]);
            }
        });

        // ลบ field ที่ว่างออก
        Object.keys(userData).forEach(key => {
            if (userData[key] === '' || userData[key] === null || userData[key] === undefined) {
                delete userData[key];
            }
        });

        await User.create(userData);
        req.flash('success_msg', 'เพิ่มผู้ใช้สำเร็จ');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด: ' + error.message);
        res.redirect('/admin/users/create');
    }
});

router.get('/users/:id/edit', async (req, res) => {
    const [editUser, departments, majors, levels, curriculums, companies, teachers, sections, academicYears] = await Promise.all([
        User.findById(req.params.id),
        Department.find({ isActive: true }).sort({ name: 1 }),
        Major.find({ isActive: true }).populate('department').sort({ name: 1 }),
        Level.find({ isActive: true }).sort({ name: 1 }),
        Curriculum.find({ isActive: true }).populate('level'),
        Company.find({ isActive: true }).sort({ name: 1 }),
        User.find({ role: 'teacher' }).sort({ firstName: 1 }),
        Section.find({ isActive: true }).populate('major').populate('academicYear').sort({ code: 1 }),
        AcademicYear.find().sort({ year: -1, semester: -1 })
    ]);

    res.render('admin/users/edit', {
        title: 'แก้ไขผู้ใช้',
        editUser,
        departments, majors, levels, curriculums, companies, teachers, sections, academicYears
    });
});

router.post('/users/:id', async (req, res) => {
    try {
        const userData = { ...req.body };

        // Helper function: ถ้าเป็น array ให้เลือกค่าที่ไม่ว่างเปล่าตัวแรก
        const getValidValue = (value) => {
            if (Array.isArray(value)) {
                return value.find(v => v && v !== '') || null;
            }
            return value;
        };

        // แปลงค่าที่อาจเป็น array
        ['department', 'major', 'level', 'curriculum', 'company', 'teacher'].forEach(field => {
            if (userData[field]) {
                userData[field] = getValidValue(userData[field]);
            }
        });

        // ลบ field ที่ว่างออก
        Object.keys(userData).forEach(key => {
            if (userData[key] === '' || userData[key] === null || userData[key] === undefined) {
                delete userData[key];
            }
        });

        // ถ้าไม่ได้กรอกรหัสผ่านใหม่ ให้ลบออก
        if (!userData.password) {
            delete userData.password;
        }

        await User.findByIdAndUpdate(req.params.id, userData);
        req.flash('success_msg', 'แก้ไขผู้ใช้สำเร็จ');
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/users');
    }
});

router.post('/users/:id/delete', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'ลบผู้ใช้สำเร็จ');
        res.redirect('/admin/users');
    } catch (error) {
        req.flash('error_msg', 'เกิดข้อผิดพลาด');
        res.redirect('/admin/users');
    }
});

module.exports = router;
