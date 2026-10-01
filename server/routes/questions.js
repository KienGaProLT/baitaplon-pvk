/**
 * ==========================================================================
 * Questions Routes - server/routes/questions.js
 * Quản lý các API câu hỏi: Lấy danh sách, Thêm mới, Xóa, Khôi phục mặc định.
 * ==========================================================================
 */

const express = require('express');
const router = express.Router();
const { dbAll, dbGet, dbRun, resetDefaultQuestions } = require('../database');

/**
 * Helper chuyển bản ghi từ SQLite thành đối tượng câu hỏi chuẩn
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
    question: row.question,
    options: options,
    correct: Number(row.correct),
    explanation: row.explanation,
    createdAt: row.created_at
  };
}

/**
 * GET /api/questions
 * Lấy toàn bộ danh sách câu hỏi trắc nghiệm
 */
router.get('/', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM questions ORDER BY id ASC`);
    const questions = rows.map(formatQuestionRow);

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
 * POST /api/questions
 * Thêm câu hỏi mới vào ngân hàng đề thi (chức năng Giảng viên)
 */
router.post('/', async (req, res) => {
  try {
    const { question, options, correct, explanation } = req.body;

    const trimmedQuestion = (question || '').trim();
    const trimmedExplanation = (explanation || '').trim();
    const correctIndex = parseInt(correct, 10);

    // Kiểm tra tính hợp lệ
    if (!trimmedQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung câu hỏi không được để trống!'
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Danh sách đáp án phải có ít nhất 2 lựa chọn!'
      });
    }

    // Lọc và làm sạch đáp án
    const cleanOptions = options.map(opt => String(opt || '').trim());
    if (cleanOptions.some(opt => opt.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Các ô đáp án không được để trống!'
      });
    }

    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex >= cleanOptions.length) {
      return res.status(400).json({
        success: false,
        message: 'Chỉ số đáp án đúng không hợp lệ!'
      });
    }

    if (!trimmedExplanation) {
      return res.status(400).json({
        success: false,
        message: 'Giải thích chi tiết không được để trống!'
      });
    }

    // Lưu vào SQLite
    const optionsJson = JSON.stringify(cleanOptions);
    const result = await dbRun(
      `INSERT INTO questions (question, options, correct, explanation) VALUES (?, ?, ?, ?)`,
      [trimmedQuestion, optionsJson, correctIndex, trimmedExplanation]
    );

    const newQuestion = {
      id: result.lastID,
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
 * DELETE /api/questions/:id
 * Xóa một câu hỏi khỏi ngân hàng đề thi
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID câu hỏi không hợp lệ!'
      });
    }

    // Đảm bảo ngân hàng đề luôn có ít nhất 1 câu hỏi
    const countRow = await dbGet(`SELECT COUNT(*) as count FROM questions`);
    const totalCount = countRow ? countRow.count : 0;
    if (totalCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Ngân hàng đề thi phải giữ lại ít nhất 1 câu hỏi!'
      });
    }

    // Kiểm tra câu hỏi có tồn tại không
    const existing = await dbGet(`SELECT id FROM questions WHERE id = ?`, [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy câu hỏi cần xóa!'
      });
    }

    // Thực hiện xóa
    await dbRun(`DELETE FROM questions WHERE id = ?`, [id]);

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

/**
 * POST /api/questions/reset
 * Khôi phục lại bộ câu hỏi gốc mặc định
 */
router.post('/reset', async (req, res) => {
  try {
    const resetRows = await resetDefaultQuestions();
    const questions = resetRows.map(formatQuestionRow);

    return res.json({
      success: true,
      message: 'Đã khôi phục bộ 10 câu hỏi mặc định thành công!',
      count: questions.length,
      questions: questions
    });
  } catch (error) {
    console.error('Lỗi POST /api/questions/reset:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể khôi phục câu hỏi: ' + error.message
    });
  }
});

module.exports = router;
