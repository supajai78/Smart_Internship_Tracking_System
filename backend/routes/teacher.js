const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/jwt');
const c = require('../controllers/teacherController');

router.use(verifyToken);
router.use(requireRole('teacher'));

// Dashboard
router.get('/dashboard', c.getDashboard);

// Students
router.get('/students', c.getStudents);
router.get('/students/:id', c.getStudent);

// Supervisions
router.get('/supervisions', c.getSupervisions);
router.get('/supervisions/form-data', c.getSupervisionFormData);
router.post('/supervisions', c.createSupervision);

// Evaluations
router.get('/evaluations', c.getEvaluations);
router.post('/evaluations/:studentId', c.createEvaluation);

// Weekly Reports
router.get('/weekly-reports', c.getWeeklyReports);
router.put('/weekly-reports/:id/approve', c.approveWeeklyReport);

module.exports = router;
