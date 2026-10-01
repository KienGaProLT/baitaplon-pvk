/**
 * ==========================================================================
 * Express Server - server/server.js
 * Chạy máy chủ Express, phục vụ API backend và Static Files cho Client.
 * Tích hợp dotenv để nạp biến môi trường từ file .env.
 * ==========================================================================
 */

const path = require('path');

// Gọi cấu hình môi trường dotenv (ưu tiên file server/.env và fallback root .env)
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv/config');

const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database');

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log các HTTP request
app.use((req, res, next) => {
  const now = new Date().toLocaleTimeString('vi-VN');
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// Phục vụ thư mục giao diện tĩnh client/
const CLIENT_DIR = path.join(__dirname, '../client');
app.use(express.static(CLIENT_DIR));

// Mount các API routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'SQL Server',
    timestamp: new Date().toISOString(),
    uptime: `${Math.round(process.uptime())}s`
  });
});

// Fallback: mọi yêu cầu không phải API đều trả về file index.html trong client/
app.get('*', (req, res) => {
  res.sendFile(path.join(CLIENT_DIR, 'index.html'));
});

// Khởi chạy CSDL và Server
async function startServer() {
  try {
    console.log('[Server] Đang kết nối và khởi tạo CSDL SQL Server...');
    await initDatabase();
    console.log('[Server] CSDL SQL Server đã sẵn sàng.');

    app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🚀 Quiz App Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📁 Client Web App: http://localhost:${PORT}`);
      console.log(`📡 API Auth:       http://localhost:${PORT}/api/auth`);
      console.log(`📡 API Questions:  http://localhost:${PORT}/api/questions`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server kết nối SQL Server:', error.message);
    console.error('💡 Vui lòng đảm bảo:');
    console.error('   1. Dịch vụ Microsoft SQL Server đang chạy.');
    console.error('   2. Thông tin đăng nhập trong file server/.env là chính xác.');
    console.error(`   3. Cơ sở dữ liệu [${process.env.DB_DATABASE || 'QuanLyDiemDB'}] đã được tạo trên SQL Server.`);
    process.exit(1);
  }
}

startServer();
