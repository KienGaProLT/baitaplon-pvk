/**
 * ==========================================================================
 * Quiz Module - client/js/quiz.js
 * Quản lý logic thi trắc nghiệm, tính điểm, đếm ngược thời gian,
 * hiệu ứng âm thanh & pháo hoa confetti, và Quản trị câu hỏi (Admin).
 * ==========================================================================
 */

import { api } from './api.js';

// Dữ liệu dự phòng nếu máy chủ chưa nạp kịp
const FALLBACK_QUESTIONS = [
  {
    id: 1,
    question: "Từ khóa nào trong JavaScript được dùng để khai báo một biến có phạm vi khối (block scope) và không thể gán lại giá trị?",
    options: ["var", "let", "const", "static"],
    correct: 2,
    explanation: "'const' tạo ra một hằng số có phạm vi khối (block scope). Giá trị của biến const không thể gán lại bằng toán tử gán (=)."
  },
  {
    id: 2,
    question: "Phương thức nào của Array trả về một mảng mới chứa các phần tử thỏa mãn điều kiện kiểm tra?",
    options: ["forEach()", "map()", "filter()", "reduce()"],
    correct: 2,
    explanation: "'filter()' lặp qua các phần tử và giữ lại các phần tử trả về 'true' từ hàm callback, tạo thành một mảng mới."
  },
  {
    id: 3,
    question: "Kết quả của biểu thức `typeof NaN` trong JavaScript là gì?",
    options: ["\"undefined\"", "\"number\"", "\"nan\"", "\"object\""],
    correct: 1,
    explanation: "Mặc dù NaN là viết tắt của 'Not-a-Number', kiểu dữ liệu thực tế của nó theo chuẩn ECMAScript vẫn là 'number'."
  },
  {
    id: 4,
    question: "Cơ chế nào trong JavaScript giúp đưa các khai báo hàm và biến lên đầu phạm vi trước khi thực thi?",
    options: ["Closure", "Hoisting", "Event Bubbling", "Currying"],
    correct: 1,
    explanation: "'Hoisting' là cơ chế mặc định của JavaScript giúp đưa phần khai báo (declaration) lên đầu phạm vi của nó trong giai đoạn biên dịch."
  },
  {
    id: 5,
    question: "Sự khác biệt chính giữa toán tử `==` và `===` trong JavaScript là gì?",
    options: [
      "`==` so sánh cả giá trị và kiểu dữ liệu, `===` chỉ so sánh giá trị",
      "`===` kiểm tra nghiêm ngặt cả giá trị và kiểu dữ liệu mà không ép kiểu (type coercion)",
      "`===` chỉ áp dụng cho object và array",
      "Hai toán tử này hoàn toàn tương đương nhau"
    ],
    correct: 1,
    explanation: "`===` (strict equality) không thực hiện ép kiểu ngầm định, do đó hai giá trị chỉ bằng nhau nếu có cùng kiểu và cùng giá trị."
  },
  {
    id: 6,
    question: "Phương thức nào được dùng để chuyển đổi một chuỗi JSON thành đối tượng JavaScript?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"],
    correct: 1,
    explanation: "'JSON.parse()' phân tích một chuỗi văn bản JSON và tạo thành đối tượng/giá trị JavaScript tương ứng."
  },
  {
    id: 7,
    question: "Sự kiện nào được kích hoạt khi toàn bộ cây DOM đã sẵn sàng mà không cần đợi ảnh và stylesheet tải xong?",
    options: ["load", "DOMContentLoaded", "beforeunload", "ready"],
    correct: 1,
    explanation: "'DOMContentLoaded' kích hoạt ngay khi tài liệu HTML đã được tải và phân tích cú pháp hoàn tất, nhanh hơn sự kiện 'load'."
  },
  {
    id: 8,
    question: "Hàm nào sau đây chạy bất đồng bộ (Asynchronous) trong JavaScript?",
    options: ["Math.round()", "Array.prototype.sort()", "fetch()", "String.prototype.toUpperCase()"],
    correct: 2,
    explanation: "'fetch()' là API bất đồng bộ trả về một Promise đại diện cho phản hồi từ máy chủ mạng."
  },
  {
    id: 9,
    question: "Trong JavaScript, 'Closure' được hiểu là gì?",
    options: [
      "Một cách để đóng kết nối cơ sở dữ liệu",
      "Một hàm có khả năng ghi nhớ và truy cập các biến từ phạm vi bên ngoài của nó ngay cả khi phạm vi đó đã thực thi xong",
      "Phương thức đóng cửa sổ trình duyệt",
      "Một biến không thể thay đổi sau khi khởi tạo"
    ],
    correct: 1,
    explanation: "Closure cho phép một hàm bên trong truy cập phạm vi bao bọc bên ngoài (lexical environment) ngay cả sau khi hàm cha đã kết thúc."
  },
  {
    id: 10,
    question: "Phương thức nào sau đây dùng để ngăn chặn hành vi mặc định của một sự kiện (ví dụ: submit form làm tải lại trang)?",
    options: ["event.stopPropagation()", "event.preventDefault()", "event.stopImmediatePropagation()", "event.cancelBubble()"],
    correct: 1,
    explanation: "'event.preventDefault()' thông báo cho trình duyệt không thực thi hành động mặc định vốn có của sự kiện đó."
  }
];

