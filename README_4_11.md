# Ứng Dụng Quiz Trắc Nghiệm Full-Stack (Express + Microsoft SQL Server + Vanilla JS)

Dự án trắc nghiệm kiến thức JavaScript với kiến trúc **Full-stack phân tách** hoàn chỉnh:
- **Backend (server/)**: Xây dựng bằng **Node.js & Express**, kết nối cơ sở dữ liệu quan hệ **Microsoft SQL Server (mssql)** thông qua biến môi trường **dotenv** (`.env`), kiến trúc RESTful API phân tách theo thư mục `routes/`.
- **Frontend (client/)**: Giao diện thuần **HTML5 / Vanilla CSS3 / Modern Modular JavaScript (ES Modules)** chia tách độc lập (`api.js`, `auth.js`, `quiz.js`, `app.js`).
- **Quản lý thư viện gốc**: `package.json` quản lý toàn bộ dependencies (`express`, `cors`, `mssql`, `dotenv`).

---

## 📁 Cấu Trúc Thư Mục Dự Án

```text
baitaplon-pvk/
├── package.json                 # Cấu hình dự án & quản lý dependencies (mssql, dotenv, express, cors)
├── package-lock.json            # Khóa phiên bản dependencies
├── questions.json               # Ngân hàng 10 câu hỏi mặc định ban đầu (Seed data)
├── README_4_11.md               # Tài liệu dự án và hướng dẫn sử dụng
│
├── server/                      # [BACKEND] Máy chủ Express & CSDL SQL Server
│   ├── .env                     # File biến môi trường (PORT, DB_USER, DB_PASSWORD, ...)
│   ├── .env.example             # File mẫu biến môi trường
│   ├── server.js                # Khởi tạo Express server, nạp dotenv/config, phục vụ static & API
│   ├── database.js              # Quản lý kết nối SQL Server (mssql pool), tạo bảng và seed dữ liệu
│   └── routes/                  # Các router API chuyên biệt
│       ├── auth.js              # Router API: Đăng ký & Đăng nhập (/api/auth)
│       └── questions.js         # Router API: Lấy, thêm, xóa, reset câu hỏi (/api/questions)
│
└── client/                      # [FRONTEND] Ứng dụng Web giao diện người dùng
    ├── index.html               # Giao diện chính của ứng dụng
    ├── css/
    │   └── style.css            # CSS Glassmorphism, Animations, Responsive
    └── js/                      # Các module JavaScript độc lập
        ├── api.js               # Module kết nối và gọi API Backend (fetch)
        ├── auth.js              # Module xử lý Đăng nhập, Đăng ký, Phân quyền & Profile
        ├── quiz.js              # Module xử lý Quiz logic, Timer, Âm thanh, Confetti & Admin
        └── app.js               # Module điều phối chính (App Coordinator)
```

---

## ⚙️ Cấu Hình Môi Trường (.env)

File `server/.env` chứa cấu hình kết nối SQL Server:

```env
PORT=3000
DB_USER=sa
DB_PASSWORD=123456
DB_SERVER=localhost
DB_DATABASE=QuizDB
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

> **Lưu ý**: Hãy đảm bảo máy chủ Microsoft SQL Server đang hoạt động và cơ sở dữ liệu `QuizDB` đã được tạo trước khi khởi động ứng dụng.

---

## 🚀 Hướng Dẫn Khởi Chạy Ứng Dụng

### Bước 1: Cài đặt thư viện
Tại thư mục gốc dự án:
```bash
npm install
```

### Bước 2: Cập nhật thông tin SQL Server
Mở file `server/.env` và điền chính xác tài khoản `DB_USER` và mật khẩu `DB_PASSWORD` của SQL Server.

### Bước 3: Khởi động máy chủ Express
Chạy lệnh:
```bash
npm start
```
*(Hoặc dùng lệnh `npm run dev` để tự động reload khi sửa code server)*

### Bước 4: Truy cập ứng dụng
Mở trình duyệt web và truy cập địa chỉ:
👉 **`http://localhost:3000`**

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

## 🔐 Tài Khoản Mẫu Mặc Định (Đã Seed vào SQL Server)

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Sinh viên** | `sinhvien_it` | `student@123` | Thi trắc nghiệm, bấm giờ, tính điểm, xem giải thích |
| **Giảng viên** | `giangvien_cntt` | `teacher@123` | Quản trị ngân hàng đề: Thêm / Xóa / Reset câu hỏi, Thi thử |

> **Quy định bảo mật**: Mọi mật khẩu đăng ký mới **bắt buộc phải có chứa ký tự `@`** (ví dụ: `user@123`).
