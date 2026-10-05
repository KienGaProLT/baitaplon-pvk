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
 * Lấy danh sách tất cả các bài trắc nghiệm kèm số lượng câu hỏi
 */
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT q.*, 
             (SELECT COUNT(*) FROM questions qs WHERE qs.quiz_id = q.id) AS question_count
      FROM quizzes q 
      ORDER BY q.id ASC
    `);

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
    const quizId = parseInt(req.params.id, 10);
    const pool = await getPool();

    const result = await pool.request()
      .input('quizId', sql.Int, quizId)
      .query('SELECT * FROM questions WHERE quiz_id = @quizId ORDER BY id ASC');

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
 * POST /api/quizzes/:id/questions
 * Thêm câu hỏi trực tiếp vào bài trắc nghiệm theo quiz_id (RESTful endpoint)
 */
router.post('/:id/questions', async (req, res) => {
  try {
    const quizId = parseInt(req.params.id, 10);
    const { question, options, correct, explanation } = req.body;

    const trimmedQuestion = (question || '').trim();
    const trimmedExplanation = (explanation || '').trim();
    const correctIndex = parseInt(correct, 10);

    if (!trimmedQuestion) {
      return res.status(400).json({ success: false, message: 'Nội dung câu hỏi không được để trống!' });
    }
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ success: false, message: 'Danh sách đáp án phải có ít nhất 2 lựa chọn!' });
    }
    const cleanOptions = options.map(opt => String(opt || '').trim());
    if (cleanOptions.some(opt => opt.length === 0)) {
      return res.status(400).json({ success: false, message: 'Các ô đáp án không được để trống!' });
    }
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= cleanOptions.length) {
      return res.status(400).json({ success: false, message: 'Chỉ số đáp án đúng không hợp lệ!' });
    }
    if (!trimmedExplanation) {
      return res.status(400).json({ success: false, message: 'Giải thích chi tiết không được để trống!' });
    }

    const pool = await getPool();
    const optionsJson = JSON.stringify(cleanOptions);
    const insertResult = await pool.request()
      .input('quizId', sql.Int, quizId)
      .input('question', sql.NVarChar, trimmedQuestion)
      .input('options', sql.NVarChar, optionsJson)
      .input('correct', sql.Int, correctIndex)
      .input('explanation', sql.NVarChar, trimmedExplanation)
      .query(`
        INSERT INTO questions (quiz_id, question, options, correct, explanation) 
        OUTPUT INSERTED.id 
        VALUES (@quizId, @question, @options, @correct, @explanation)
      `);

    const newId = insertResult.recordset[0].id;

    return res.status(201).json({
      success: true,
      message: 'Đã thêm câu hỏi thành công vào bài thi!',
      question: {
        id: newId,
        quiz_id: quizId,
        question: trimmedQuestion,
        options: cleanOptions,
        correct: correctIndex,
        explanation: trimmedExplanation
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/quizzes/:id/questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể thêm câu hỏi vào bài thi: ' + error.message
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