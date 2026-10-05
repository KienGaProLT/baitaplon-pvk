/**
 * ==========================================================================
 * Quiz Results Routes - server/routes/quizResults.js
 * Quản lý API Lưu kết quả thi của người dùng (Chuẩn Microsoft SQL Server)
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { sql, dbConfig } = require('../database');

/**
 * 1. POST /api/quiz-results
 * Lưu kết quả bài làm của người dùng
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId, user_id,
      quizId, quiz_id,
      score = 0,
      correctAnswers, correct_answers,
      totalQuestions, total_questions,
      timeSpent, time_spent
    } = req.body;

    const finalUserId = userId || user_id || null;
    const finalQuizId = quizId || quiz_id || null;
    const finalScore = parseFloat(score) || 0;
    const finalTotal = parseInt(totalQuestions || total_questions, 10) || 0;
    const finalCorrect = parseInt(
      correctAnswers !== undefined ? correctAnswers : (correct_answers !== undefined ? correct_answers : 0),
      10
    );
    const finalTime = parseInt(timeSpent || time_spent, 10) || 0;

    const pool = await sql.connect(dbConfig);

    // Kiểm tra xem bảng quiz_results có các cột phụ hay không
    const colCheck = await pool.request().query(`
      SELECT 
        COUNT(CASE WHEN name = 'correct_answers' THEN 1 END) as has_correct,
        COUNT(CASE WHEN name = 'time_spent' THEN 1 END) as has_time
      FROM sys.columns 
      WHERE object_id = OBJECT_ID('quiz_results')
    `);

    const hasCorrect = colCheck.recordset[0].has_correct > 0;
    const hasTime = colCheck.recordset[0].has_time > 0;

    let query = '';
    const request = pool.request()
      .input('userId', sql.Int, finalUserId)
      .input('quizId', sql.Int, finalQuizId)
      .input('score', sql.Float, finalScore)
      .input('total', sql.Int, finalTotal);

    if (hasCorrect && hasTime) {
      query = `
        INSERT INTO quiz_results (user_id, quiz_id, score, total_questions, correct_answers, time_spent)
        VALUES (@userId, @quizId, @score, @total, @correct, @time)
      `;
      request.input('correct', sql.Int, finalCorrect);
      request.input('time', sql.Int, finalTime);
    } else {
      query = `
        INSERT INTO quiz_results (user_id, quiz_id, score, total_questions)
        VALUES (@userId, @quizId, @score, @total)
      `;
    }

    await request.query(query);

    return res.status(201).json({
      success: true,
      message: 'Đã lưu kết quả bài thi thành công vào CSDL!',
      data: {
        userId: finalUserId,
        quizId: finalQuizId,
        score: finalScore,
        totalQuestions: finalTotal,
        correctAnswers: finalCorrect,
        timeSpent: finalTime
      }
    });
  } catch (error) {
    console.error('Lỗi POST /api/quiz-results:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lưu kết quả bài thi: ' + error.message
    });
  }
});

/**
 * 2. GET /api/quiz-results
 * Lấy danh sách lịch sử kết quả thi
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId || req.query.user_id;
    const pool = await sql.connect(dbConfig);

    let query = `
      SELECT 
        r.id,
        r.user_id,
        r.quiz_id,
        r.score,
        r.total_questions,
        r.created_at,
        u.username,
        q.title AS quiz_title
      FROM quiz_results r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN quizzes q ON r.quiz_id = q.id
    `;

    const request = pool.request();

    if (userId) {
      query += ` WHERE r.user_id = @userId`;
      request.input('userId', sql.Int, userId);
    }

    query += ` ORDER BY r.id DESC`;

    const result = await request.query(query);

    return res.json({
      success: true,
      count: result.recordset.length,
      results: result.recordset
    });
  } catch (error) {
    console.error('Lỗi GET /api/quiz-results:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải lịch sử kết quả bài thi: ' + error.message
    });
  }
});

module.exports = router;