export class QuizManager {
  constructor(dom, showScreenFn, getCurrentUserFn) {
    this.dom = dom;
    this.showScreen = showScreenFn;
    this.getCurrentUser = getCurrentUserFn;

    // Cấu hình thời gian
    this.TIME_PER_QUESTION = 20;

    // Trạng thái Quiz & Quizzes List
    this.quizzes = [];
    this.currentQuiz = null;
    this.questions = [];
    this.adminQuestions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timeLeft = this.TIME_PER_QUESTION;
    this.timerInterval = null;
    this.isAnswered = false;
    this.userAnswers = [];
    this.startTime = null;
    this.totalTimeTaken = 0;
    this.soundEnabled = true;

    // Audio Context
    this.audioCtx = null;

    this.bindEvents();
  }

  /**
   * 1. Tải danh sách tất cả các bài trắc nghiệm từ API (GET /api/quizzes)
   */
  async loadQuizzes() {
    if (this.dom.quizzesGrid) {
      this.dom.quizzesGrid.innerHTML = `
        <div class="quizzes-loading-state">
          <span class="loading-spinner"></span>
          <p>Đang tải danh sách bài trắc nghiệm từ máy chủ SQL Server...</p>
        </div>
      `;
    }

    const res = await api.getQuizzes();

    let list = [];
    if (res.ok) {
      if (Array.isArray(res.data)) {
        list = res.data;
      } else if (res.data && Array.isArray(res.data.quizzes)) {
        list = res.data.quizzes;
      }
    }

    this.quizzes = list;
    this.renderQuizzesList();
  }

  /**
   * Render danh sách thẻ bài trắc nghiệm ra giao diện Trang chủ
   */
  renderQuizzesList() {
    if (!this.dom.quizzesGrid) return;
    this.dom.quizzesGrid.innerHTML = '';

    const count = this.quizzes.length;
    if (this.dom.quizzesCountBadge) {
      this.dom.quizzesCountBadge.textContent = `${count} bài thi`;
    }

    if (count === 0) {
      this.dom.quizzesGrid.innerHTML = `
        <div class="quizzes-empty-state">
          <p>Hiện chưa có bài trắc nghiệm nào trong cơ sở dữ liệu.</p>
          <p class="hint-text">Giảng viên có thể dùng form bên trên để tạo bài trắc nghiệm đầu tiên.</p>
        </div>
      `;
      return;
    }

    this.quizzes.forEach((quiz, index) => {
      const card = document.createElement('div');
      card.className = 'quiz-card-item';

      const questionCount = quiz.question_count !== undefined ? quiz.question_count : 0;
      const creatorName = quiz.creator_name ? quiz.creator_name : (quiz.created_by ? `GV #${quiz.created_by}` : 'Hệ thống');

      card.innerHTML = `
        <div class="quiz-card-top">
          <div class="quiz-card-icon">📝</div>
          <span class="quiz-badge-pill">${questionCount > 0 ? `${questionCount} câu hỏi` : 'Đề thi trắc nghiệm'}</span>
        </div>
        <h4 class="quiz-card-title">${this.escapeHtml(quiz.title)}</h4>
        <p class="quiz-card-desc">${this.escapeHtml(quiz.description || 'Bài thi trắc nghiệm đánh giá kiến thức chuyên môn.')}</p>
        <div class="quiz-card-meta">
          <span class="quiz-meta-item">⏱️ 20 giây / câu</span>
          <span class="quiz-meta-item">👨‍🏫 ${this.escapeHtml(creatorName)}</span>
        </div>
        <div class="quiz-card-actions">
          <button type="button" class="btn btn-primary btn-select-quiz" data-id="${quiz.id}">
            <span>Bắt Đầu Làm Bài</span>
            <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button type="button" class="btn-add-q-to-quiz" data-id="${quiz.id}" title="Thêm câu hỏi vào bài thi này">
            <span>➕ Thêm Câu Hỏi</span>
          </button>
          <button type="button" class="btn-delete-quiz" data-id="${quiz.id}" title="Xóa bài trắc nghiệm này">
            <span>🗑️ Xóa</span>
          </button>
        </div>
      `;

      const btnSelect = card.querySelector('.btn-select-quiz');
      btnSelect.addEventListener('click', () => {
        this.initAudioContext();
        this.playSound('click');
        this.selectAndStartQuiz(quiz);
      });

      const btnAddQ = card.querySelector('.btn-add-q-to-quiz');
      if (btnAddQ) {
        btnAddQ.addEventListener('click', (e) => {
          e.stopPropagation();
          this.initAudioContext();
          this.playSound('click');
          this.openAdminScreen(quiz.id);
        });
      }

      const btnDelete = card.querySelector('.btn-delete-quiz');
      if (btnDelete) {
        btnDelete.addEventListener('click', (e) => {
          e.stopPropagation();
          this.handleDeleteQuiz(quiz.id, quiz.title);
        });
      }

      this.dom.quizzesGrid.appendChild(card);
    });
  }

