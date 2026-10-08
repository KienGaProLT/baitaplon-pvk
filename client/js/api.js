/**
 * ==========================================================================
 * API Client Module - client/js/api.js
 * Chịu trách nhiệm thực hiện các yêu cầu HTTP fetch() gửi tới Express Backend.
 * ==========================================================================
 */

const API_BASE = '/api';

export const api = {
  /**
   * Gọi API Đăng nhập
   * @param {Object} credentials - { username, password }
   */
  async login(credentials) {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi kết nối server khi đăng nhập:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể kết nối đến máy chủ API backend! Hãy đảm bảo server Express đang chạy.' }
      };
    }
  },

  /**
   * Gọi API Đăng ký tài khoản
   * @param {Object} userData - { username, password, role }
   */
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi kết nối server khi đăng ký:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể kết nối đến máy chủ API backend! Hãy đảm bảo server Express đang chạy.' }
      };
    }
  },

  /**
   * Gọi API Lấy toàn bộ danh sách câu hỏi
   */
  async getQuestions() {
    try {
      const response = await fetch(`${API_BASE}/questions`);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi kết nối khi tải danh sách câu hỏi:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, questions: [], message: 'Lỗi kết nối máy chủ' }
      };
    }
  },

  /**
   * Gọi API Thêm câu hỏi mới (Giảng viên)
   * @param {Object} questionData - { question, options, correct, explanation }
   */
  async addQuestion(questionData) {
    try {
      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi thêm câu hỏi:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể gửi câu hỏi đến máy chủ!' }
      };
    }
  },

  /**
   * Gọi API Thêm câu hỏi theo quiz_id (POST /api/quizzes/:id/questions)
   * @param {number|string} quizId - ID bài trắc nghiệm
   * @param {Object} questionData - { question, options, correct, explanation }
   */
  async addQuestionToQuiz(quizId, questionData) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn(`[API] Lỗi khi thêm câu hỏi vào bài thi [${quizId}]:`, error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể thêm câu hỏi vào bài thi!' }
      };
    }
  },

  /**
   * Gọi API Xóa câu hỏi (Giảng viên)
   * @param {number|string} id - ID câu hỏi
   */
  async deleteQuestion(id) {
    try {
      const response = await fetch(`${API_BASE}/questions/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi xóa câu hỏi:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể xóa câu hỏi trên máy chủ!' }
      };
    }
  },

  /**
   * Gọi API Khôi phục bộ câu hỏi mặc định
   */
  async resetQuestions() {
    try {
      const response = await fetch(`${API_BASE}/questions/reset`, {
        method: 'POST'
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi reset câu hỏi:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể khôi phục câu hỏi trên máy chủ!' }
      };
    }
  },

  /**
   * 1. Gọi API Lấy danh sách tất cả các bài trắc nghiệm (GET /api/quizzes)
   */
  async getQuizzes() {
    try {
      const response = await fetch(`${API_BASE}/quizzes`);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi lấy danh sách bài trắc nghiệm:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, quizzes: [], message: 'Không thể kết nối đến máy chủ!' }
      };
    }
  },

  /**
   * 2. Gọi API Lấy danh sách câu hỏi theo từng quiz_id (GET /api/quizzes/:id/questions)
   * @param {number|string} quizId - ID bài trắc nghiệm
   */
  async getQuizQuestions(quizId) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${quizId}/questions`);
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn(`[API] Lỗi khi lấy câu hỏi bài thi [${quizId}]:`, error);
      return {
        ok: false,
        status: 0,
        data: { success: false, questions: [], message: 'Không thể nạp câu hỏi bài thi!' }
      };
    }
  },

  /**
   * 3. Gọi API Lưu kết quả bài làm của người dùng (POST /api/quiz-results)
   * @param {Object} resultData - { userId, quizId, score, correctAnswers, totalQuestions, timeSpent }
   */
  async saveQuizResult(resultData) {
    try {
      const response = await fetch(`${API_BASE}/quiz-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi lưu kết quả bài thi:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể lưu kết quả bài thi lên máy chủ!' }
      };
    }
  },

  /**
   * 4. Gọi API Cho phép giảng viên tạo bài trắc nghiệm mới (POST /api/quizzes)
   * @param {Object} quizData - { title, description, created_by, questions }
   */
  async createQuiz(quizData) {
    try {
      const response = await fetch(`${API_BASE}/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn('[API] Lỗi khi tạo bài trắc nghiệm mới:', error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể gửi yêu cầu tạo bài trắc nghiệm!' }
      };
    }
  },

  /**
   * 5. Gọi API Xóa bài trắc nghiệm (DELETE /api/quizzes/:id)
   * @param {number|string} id - ID bài trắc nghiệm cần xóa
   */
  async deleteQuiz(id) {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.warn(`[API] Lỗi khi xóa bài trắc nghiệm [${id}]:`, error);
      return {
        ok: false,
        status: 0,
        data: { success: false, message: 'Không thể kết nối đến máy chủ để xóa bài trắc nghiệm!' }
      };
    }
  }
};

