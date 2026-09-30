# Ứng Dụng Quiz Bằng JavaScript Thuần (Vanilla JS)

Dự án trắc nghiệm kiến thức JavaScript với kiến trúc phân tách rõ ràng giữa **Giao diện (UI)**, **Xử lý logic (Logic & Phân quyền)** và **Dữ liệu câu hỏi (Data JSON)**.

---

## 📁 Cấu Trúc Thư Mục

```text
baitaplon-pvk/
├── index.html       # Giao diện HTML (Login, Start, Quiz, Result, Review, Admin)
├── style.css        # Thiết kế giao diện (CSS Glassmorphism, animations, responsive)
├── app.js           # Logic xử lý chính (Class QuizApp, Auth, Roles, Timer, Audio synth, Admin)
├── questions.json   # Dữ liệu ngân hàng câu hỏi trắc nghiệm
└── README_4_11.md   # Hướng dẫn sử dụng và tài liệu cấu trúc
```

---

## 🔐 Hệ Thống Đăng Nhập & Phân Quyền (Mới cập nhật)

### 1. Quy tắc xác thực & Bảo mật:
- **Tên đăng nhập**: Không được để trống.
- **Ràng buộc mật khẩu**: Bắt buộc phải **chứa ký tự `@`** (Ví dụ: `student@123`, `teacher@123`). Nếu không có ký tự `@`, hệ thống sẽ cảnh báo lỗi và yêu cầu nhập lại.

### 2. Phân quyền người dùng (Role-Based Access Control):
- **👨‍🎓 Sinh viên (Student)**:
  - Sau khi đăng nhập thành công, chuyển hướng đến màn hình chào mừng làm bài thi (**Start Screen**).
  - Thanh Header hiển thị thông tin học viên và nút Đăng xuất.
  - Tiến hành làm bài trắc nghiệm với đồng hồ đếm ngược, phản hồi tức thì và xem kết quả.
- **👨‍🏫 Giảng viên (Teacher)**:
  - Sau khi đăng nhập thành công, chuyển hướng thẳng vào **Bảng Quản trị (Admin Screen)**.
  - **Tính năng Giảng viên**:
    - Xem danh sách toàn bộ câu hỏi hiện có trong hệ thống kèm đáp án đúng.
    - Form thêm câu hỏi mới: Tiêu đề, 4 lựa chọn (A, B, C, D), chọn đáp án đúng và giải thích chi tiết. Câu hỏi mới được lưu tự động vào `localStorage` và cập nhật ngay lập tức.
    - Xóa câu hỏi không mong muốn.
    - Nút **"Vào Thi Thử Quiz"** để Giảng viên trực tiếp trải nghiệm đề thi.
    - Nút **"Khôi phục mặc định"** để đưa ngân hàng đề về 10 câu hỏi gốc.

### 3. Tài khoản mẫu để kiểm thử nhanh:
| Vai trò | Tên đăng nhập | Mật khẩu mẫu | Điều hướng sau đăng nhập |
| :--- | :--- | :--- | :--- |
| **Sinh viên** | `sinhvien_it` | `student@123` | Màn hình làm bài Quiz |
| **Giảng viên** | `giangvien_cntt` | `teacher@123` | Bảng quản trị thêm câu hỏi |

---

## 🚀 Các Tính Năng Nổi Bật

1. **Kiến trúc phân tách chuẩn**:
   - [index.html](file:///c:/baitaplon-pvk/index.html): Giao diện 6 màn hình (`#screen-login`, `#screen-start`, `#screen-quiz`, `#screen-result`, `#screen-review`, `#screen-admin`).
   - [style.css](file:///c:/baitaplon-pvk/style.css): Hệ thống màu sắc Dark Tech, hiệu ứng mờ kính Glassmorphism, chuyển động mượt mà, tối ưu Responsive trên Mobile & Desktop.
   - [app.js](file:///c:/baitaplon-pvk/app.js): Lập trình hướng đối tượng (`QuizApp`), nạp bất đồng bộ `fetch('questions.json')`, đồng hồ đếm ngược, tự động tính điểm, tổng hợp âm thanh bằng **Web Audio API** (không cần tải file MP3).
   - [questions.json](file:///c:/baitaplon-pvk/questions.json): Dữ liệu câu hỏi kèm 4 lựa chọn, vị trí đáp án đúng và phần giải thích chi tiết.

2. **Trải nghiệm tương tác cao**:
   - **Đồng hồ đếm ngược**: 20 giây mỗi câu, tự đổi màu vàng/đỏ và âm thanh cảnh báo khi dưới 5 giây.
   - **Phản hồi tức thì**: Bấm chọn đáp án sẽ hiển thị ngay đúng/sai cùng hộp giải thích kiến thức.
   - **Hỗ trợ bàn phím**:
     - Phím `1`, `2`, `3`, `4` hoặc `A`, `B`, `C`, `D` để chọn đáp án.
     - Phím `Enter` hoặc `Space` để chuyển sang câu tiếp theo.
     - Tự động vô hiệu hóa phím tắt khi đang nhập liệu trong form đăng nhập / thêm câu hỏi.
   - **Màn hình tổng kết**: Biểu đồ vòng tròn SVG sinh động, hiệu ứng pháo hoa Confetti khi đạt điểm cao, đánh giá xếp loại kỹ năng.
   - **Xem lại đáp án (Review Mode)**: Cho phép xem lại toàn bộ câu hỏi, đáp án đã chọn so với đáp án đúng và lời giải thích.

---

## 💻 Cách Chạy Ứng Dụng

- **Cách 1 (Khuyên dùng)**: Mở thư mục dự án trong VS Code, click chuột phải vào [index.html](file:///c:/baitaplon-pvk/index.html) và chọn **Open with Live Server**.
- **Cách 2**: Chạy máy chủ tĩnh bất kỳ bằng lệnh:
  ```bash
  npx serve .
  ```
- **Cách 3**: Nhấp đúp trực tiếp vào [index.html](file:///c:/baitaplon-pvk/index.html) để mở trên trình duyệt.