  /**
   * Xử lý xóa bài trắc nghiệm (DELETE /api/quizzes/:id)
   * Có hộp thoại confirm xác nhận trước khi xóa và tự động tải lại trang sau khi xóa thành công
   * @param {number|string} quizId - ID bài trắc nghiệm
   * @param {string} quizTitle - Tên bài trắc nghiệm
   */
  async handleDeleteQuiz(quizId, quizTitle = '') {
    const titleText = quizTitle ? `"${quizTitle}"` : `mã #${quizId}`;
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa bài trắc nghiệm ${titleText} không?\n\nLưu ý: Hành động này sẽ xóa toàn bộ câu hỏi và kết quả làm bài liên quan.`);
    if (!confirmed) return;

    try {
      this.initAudioContext();
      this.playSound('click');

      const res = await api.deleteQuiz(quizId);
      if (res.ok && res.data && res.data.success) {
        alert(res.data.message || 'Xóa bài trắc nghiệm thành công!');
        window.location.reload();
      } else {
        alert(res.data?.message || 'Không thể xóa bài trắc nghiệm trên máy chủ!');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài trắc nghiệm:', error);
      alert('Đã xảy ra lỗi khi thực hiện xóa bài trắc nghiệm!');
    }
  }


  /**
   * 2. Chọn một bài trắc nghiệm và tải câu hỏi theo quiz_id (GET /api/quizzes/:id/questions)
   * @param {Object} quiz - Đối tượng bài trắc nghiệm được chọn
   */
  async selectAndStartQuiz(quiz) {
    this.currentQuiz = quiz;

    if (this.dom.activeQuizTitle) {
      this.dom.activeQuizTitle.textContent = quiz.title;
    }

    // Gọi API lấy danh sách câu hỏi theo quiz_id
    const res = await api.getQuizQuestions(quiz.id);

    let fetchedQuestions = [];
    if (res.ok) {
      if (Array.isArray(res.data)) {
        fetchedQuestions = res.data;
      } else if (res.data && Array.isArray(res.data.questions)) {
        fetchedQuestions = res.data.questions;
      }
    }

    if (fetchedQuestions.length > 0) {
      this.questions = fetchedQuestions.map(q => {
        let options = q.options;
        if (typeof options === 'string') {
          try {
            options = JSON.parse(options);
          } catch (e) {
            options = [];
          }
        }
        return {
          id: q.id,
          quizId: q.quiz_id || q.quizId,
          question: q.question,
          options: Array.isArray(options) ? options : [],
          correct: Number(q.correct),
          explanation: q.explanation || 'Không có giải thích chi tiết.'
        };
      });
    } else {
      alert(`Bài trắc nghiệm "${quiz.title}" hiện chưa có câu hỏi nào trong ngân hàng đề. Vui lòng thêm câu hỏi trước khi thi!`);
      return;
    }

    this.updateQuestionsCountDisplay();
    this.startQuiz();
  }

  /**
   * Tải danh sách câu hỏi mặc định/toàn bộ từ API Express
   */
  async loadQuestions() {
    const res = await api.getQuestions();

    if (res.ok && res.data.success && Array.isArray(res.data.questions) && res.data.questions.length > 0) {
      this.questions = res.data.questions;
    } else {
      console.warn('[Quiz] Không thể lấy câu hỏi từ API, sử dụng dữ liệu dự phòng.');
      this.questions = [...FALLBACK_QUESTIONS];
    }

    this.updateQuestionsCountDisplay();
  }

  /**
   * Cập nhật số lượng câu hỏi trên các màn hình
   */
  updateQuestionsCountDisplay() {
    const count = this.questions.length;
    if (this.dom.startTotalQ) this.dom.startTotalQ.textContent = count;
    if (this.dom.totalQCount) this.dom.totalQCount.textContent = count;
    if (this.dom.adminQCount) this.dom.adminQCount.textContent = count;
  }

  /**
   * Gắn các sự kiện của Quiz, Quản trị và Form Giảng viên
   */
  bindEvents() {
    // Nút Bắt đầu làm bài (Legacy/hero nếu còn dùng)
    if (this.dom.btnStart) {
      this.dom.btnStart.addEventListener('click', () => {
        this.initAudioContext();
        this.playSound('click');
        if (this.quizzes && this.quizzes.length > 0) {
          this.selectAndStartQuiz(this.quizzes[0]);
        } else {
          this.startQuiz();
        }
      });
    }

    // Nút Tải lại danh sách bài trắc nghiệm
    if (this.dom.btnRefreshQuizzes) {
      this.dom.btnRefreshQuizzes.addEventListener('click', () => {
        this.playSound('click');
        this.loadQuizzes();
      });
    }

    // Form Giảng viên Tạo bài trắc nghiệm mới
    if (this.dom.formCreateQuiz) {
      this.dom.formCreateQuiz.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCreateQuiz();
      });
    }

    // Nút Thoát ra danh sách bài thi khi đang làm bài
    if (this.dom.btnExitToQuizzes) {
      this.dom.btnExitToQuizzes.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn dừng bài thi hiện tại và quay về danh sách bài trắc nghiệm?')) {
          this.clearIntervalTimer();
          this.playSound('click');
          this.showScreen('start');
          this.loadQuizzes();
        }
      });
    }

    // Nút Chuyển câu tiếp theo / Nộp bài
    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener('click', () => {
        this.playSound('click');
        this.nextQuestion();
      });
    }

    // Nút Làm lại bài thi (Retake) - Reset trạng thái và thi lại chính bài hiện tại
    if (this.dom.btnRestart) {
      this.dom.btnRestart.addEventListener('click', () => {
        this.playSound('click');
        if (this.currentQuiz && this.questions && this.questions.length > 0) {
          this.startQuiz();
        } else if (this.quizzes && this.quizzes.length > 0) {
          this.selectAndStartQuiz(this.quizzes[0]);
        } else {
          this.showScreen('start');
          this.loadQuizzes();
        }
      });
    }

    // Nút Quay về Danh Sách Bài Thi từ màn hình Kết Quả
    if (this.dom.btnBackToQuizzes) {
      this.dom.btnBackToQuizzes.addEventListener('click', () => {
        this.playSound('click');
        this.showScreen('start');
        this.loadQuizzes();
      });
    }

    // Nút Xem lại chi tiết
    if (this.dom.btnReview) {
      this.dom.btnReview.addEventListener('click', () => {
        this.playSound('click');
        this.showReviewScreen();
      });
    }

    // Nút Quay lại kết quả từ màn hình Review
    if (this.dom.btnBackToResult) {
      this.dom.btnBackToResult.addEventListener('click', () => {
        this.playSound('click');
        this.showScreen('result');
      });
    }

    // Nút chuyển từ Admin sang Quiz
    if (this.dom.btnAdminToQuiz) {
      this.dom.btnAdminToQuiz.addEventListener('click', () => {
        this.playSound('click');
        this.showScreen('start');
        this.loadQuizzes();
      });
    }

    // Form thêm câu hỏi mới (Admin)
    if (this.dom.formAddQuestion) {
      this.dom.formAddQuestion.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleAddQuestion();
      });
    }

    // Chọn bài thi để quản lý/thêm câu hỏi trong Admin
    if (this.dom.adminQuizSelect) {
      this.dom.adminQuizSelect.addEventListener('change', () => {
        this.playSound('click');
        const selectedQuizId = parseInt(this.dom.adminQuizSelect.value, 10);
        if (selectedQuizId) {
          this.loadAdminQuestions(selectedQuizId);
        }
      });
    }

    // Nút khôi phục câu hỏi mặc định (Admin)
    if (this.dom.btnResetQuestions) {
      this.dom.btnResetQuestions.addEventListener('click', () => {
        this.handleResetQuestions();
      });
    }

    // Bật/tắt âm thanh
    if (this.dom.btnSoundToggle) {
      this.dom.btnSoundToggle.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    // Hỗ trợ phím tắt bàn phím: 1, 2, 3, 4 hoặc A, B, C, D và Enter/Space
    window.addEventListener('keydown', (e) => {
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      if (!this.dom.screenQuiz.classList.contains('active')) return;

      const key = e.key.toLowerCase();

      if (!this.isAnswered) {
        let selectedIndex = -1;
        if (key === '1' || key === 'a') selectedIndex = 0;
        else if (key === '2' || key === 'b') selectedIndex = 1;
        else if (key === '3' || key === 'c') selectedIndex = 2;
        else if (key === '4' || key === 'd') selectedIndex = 3;

        if (selectedIndex !== -1) {
          const currentOptions = this.questions[this.currentIndex]?.options;
          if (currentOptions && selectedIndex < currentOptions.length) {
            e.preventDefault();
            this.handleAnswerSelection(selectedIndex);
          }
        }
      } else {
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          this.nextQuestion();
        }
      }
    });
  }

  /**
   * Bắt đầu một lượt thi trắc nghiệm mới
   */
  startQuiz() {
    if (!this.questions || this.questions.length === 0) {
      alert('Chưa có câu hỏi nào trong ngân hàng đề thi!');
      return;
    }

    this.currentIndex = 0;
    this.score = 0;
    this.userAnswers = [];
    this.startTime = Date.now();
    this.dom.liveScore.textContent = '0';
    this.dom.totalQCount.textContent = this.questions.length;

    this.showScreen('quiz');
    this.renderCurrentQuestion();
  }

  /**
   * Hiển thị câu hỏi hiện tại
   */
  renderCurrentQuestion() {
    this.isAnswered = false;
    this.clearIntervalTimer();

    const q = this.questions[this.currentIndex];
    const total = this.questions.length;

    // Cập nhật số thứ tự và thanh tiến trình
    this.dom.currentQIndex.textContent = this.currentIndex + 1;
    const progressPercent = (this.currentIndex / total) * 100;
    this.dom.progressBar.style.width = `${progressPercent}%`;

    // Cập nhật tag phân loại và câu hỏi
    if (this.dom.questionTag) {
      this.dom.questionTag.textContent = this.currentQuiz?.title ? this.currentQuiz.title : 'Câu hỏi trắc nghiệm';
    }
    this.dom.questionText.textContent = q.question;

    // Ẩn hộp giải thích & nút next
    this.dom.explanationBox.classList.add('hidden');
    this.dom.explanationBox.className = 'explanation-box hidden';
    this.dom.btnNext.classList.add('hidden');

    if (this.currentIndex === total - 1) {
      this.dom.btnNextText.textContent = 'Nộp Bài & Xem Điểm';
    } else {
      this.dom.btnNextText.textContent = 'Câu Tiếp Theo';
    }

    // Render danh sách lựa chọn
    this.dom.optionsGrid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    q.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.setAttribute('data-index', idx);

      btn.innerHTML = `
        <span class="option-key">${letters[idx]}</span>
        <span class="option-text">${this.escapeHtml(optText)}</span>
        <span class="option-status-icon">
          <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      `;

      btn.addEventListener('click', () => {
        if (!this.isAnswered) {
          this.handleAnswerSelection(idx);
        }
      });

      this.dom.optionsGrid.appendChild(btn);
    });

    this.startCountdown();
  }

  /**
   * Bắt đầu đếm ngược 20 giây mỗi câu
   */
  startCountdown() {
    this.timeLeft = this.TIME_PER_QUESTION;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();

      if (this.timeLeft <= 0) {
        this.clearIntervalTimer();
        this.handleTimeOut();
      }
    }, 1000);
  }

  /**
   * Cập nhật đồng hồ đếm ngược và đổi màu cảnh báo
   */
  updateTimerDisplay() {
    this.dom.timerSeconds.textContent = this.timeLeft;
    this.dom.timerBadge.classList.remove('warning', 'danger');

    if (this.timeLeft <= 5) {
      this.dom.timerBadge.classList.add('danger');
      if (this.timeLeft > 0) this.playSound('tick');
    } else if (this.timeLeft <= 10) {
      this.dom.timerBadge.classList.add('warning');
    }
  }

  /**
   * Dừng đồng hồ đếm ngược
   */
  clearIntervalTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Xử lý khi người dùng chọn đáp án
   */
  handleAnswerSelection(selectedIndex) {
    if (this.isAnswered) return;
    this.isAnswered = true;
    this.clearIntervalTimer();

    const q = this.questions[this.currentIndex];
    const isCorrect = (selectedIndex === q.correct);

    this.userAnswers.push({
      question: q,
      selectedIndex: selectedIndex,
      correctIndex: q.correct,
      isCorrect: isCorrect,
      timedOut: false
    });

    if (isCorrect) {
      this.score++;
      this.dom.liveScore.textContent = this.score * 10;
      this.playSound('correct');
      this.fireAnswerConfetti();
    } else {
      this.playSound('wrong');
    }

    // Làm nổi bật đáp án đúng/sai
    const optionButtons = this.dom.optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
        btn.querySelector('.option-status-icon').innerHTML = `
          <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
      } else if (idx === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
        btn.querySelector('.option-status-icon').innerHTML = `
          <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;
      } else {
        btn.classList.add('dimmed');
      }
    });

    this.showExplanation(isCorrect, q.explanation);
    this.dom.btnNext.classList.remove('hidden');
  }

  /**
   * Xử lý khi hết 20 giây mà chưa trả lời
   */
  handleTimeOut() {
    this.isAnswered = true;
    const q = this.questions[this.currentIndex];

    this.userAnswers.push({
      question: q,
      selectedIndex: null,
      correctIndex: q.correct,
      isCorrect: false,
      timedOut: true
    });

    this.playSound('wrong');

    const optionButtons = this.dom.optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('dimmed');
      }
    });

    this.showExplanation(false, `⏰ Hết thời gian! Đáp án đúng là: ${q.options[q.correct]}. \n\n${q.explanation}`);
    this.dom.btnNext.classList.remove('hidden');
  }

  /**
   * Hiển thị giải thích chi tiết
   */
  showExplanation(isCorrect, explanationText) {
    this.dom.explanationBox.classList.remove('hidden');
    if (isCorrect) {
      this.dom.explanationBox.className = 'explanation-box correct-box';
      this.dom.explanationStatus.className = 'explanation-status correct-text';
      this.dom.explanationStatus.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Chính xác tuyệt vời!</span>
      `;
    } else {
      this.dom.explanationBox.className = 'explanation-box incorrect-box';
      this.dom.explanationStatus.className = 'explanation-status incorrect-text';
      this.dom.explanationStatus.innerHTML = `
        <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>Chưa chính xác!</span>
      `;
    }

