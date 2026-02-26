const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/jwt');
const c = require('../controllers/adminController');

router.use(verifyToken);
router.use(requireRole('admin'));

// Dashboard
router.get('/dashboard', c.getDashboard);

// Academic Years
router.get('/academic-years', c.getAcademicYears);
router.post('/academic-years', c.createAcademicYear);
router.get('/academic-years/:id', c.getAcademicYear);
router.put('/academic-years/:id', c.updateAcademicYear);
router.delete('/academic-years/:id', c.deleteAcademicYear);

// Departments
router.get('/departments', c.getDepartments);
router.post('/departments', c.createDepartment);
router.get('/departments/:id', c.getDepartment);
router.put('/departments/:id', c.updateDepartment);
router.delete('/departments/:id', c.deleteDepartment);

// Majors
router.get('/majors', c.getMajors);
router.post('/majors', c.createMajor);
router.get('/majors/:id', c.getMajor);
router.put('/majors/:id', c.updateMajor);
router.delete('/majors/:id', c.deleteMajor);

// Sections
router.get('/sections', c.getSections);
router.post('/sections', c.createSection);
router.get('/sections/:id', c.getSection);
router.put('/sections/:id', c.updateSection);
router.delete('/sections/:id', c.deleteSection);

// Levels
router.get('/levels', c.getLevels);
router.post('/levels', c.createLevel);
router.get('/levels/:id', c.getLevel);
router.put('/levels/:id', c.updateLevel);
router.delete('/levels/:id', c.deleteLevel);

// Curriculums
router.get('/curriculums', c.getCurriculums);
router.post('/curriculums', c.createCurriculum);
router.get('/curriculums/:id', c.getCurriculum);
router.put('/curriculums/:id', c.updateCurriculum);
router.delete('/curriculums/:id', c.deleteCurriculum);

// Companies
router.get('/companies', c.getCompanies);
router.post('/companies', c.createCompany);
router.get('/companies/:id', c.getCompany);
router.put('/companies/:id', c.updateCompany);
router.delete('/companies/:id', c.deleteCompany);

// Users
router.get('/users', c.getUsers);
router.get('/users/form-data', c.getUserFormData);
router.get('/users/:id', c.getUser);
router.post('/users', c.createUser);
router.put('/users/:id', c.updateUser);
router.delete('/users/:id', c.deleteUser);

module.exports = router;
