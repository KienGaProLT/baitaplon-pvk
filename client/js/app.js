/**
 * ==========================================================================
 * Main Application Coordinator - client/js/app.js
 * Điểm khởi chạy của Frontend: phối hợp các module Auth, Quiz, API và
 * điều hướng màn hình người dùng.
 * ==========================================================================
 */

import { AuthManager } from './auth.js';
import { QuizManager } from './quiz.js';

class App {
  constructor() {
    this.dom = this.cacheDom();
    this.showScreen = this.showScreen.bind(this);

    // Khởi tạo Quiz Manager trước
    this.quiz = new QuizManager(this.dom, this.showScreen);

    // Khởi tạo Auth Manager với callbacks
    this.auth = new AuthManager(
      this.dom,
      (user) => this.handleLoginSuccess(user),
      () => this.handleLogout()
    );

    this.init();
  }

  /**
   * Lưu trữ tham chiếu các phần tử DOM
   */
  cacheDom() {
    return {
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
  }

  /**
   * Khởi tạo ứng dụng
   */
  async init() {
    // 1. Tải danh sách câu hỏi từ CSDL SQLite qua API
    await this.quiz.loadQuestions();

    // 2. Gắn sự kiện nút Quản trị trên Header (Giảng viên)
    if (this.dom.btnHeaderAdmin) {
      this.dom.btnHeaderAdmin.addEventListener('click', () => {
        this.quiz.playSound('click');
        this.quiz.clearIntervalTimer();
        this.showScreen('admin');
        this.quiz.renderAdminQuestions();
      });
    }

    // 3. Kiểm tra xem người dùng đã đăng nhập từ trước chưa
    const currentUser = this.auth.getCurrentUser();
    if (currentUser) {
      this.handleLoginSuccess(currentUser);
    } else {
      this.showScreen('login');
    }
  }

  /**
   * Xử lý điều hướng khi đăng nhập thành công
   */
  handleLoginSuccess(user) {
    this.quiz.initAudioContext();
    this.quiz.playSound('correct');

    if (user.role === 'teacher') {
      // Giảng viên -> Chuyển thẳng vào Bảng Quản trị
      this.quiz.renderAdminQuestions();
      this.showScreen('admin');
    } else {
      // Sinh viên -> Chuyển tới Màn hình chào mừng làm bài
      if (this.dom.welcomeUserText) {
        this.dom.welcomeUserText.textContent = `Xin chào, ${user.username}! Hãy sẵn sàng thử thách kiến thức nhé.`;
      }
      this.showScreen('start');
    }
  }

  /**
   * Xử lý khi đăng xuất
   */
  handleLogout() {
    this.quiz.clearIntervalTimer();
    this.quiz.playSound('click');
    this.showScreen('login');
  }

  /**
   * Chuyển đổi giữa các màn hình ứng dụng
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
}

// Khởi tạo ứng dụng khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