    this.dom.explanationText.textContent = explanationText;
  }

  /**
   * Chuyển sang câu tiếp theo hoặc hoàn thành bài thi
   */
  nextQuestion() {
    this.currentIndex++;

    if (this.currentIndex < this.questions.length) {
      this.renderCurrentQuestion();
    } else {
      this.dom.progressBar.style.width = '100%';
      this.finishQuiz();
    }
  }

  /**
   * 3. Hoàn thành bài thi, hiển thị điểm số chi tiết và lưu kết quả vào CSDL
   */
  async finishQuiz() {
    this.clearIntervalTimer();
    this.totalTimeTaken = Math.round((Date.now() - this.startTime) / 1000);

    const total = this.questions.length;
    const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;

    this.dom.finalScorePercent.textContent = `${percentage}%`;
    this.dom.finalCorrectCount.textContent = this.score;
    this.dom.finalTotalCount.textContent = total;

    const minutes = Math.floor(this.totalTimeTaken / 60);
    const seconds = this.totalTimeTaken % 60;
    this.dom.statTimeTaken.textContent = minutes > 0 ? `${minutes}p ${seconds}s` : `${seconds}s`;
    this.dom.statAccuracy.textContent = `${percentage}%`;

    let grade = '';
    let trophy = '🎖️';
    let title = '';
    let subtitle = '';

    if (percentage >= 90) {
      grade = 'Thần sầu 🚀';
      trophy = '🏆';
      title = 'Xuất Sắc Vượt Trội!';
      subtitle = 'Kiến thức của bạn cực kỳ vững chắc!';
      this.fireVictoryConfetti();
      this.playSound('victory');
    } else if (percentage >= 70) {
      grade = 'Khá giỏi ⭐';
      trophy = '⭐';
      title = 'Làm Tốt Lắm!';
      subtitle = 'Bạn nắm rất chắc các nguyên lý cốt lõi.';
      this.fireVictoryConfetti();
      this.playSound('victory');
    } else if (percentage >= 50) {
      grade = 'Đạt yêu cầu 👍';
      trophy = '🎯';
      title = 'Cần Cố Gắng Hơn!';
      subtitle = 'Bạn đã nắm được các khái niệm cơ bản nhưng cần củng cố thêm.';
    } else {
      grade = 'Cần ôn tập 📚';
      trophy = '💡';
      title = 'Đừng Nản Lòng!';
      subtitle = 'Hãy xem lại đáp án và củng cố thêm các phần kiến thức còn thiếu nhé.';
    }

    this.dom.statGrade.textContent = grade;
    this.dom.trophyBadge.textContent = trophy;
    this.dom.resultTitle.textContent = title;
    this.dom.resultSubtitle.textContent = subtitle;

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percentage / 100) * circumference;
    this.dom.scoreCircleBar.style.strokeDashoffset = circumference;
    setTimeout(() => {
      this.dom.scoreCircleBar.style.strokeDashoffset = offset;
    }, 100);

    // Gửi yêu cầu lưu kết quả bài thi qua API (POST /api/quiz-results)
    try {
      const currentUser = this.getCurrentUser ? this.getCurrentUser() : null;
      const resultPayload = {
        userId: currentUser ? currentUser.id : null,
        quizId: this.currentQuiz ? this.currentQuiz.id : null,
        score: percentage,
        correctAnswers: this.score,
        totalQuestions: total,
        timeSpent: this.totalTimeTaken
      };

      const saveRes = await api.saveQuizResult(resultPayload);
      if (saveRes.ok && saveRes.data.success) {
        console.log('[Quiz] Đã lưu kết quả thi vào SQL Server:', saveRes.data);
        if (this.dom.resultSavedBadge) {
          this.dom.resultSavedBadge.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.warn('[Quiz] Lỗi lưu kết quả bài thi:', err);
    }

    this.showScreen('result');
  }

  /**
   * Màn hình xem lại tất cả các câu trả lời
   */
  showReviewScreen() {
    this.dom.reviewList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    this.userAnswers.forEach((ans, index) => {
      const q = ans.question;
      const isCorrect = ans.isCorrect;

      const card = document.createElement('div');
      card.className = `review-card ${isCorrect ? 'correct-item' : 'incorrect-item'}`;

      const userChoiceText = ans.selectedIndex !== null 
        ? `${letters[ans.selectedIndex]}. ${q.options[ans.selectedIndex]}` 
        : '⚠️ Đã hết giờ (Chưa chọn)';
      const correctChoiceText = `${letters[ans.correctIndex]}. ${q.options[ans.correctIndex]}`;

      card.innerHTML = `
        <div class="review-card-top">
          <span class="review-q-number">Câu hỏi ${index + 1} / ${this.questions.length}</span>
          <span class="review-status-badge ${isCorrect ? 'correct' : 'incorrect'}">
            ${isCorrect ? 'Đúng' : (ans.timedOut ? 'Hết giờ' : 'Sai')}
          </span>
        </div>
        <h4 class="review-q-text">${this.escapeHtml(q.question)}</h4>
        <div class="review-answers-box">
          ${!isCorrect ? `
            <div class="review-ans-item user-wrong">
              <span>❌ Bạn đã chọn:</span>
              <strong>${this.escapeHtml(userChoiceText)}</strong>
            </div>
          ` : ''}
          <div class="review-ans-item target-correct">
            <span>✅ Đáp án đúng:</span>
            <strong>${this.escapeHtml(correctChoiceText)}</strong>
          </div>
        </div>
        <div class="review-explanation">
          <strong>Giải thích:</strong> ${this.escapeHtml(q.explanation)}
        </div>
      `;

      this.dom.reviewList.appendChild(card);
    });

    this.showScreen('review');
  }

  /**
   * ==========================================
   * CÁC CHỨC NĂNG QUẢN TRỊ ADMIN (GIẢNG VIÊN)
   * ==========================================
   */

  /**
   * Mở giao diện Admin và chọn bài trắc nghiệm mục tiêu
   * @param {number|string|null} targetQuizId - ID bài trắc nghiệm muốn thêm câu hỏi (tùy chọn)
   */
  async openAdminScreen(targetQuizId = null) {
    if (this.showScreen) {
      this.showScreen('admin');
    }

    // Đảm bảo danh sách bài thi đã được nạp
    if (!this.quizzes || this.quizzes.length === 0) {
      await this.loadQuizzes();
    }

    // Nạp danh sách bài thi vào dropdown chọn bài thi
    if (this.dom.adminQuizSelect) {
      this.dom.adminQuizSelect.innerHTML = '';
      if (this.quizzes.length === 0) {
        this.dom.adminQuizSelect.innerHTML = '<option value="">-- Chưa có bài thi nào --</option>';
      } else {
        this.quizzes.forEach(q => {
          const opt = document.createElement('option');
          opt.value = q.id;
          const countInfo = q.question_count !== undefined ? ` (${q.question_count} câu)` : '';
          opt.textContent = `${q.title}${countInfo}`;
          this.dom.adminQuizSelect.appendChild(opt);
        });

        // Chọn bài thi mục tiêu nếu được truyền vào, hoặc bài thi đầu tiên
        if (targetQuizId) {
          this.dom.adminQuizSelect.value = String(targetQuizId);
        } else if (!this.dom.adminQuizSelect.value && this.quizzes.length > 0) {
          this.dom.adminQuizSelect.value = String(this.quizzes[0].id);
        }
      }
    }

    const currentQuizId = this.dom.adminQuizSelect?.value || targetQuizId || (this.quizzes[0]?.id);
    if (currentQuizId) {
      await this.loadAdminQuestions(currentQuizId);
    }

    // Focus vào ô nội dung câu hỏi
    if (this.dom.adminQText) {
      setTimeout(() => {
        this.dom.adminQText.focus();
      }, 150);
    }

    if (targetQuizId) {
      const selected = this.quizzes.find(q => q.id === Number(targetQuizId));
      if (selected) {
        this.showAdminAlert(`Đang chọn bài thi: "${selected.title}". Hãy nhập nội dung câu hỏi bên dưới!`);
      }
    }
  }

  /**
   * Tải danh sách câu hỏi của một bài trắc nghiệm cụ thể vào bảng Admin
   * @param {number|string} quizId
   */
  async loadAdminQuestions(quizId) {
    if (!quizId) {
      this.adminQuestions = [];
      this.renderAdminQuestions();
      return;
    }

    const res = await api.getQuizQuestions(quizId);
    let fetched = [];

    if (res.ok && res.data) {
      if (Array.isArray(res.data)) {
        fetched = res.data;
      } else if (Array.isArray(res.data.questions)) {
        fetched = res.data.questions;
      }
    }

    this.adminQuestions = fetched.map(q => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : (Array.isArray(q.options) ? q.options : []);
      } catch (e) {
        parsedOptions = [];
      }
      return {
        id: q.id,
        quiz_id: q.quiz_id,
        question: q.question,
        options: parsedOptions,
        correct: Number(q.correct),
        explanation: q.explanation
      };
    });

    // Cập nhật nhãn bộ lọc bài thi
    const selected = this.quizzes.find(q => q.id === Number(quizId));
    if (this.dom.adminQuizFilterLabel) {
      this.dom.adminQuizFilterLabel.textContent = selected 
        ? `Đang xem: ${selected.title}` 
        : `Bài thi #${quizId}`;
    }

    this.renderAdminQuestions();
  }

  /**
   * Render danh sách câu hỏi trong bảng Quản trị
   */
  renderAdminQuestions() {
    if (!this.dom.adminQuestionsList) return;
    this.dom.adminQuestionsList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    const list = this.adminQuestions || [];

    if (this.dom.adminQCount) {
      this.dom.adminQCount.textContent = list.length;
    }

    if (list.length === 0) {
      this.dom.adminQuestionsList.innerHTML = `
        <div style="text-align: center; padding: 35px 20px; color: var(--text-sub);">
          <p style="font-size: 1.5rem; margin-bottom: 8px;">📭</p>
          <p style="font-weight: 600; color: var(--text-main);">Chưa có câu hỏi nào cho bài thi này.</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Hãy điền form bên trái để thêm câu hỏi đầu tiên!</p>
        </div>
      `;
      return;
    }

    list.forEach((q, index) => {
      const item = document.createElement('div');
      item.className = 'admin-q-item';

      const correctLetter = letters[q.correct] || 'A';
      const correctText = q.options[q.correct] || '';

      item.innerHTML = `
        <div class="admin-q-item-top">
          <span class="admin-q-num">Câu hỏi ${index + 1}</span>
          <button type="button" class="btn-delete-q" title="Xóa câu hỏi này" data-id="${q.id}">
            ✕
          </button>
        </div>
        <p class="admin-q-item-title">${this.escapeHtml(q.question)}</p>
        <span class="admin-q-correct-label">✅ Đáp án đúng: ${correctLetter}. ${this.escapeHtml(correctText)}</span>
      `;

      const btnDelete = item.querySelector('.btn-delete-q');
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteQuestion(q.id, index);
      });

      this.dom.adminQuestionsList.appendChild(item);
    });
  }

  /**
   * Xử lý Thêm câu hỏi mới từ Giảng viên vào bài trắc nghiệm đã chọn
   */
  async handleAddQuestion() {
    const quizId = parseInt(this.dom.adminQuizSelect?.value, 10);
    if (isNaN(quizId) || quizId <= 0) {
      alert('Vui lòng chọn bài trắc nghiệm bạn muốn thêm câu hỏi!');
      return;
    }

    const qText = this.dom.adminQText.value.trim();
    const optA = this.dom.adminOptA.value.trim();
    const optB = this.dom.adminOptB.value.trim();
    const optC = this.dom.adminOptC.value.trim();
    const optD = this.dom.adminOptD.value.trim();
    const correctIdx = parseInt(this.dom.adminQCorrect.value, 10);
    const explanation = this.dom.adminQExplanation.value.trim();

    if (!qText || !optA || !optB || !optC || !optD || !explanation) {
      alert('Vui lòng điền đầy đủ tất cả các trường thông tin câu hỏi!');
      return;
    }

    const questionData = {
      quiz_id: quizId,
      question: qText,
      options: [optA, optB, optC, optD],
      correct: correctIdx,
      explanation: explanation
    };

    const res = await api.addQuestion(questionData);

    if (res.ok && res.data.success) {
      const currentSelectedQuizId = this.dom.adminQuizSelect.value;

      // Reset các trường nhập liệu
      this.dom.adminQText.value = '';
      this.dom.adminOptA.value = '';
      this.dom.adminOptB.value = '';
      this.dom.adminOptC.value = '';
      this.dom.adminOptD.value = '';
      this.dom.adminQExplanation.value = '';

      // Tải lại câu hỏi cho bài thi hiện tại
      await this.loadAdminQuestions(currentSelectedQuizId);

      // Cập nhật lại số lượng câu hỏi trên trang chủ và trong dropdown
      await this.loadQuizzes();
      if (this.dom.adminQuizSelect) {
        this.dom.adminQuizSelect.value = currentSelectedQuizId;
      }

      const selected = this.quizzes.find(q => q.id === Number(currentSelectedQuizId));
      const quizTitle = selected ? `"${selected.title}"` : 'bài thi';

      this.showAdminAlert(`Đã thêm thành công câu hỏi vào ${quizTitle}!`);
      this.playSound('correct');

      // Tự động focus lại ô câu hỏi để tiện nhập câu tiếp theo
      this.dom.adminQText.focus();
    } else {
      alert(res.data?.message || 'Không thể thêm câu hỏi!');
    }
  }

  /**
   * Xóa một câu hỏi khỏi ngân hàng đề thi
   */
  async deleteQuestion(id, index) {
    if (confirm(`Bạn có chắc muốn xóa câu hỏi số ${index + 1} không?`)) {
      const res = await api.deleteQuestion(id);

      if (res.ok && res.data.success) {
        const currentSelectedQuizId = this.dom.adminQuizSelect?.value;
        await this.loadAdminQuestions(currentSelectedQuizId);
        await this.loadQuizzes();
        if (this.dom.adminQuizSelect && currentSelectedQuizId) {
          this.dom.adminQuizSelect.value = currentSelectedQuizId;
        }
        this.showAdminAlert('Đã xóa câu hỏi khỏi bài trắc nghiệm.');
        this.playSound('click');
      } else {
        alert(res.data?.message || 'Không thể xóa câu hỏi!');
      }
    }
  }

  /**
   * Khôi phục bộ câu hỏi mặc định
   */
  async handleResetQuestions() {
    if (confirm('Bạn có chắc chắn muốn khôi phục về bộ câu hỏi mặc định không? Các câu hỏi đã thêm thủ công sẽ bị xóa.')) {
      const res = await api.resetQuestions();

      if (res.ok && res.data.success) {
        const currentSelectedQuizId = this.dom.adminQuizSelect?.value;
        await this.loadAdminQuestions(currentSelectedQuizId);
        await this.loadQuizzes();
        this.showAdminAlert('Đã khôi phục bộ 10 câu hỏi mặc định!');
        this.playSound('correct');
      } else {
        alert(res.data?.message || 'Không thể khôi phục câu hỏi!');
      }
    }
  }

  /**
   * Hiển thị thông báo trong màn hình Admin
   */
  showAdminAlert(msg) {
    this.dom.adminAlertText.textContent = msg;
    this.dom.adminAlert.classList.remove('hidden');
    setTimeout(() => {
      this.dom.adminAlert.classList.add('hidden');
    }, 4000);
  }

  /**
   * 4. Giảng viên Tạo bài trắc nghiệm mới (POST /api/quizzes)
   */
  async handleCreateQuiz() {
    const title = this.dom.newQuizTitle?.value?.trim();
    const desc = this.dom.newQuizDesc?.value?.trim() || '';

    if (!title) {
      alert('Vui lòng nhập tiêu đề bài trắc nghiệm!');
      return;
    }

    const currentUser = this.getCurrentUser ? this.getCurrentUser() : null;
    const questions = [];

    // Kiểm tra câu hỏi đầu tiên nếu có nhập
    const qText = this.dom.newQText?.value?.trim();
    const optA = this.dom.newOptA?.value?.trim();
    const optB = this.dom.newOptB?.value?.trim();
    const optC = this.dom.newOptC?.value?.trim();
    const optD = this.dom.newOptD?.value?.trim();
    const correctIdx = parseInt(this.dom.newQCorrect?.value || '0', 10);
    const explanation = this.dom.newQExplanation?.value?.trim() || 'Đáp án chính xác!';

    if (qText) {
      const options = [];
      if (optA) options.push(optA);
      if (optB) options.push(optB);
      if (optC) options.push(optC);
      if (optD) options.push(optD);

      if (options.length >= 2) {
        questions.push({
          question: qText,
          options: options,
          correct: correctIdx < options.length ? correctIdx : 0,
          explanation: explanation
        });
      }
    }

    const quizPayload = {
      title: title,
      description: desc,
      created_by: currentUser ? currentUser.id : null,
      questions: questions
    };

    const res = await api.createQuiz(quizPayload);

    if (res.ok && res.data.success) {
      if (this.dom.formCreateQuiz) {
        this.dom.formCreateQuiz.reset();
      }
      this.showTeacherQuizAlert(`🎉 Tạo bài trắc nghiệm "${title}" thành công!`);
      this.playSound('correct');
      // Tải lại danh sách bài trắc nghiệm ngay lập tức trên trang chủ
      await this.loadQuizzes();
    } else {
      alert(res.data?.message || 'Không thể tạo bài trắc nghiệm mới!');
    }
  }

  /**
   * Hiển thị thông báo khi tạo bài trắc nghiệm mới
   */
  showTeacherQuizAlert(msg) {
    if (this.dom.teacherQuizAlert && this.dom.teacherQuizAlertText) {
      this.dom.teacherQuizAlertText.textContent = msg;
      this.dom.teacherQuizAlert.classList.remove('hidden');
      setTimeout(() => {
        if (this.dom.teacherQuizAlert) {
          this.dom.teacherQuizAlert.classList.add('hidden');
        }
      }, 5000);
    }
  }

  /**
   * ==========================================
   * ÂM THANH & HIỆU ỨNG PHÁO HOA
   * ==========================================
   */

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (this.soundEnabled) {
      this.dom.iconSoundOn.classList.remove('hidden');
      this.dom.iconSoundOff.classList.add('hidden');
      this.playSound('click');
    } else {
      this.dom.iconSoundOn.classList.add('hidden');
      this.dom.iconSoundOff.classList.remove('hidden');
    }
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playSound(type) {
    if (!this.soundEnabled) return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    try {
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'correct') {
        const notes = [523.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.12, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'victory') {
        const arpeggio = [523.25, 659.25, 783.99, 1046.50];
        arpeggio.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
      }
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  fireAnswerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.72 },
        colors: ['#10b981', '#34d399', '#6366f1', '#38bdf8', '#fbbf24', '#f43f5e'],
        disableForReducedMotion: true,
        zIndex: 9999
      });
    }
  }

  fireVictoryConfetti() {
    if (typeof confetti !== 'function') return;

    confetti({
      particleCount: 90,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'],
      zIndex: 9999
    });

    const duration = 2500;
    const animationEnd = Date.now() + duration;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = Math.floor(30 * (timeLeft / duration));

      confetti({
        particleCount: particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.75 },
        colors: ['#6366f1', '#10b981', '#38bdf8', '#ec4899'],
        zIndex: 9999
      });

      confetti({
        particleCount: particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.75 },
        colors: ['#f59e0b', '#a855f7', '#34d399', '#f43f5e'],
        zIndex: 9999
      });
    }, 250);
  }

  escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
