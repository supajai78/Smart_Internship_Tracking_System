const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB เชื่อมต่อสำเร็จ: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB เชื่อมต่อล้มเหลว: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
