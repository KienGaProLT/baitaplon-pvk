/**
 * ==========================================================================
 * Express Server - server/server.js
 * Chạy máy chủ Express, phục vụ API backend và Static Files cho Client.
 * ==========================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
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
    console.log('[Server] Đang kết nối và khởi tạo CSDL SQLite...');
    await initDatabase();
    console.log('[Server] CSDL SQLite đã sẵn sàng.');

    app.listen(PORT, () => {
      console.log('========================================================');
      console.log(`🚀 Quiz App Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📁 Client Web App: http://localhost:${PORT}`);
      console.log(`📡 API Auth:       http://localhost:${PORT}/api/auth`);
      console.log(`📡 API Questions:  http://localhost:${PORT}/api/questions`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('❌ Không thể khởi động server:', error);
    process.exit(1);
  }
}

startServer();
