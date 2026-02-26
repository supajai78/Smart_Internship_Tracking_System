const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../middlewares/jwt');

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
        }

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user._id, username: user.username,
                firstName: user.firstName, lastName: user.lastName,
                role: user.role, avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
        res.json({
            id: user._id, username: user.username,
            firstName: user.firstName, lastName: user.lastName,
            role: user.role, avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาด' });
    }
};
