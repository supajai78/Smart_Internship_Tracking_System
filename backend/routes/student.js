const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middlewares/jwt');
const c = require('../controllers/studentController');

router.use(verifyToken);
router.use(requireRole('student'));

// Dashboard
router.get('/dashboard', c.getDashboard);

// Attendance
router.get('/attendance', c.getAttendance);
router.post('/attendance/checkin', c.checkIn);
router.post('/attendance/checkout', c.checkOut);

// Leave Requests
router.get('/leave-requests', c.getLeaveRequests);
router.post('/leave-requests', c.createLeaveRequest);

// Daily Logs
router.get('/daily-logs', c.getDailyLogs);
router.post('/daily-logs', c.createDailyLog);
router.put('/daily-logs/:id', c.updateDailyLog);

// Weekly Reports
router.get('/weekly-reports', c.getWeeklyReports);
router.post('/weekly-reports', c.createWeeklyReport);

module.exports = router;
