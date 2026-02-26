const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/jwt');
const c = require('../controllers/mentorController');

router.use(verifyToken);
router.use(requireRole('mentor'));

// Dashboard
router.get('/dashboard', c.getDashboard);

// Students
router.get('/students', c.getStudents);
router.get('/students/:id', c.getStudent);

// Leave Requests
router.get('/leave-requests', c.getLeaveRequests);
router.put('/leave-requests/:id/approve', c.approveLeaveRequest);
router.put('/leave-requests/:id/reject', c.rejectLeaveRequest);

// Evaluations
router.get('/evaluations', c.getEvaluations);
router.post('/evaluations/:studentId', c.createEvaluation);

module.exports = router;
