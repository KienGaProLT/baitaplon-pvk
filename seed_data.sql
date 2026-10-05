-- ==============================================================================
-- SCRIPT SQL: KHỞI TẠO BÀI TRẮC NGHIỆM VÀ LIÊN KẾT QUIZ_ID CHO CÂU HỎI TRONG SSMS
-- Hướng dẫn: Mở SQL Server Management Studio (SSMS), chọn New Query và thực thi (Execute / F5).
-- ==============================================================================

USE QuizDB;
GO

-- 1. Đảm bảo cột quiz_id tồn tại trong bảng questions
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('questions') AND name = 'quiz_id')
BEGIN
    ALTER TABLE questions ADD quiz_id INT NULL;
    PRINT N'[OK] Đã thêm cột [quiz_id] vào bảng [questions].';
END
GO

-- 2. Thêm bài trắc nghiệm mẫu nếu bảng quizzes đang trống
IF NOT EXISTS (SELECT 1 FROM quizzes)
BEGIN
    DECLARE @TeacherId INT = (SELECT TOP 1 id FROM users WHERE role = 'teacher');

    -- Bài thi 1
    INSERT INTO quizzes (title, description, created_by)
    VALUES (
        N'Bài 1: JavaScript Cơ Bản & ES6+',
        N'Kiểm tra kiến thức nền tảng: Biến, Scope, Closure, Hoisting, Toán tử và DOM.',
        @TeacherId
    );

    -- Bài thi 2
    INSERT INTO quizzes (title, description, created_by)
    VALUES (
        N'Bài 2: JavaScript Nâng Cao & Bất Đồng Bộ',
        N'Chuyên đề chuyên sâu về Event Loop, Promise, Async/Await và Web APIs.',
        @TeacherId
    );

    PRINT N'[OK] Đã thêm các bài trắc nghiệm mẫu vào bảng [quizzes]!';
END
ELSE
BEGIN
    PRINT N'[INFO] Bảng [quizzes] đã có sẵn dữ liệu.';
END
GO

-- 3. Cập nhật quiz_id cho các câu hỏi cũ trong bảng questions nếu quiz_id đang NULL
DECLARE @DefaultQuizId INT = (SELECT TOP 1 id FROM quizzes ORDER BY id ASC);

IF @DefaultQuizId IS NOT NULL
BEGIN
    DECLARE @RowsUpdated INT = 0;

    UPDATE questions
    SET quiz_id = @DefaultQuizId
    WHERE quiz_id IS NULL OR quiz_id = 0;

    SET @RowsUpdated = @@ROWCOUNT;
    PRINT N'[OK] Đã gán quiz_id = ' + CAST(@DefaultQuizId AS NVARCHAR) + N' cho ' + CAST(@RowsUpdated AS NVARCHAR) + N' câu hỏi cũ.';
END
GO

-- 4. Bổ sung thêm câu hỏi mẫu cho Bài thi số 2 nếu bài thi 2 chưa có câu hỏi
DECLARE @Quiz2Id INT = (SELECT TOP 1 id FROM quizzes WHERE id > 1 ORDER BY id ASC);

IF @Quiz2Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM questions WHERE quiz_id = @Quiz2Id)
BEGIN
    INSERT INTO questions (quiz_id, question, options, correct, explanation)
    VALUES 
    (
        @Quiz2Id,
        N'Thứ tự thực thi nào là đúng giữa Macro-task (setTimeout) và Micro-task (Promise)?',
        N'["Macro-task chạy trước Micro-task", "Tất cả Micro-task trong hàng đợi được xử lý trước Macro-task tiếp theo", "Cả hai chạy cùng lúc song song", "Chạy ngẫu nhiên tùy thuộc vào trình duyệt"]',
        1,
        N'Event Loop luôn ưu tiên xử lý toàn bộ các công việc trong Microtask Queue (Promise.then, queueMicrotask) trước khi chuyển sang Macrotask tiếp theo (setTimeout, setInterval).'
    ),
    (
        @Quiz2Id,
        N'Một hàm được khai báo với từ khóa `async` luôn trả về kiểu dữ liệu gì?',
        N'["Object thông thường", "Promise", "Callback function", "undefined"]',
        1,
        N'Mọi hàm async luôn tự động bọc giá trị trả về trong một Promise. Nếu hàm ném ra lỗi, nó sẽ trả về một Promise bị rejected.'
    ),
    (
        @Quiz2Id,
        N'Phương thức nào của Promise sẽ chờ tất cả các Promise hoàn thành bất kể thành công hay thất bại?',
        N'["Promise.all()", "Promise.race()", "Promise.any()", "Promise.allSettled()"]',
        3,
        N'Promise.allSettled() chờ cho tới khi toàn bộ mảng Promise đã kết thúc (dù resolve hay reject) và trả về mảng kết quả chi tiết từng promise.'
    ),
    (
        @Quiz2Id,
        N'Toán tử Optional Chaining (?.) trong JavaScript có tác dụng gì?',
        N'["Truy cập thuộc tính an toàn mà không gây lỗi nếu object là null hoặc undefined", "Gán giá trị mặc định cho biến", "So sánh tuyệt đối kiểu dữ liệu", "Tạo một hàm callback ẩn danh"]',
        0,
        N'Toán tử ?. cho phép đọc giá trị của thuộc tính nằm sâu trong chuỗi object mà không cần kiểm tra từng mắt xích có null/undefined hay không.'
    );

    PRINT N'[OK] Đã nạp thêm các câu hỏi mẫu cho Bài thi số ' + CAST(@Quiz2Id AS NVARCHAR) + N'!';
END
GO

-- 5. Xem kiểm tra kết quả danh sách bài thi và số lượng câu hỏi tương ứng
SELECT 
    q.id AS [Mã Bài Thi],
    q.title AS [Tên Bài Trắc Nghiệm],
    q.description AS [Mô Tả],
    COUNT(qs.id) AS [Số Lượng Câu Hỏi]
FROM quizzes q
LEFT JOIN questions qs ON q.id = qs.quiz_id
GROUP BY q.id, q.title, q.description
ORDER BY q.id ASC;
GO
