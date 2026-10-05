/**
 * ==========================================================================
 * Questions Routes - server/routes/questions.js
 * Quản lý các API câu hỏi (Chuẩn Microsoft SQL Server)
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { sql, dbConfig } = require('../database');

/**
 * Helper chuyển bản ghi từ SQL Server thành đối tượng câu hỏi chuẩn
 */
function formatQuestionRow(row) {
  let options = [];
  try {
    options = typeof row.options === 'string' ? JSON.parse(row.options) : row.options;
  } catch (e) {
    options = [];
  }

  return {
    id: row.id,
    quizId: row.quiz_id,
    quiz_id: row.quiz_id,
    question: row.question,
    options: options,
    correct: Number(row.correct),
    explanation: row.explanation,
    createdAt: row.created_at
  };
}

/**
 * 1. GET /api/questions
 * Lấy danh sách câu hỏi trắc nghiệm (hỗ trợ lọc theo query ?quiz_id=...)
 */
router.get('/', async (req, res) => {
  try {
    const quizId = req.query.quiz_id || req.query.quizId;
    const pool = await sql.connect(dbConfig);

    let query = `SELECT * FROM questions`;
    const request = pool.request();

    if (quizId) {
      query += ` WHERE quiz_id = @quizId`;
      request.input('quizId', sql.Int, parseInt(quizId, 10));
    }

    query += ` ORDER BY id ASC`;

    const result = await request.query(query);
    const questions = result.recordset.map(formatQuestionRow);

    return res.json({
      success: true,
      count: questions.length,
      questions: questions
    });
  } catch (error) {
    console.error('Lỗi GET /api/questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tải danh sách câu hỏi: ' + error.message
    });
  }
});

/**
 * 2. POST /api/questions
 * Thêm câu hỏi mới vào ngân hàng đề thi (chức năng Giảng viên)
 */
router.post('/', async (req, res) => {
  try {
    const { question, options, correct, explanation, quiz_id, quizId } = req.body;

    const trimmedQuestion = (question || '').trim();
    const trimmedExplanation = (explanation || '').trim();
    const correctIndex = parseInt(correct, 10);

    const pool = await sql.connect(dbConfig);

    // Xác định quiz_id tương ứng
    let targetQuizId = parseInt(quiz_id || quizId, 10);
    if (isNaN(targetQuizId)) {
      const topQuizResult = await pool.request().query(`SELECT TOP 1 id FROM quizzes ORDER BY id ASC`);
      targetQuizId = topQuizResult.recordset.length > 0 ? topQuizResult.recordset[0].id : 1;
    }

    // Kiểm tra tính hợp lệ
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

    // Lưu vào SQL Server
    const optionsJson = JSON.stringify(cleanOptions);
    const insertResult = await pool.request()
      .input('targetQuizId', sql.Int, targetQuizId)
      .input('trimmedQuestion', sql.NVarChar, trimmedQuestion)
      .input('optionsJson', sql.NVarChar, optionsJson)
      .input('correctIndex', sql.Int, correctIndex)
      .input('trimmedExplanation', sql.NVarChar, trimmedExplanation)
      .query(`
        INSERT INTO questions (quiz_id, question, options, correct, explanation) 
        OUTPUT INSERTED.id 
        VALUES (@targetQuizId, @trimmedQuestion, @optionsJson, @correctIndex, @trimmedExplanation)
      `);

    const newId = insertResult.recordset[0].id;

    const newQuestion = {
      id: newId,
      quiz_id: targetQuizId,
      question: trimmedQuestion,
      options: cleanOptions,
      correct: correctIndex,
      explanation: trimmedExplanation
    };

    return res.status(201).json({
      success: true,
      message: 'Đã thêm câu hỏi thành công vào ngân hàng đề!',
      question: newQuestion
    });
  } catch (error) {
    console.error('Lỗi POST /api/questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể thêm câu hỏi: ' + error.message
    });
  }
});

/**
 * 3. DELETE /api/questions/:id
 * Xóa một câu hỏi khỏi ngân hàng đề thi
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: 'ID câu hỏi không hợp lệ!' });
    }

    const pool = await sql.connect(dbConfig);

    // Đảm bảo ngân hàng đề luôn có ít nhất 1 câu hỏi
    const countResult = await pool.request().query(`SELECT COUNT(*) as count FROM questions`);
    const totalCount = countResult.recordset[0].count;
    if (totalCount <= 1) {
      return res.status(400).json({ success: false, message: 'Ngân hàng đề thi phải giữ lại ít nhất 1 câu hỏi!' });
    }

    // Kiểm tra câu hỏi có tồn tại không
    const existingResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT id FROM questions WHERE id = @id`);

    if (existingResult.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi cần xóa!' });
    }

    // Thực hiện xóa
    await pool.request()
      .input('id', sql.Int, id)
      .query(`DELETE FROM questions WHERE id = @id`);

    return res.json({
      success: true,
      message: 'Đã xóa câu hỏi thành công!'
    });
  } catch (error) {
    console.error('Lỗi DELETE /api/questions/:id:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xóa câu hỏi: ' + error.message
    });
  }
});

module.exports = router;