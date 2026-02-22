require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {
    User,
    AcademicYear,
    Department,
    Major,
    Level,
    Curriculum,
    Company
} = require('../models');

const seedDatabase = async () => {
    try {
        // เชื่อมต่อ Database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

        // ลบข้อมูลเก่า
        await Promise.all([
            User.deleteMany({}),
            AcademicYear.deleteMany({}),
            Department.deleteMany({}),
            Major.deleteMany({}),
            Level.deleteMany({}),
            Curriculum.deleteMany({}),
            Company.deleteMany({})
        ]);
        console.log('🗑️ ลบข้อมูลเก่าแล้ว');

        // สร้างระดับชั้น
        const levels = await Level.insertMany([
            { name: 'ปวช.', code: 'pvch', description: 'ประกาศนียบัตรวิชาชีพ' },
            { name: 'ปวส.', code: 'pvs', description: 'ประกาศนียบัตรวิชาชีพชั้นสูง' }
        ]);
        console.log('✅ สร้างระดับชั้นแล้ว');

        const pvchLevel = levels.find(l => l.code === 'pvch');
        const pvsLevel = levels.find(l => l.code === 'pvs');

        // สร้างหลักสูตร
        const curriculums = await Curriculum.insertMany([
            { name: 'ปวช. ปกติ', code: 'pvch-regular', level: pvchLevel._id, internshipDuration: 60, description: 'หลักสูตร ปวช. ปกติ' },
            { name: 'ปวส. สายตรง', code: 'pvs-direct', level: pvsLevel._id, internshipDuration: 120, description: 'หลักสูตร ปวส. ต่อเนื่องจาก ปวช.' },
            { name: 'ปวส. สาย ม.6', code: 'pvs-m6', level: pvsLevel._id, internshipDuration: 60, description: 'หลักสูตร ปวส. จบ ม.6' }
        ]);
        console.log('✅ สร้างหลักสูตรแล้ว');

        // สร้างแผนกวิชา
        const departments = await Department.insertMany([
            { name: 'แผนกวิชาช่างยนต์', code: 'AUTO', description: 'แผนกวิชาช่างยนต์' },
            { name: 'แผนกวิชาช่างไฟฟ้ากำลัง', code: 'ELEC', description: 'แผนกวิชาช่างไฟฟ้ากำลัง' },
            { name: 'แผนกวิชาช่างอิเล็กทรอนิกส์', code: 'ELTN', description: 'แผนกวิชาช่างอิเล็กทรอนิกส์' },
            { name: 'แผนกวิชาเทคโนโลยีสารสนเทศ', code: 'IT', description: 'แผนกวิชาเทคโนโลยีสารสนเทศ' },
            { name: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ', code: 'BC', description: 'แผนกวิชาคอมพิวเตอร์ธุรกิจ' },
            { name: 'แผนกวิชาการบัญชี', code: 'ACC', description: 'แผนกวิชาการบัญชี' }
        ]);
        console.log('✅ สร้างแผนกวิชาแล้ว');

        const itDept = departments.find(d => d.code === 'IT');
        const autoDept = departments.find(d => d.code === 'AUTO');

        // สร้างสาขาวิชา
        const majors = await Major.insertMany([
            { name: 'สาขาวิชาเทคโนโลยีสารสนเทศ', code: 'IT01', department: itDept._id },
            { name: 'สาขาวิชาเทคนิคคอมพิวเตอร์', code: 'IT02', department: itDept._id },
            { name: 'สาขาวิชาเทคนิคยานยนต์', code: 'AUTO01', department: autoDept._id },
            { name: 'สาขาวิชาเทคนิคเครื่องกลอุตสาหกรรม', code: 'AUTO02', department: autoDept._id }
        ]);
        console.log('✅ สร้างสาขาวิชาแล้ว');

        // สร้างปีการศึกษา
        const academicYear = await AcademicYear.create({
            name: '1/2569',
            year: 2569,
            semester: 1,
            startDate: new Date('2026-05-01'),
            endDate: new Date('2026-09-30'),
            isActive: true
        });
        console.log('✅ สร้างปีการศึกษาแล้ว');

        // สร้างสถานประกอบการตัวอย่าง
        const companies = await Company.insertMany([
            {
                name: 'บริษัท ซีพี ออลล์ จำกัด (มหาชน)',
                address: '119 ถ.อุปราช ต.ในเมือง อ.เมือง จ.อุบลราชธานี',
                phone: '045-123456',
                latitude: 15.2286,
                longitude: 104.8564,
                checkInRadius: 500,
                isMOU: true
            },
            {
                name: 'ห้างหุ้นส่วนจำกัด อุบลเทคนิค',
                address: '88 ถ.ชยางกูร ต.ในเมือง อ.เมือง จ.อุบลราชธานี',
                phone: '045-789012',
                latitude: 15.2340,
                longitude: 104.8602,
                checkInRadius: 500,
                isMOU: true
            }
        ]);
        console.log('✅ สร้างสถานประกอบการแล้ว');

        // สร้าง Admin
        await User.create({
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            firstName: 'ผู้ดูแล',
            lastName: 'ระบบ',
            email: 'admin@ubtc.ac.th'
        });
        console.log('✅ สร้าง Admin แล้ว (username: admin, password: admin123)');

        // สร้าง Teacher ตัวอย่าง
        const teacher = await User.create({
            username: 'teacher01',
            password: 'teacher123',
            role: 'teacher',
            firstName: 'สมชาย',
            lastName: 'ใจดี',
            email: 'somchai@ubtc.ac.th',
            department: itDept._id
        });
        console.log('✅ สร้าง Teacher แล้ว (username: teacher01, password: teacher123)');

        // สร้าง Mentor ตัวอย่าง
        const mentor = await User.create({
            username: 'mentor01',
            password: 'mentor123',
            role: 'mentor',
            firstName: 'สุดา',
            lastName: 'รักงาน',
            email: 'suda@company.com',
            company: companies[0]._id
        });
        console.log('✅ สร้าง Mentor แล้ว (username: mentor01, password: mentor123)');

        // สร้าง Student ตัวอย่าง
        const itMajor = majors.find(m => m.code === 'IT01');
        const pvsDirect = curriculums.find(c => c.code === 'pvs-direct');

        await User.create({
            username: 'student01',
            password: 'student123',
            role: 'student',
            firstName: 'นักศึกษา',
            lastName: 'ทดสอบ',
            email: 'student@ubtc.ac.th',
            studentId: '66301010001',
            department: itDept._id,
            major: itMajor._id,
            level: pvsLevel._id,
            curriculum: pvsDirect._id,
            company: companies[0]._id,
            teacher: teacher._id
        });
        console.log('✅ สร้าง Student แล้ว (username: student01, password: student123)');

        console.log('\n🎉 Seed Database เสร็จสมบูรณ์!');
        console.log('\n📝 บัญชีผู้ใช้สำหรับทดสอบ:');
        console.log('   Admin:   username: admin,     password: admin123');
        console.log('   Teacher: username: teacher01, password: teacher123');
        console.log('   Mentor:  username: mentor01,  password: mentor123');
        console.log('   Student: username: student01, password: student123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed Error:', error);
        process.exit(1);
    }
};

seedDatabase();
