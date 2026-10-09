BÁO CÁO TIẾN ĐỘ BÀI TẬP LỚN - KỶ NGUYÊN VIBE CODING
Họ và tên sinh viên: Phạm Văn Kiên

Mã sinh viên: 74DCTT22499

Lớp: 74DCTT27

Giảng viên hướng dẫn: Thầy Tô Hải Thiên (thienth@utt.edu.vn)

Ngày báo cáo: 11/10/2026

Repository (Public): https://github.com/KienGaProLT/baitaplon-pvk

TỔNG QUAN HỆ THỐNG
Dự án được xây dựng theo mô hình Quiz Application (Hệ thống thi trắc nghiệm trực tuyến) áp dụng các tiêu chuẩn kiến trúc hiện đại:

Backend: Node.js với Express Framework, sử dụng cơ sở dữ liệu Microsoft SQL Server thông qua các hàm bọc (wrapper) tùy chỉnh trong database.js để tối ưu hóa truy vấn.

Frontend: Mô hình Single Page Application (SPA) thuần túy, tổ chức mã nguồn theo hướng mô-đun hóa rõ ràng (client/js/app.js, auth.js, quiz.js, api.js) kết hợp DOM Caching và quản lý trạng thái linh hoạt.

Ý 1: XÂY DỰNG HỆ THỐNG VỚI SỰ TRỢ GIÚP CỦA AI AGENT (3 ĐIỂM)
Trong kỷ nguyên "Vibe Coding", mục tiêu không phải là để AI tự làm hết từ A-Z một cách mù quáng, mà là đóng vai trò Kiến trúc sư hệ thống (System Architect) chỉ đạo, kiểm soát và xác thực mã nguồn do AI Agent sinh ra.

Quy trình 4 bước làm việc với AI Agent trong dự án:
Phân rã bài toán (Decomposition):

Không đưa prompt mơ hồ "Hãy viết cho tôi trang web trắc nghiệm".

Chia nhỏ thành các tầng:

Bước 1: Lập kế hoạch tổng thể (Planning & Architecture):

Thay vì viết code ngay, bước đầu tiên phải làm là vạch ra Plan. Xác định rõ mục tiêu website (Web Quiz App), mô hình kiến trúc (Client-Server, SPA kết hợp API), và phân rã các tính năng chính (Đăng nhập/Đăng ký, Danh sách bài thi, Làm bài trắc nghiệm, Chấm điểm, Quản trị).

Vai trò của Agent: Đóng vai trò là chuyên gia tư vấn giúp bạn hoàn thiện bản Plan này (ví dụ: gợi ý cấu trúc thư mục client/ và server/, chọn công nghệ Node.js, Express và SQL Server).

Bước 2: Thiết kế Cơ sở dữ liệu và API (Database & Backend Planning):

Tiếp theo làm gì: Sau khi có bản Plan tổng thể, tiến hành lập kế hoạch chi tiết cho dữ liệu. Xác định các bảng cần thiết (users, quizzes, questions) và thiết kế các tuyến đường API (/api/auth, /api/quizzes).

Vai trò của Agent: Giúp hiện thực hóa bản thiết kế database thành code kết nối (database.js) và các API routes (server/routes/).

Bước 3: Thiết kế Giao diện và Luồng người dùng (Frontend & UX Planning):

Tiếp theo: Lên kế hoạch cho giao diện Single Page Application (SPA), xác định các màn hình (Login, Start, Quiz, Result) và cách chuyển đổi qua lại giữa chúng (app.js, showScreen).

Vai trò của Agent: Viết khung giao diện, xây dựng các module điều hướng (auth.js, quiz.js) và áp dụng các kỹ thuật tối ưu hóa như DOM Caching.

Bước 4: Kiểm thử, Tinh chỉnh và Hoàn thiện (Testing & Refinement):

Cuối cùng: Dựa trên bản kế hoạch ban đầu để chạy thử toàn bộ hệ thống, kiểm tra tính đồng bộ giữa Frontend và Backend (ví dụ: quy tắc mật khẩu, phân quyền giảng viên/sinh viên) và fix lỗi phát sinh.

Ý 2: KỸ NĂNG KIỂM SOÁT MÃ NGUỒN (5 ĐIỂM)
a) Kiểm soát tính năng (Feature Mastery)
1. Module Đăng Nhập & Đăng Ký nằm ở đâu?
Giao diện & Logic Frontend:

File điều phối chung: client/js/app.js

Module quản lý xác thực: client/js/auth.js

Giao diện HTML tập trung tại: client/index.html

Xử lý API Backend & Cơ sở dữ liệu:

Route xử lý đăng nhập/đăng ký: server/routes/auth.js

Cấu hình kết nối CSDL: server/database.js

