/**
 * ==========================================================================
 * Auth Module - client/js/auth.js
 * Quản lý trạng thái xác thực, phân quyền (Sinh viên / Giảng viên),
 * giao diện Đăng nhập, Đăng ký và Header Profile.
 * ==========================================================================
 */

import { api } from './api.js';

export class AuthManager {
  constructor(dom, onLoginSuccess, onLogout) {
    this.dom = dom;
    this.onLoginSuccess = onLoginSuccess;
    this.onLogout = onLogout;
    this.currentUser = null;

    this.init();
  }

  /**
   * Khởi tạo trạng thái phiên người dùng từ sessionStorage (nếu đã đăng nhập trước đó)
   */
  init() {
    this.loadSavedSession();
    this.bindEvents();
  }

  /**
   * Đọc phiên người dùng đã lưu
   */
  loadSavedSession() {
    try {
      const saved = sessionStorage.getItem('quiz_current_user');
      if (saved) {
        this.currentUser = JSON.parse(saved);
        this.updateHeaderProfile();
      }
    } catch (e) {
      console.warn('Lỗi đọc session từ sessionStorage:', e);
      this.currentUser = null;
    }
  }

  /**
   * Lưu phiên người dùng vào sessionStorage
   */
  saveSession(user) {
    this.currentUser = user;
    try {
      sessionStorage.setItem('quiz_current_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Không thể lưu session:', e);
    }
    this.updateHeaderProfile();
  }

  /**
   * Xóa phiên người dùng
   */
  clearSession() {
    this.currentUser = null;
    try {
      sessionStorage.removeItem('quiz_current_user');
    } catch (e) {
      console.warn('Lỗi xóa session:', e);
    }
    this.updateHeaderProfile();
  }

