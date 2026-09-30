/**
 * ==========================================================================
 * JavaScript Quiz Application - app.js
 * Quản lý logic xử lý, nạp dữ liệu từ JSON, đếm thời gian, âm thanh,
 * hệ thống Đăng ký / Đăng nhập (Auth), phân quyền Giảng viên & Sinh viên,
 * lưu trữ tài khoản vào localStorage và Quản trị câu hỏi.
 * ==========================================================================
 */

// Fallback data phòng khi mở trực tiếp bằng file:// khiến trình duyệt chặn fetch()
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

class QuizApp {
  constructor() {
    // Cấu hình quiz
    this.TIME_PER_QUESTION = 20; // 20 giây mỗi câu

    // Danh sách tài khoản đã đăng ký (lưu trong localStorage)
    this.registeredUsers = [];

    // Trạng thái phiên người dùng hiện tại
    this.currentUser = null; // { username: string, role: 'student' | 'teacher' }

    // Trạng thái ứng dụng (State)
    this.questions = [];
    this.currentIndex = 0;
    this.score = 0;
    this.timeLeft = this.TIME_PER_QUESTION;
    this.timerInterval = null;
    this.isAnswered = false;
    this.userAnswers = []; // Lịch sử trả lời: { question, selected, correct, isCorrect }
    this.startTime = null;
    this.totalTimeTaken = 0;
    this.soundEnabled = true;

    // Web Audio Context (tạo âm thanh trực tiếp)
    this.audioCtx = null;

    // Cache các phần tử DOM
    this.dom = {
      // Screens
      screenLogin: document.getElementById('screen-login'),
      screenStart: document.getElementById('screen-start'),
      screenQuiz: document.getElementById('screen-quiz'),
      screenResult: document.getElementById('screen-result'),
      screenReview: document.getElementById('screen-review'),
      screenAdmin: document.getElementById('screen-admin'),

      // Header Controls
      userHeaderInfo: document.getElementById('user-header-info'),
      headerUserAvatar: document.getElementById('header-user-avatar'),
      headerUserName: document.getElementById('header-user-name'),
      headerUserRole: document.getElementById('header-user-role'),
      btnHeaderAdmin: document.getElementById('btn-header-admin'),
      btnLogout: document.getElementById('btn-logout'),
      btnSoundToggle: document.getElementById('btn-sound-toggle'),
      iconSoundOn: document.getElementById('icon-sound-on'),
      iconSoundOff: document.getElementById('icon-sound-off'),

      // Auth Tabs & Panels
      tabBtnLogin: document.getElementById('tab-btn-login'),
      tabBtnRegister: document.getElementById('tab-btn-register'),
      panelLogin: document.getElementById('panel-login'),
      panelRegister: document.getElementById('panel-register'),
      loginSuccessMsg: document.getElementById('login-success-msg'),
      loginSuccessText: document.getElementById('login-success-text'),
      btnSwitchToRegister: document.getElementById('btn-switch-to-register'),
      btnSwitchToLogin: document.getElementById('btn-switch-to-login'),

      // Login Form
      formLogin: document.getElementById('form-login'),
      inputUsername: document.getElementById('input-username'),
      inputPassword: document.getElementById('input-password'),
      btnTogglePwd: document.getElementById('btn-toggle-pwd'),
      iconPwdShow: document.getElementById('icon-pwd-show'),
      iconPwdHide: document.getElementById('icon-pwd-hide'),
      loginErrorMsg: document.getElementById('login-error-msg'),
      loginErrorText: document.getElementById('login-error-text'),
      btnQuickStudent: document.getElementById('btn-quick-student'),
      btnQuickTeacher: document.getElementById('btn-quick-teacher'),

      // Register Form
      formRegister: document.getElementById('form-register'),
      inputRegUsername: document.getElementById('input-reg-username'),
      inputRegPassword: document.getElementById('input-reg-password'),
      btnToggleRegPwd: document.getElementById('btn-toggle-reg-pwd'),
      iconRegPwdShow: document.getElementById('icon-reg-pwd-show'),
      iconRegPwdHide: document.getElementById('icon-reg-pwd-hide'),
      regErrorMsg: document.getElementById('reg-error-msg'),
      regErrorText: document.getElementById('reg-error-text'),
      btnRegisterSubmit: document.getElementById('btn-register-submit'),

      // Start Screen
      welcomeUserText: document.getElementById('welcome-user-text'),
      startTotalQ: document.getElementById('start-total-q'),
      btnStart: document.getElementById('btn-start'),

      // Quiz Screen
      progressBar: document.getElementById('progress-bar'),
      currentQIndex: document.getElementById('current-q-index'),
      totalQCount: document.getElementById('total-q-count'),
      liveScore: document.getElementById('live-score'),
      timerBadge: document.getElementById('timer-badge'),
      timerSeconds: document.getElementById('timer-seconds'),
      questionText: document.getElementById('question-text'),
      optionsGrid: document.getElementById('options-grid'),
      explanationBox: document.getElementById('explanation-box'),
      explanationStatus: document.getElementById('explanation-status'),
      explanationText: document.getElementById('explanation-text'),
      btnNext: document.getElementById('btn-next'),
      btnNextText: document.getElementById('btn-next-text'),

      // Result Screen
      trophyBadge: document.getElementById('trophy-badge'),
      resultTitle: document.getElementById('result-title'),
      resultSubtitle: document.getElementById('result-subtitle'),
      finalScorePercent: document.getElementById('final-score-percent'),
      finalCorrectCount: document.getElementById('final-correct-count'),
      finalTotalCount: document.getElementById('final-total-count'),
      scoreCircleBar: document.getElementById('score-circle-bar'),
      statTimeTaken: document.getElementById('stat-time-taken'),
      statAccuracy: document.getElementById('stat-accuracy'),
      statGrade: document.getElementById('stat-grade'),
      btnRestart: document.getElementById('btn-restart'),
      btnReview: document.getElementById('btn-review'),

      // Review Screen
      btnBackToResult: document.getElementById('btn-back-to-result'),
      reviewList: document.getElementById('review-list'),

      // Admin Screen
      btnAdminToQuiz: document.getElementById('btn-admin-to-quiz'),
      adminAlert: document.getElementById('admin-alert'),
      adminAlertText: document.getElementById('admin-alert-text'),
      formAddQuestion: document.getElementById('form-add-question'),
      adminQText: document.getElementById('admin-q-text'),
      adminOptA: document.getElementById('admin-opt-a'),
      adminOptB: document.getElementById('admin-opt-b'),
      adminOptC: document.getElementById('admin-opt-c'),
      adminOptD: document.getElementById('admin-opt-d'),
      adminQCorrect: document.getElementById('admin-q-correct'),
      adminQExplanation: document.getElementById('admin-q-explanation'),
      adminQCount: document.getElementById('admin-q-count'),
      adminQuestionsList: document.getElementById('admin-questions-list'),
      btnResetQuestions: document.getElementById('btn-reset-questions'),

      // Canvas Confetti
      confettiCanvas: document.getElementById('confetti-canvas')
    };

    this.init();
  }

