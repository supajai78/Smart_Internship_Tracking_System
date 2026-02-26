const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/jwt');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getMe);

module.exports = router;
