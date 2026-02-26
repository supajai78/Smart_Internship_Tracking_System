const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'smart-internship-secret-key';

// สร้าง JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            username: user.username,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Middleware: ตรวจสอบ JWT Token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
};

// Middleware: ตรวจสอบ Role
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'คุณไม่มีสิทธิ์เข้าถึง' });
        }

        next();
    };
};

module.exports = {
    JWT_SECRET,
    generateToken,
    verifyToken,
    requireRole
};