2. Trả lời câu hỏi phỏng vấn: "Tạo ràng buộc mật khẩu phải có dấu @ như thế nào?"
Có thể thực hiện kiểm soát đồng bộ ở cả 2 phía:
// Kiểm tra ràng buộc mật khẩu bắt buộc phải có ký tự @
if (!password || !password.includes('@')) {
  this.showRegError("Mật khẩu không hợp lệ! Bắt buộc phải chứa ký tự '@'.");
  this.dom.inputRegPassword.focus();
  return;
}
Phía Máy chủ (Server-side validation trong server/routes/auth.js):
// Chặn ngay từ tầng API nếu client bị bypass
if (!password || !password.includes('@')) {
  return res.status(400).json({
    success: false,
    message: "Mật khẩu không hợp lệ! Bắt buộc phải có chứa ký tự '@' theo yêu cầu bảo mật."
  });
}

3. Cấu trúc Backend của hệ thống:
Database Wrapper Layer (server/database.js): Cung cấp các hàm tiện ích dbGet, dbRun, dbAll để bọc các thao tác với SQL Server, giúp câu lệnh truy vấn ngắn gọn và dễ bảo trì.

Routes Layer (server/routes/): Phân chia rõ ràng các file quản lý từng nghiệp vụ cụ thể (auth.js cho tài khoản, quizzes.js cho bài thi, questions.js cho câu hỏi).

b) Kỹ năng sử dụng skills (Graphify và công cụ hỗ trợ)
Ứng dụng Graphify / Sơ đồ hóa quan hệ:Phân tích mối quan hệ phụ thuộc giữa các module Frontend (app.js <-> auth.js <-> quiz.js) và Backend (server.js <-> routes <-> database.js).

Áp dụng AI Skills & Quy chuẩn:

Tuân thủ quy tắc đồng bộ code: Khi thay đổi quy tắc validation (như quy tắc mật khẩu hoặc tài khoản mẫu DEFAULT_USERS), bắt buộc phải cập nhật đồng bộ ở cả Frontend (auth.js) lẫn Backend (database.js / auth.js route) để tránh hiện tượng lệch pha hệ thống.

c) Góc nhìn Leader về Git Log, Git Diff và Đánh giá hiệu quả làm việc

1. Ý hiểu về git log và git diff:

git log: Phản ánh tiến trình tư duy và lịch sử phát triển dự án theo thời gian thực (Timeline). Giúp Leader thấy được lập trình viên có triển khai từng bước bài bản (từ thiết kế DB <-> viết API <-> dựng UI) hay làm việc chắp vá

git diff: Thể hiện chi tiết sự thay đổi trên từng dòng code (+ hay -). Giúp kiểm tra chất lượng mã nguồn, đảm bảo code gọn gàng, không để lọt code thừa, file tạm hoặc console.log dư thừa.

2. Tiêu chí đánh giá 1 thành viên làm việc hiệu quả (Dưới vai trò Leader):

Nguyên tắc cốt lõi: Tuyệt đối KHÔNG dùng số dòng code (Lines of Code - LOC) để đánh giá! Người viết 1.000 dòng code rác không thể hiệu quả bằng người viết 50 dòng code súc tích, tối ưu và tái sử dụng tốt.

Các tiêu chí đánh giá chuẩn mực:

Tần suất Commit đều đặn (Atomic Commits):

Làm đến đâu commit đến đó, mỗi commit giải quyết trọn vẹn một chức năng hoặc một mục tiêu cụ thể.

Chất lượng Diff (Clean Diffs):

Thay đổi đúng trọng tâm yêu cầu, không lan man sang các file không liên quan, không commit các file hệ thống (node_modules, .env).

Ý thức tự kiểm thử (Self-Testing):

Code viết ra phải chạy được ngay, pass các bước kiểm tra cơ bản trước khi đẩy lên nhánh chính.

Khả năng giải trình:

Khi được hỏi về bất kỳ tính năng nào, thành viên phải chỉ ra được chính xác đoạn code nằm ở file nào, dòng nào và hiểu rõ cơ chế hoạt động của nó.

Ý 3: KẾT HỢP CÁC CÔNG CỤ TEST TÍNH NĂNG (NÂNG CAO - 2 ĐIỂM)

Dự án triển khai kiểm thử đa tầng:

Kiểm thử giao diện & Trạng thái Form (Client-side Validation Testing):

Kiểm tra trực tiếp các thông báo lỗi trên giao diện khi người dùng nhập sai định dạng mật khẩu (thiếu ký tự @) hoặc để trống tên đăng nhập.

Kiểm thử API Endpoint (Backend Testing):

Sử dụng các công cụ như Postman hoặc REST Client để kiểm thử trực tiếp các API tuyến đường (POST /api/auth/login, POST /api/auth/register, GET /api/quizzes), kiểm tra mã phản hồi HTTP (200 OK, 400 Bad Request, 401 Unauthorized) và định dạng JSON trả về.

Kiểm thử Phân quyền (Role-based UI Testing):

Kiểm thử sự khác biệt giữa hai phân quyền: Tài khoản Giảng viên (teacher) (được hiển thị khung tạo bài trắc nghiệm và nút Quản trị) và tài khoản Học viên (student) (bị ẩn các công cụ quản trị, chỉ tập trung làm bài).

Báo cáo được hoàn thiện và cập nhật liên tục trên Git commit history.