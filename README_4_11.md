# Ứng Dụng Quiz Bằng JavaScript Thuần (Vanilla JS)

Dự án trắc nghiệm kiến thức JavaScript với kiến trúc tách biệt rõ ràng giữa **Giao diện (UI)**, **Xử lý logic (Logic)** và **Dữ liệu câu hỏi (Data JSON)**.

---

## 📁 Cấu Trúc Thư Mục

```text
baitaplon-pvk/
├── index.html       # Giao diện HTML (Semantic structure, 4 màn hình: Start, Quiz, Result, Review)
├── style.css        # Thiết kế giao diện (CSS Glassmorphism, animations, responsive)
├── app.js           # Logic xử lý chính (Class QuizApp, timer, audio synth, review, confetti)
├── questions.json   # Dữ liệu ngân hàng câu hỏi trắc nghiệm
└── README.md        # Hướng dẫn sử dụng và tài liệu cấu trúc
```

---

## 🚀 Các Tính Năng Nổi Bật

1. **Kiến trúc phân tách chuẩn**:
   - [index.html](file:///c:/baitaplon-pvk/index.html): Cấu trúc 4 màn hình trực quan (`#screen-start`, `#screen-quiz`, `#screen-result`, `#screen-review`).
   - [style.css](file:///c:/baitaplon-pvk/style.css): Hệ thống màu sắc Dark Tech hiện đại, hiệu ứng Glassmorphism mờ kính, chuyển động mượt mà, hỗ trợ tốt trên Mobile & Desktop.
   - [app.js](file:///c:/baitaplon-pvk/app.js): Lập trình hướng đối tượng (`QuizApp`), nạp bất đồng bộ `fetch('questions.json')`, đồng hồ đếm ngược, tự động tính điểm, tổng hợp âm thanh bằng **Web Audio API** (không cần tải file MP3).
   - [questions.json](file:///c:/baitaplon-pvk/questions.json): Dữ liệu câu hỏi kèm 4 lựa chọn, vị trí đáp án đúng và phần giải thích chi tiết.

2. **Trải nghiệm tương tác cao**:
   - **Đồng hồ đếm ngược**: 20 giây mỗi câu, tự đổi màu vàng/đỏ và âm thanh cảnh báo khi dưới 5 giây.
   - **Phản hồi tức thì**: Bấm chọn đáp án sẽ hiển thị ngay đúng/sai cùng hộp giải thích kiến thức.
   - **Hỗ trợ bàn phím**:
     - Phím `1`, `2`, `3`, `4` hoặc `A`, `B`, `C`, `D` để chọn đáp án.
     - Phím `Enter` hoặc `Space` để chuyển sang câu tiếp theo.
   - **Màn hình tổng kết**: Biểu đồ vòng tròn SVG sinh động, hiệu ứng pháo hoa Confetti khi đạt điểm cao, đánh giá xếp loại kỹ năng.
   - **Xem lại đáp án (Review Mode)**: Cho phép xem lại toàn bộ câu hỏi, đáp án đã chọn so với đáp án đúng và lời giải thích.

---

## 📝 Cách Chỉnh Sửa & Thêm Câu Hỏi Mới

Mở file [questions.json](file:///c:/baitaplon-pvk/questions.json) và thêm câu hỏi theo mẫu:

```json
{
  "id": 11,
  "question": "Nội dung câu hỏi của bạn?",
  "options": [
    "Đáp án A",
    "Đáp án B",
    "Đáp án C",
    "Đáp án D"
  ],
  "correct": 0,
  "explanation": "Giải thích chi tiết vì sao đáp án này đúng."
}
```
> **Lưu ý:** Thuộc tính `"correct"` là chỉ số mảng bắt đầu từ `0` (0 là A, 1 là B, 2 là C, 3 là D).

---

## 💻 Cách Chạy Ứng Dụng

### Cách 1: Sử dụng Live Server trong VS Code (Khuyên dùng)
1. Cài đặt tiện ích mở rộng **Live Server** trong VS Code.
2. Click chuột phải vào [index.html](file:///c:/baitaplon-pvk/index.html) và chọn **Open with Live Server**.

### Cách 2: Chạy máy chủ tĩnh đơn giản với Node.js
Trong thư mục dự án, chạy lệnh:
```bash
npx serve .
# hoặc
npx http-server -p 3000
```
Sau đó mở trình duyệt tại `http://localhost:3000`.

### Cách 3: Mở trực tiếp file index.html
Bạn có thể nhấp đúp trực tiếp vào [index.html](file:///c:/baitaplon-pvk/index.html). Mã nguồn trong [app.js](file:///c:/baitaplon-pvk/app.js) đã được trang bị cơ chế tự động Fallback dữ liệu để đảm bảo ứng dụng vẫn chạy mượt mà ngay cả khi trình duyệt áp dụng chính sách bảo mật CORS đối với giao thức `file://`.
