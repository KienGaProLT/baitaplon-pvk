/**
 * ==========================================================================
 * Quizzes Routes - server/routes/quizzes.js
 * Quản lý API Bài trắc nghiệm (Chuẩn Microsoft SQL Server)
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../database');

/**
 * 1. GET /api/quizzes
 * Lấy danh sách tất cả các bài trắc nghiệm
 */
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query('SELECT * FROM quizzes ORDER BY id DESC');

    return res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi GET /api/quizzes:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách bài trắc nghiệm: ' + error.message
    });
  }
});

/**
 * 2. GET /api/quizzes/:id/questions
 * Lấy danh sách câu hỏi theo ID bài trắc nghiệm
 */
router.get('/:id/questions', async (req, res) => {
  try {
    const quizId = req.params.id;
    const pool = await getPool();

    const result = await pool.request()
      .input('quizId', sql.Int, quizId)
      .query('SELECT * FROM questions WHERE quiz_id = @quizId');

    return res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi GET /api/quizzes/:id/questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách câu hỏi: ' + error.message
    });
  }
});

/**
 * 3. POST /api/quizzes
 * Tạo bài trắc nghiệm mới
 */
router.post('/', async (req, res) => {
  try {
    const { title, description, created_by } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề bài trắc nghiệm không được để trống!'
      });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('createdBy', sql.Int, created_by || 1)
      .query(`
        INSERT INTO quizzes (title, description, created_by) 
        OUTPUT INSERTED.id 
        VALUES (@title, @description, @createdBy)
      `);

    return res.status(201).json({
      success: true,
      message: 'Tạo bài trắc nghiệm thành công!',
      quizId: result.recordset[0].id
    });
  } catch (error) {
    console.error('Lỗi POST /api/quizzes:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo bài trắc nghiệm: ' + error.message
    });
  }
});

module.exports = router;