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
  }
};