  /**
   * Gắn các sự kiện form Đăng nhập / Đăng ký
   */
  bindEvents() {
    // 1. Chuyển đổi tab Đăng nhập & Đăng ký
    if (this.dom.tabBtnLogin) {
      this.dom.tabBtnLogin.addEventListener('click', () => this.switchAuthTab('login'));
    }
    if (this.dom.tabBtnRegister) {
      this.dom.tabBtnRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }
    if (this.dom.btnSwitchToRegister) {
      this.dom.btnSwitchToRegister.addEventListener('click', () => this.switchAuthTab('register'));
    }
    if (this.dom.btnSwitchToLogin) {
      this.dom.btnSwitchToLogin.addEventListener('click', () => this.switchAuthTab('login'));
    }

    // 2. Submit form Đăng nhập
    if (this.dom.formLogin) {
      this.dom.formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Ẩn/Hiện mật khẩu form Login
    if (this.dom.btnTogglePwd) {
      this.dom.btnTogglePwd.addEventListener('click', () => {
        const currentType = this.dom.inputPassword.getAttribute('type');
        const isPwd = currentType === 'password';
        this.dom.inputPassword.setAttribute('type', isPwd ? 'text' : 'password');
        this.dom.iconPwdShow.classList.toggle('hidden', isPwd);
        this.dom.iconPwdHide.classList.toggle('hidden', !isPwd);
      });
    }

    // 3. Submit form Đăng ký
    if (this.dom.formRegister) {
      this.dom.formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Ẩn/Hiện mật khẩu form Đăng ký
    if (this.dom.btnToggleRegPwd) {
      this.dom.btnToggleRegPwd.addEventListener('click', () => {
        const currentType = this.dom.inputRegPassword.getAttribute('type');
        const isPwd = currentType === 'password';
        this.dom.inputRegPassword.setAttribute('type', isPwd ? 'text' : 'password');
        this.dom.iconRegPwdShow.classList.toggle('hidden', isPwd);
        this.dom.iconRegPwdHide.classList.toggle('hidden', !isPwd);
      });
    }

    // 4. Điền tài khoản mẫu Sinh viên
    if (this.dom.btnQuickStudent) {
      this.dom.btnQuickStudent.addEventListener('click', () => {
        this.dom.inputUsername.value = 'sinhvien_it';
        this.dom.inputPassword.value = 'student@123';
        const studentRadio = document.querySelector('input[name="loginRole"][value="student"]');
        if (studentRadio) studentRadio.checked = true;
        this.hideLoginError();
      });
    }

    // 5. Điền tài khoản mẫu Giảng viên
    if (this.dom.btnQuickTeacher) {
      this.dom.btnQuickTeacher.addEventListener('click', () => {
        this.dom.inputUsername.value = 'giangvien_cntt';
        this.dom.inputPassword.value = 'teacher@123';
        const teacherRadio = document.querySelector('input[name="loginRole"][value="teacher"]');
        if (teacherRadio) teacherRadio.checked = true;
        this.hideLoginError();
      });
    }

    // 6. Nút Đăng xuất
    if (this.dom.btnLogout) {
      this.dom.btnLogout.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  }

  /**
   * Chuyển đổi giữa 2 tab Đăng nhập (login) và Đăng ký (register)
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
   * Xử lý ĐĂNG KÝ tài khoản
   */
  async handleRegister() {
    const username = this.dom.inputRegUsername.value.trim();
    const password = this.dom.inputRegPassword.value;
    const selectedRoleEl = document.querySelector('input[name="registerRole"]:checked');
    const role = selectedRoleEl ? selectedRoleEl.value : 'student';

    // 1. Kiểm tra username
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

    // 2. Ràng buộc bảo mật: Mật khẩu BẮT BUỘC phải có '@'
    if (!password.includes('@')) {
      this.showRegError("Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật.");
      this.dom.inputRegPassword.focus();
      return;
    }

    // Disable nút submit trong lúc đang gọi API
    if (this.dom.btnRegisterSubmit) this.dom.btnRegisterSubmit.disabled = true;

    // 3. Gửi yêu cầu tới backend API Express
    const res = await api.register({ username, password, role });
    if (this.dom.btnRegisterSubmit) this.dom.btnRegisterSubmit.disabled = false;

    if (!res.ok || !res.data.success) {
      const errMsg = res.data?.message || 'Đăng ký không thành công!';
      this.showRegError(errMsg);
      return;
    }

    // 4. Đăng ký thành công: reset form, chuyển sang tab login
    this.dom.formRegister.reset();
    this.hideRegError();
    this.switchAuthTab('login');

    const roleLabel = role === 'teacher' ? 'Giảng viên' : 'Sinh viên';
    this.showLoginSuccess(`🎉 Đăng ký thành công tài khoản "${username}" (${roleLabel})! Mời bạn đăng nhập để bắt đầu.`);

    // 5. Tự động điền thông tin vừa tạo vào form đăng nhập
    this.dom.inputUsername.value = username;
    this.dom.inputPassword.value = password;
    const matchingRoleRadio = document.querySelector(`input[name="loginRole"][value="${role}"]`);
    if (matchingRoleRadio) matchingRoleRadio.checked = true;
  }

  /**
   * Xử lý ĐĂNG NHẬP tài khoản
   */
  async handleLogin() {
    const username = this.dom.inputUsername.value.trim();
    const password = this.dom.inputPassword.value;

    if (!username) {
      this.showLoginError('Vui lòng nhập tên đăng nhập!');
      this.dom.inputUsername.focus();
      return;
    }

    if (!password || !password.includes('@')) {
      this.showLoginError("Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật.");
      this.dom.inputPassword.focus();
      return;
    }

    // Gửi yêu cầu tới backend API Express
    const res = await api.login({ username, password });

    if (!res.ok || !res.data.success) {
      const errMsg = res.data?.message || 'Đăng nhập không thành công!';
      this.showLoginError(errMsg);
      return;
    }

    // Đăng nhập thành công
    const user = res.data.user;
    this.hideLoginError();
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');

    this.saveSession(user);

    // Kích hoạt callback đăng nhập thành công
    if (typeof this.onLoginSuccess === 'function') {
      this.onLoginSuccess(user);
    }
  }

  /**
   * Xử lý Đăng xuất
   */
  handleLogout() {
    this.clearSession();
    this.dom.formLogin.reset();
    if (this.dom.formRegister) this.dom.formRegister.reset();
    this.hideLoginError();
    this.hideRegError();
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');
    this.switchAuthTab('login');

    if (typeof this.onLogout === 'function') {
      this.onLogout();
    }
  }

  /**
   * Cập nhật thông tin người dùng trên Header
   */
  updateHeaderProfile() {
    if (!this.currentUser) {
      if (this.dom.userHeaderInfo) this.dom.userHeaderInfo.classList.add('hidden');
      return;
    }

    if (this.dom.userHeaderInfo) this.dom.userHeaderInfo.classList.remove('hidden');
    if (this.dom.headerUserName) this.dom.headerUserName.textContent = this.currentUser.username;

    if (this.currentUser.role === 'teacher') {
      if (this.dom.headerUserAvatar) this.dom.headerUserAvatar.textContent = '👨‍🏫';
      if (this.dom.headerUserRole) {
        this.dom.headerUserRole.textContent = 'Giảng viên';
        this.dom.headerUserRole.className = 'role-badge role-teacher';
      }
      if (this.dom.btnHeaderAdmin) this.dom.btnHeaderAdmin.classList.remove('hidden');
    } else {
      if (this.dom.headerUserAvatar) this.dom.headerUserAvatar.textContent = '👨‍🎓';
      if (this.dom.headerUserRole) {
        this.dom.headerUserRole.textContent = 'Sinh viên';
        this.dom.headerUserRole.className = 'role-badge role-student';
      }
      if (this.dom.btnHeaderAdmin) this.dom.btnHeaderAdmin.classList.add('hidden');
    }
  }

  showLoginError(msg) {
    if (this.dom.loginErrorText && this.dom.loginErrorMsg) {
      this.dom.loginErrorText.textContent = msg;
      this.dom.loginErrorMsg.classList.remove('hidden');
    }
    if (this.dom.loginSuccessMsg) this.dom.loginSuccessMsg.classList.add('hidden');
  }

  hideLoginError() {
    if (this.dom.loginErrorMsg) this.dom.loginErrorMsg.classList.add('hidden');
  }

  showRegError(msg) {
    if (this.dom.regErrorText && this.dom.regErrorMsg) {
      this.dom.regErrorText.textContent = msg;
      this.dom.regErrorMsg.classList.remove('hidden');
    }
  }

  hideRegError() {
    if (this.dom.regErrorMsg) this.dom.regErrorMsg.classList.add('hidden');
  }

  showLoginSuccess(msg) {
    if (this.dom.loginSuccessMsg && this.dom.loginSuccessText) {
      this.dom.loginSuccessText.textContent = msg;
      this.dom.loginSuccessMsg.classList.remove('hidden');
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isTeacher() {
    return this.currentUser && this.currentUser.role === 'teacher';
  }
}