  /**
   * Khởi tạo ứng dụng
   */
  async init() {
    this.loadRegisteredUsers();
    this.bindEvents();
    await this.loadQuestions();
    this.showScreen('login');
  }

  /**
   * Nạp danh sách người dùng từ localStorage (kèm tài khoản mẫu mặc định)
   */
  loadRegisteredUsers() {
    const DEFAULT_USERS = [
      { username: 'sinhvien_it', password: 'student@123', role: 'student', createdAt: Date.now() },
      { username: 'giangvien_cntt', password: 'teacher@123', role: 'teacher', createdAt: Date.now() }
    ];

    const saved = localStorage.getItem('quiz_registered_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.registeredUsers = parsed;
          // Đảm bảo 2 tài khoản mẫu luôn có mặt để kiểm thử nhanh
          DEFAULT_USERS.forEach(defU => {
            if (!this.registeredUsers.some(u => u.username.toLowerCase() === defU.username.toLowerCase())) {
              this.registeredUsers.push(defU);
            }
          });
          return;
        }
      } catch (e) {
        console.warn('Lỗi đọc quiz_registered_users từ localStorage:', e);
      }
    }

    this.registeredUsers = [...DEFAULT_USERS];
    localStorage.setItem('quiz_registered_users', JSON.stringify(this.registeredUsers));
  }

  /**
   * Lưu danh sách người dùng vào localStorage
   */
  saveRegisteredUsersToStorage() {
    try {
      localStorage.setItem('quiz_registered_users', JSON.stringify(this.registeredUsers));
    } catch (e) {
      console.warn('Không thể lưu quiz_registered_users vào localStorage:', e);
    }
  }

  /**
   * Nạp danh sách câu hỏi: Ưu tiên dữ liệu lưu trong localStorage (nếu giáo viên đã thêm mới),
   * sau đó mới nạp từ questions.json hoặc fallback
   */
  async loadQuestions() {
    const savedCustom = localStorage.getItem('quiz_custom_questions');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.questions = parsed;
          this.updateQuestionsCountDisplay();
          return;
        }
      } catch (e) {
        console.warn('Lỗi đọc dữ liệu custom từ localStorage:', e);
      }
    }

    try {
      const response = await fetch('questions.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        this.questions = data;
      } else {
        throw new Error('Dữ liệu JSON rỗng');
      }
    } catch (err) {
      console.warn('Không thể nạp trực tiếp questions.json qua fetch, sử dụng fallback data:', err);
      this.questions = [...FALLBACK_QUESTIONS];
    }

    this.updateQuestionsCountDisplay();
  }

  /**
   * Lưu danh sách câu hỏi vào localStorage
   */
  saveQuestionsToStorage() {
    try {
      localStorage.setItem('quiz_custom_questions', JSON.stringify(this.questions));
    } catch (e) {
      console.warn('Không thể lưu vào localStorage:', e);
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
   * Gắn các lắng nghe sự kiện
   */
  bindEvents() {
    // 1. Chuyển đổi qua lại giữa Tab Đăng Nhập và Đăng Ký
    if (this.dom.tabBtnLogin) {
      this.dom.tabBtnLogin.addEventListener('click', () => {
        this.playSound('click');
        this.switchAuthTab('login');
      });
    }
    if (this.dom.tabBtnRegister) {
      this.dom.tabBtnRegister.addEventListener('click', () => {
        this.playSound('click');
        this.switchAuthTab('register');
      });
    }
    if (this.dom.btnSwitchToRegister) {
      this.dom.btnSwitchToRegister.addEventListener('click', () => {
        this.playSound('click');
        this.switchAuthTab('register');
      });
    }
    if (this.dom.btnSwitchToLogin) {
      this.dom.btnSwitchToLogin.addEventListener('click', () => {
        this.playSound('click');
        this.switchAuthTab('login');
      });
    }

    // 2. Submit Form Đăng nhập
    this.dom.formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });

    // Ẩn/Hiện mật khẩu trong Form Đăng nhập
    this.dom.btnTogglePwd.addEventListener('click', () => {
      const currentType = this.dom.inputPassword.getAttribute('type');
      if (currentType === 'password') {
        this.dom.inputPassword.setAttribute('type', 'text');
        this.dom.iconPwdShow.classList.add('hidden');
        this.dom.iconPwdHide.classList.remove('hidden');
      } else {
        this.dom.inputPassword.setAttribute('type', 'password');
        this.dom.iconPwdShow.classList.remove('hidden');
        this.dom.iconPwdHide.classList.add('hidden');
      }
    });

    // 3. Submit Form Đăng ký (Register)
    if (this.dom.formRegister) {
      this.dom.formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Ẩn/Hiện mật khẩu trong Form Đăng ký
    if (this.dom.btnToggleRegPwd) {
      this.dom.btnToggleRegPwd.addEventListener('click', () => {
        const currentType = this.dom.inputRegPassword.getAttribute('type');
        if (currentType === 'password') {
          this.dom.inputRegPassword.setAttribute('type', 'text');
          this.dom.iconRegPwdShow.classList.add('hidden');
          this.dom.iconRegPwdHide.classList.remove('hidden');
        } else {
          this.dom.inputRegPassword.setAttribute('type', 'password');
          this.dom.iconRegPwdShow.classList.remove('hidden');
          this.dom.iconRegPwdHide.classList.add('hidden');
        }
      });
    }

    // Điền tài khoản mẫu Sinh viên
    this.dom.btnQuickStudent.addEventListener('click', () => {
      this.dom.inputUsername.value = 'sinhvien_it';
      this.dom.inputPassword.value = 'student@123';
      const studentRadio = document.querySelector('input[name="loginRole"][value="student"]');
      if (studentRadio) studentRadio.checked = true;
      this.hideLoginError();
      this.playSound('click');
    });

    // Điền tài khoản mẫu Giảng viên
    this.dom.btnQuickTeacher.addEventListener('click', () => {
      this.dom.inputUsername.value = 'giangvien_cntt';
      this.dom.inputPassword.value = 'teacher@123';
      const teacherRadio = document.querySelector('input[name="loginRole"][value="teacher"]');
      if (teacherRadio) teacherRadio.checked = true;
      this.hideLoginError();
      this.playSound('click');
    });

    // 4. Nút Đăng xuất
    this.dom.btnLogout.addEventListener('click', () => {
      this.playSound('click');
      this.handleLogout();
    });

    // 5. Nút Quản trị trên Header (dành cho Giảng viên)
    this.dom.btnHeaderAdmin.addEventListener('click', () => {
      this.playSound('click');
      this.clearIntervalTimer();
      this.showScreen('admin');
      this.renderAdminQuestions();
    });

    // 6. Màn hình Bắt đầu (Start Screen) -> Làm bài thi
    this.dom.btnStart.addEventListener('click', () => {
      this.initAudioContext();
      this.playSound('click');
      this.startQuiz();
    });

    // 7. Nút Câu tiếp theo trong Quiz
    this.dom.btnNext.addEventListener('click', () => {
      this.playSound('click');
      this.nextQuestion();
    });

    // 8. Nút Làm lại bài thi
    this.dom.btnRestart.addEventListener('click', () => {
      this.playSound('click');
      this.startQuiz();
    });

    // 9. Nút Xem lại đáp án
    this.dom.btnReview.addEventListener('click', () => {
      this.playSound('click');
      this.showReviewScreen();
    });

    // 10. Nút Quay lại kết quả từ Review
    this.dom.btnBackToResult.addEventListener('click', () => {
      this.playSound('click');
      this.showScreen('result');
    });

    // 11. Giảng viên vào làm thử Quiz từ Admin Screen
    this.dom.btnAdminToQuiz.addEventListener('click', () => {
      this.playSound('click');
      this.showScreen('start');
    });

    // 12. Form Thêm câu hỏi mới (Admin)
    this.dom.formAddQuestion.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddQuestion();
    });

    // 13. Khôi phục câu hỏi mặc định
    this.dom.btnResetQuestions.addEventListener('click', () => {
      if (confirm('Bạn có chắc chắn muốn khôi phục về bộ câu hỏi mặc định không? Các câu hỏi đã thêm thủ công sẽ bị xóa.')) {
        localStorage.removeItem('quiz_custom_questions');
        this.questions = [...FALLBACK_QUESTIONS];
        this.updateQuestionsCountDisplay();
        this.renderAdminQuestions();
        this.showAdminAlert('Đã khôi phục bộ 10 câu hỏi mặc định!');
        this.playSound('correct');
      }
    });

    // 14. Bật/tắt âm thanh
    this.dom.btnSoundToggle.addEventListener('click', () => {
      this.toggleSound();
    });

    // 15. Hỗ trợ phím tắt bàn phím: 1, 2, 3, 4 hoặc A, B, C, D và Enter/Space
    window.addEventListener('keydown', (e) => {
      // Bỏ qua phím tắt nếu con trỏ đang ở trong ô nhập liệu (input, textarea, select)
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') return;

      // Chỉ kích hoạt phím tắt trả lời khi đang ở màn hình Quiz
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
        // Đã trả lời xong, bấm Enter hoặc Space để chuyển câu tiếp
        if (e.key === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          this.nextQuestion();
        }
      }
    });
  }

  /**
   * Chuyển đổi giữa 2 tab: Đăng nhập (login) và Đăng ký (register)
   */
  switchAuthTab(mode) {
    if (mode === 'login') {
      if (this.dom.tabBtnLogin) this.dom.tabBtnLogin.classList.add('active');
      if (this.dom.tabBtnRegister) this.dom.tabBtnRegister.classList.remove('active');
      if (this.dom.panelLogin) this.dom.panelLogin.classList.remove('hidden');
      if (this.dom.panelRegister) this.dom.panelRegister.classList.add('hidden');
      this.hideRegError();
    } else {
      if (this.dom.tabBtnRegister) this.dom.tabBtnRegister.classList.add('active');
      if (this.dom.tabBtnLogin) this.dom.tabBtnLogin.classList.remove('active');
      if (this.dom.panelRegister) this.dom.panelRegister.classList.remove('hidden');
      if (this.dom.panelLogin) this.dom.panelLogin.classList.add('hidden');
      this.hideLoginError();
      if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');
    }
  }

  /**
   * Xử lý ĐĂNG KÝ tài khoản mới (Register)
   */
  handleRegister() {
    const username = this.dom.inputRegUsername.value.trim();
    const password = this.dom.inputRegPassword.value;
    const selectedRoleEl = document.querySelector('input[name="registerRole"]:checked');
    const role = selectedRoleEl ? selectedRoleEl.value : 'student';

    // 1. Kiểm tra tên tài khoản rỗng hoặc quá ngắn
    if (!username) {
      this.showRegError('Vui lòng nhập tên tài khoản đăng ký!');
      this.dom.inputRegUsername.focus();
      return;
    }
    if (username.length < 3) {
      this.showRegError('Tên tài khoản phải có độ dài từ 3 ký tự trở lên!');
      this.dom.inputRegUsername.focus();
      return;
    }

    // 2. Ràng buộc bảo mật: Mật khẩu BẮT BUỘC phải chứa ký tự '@'
    if (!password.includes('@')) {
      this.showRegError("Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật.");
      this.dom.inputRegPassword.focus();
      this.playSound('wrong');
      return;
    }

    // 3. Kiểm tra trùng lặp tên tài khoản
    const isExisted = this.registeredUsers.some(
      u => u.username.toLowerCase() === username.toLowerCase()
    );
    if (isExisted) {
      this.showRegError(`Tài khoản "${username}" đã tồn tại trên hệ thống! Vui lòng chọn tên khác.`);
      this.dom.inputRegUsername.focus();
      this.playSound('wrong');
      return;
    }

    // 4. Lưu tài khoản mới vào mảng và ghi vào localStorage
    const newUser = {
      username: username,
      password: password,
      role: role,
      createdAt: Date.now()
    };

    this.registeredUsers.push(newUser);
    this.saveRegisteredUsersToStorage();

    // 5. Hoàn tất đăng ký, xóa form và ẩn thông báo lỗi
    this.dom.formRegister.reset();
    this.hideRegError();

    // 6. Tự động chuyển về màn hình đăng nhập
    this.switchAuthTab('login');

    // 7. Hiển thị thông báo đăng ký thành công
    const roleLabel = role === 'teacher' ? 'Giảng viên' : 'Sinh viên';
    this.showLoginSuccess(`🎉 Đăng ký thành công tài khoản "${username}" (${roleLabel})! Mời bạn đăng nhập để bắt đầu.`);

    // 8. Tự động điền trước thông tin vừa tạo vào form đăng nhập để người dùng đăng nhập ngay
    this.dom.inputUsername.value = username;
    this.dom.inputPassword.value = password;
    const matchingLoginRole = document.querySelector(`input[name="loginRole"][value="${role}"]`);
    if (matchingLoginRole) matchingLoginRole.checked = true;

    this.playSound('correct');
  }

  /**
   * Xử lý ĐĂNG NHẬP với dữ liệu đã lưu trong localStorage
   */
  handleLogin() {
    const username = this.dom.inputUsername.value.trim();
    const password = this.dom.inputPassword.value;
    const selectedRoleEl = document.querySelector('input[name="loginRole"]:checked');
    let role = selectedRoleEl ? selectedRoleEl.value : 'student';

    // 1. Kiểm tra tên đăng nhập rỗng
    if (!username) {
      this.showLoginError('Vui lòng nhập tên đăng nhập!');
      this.dom.inputUsername.focus();
      return;
    }

    // 2. Ràng buộc bảo mật: Mật khẩu BẮT BUỘC phải chứa ký tự '@'
    if (!password.includes('@')) {
      this.showLoginError("Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật.");
      this.dom.inputPassword.focus();
      this.playSound('wrong');
      return;
    }

    // 3. Tra cứu tài khoản trong danh sách đã đăng ký (hoặc tài khoản mẫu)
    const foundUser = this.registeredUsers.find(
      u => u.username.toLowerCase() === username.toLowerCase()
    );

    if (foundUser) {
      // Kiểm tra mật khẩu
      if (foundUser.password !== password) {
        this.showLoginError('Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
        this.dom.inputPassword.focus();
        this.playSound('wrong');
        return;
      }
      // Lấy đúng vai trò đã đăng ký của tài khoản
      role = foundUser.role;
    } else {
      // Tài khoản chưa từng đăng ký
      this.showLoginError(`Tài khoản "${username}" chưa tồn tại! Vui lòng bấm vào tab 'Đăng Ký' để tạo tài khoản mới.`);
      this.playSound('wrong');
      return;
    }

    // 4. Đăng nhập thành công
    this.hideLoginError();
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');

    this.currentUser = {
      username: foundUser.username,
      role: role
    };

    this.initAudioContext();
    this.playSound('correct');

    // Cập nhật Header Profile
    this.updateHeaderProfile();

    // 5. Phân quyền điều hướng:
    if (role === 'teacher') {
      // Giảng viên -> Chuyển hướng tới Bảng Quản trị câu hỏi
      this.renderAdminQuestions();
      this.showScreen('admin');
    } else {
      // Sinh viên -> Chuyển hướng vào màn hình làm bài Quiz
      this.dom.welcomeUserText.textContent = `Xin chào, ${foundUser.username}! Hãy sẵn sàng thử thách kiến thức nhé.`;
      this.showScreen('start');
    }
  }

  /**
   * Cập nhật thông tin Header khi người dùng đăng nhập
   */
  updateHeaderProfile() {
    if (!this.currentUser) {
      this.dom.userHeaderInfo.classList.add('hidden');
      return;
    }

    this.dom.userHeaderInfo.classList.remove('hidden');
    this.dom.headerUserName.textContent = this.currentUser.username;

    if (this.currentUser.role === 'teacher') {
      this.dom.headerUserAvatar.textContent = '👨‍🏫';
      this.dom.headerUserRole.textContent = 'Giảng viên';
      this.dom.headerUserRole.className = 'role-badge role-teacher';
      this.dom.btnHeaderAdmin.classList.remove('hidden');
    } else {
      this.dom.headerUserAvatar.textContent = '👨‍🎓';
      this.dom.headerUserRole.textContent = 'Sinh viên';
      this.dom.headerUserRole.className = 'role-badge role-student';
      this.dom.btnHeaderAdmin.classList.add('hidden');
    }
  }

  /**
   * Xử lý Đăng xuất
   */
  handleLogout() {
    this.clearIntervalTimer();
    this.currentUser = null;
    this.dom.userHeaderInfo.classList.add('hidden');
    this.dom.formLogin.reset();
    if (this.dom.formRegister) this.dom.formRegister.reset();
    this.hideLoginError();
    this.hideRegError();
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');
    this.switchAuthTab('login');
    this.showScreen('login');
  }

  /**
   * Hiển thị thông báo lỗi Đăng nhập
   */
  showLoginError(msg) {
    this.dom.loginErrorText.textContent = msg;
    this.dom.loginErrorMsg.classList.remove('hidden');
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');
  }

  /**
   * Ẩn thông báo lỗi Đăng nhập
   */
  hideLoginError() {
    this.dom.loginErrorMsg.classList.add('hidden');
  }

  /**
   * Hiển thị thông báo lỗi Đăng ký
   */
  showRegError(msg) {
    if (this.dom.regErrorText && this.dom.regErrorMsg) {
      this.dom.regErrorText.textContent = msg;
      this.dom.regErrorMsg.classList.remove('hidden');
    }
  }

  /**
   * Ẩn thông báo lỗi Đăng ký
   */
  hideRegError() {
    if (this.dom.regErrorMsg) {
      this.dom.regErrorMsg.classList.add('hidden');
    }
  }

  /**
   * Hiển thị thông báo thành công sau khi Đăng ký
   */
  showLoginSuccess(msg) {
    if (this.dom.loginSuccessMsg && this.dom.loginSuccessText) {
      this.dom.loginSuccessText.textContent = msg;
      this.dom.loginSuccessMsg.classList.remove('hidden');
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
   * Xử lý Thêm câu hỏi mới từ Giảng viên
   */
  handleAddQuestion() {
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

    const newQuestion = {
      id: Date.now(),
      question: qText,
      options: [optA, optB, optC, optD],
      correct: correctIdx,
      explanation: explanation
    };

    // Thêm vào danh sách câu hỏi
    this.questions.push(newQuestion);
    this.saveQuestionsToStorage();

    // Reset form
    this.dom.formAddQuestion.reset();

    // Cập nhật giao diện
    this.renderAdminQuestions();
    this.showAdminAlert(`Đã thêm thành công câu hỏi #${this.questions.length} vào ngân hàng đề!`);
    this.playSound('correct');
  }

  /**
   * Render danh sách câu hỏi trong Bảng Quản trị Giảng viên
   */
  renderAdminQuestions() {
    this.dom.adminQuestionsList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    this.dom.adminQCount.textContent = this.questions.length;

    this.questions.forEach((q, index) => {
      const item = document.createElement('div');
      item.className = 'admin-q-item';

      const correctLetter = letters[q.correct] || 'A';
      const correctText = q.options[q.correct] || '';

      item.innerHTML = `
        <div class="admin-q-item-top">
          <span class="admin-q-num">Câu hỏi ${index + 1}</span>
          <button type="button" class="btn-delete-q" title="Xóa câu hỏi này" data-index="${index}">
            ✕
          </button>
        </div>
        <p class="admin-q-item-title">${this.escapeHtml(q.question)}</p>
        <span class="admin-q-correct-label">✅ Đáp án đúng: ${correctLetter}. ${this.escapeHtml(correctText)}</span>
      `;

      // Nút xóa câu hỏi
      const btnDelete = item.querySelector('.btn-delete-q');
      btnDelete.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteQuestion(index);
      });

      this.dom.adminQuestionsList.appendChild(item);
    });
  }

  /**
   * Xóa một câu hỏi khỏi ngân hàng đề
   */
  deleteQuestion(index) {
    if (this.questions.length <= 1) {
      alert('Ngân hàng đề thi phải giữ lại ít nhất 1 câu hỏi!');
      return;
    }

    if (confirm(`Bạn có chắc muốn xóa câu hỏi số ${index + 1} không?`)) {
      this.questions.splice(index, 1);
      this.saveQuestionsToStorage();
      this.renderAdminQuestions();
      this.showAdminAlert('Đã xóa câu hỏi khỏi ngân hàng đề.');
      this.playSound('click');
    }
  }

  /**
   * Chuyển đổi qua lại giữa các màn hình
   */
  showScreen(screenName) {
    const screens = [
      this.dom.screenLogin,
      this.dom.screenStart,
      this.dom.screenQuiz,
      this.dom.screenResult,
      this.dom.screenReview,
      this.dom.screenAdmin
    ];

    screens.forEach(screen => {
      if (screen) screen.classList.remove('active');
    });

    switch (screenName) {
      case 'login':
        if (this.dom.screenLogin) this.dom.screenLogin.classList.add('active');
        break;
      case 'start':
        if (this.dom.screenStart) this.dom.screenStart.classList.add('active');
        break;
      case 'quiz':
        if (this.dom.screenQuiz) this.dom.screenQuiz.classList.add('active');
        break;
      case 'result':
        if (this.dom.screenResult) this.dom.screenResult.classList.add('active');
        break;
      case 'review':
        if (this.dom.screenReview) this.dom.screenReview.classList.add('active');
        break;
      case 'admin':
        if (this.dom.screenAdmin) this.dom.screenAdmin.classList.add('active');
        break;
    }
  }

  /**
   * Bắt đầu một lượt làm bài mới
   */
  startQuiz() {
    if (!this.questions || this.questions.length === 0) {
      alert('Chưa có câu hỏi nào trong ngân hàng đề!');
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

    // Cập nhật số thứ tự và tiến trình
    this.dom.currentQIndex.textContent = this.currentIndex + 1;
    const progressPercent = ((this.currentIndex) / total) * 100;
    this.dom.progressBar.style.width = `${progressPercent}%`;

    // Hiển thị nội dung câu hỏi
    this.dom.questionText.textContent = q.question;

    // Ẩn phần giải thích & nút next
    this.dom.explanationBox.classList.add('hidden');
    this.dom.explanationBox.className = 'explanation-box hidden';
    this.dom.btnNext.classList.add('hidden');

    // Nếu là câu cuối cùng thì đổi text của nút Next thành "Xem Kết Quả"
    if (this.currentIndex === total - 1) {
      this.dom.btnNextText.textContent = "Xem Kết Quả";
    } else {
      this.dom.btnNextText.textContent = "Câu Tiếp Theo";
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

    // Bắt đầu đếm ngược thời gian
    this.startCountdown();
  }

  /**
   * Bắt đầu đếm ngược thời gian cho mỗi câu hỏi
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
   * Cập nhật hiển thị đồng hồ và đổi màu khi sắp hết giờ
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
   * Xóa interval đếm ngược
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

    // Lưu lại câu trả lời để xem lại sau
    this.userAnswers.push({
      question: q,
      selectedIndex: selectedIndex,
      correctIndex: q.correct,
      isCorrect: isCorrect,
      timedOut: false
    });

    // Cập nhật điểm số
    if (isCorrect) {
      this.score++;
      this.dom.liveScore.textContent = this.score * 10;
      this.playSound('correct');
    } else {
      this.playSound('wrong');
    }

    // Cập nhật giao diện các nút đáp án
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

    // Hiển thị hộp giải thích chi tiết
    this.showExplanation(isCorrect, q.explanation);

    // Hiển thị nút tiếp tục
    this.dom.btnNext.classList.remove('hidden');
  }

  /**
   * Xử lý khi hết thời gian mà chưa chọn
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

    // Làm nổi bật đáp án đúng
    const optionButtons = this.dom.optionsGrid.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.correct) {
        btn.classList.add('correct');
      } else {
        btn.classList.add('dimmed');
      }
    });

    // Hiển thị hộp giải thích thông báo hết giờ
    this.showExplanation(false, `⏰ Hết thời gian! Đáp án đúng là: ${q.options[q.correct]}. \n\n${q.explanation}`);
    this.dom.btnNext.classList.remove('hidden');
  }

  /**
   * Hiển thị giải thích đáp án
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
   * Chuyển sang câu hỏi kế tiếp hoặc kết thúc bài
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
   * Kết thúc quiz và hiển thị kết quả
   */
  finishQuiz() {
    this.clearIntervalTimer();
    this.totalTimeTaken = Math.round((Date.now() - this.startTime) / 1000);

    const total = this.questions.length;
    const percentage = Math.round((this.score / total) * 100);

    // Cập nhật các trường thông số kết quả
    this.dom.finalScorePercent.textContent = `${percentage}%`;
    this.dom.finalCorrectCount.textContent = this.score;
    this.dom.finalTotalCount.textContent = total;

    // Thời gian làm bài
    const minutes = Math.floor(this.totalTimeTaken / 60);
    const seconds = this.totalTimeTaken % 60;
    this.dom.statTimeTaken.textContent = minutes > 0 ? `${minutes}p ${seconds}s` : `${seconds}s`;

    // Độ chính xác
    this.dom.statAccuracy.textContent = `${percentage}%`;

    // Đánh giá xếp loại & Trophy
    let grade = '';
    let trophy = '🎖️';
    let title = '';
    let subtitle = '';

    if (percentage >= 90) {
      grade = 'Thần sầu 🚀';
      trophy = '🏆';
      title = 'Xuất Sắc Vượt Trội!';
      subtitle = 'Kiến thức JavaScript của bạn cực kỳ vững chắc!';
      this.triggerConfetti();
      this.playSound('victory');
    } else if (percentage >= 70) {
      grade = 'Khá giỏi ⭐';
      trophy = '⭐';
      title = 'Làm Tốt Lắm!';
      subtitle = 'Bạn nắm rất chắc các nguyên lý cốt lõi của JavaScript.';
      this.triggerConfetti();
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

    // Hiển thị vòng tròn phần trăm (SVG dashoffset)
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percentage / 100) * circumference;
    this.dom.scoreCircleBar.style.strokeDashoffset = circumference;
    setTimeout(() => {
      this.dom.scoreCircleBar.style.strokeDashoffset = offset;
    }, 100);

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
   * Bật / Tắt âm thanh
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

  /**
   * Khởi tạo Web Audio Context
   */
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

  /**
   * Tổng hợp âm thanh bằng Web Audio API
   */
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

  /**
   * Hiệu ứng pháo hoa Confetti chúc mừng
   */
  triggerConfetti() {
    const canvas = this.dom.confettiCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 12,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.alpha -= 0.009;
        p.rotation += p.rotationSpeed;

        if (p.alpha > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    render();
  }

  /**
   * Escape HTML chống XSS
   */
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

// Khởi tạo app khi cây DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
