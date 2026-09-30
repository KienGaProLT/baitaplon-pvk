# Ứng Dụng Quiz Bằng JavaScript Thuần (Vanilla JS)

Dự án trắc nghiệm kiến thức JavaScript với kiến trúc phân tách rõ ràng giữa **Giao diện (UI)**, **Xử lý logic (Auth, Logic & Phân quyền)** và **Dữ liệu câu hỏi (Data JSON)**.

---

## 📁 Cấu Trúc Thư Mục

```text
baitaplon-pvk/
├── index.html       # Giao diện HTML (Login, Register, Start, Quiz, Result, Review, Admin)
├── style.css        # Thiết kế giao diện (CSS Glassmorphism, Auth tabs, animations, responsive)
├── app.js           # Logic xử lý chính (Class QuizApp, Register/Login, Roles, Timer, Audio synth, Admin)
├── questions.json   # Dữ liệu ngân hàng câu hỏi trắc nghiệm
└── README_4_11.md   # Hướng dẫn sử dụng và tài liệu cấu trúc
```

---

## 🔐 Hệ Thống Đăng Ký & Đăng Nhập (Auth System)

### 1. Chuyển đổi qua lại giữa Đăng Nhập & Đăng Ký:
- Ngay tại màn hình đầu tiên, người dùng có thể chuyển đổi linh hoạt qua lại giữa 2 chế độ thông qua:
  - **Thanh Tab chuyển đổi trên đầu**: `[ Đăng Nhập ]` và `[ Đăng Ký ]`.
  - **Dòng liên kết điều hướng ở chân form**: *"Chưa có tài khoản? Đăng ký tài khoản mới"* và *"Đã có tài khoản rồi? Đăng nhập ngay"*.

### 2. Quy trình & Ràng buộc khi Đăng ký (Register):
- **Form Đăng ký gồm**:
  - Chọn vai trò: **👨‍🎓 Sinh viên** hoặc **👨‍🏫 Giảng viên**.
  - **Tên tài khoản**: Bắt buộc (tối thiểu 3 ký tự, không được trùng với tài khoản đã có).
  - **Mật khẩu**: Có nút bật/tắt ẩn hiện mật khẩu.
  - **Ràng buộc bảo mật**: Mật khẩu **bắt buộc phải có chứa ký tự `@`** (Ví dụ: `nguyena@123`, `giangvien@abc`). Nếu không có ký tự `@`, hệ thống sẽ chặn đăng ký và báo lỗi đỏ.
- **Cơ chế lưu trữ**:
  - Dữ liệu tài khoản mới được lưu trực tiếp vào `localStorage` của trình duyệt dưới key `quiz_registered_users`.
  - Sau khi đăng ký thành công:
    1. Hệ thống tự động chuyển ngay về màn hình **Đăng nhập**.
    2. Hiển thị thông báo màu xanh chúc mừng: *"🎉 Đăng ký thành công tài khoản ...! Mời bạn đăng nhập để bắt đầu."*
    3. Tự động điền trước Tên tài khoản và Mật khẩu vừa tạo vào form đăng nhập để người dùng chỉ cần bấm **"Đăng Nhập Ngay"**.

### 3. Phân quyền người dùng sau khi Đăng nhập:
- **👨‍🎓 Sinh viên (Student)**:
  - Chuyển hướng đến màn hình chào mừng làm bài thi (**Start Screen**).
  - Hiển thị lời chào theo tên tài khoản đã đăng ký.
  - Làm bài thi trắc nghiệm (20s/câu), tính điểm, xem giải thích và xem lại kết quả.
- **👨‍🏫 Giảng viên (Teacher)**:
  - Chuyển hướng thẳng vào **Bảng Quản trị (Admin Screen)**.
  - Thêm câu hỏi mới vào ngân hàng đề (tự lưu vào `localStorage`).
  - Xóa câu hỏi, quản lý danh sách và kiểm tra bài thi thử.

### 4. Tài khoản mẫu có sẵn (Có thể dùng ngay không cần đăng ký):
| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Sinh viên** | `sinhvien_it` | `student@123` | Thi trắc nghiệm |
| **Giảng viên** | `giangvien_cntt` | `teacher@123` | Quản trị ngân hàng đề thi |

---

## 💻 Cách Chạy Ứng Dụng

- **Cách 1 (Khuyên dùng)**: Mở thư mục dự án trong VS Code, click chuột phải vào [index.html](file:///c:/baitaplon-pvk/index.html) và chọn **Open with Live Server**.
- **Cách 2**: Mở terminal tại thư mục dự án và chạy:
  ```bash
  npx serve .
  ```
- **Cách 3**: Nhấp đúp trực tiếp vào [index.html](file:///c:/baitaplon-pvk/index.html) để mở trên trình duyệt.
