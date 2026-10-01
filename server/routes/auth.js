/**
 * ==========================================================================
 * Auth Routes - server/routes/auth.js
 * Quản lý các API Đăng ký, Đăng nhập và xác thực tài khoản.
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { dbGet, dbRun } = require('../database');

/**
 * POST /api/auth/register
 * Đăng ký tài khoản mới
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role = 'student' } = req.body;

    const trimmedUsername = (username || '').trim();

    // 1. Kiểm tra username
    if (!trimmedUsername) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên tài khoản đăng ký!'
      });
    }

    if (trimmedUsername.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Tên tài khoản phải có độ dài từ 3 ký tự trở lên!'
      });
    }

    // 2. Ràng buộc bảo mật: Mật khẩu bắt buộc phải có '@'
    if (!password || !password.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật."
      });
    }

    // 3. Kiểm tra vai trò hợp lệ
    const validRoles = ['student', 'teacher'];
    const assignedRole = validRoles.includes(role) ? role : 'student';

    // 4. Kiểm tra tài khoản đã tồn tại chưa
    const existingUser = await dbGet(
      `SELECT id FROM users WHERE LOWER(username) = LOWER(?)`,
      [trimmedUsername]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `Tài khoản "${trimmedUsername}" đã tồn tại trên hệ thống! Vui lòng chọn tên khác.`
      });
    }

    // 5. Lưu tài khoản mới vào SQLite
    const result = await dbRun(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      [trimmedUsername, password, assignedRole]
    );

    const roleLabel = assignedRole === 'teacher' ? 'Giảng viên' : 'Sinh viên';

    return res.status(201).json({
      success: true,
      message: `🎉 Đăng ký thành công tài khoản "${trimmedUsername}" (${roleLabel})!`,
      user: {
        id: result.lastID,
        username: trimmedUsername,
        role: assignedRole
      }
    });
  } catch (error) {
    console.error('Lỗi API /api/auth/register:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng ký tài khoản: ' + error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Đăng nhập tài khoản
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const trimmedUsername = (username || '').trim();

    if (!trimmedUsername) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập tên đăng nhập!'
      });
    }

    if (!password || !password.includes('@')) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật."
      });
    }

    // Tra cứu trong CSDL SQLite
    const user = await dbGet(
      `SELECT id, username, password, role FROM users WHERE LOWER(username) = LOWER(?)`,
      [trimmedUsername]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Tài khoản "${trimmedUsername}" chưa tồn tại! Vui lòng bấm vào tab 'Đăng Ký' để tạo tài khoản mới.`
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu không chính xác! Vui lòng kiểm tra lại.'
      });
    }

    return res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi API /api/auth/login:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi đăng nhập: ' + error.message
    });
  }
});

module.exports = router;
