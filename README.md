# Smart Internship Tracking System

ระบบติดตามการฝึกงานของนักศึกษา ปวช./ปวส. วิทยาลัยเทคนิคอุบลราชธานี

## การติดตั้ง

```bash
# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# รัน TailwindCSS watcher (เปิด terminal อีกอัน)
npm run tailwind
```

## เทคโนโลยีที่ใช้

- **Frontend:** HTML + TailwindCSS + JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Template Engine:** EJS

## โครงสร้างโฟลเดอร์

```
├── config/          # ไฟล์ config (database, etc.)
├── controllers/     # Business logic
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── public/          # Static files (CSS, JS, Images)
├── routes/          # Express routes
├── views/           # EJS templates
├── utils/           # Helper functions
├── app.js           # Main application
└── .env             # Environment variables
```
