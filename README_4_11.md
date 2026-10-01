# Ứng Dụng Quiz Trắc Nghiệm Full-Stack (Express + SQLite + Vanilla JS)

Dự án trắc nghiệm kiến thức JavaScript được tái cấu trúc theo mô hình **Full-stack phân tách** hoàn chỉnh:
- **Backend (server/)**: Xây dựng bằng **Node.js & Express**, kết nối cơ sở dữ liệu quan hệ **SQLite** (lưu trữ người dùng và ngân hàng câu hỏi), kiến trúc RESTful API phân tách theo thư mục `routes/`.
- **Frontend (client/)**: Giao diện thuần **HTML5 / Vanilla CSS3 / Modern Modular JavaScript (ES Modules)** chia tách độc lập (`api.js`, `auth.js`, `quiz.js`, `app.js`).
- **Quản lý thư viện gốc**: `package.json` quản lý toàn bộ dependencies (`express`, `cors`, `sqlite3`).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
baitaplon-pvk/
├── package.json               # Cấu hình dự án & quản lý dependencies
├── package-lock.json          # Khóa phiên bản dependencies
├── questions.json             # Ngân hàng 10 câu hỏi mặc định ban đầu (Seed data)
├── README_4_11.md             # Tài liệu dự án và hướng dẫn sử dụng
│
├── server/                    # [BACKEND] Máy chủ Express & CSDL SQLite
│   ├── server.js              # Khởi tạo Express server, phục vụ static client và routing API
│   ├── database.js            # Khởi tạo CSDL SQLite (quiz.db), tạo bảng và seed dữ liệu
│   ├── quiz.db                # File CSDL SQLite lưu trữ dữ liệu thực tế
│   └── routes/                # Các router API chuyên biệt
│       ├── auth.js            # Router API: Đăng ký & Đăng nhập (/api/auth)
│       └── questions.js       # Router API: Lấy, thêm, xóa, reset câu hỏi (/api/questions)
│
└── client/                    # [FRONTEND] Ứng dụng Web giao diện người dùng
    ├── index.html             # Giao diện chính của ứng dụng
    ├── css/
    │   └── style.css          # CSS Glassmorphism, Animations, Responsive
    └── js/                    # Các module JavaScript độc lập
        ├── api.js             # Module kết nối và gọi API Backend (fetch)
        ├── auth.js            # Module xử lý Đăng nhập, Đăng ký, Phân quyền & Profile
        ├── quiz.js            # Module xử lý Quiz logic, Timer, Âm thanh, Confetti & Admin
        └── app.js             # Module điều phối chính (App Coordinator)
```

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### Bước 1: Cài đặt thư viện (nếu chưa chạy)
Tại thư mục gốc dự án:
```bash
npm install
```

### Bước 2: Khởi động máy chủ Express
Chạy lệnh:
```bash
npm start
```
*(Hoặc dùng lệnh `npm run dev` để tự động reload khi sửa code server)*

### Bước 3: Truy cập ứng dụng
Mở trình duyệt web và truy cập địa chỉ:
👉 **`http://localhost:3000`**

Hệ thống sẽ tự động phục vụ giao diện từ thư mục `client/` và kết nối trực tiếp với backend API.

---

## 📡 Danh Sách API Endpoints (RESTful)

### 1. Nhóm Xác thực & Người dùng (`/api/auth`)
| Phương thức | Đường dẫn | Chức năng | Body dữ liệu |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Đăng ký tài khoản mới | `{ username, password, role }` |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản | `{ username, password }` |

### 2. Nhóm Quản trị Câu hỏi (`/api/questions`)
| Phương thức | Đường dẫn | Chức năng | Body dữ liệu |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/questions` | Lấy toàn bộ danh sách câu hỏi | Không |
| `POST` | `/api/questions` | Thêm câu hỏi mới vào CSDL | `{ question, options, correct, explanation }` |
| `DELETE` | `/api/questions/:id` | Xóa câu hỏi theo ID | Không |
| `POST` | `/api/questions/reset` | Khôi phục 10 câu hỏi mặc định | Không |

---

## 🔐 Tài Khoản Mẫu Mặc Định (Đã Seed vào SQLite)

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Sinh viên** | `sinhvien_it` | `student@123` | Thi trắc nghiệm, bấm giờ, tính điểm, xem giải thích |
| **Giảng viên** | `giangvien_cntt` | `teacher@123` | Quản trị ngân hàng đề: Thêm / Xóa / Reset câu hỏi, Thi thử |

> **Quy định bảo mật**: Mọi mật khẩu đăng ký mới **bắt buộc phải có chứa ký tự `@`** (ví dụ: `user@123`).

---

## 💎 Điểm Nhấn Công Nghệ

1. **Mô hình Full-stack rõ ràng**: Phân tách hoàn toàn giữa Client (Vanilla JS Modules) và Server (Express REST API).
2. **Cơ sở dữ liệu SQLite**: Dữ liệu lưu vĩnh viễn trong file `server/quiz.db`, tự động khởi tạo bảng (`users`, `questions`) và nạp dữ liệu mẫu ban đầu.
3. **Hiệu ứng trực quan & Âm thanh**:
   - Web Audio API tổng hợp âm thanh trực tiếp không cần file MP3 ngoài.
   - Thư viện `canvas-confetti` tạo hiệu ứng pháo hoa chúc mừng khi trả lời đúng và khi hoàn thành xuất sắc bài thi.
4. **Phím tắt nhanh**: Hỗ trợ phím `1`, `2`, `3`, `4` hoặc `A`, `B`, `C`, `D` để chọn đáp án và `Enter`/`Space` để chuyển câu.
