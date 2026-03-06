require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// เชื่อมต่อ Database
connectDB();

// CORS
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/student', require('./routes/student'));

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'เกิดข้อผิดพลาด', error: err.message });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server ทำงานที่ http://localhost:${PORT}`);
});
