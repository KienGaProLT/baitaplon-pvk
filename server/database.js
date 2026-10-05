/**
 * ==========================================================================
 * Database Module (Microsoft SQL Server) - server/database.js
 * Quản lý kết nối CSDL SQL Server sử dụng thư viện `mssql` dựa trên các
 * biến môi trường trong file `.env`.
 * Tự động khởi tạo cấu trúc bảng (`users`, `quizzes`, `questions`, `quiz_results`)
 * và nạp dữ liệu mẫu ban đầu.
 * ==========================================================================
 */

const sql = require('mssql');
const path = require('path');
const fs = require('fs');

// Nạp biến môi trường từ file server/.env (hoặc fallback ở root)
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const QUESTIONS_JSON_PATH = path.join(__dirname, '../questions.json');

// Cấu hình kết nối SQL Server từ các biến môi trường
const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'QuizDB',
  port: parseInt(process.env.DB_PORT, 10) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Tài khoản mẫu ban đầu (Seed data)
const DEFAULT_USERS = [
  { username: 'sinhvien_it', password: 'student@123', role: 'student' },
  { username: 'giangvien_cntt', password: 'teacher@123', role: 'teacher' }
];

// 10 câu hỏi trắc nghiệm JavaScript mặc định phòng khi file JSON chưa có
const FALLBACK_QUESTIONS = [
  {
    question: "Từ khóa nào trong JavaScript được dùng để khai báo một biến có phạm vi khối (block scope) và không thể gán lại giá trị?",
    options: ["var", "let", "const", "static"],
    correct: 2,
    explanation: "'const' tạo ra một hằng số có phạm vi khối (block scope). Giá trị của biến const không thể gán lại bằng toán tử gán (=)."
  },
  {
    question: "Phương thức nào của Array trả về một mảng mới chứa các phần tử thỏa mãn điều kiện kiểm tra?",
    options: ["forEach()", "map()", "filter()", "reduce()"],
    correct: 2,
    explanation: "'filter()' lặp qua các phần tử và giữ lại các phần tử trả về 'true' từ hàm callback, tạo thành một mảng mới."
  },
  {
    question: "Kết quả của biểu thức `typeof NaN` trong JavaScript là gì?",
    options: ["\"undefined\"", "\"number\"", "\"nan\"", "\"object\""],
    correct: 1,
    explanation: "Mặc dù NaN là viết tắt của 'Not-a-Number', kiểu dữ liệu thực tế của nó theo chuẩn ECMAScript vẫn là 'number'."
  },
  {
    question: "Cơ chế nào trong JavaScript giúp đưa các khai báo hàm và biến lên đầu phạm vi trước khi thực thi?",
    options: ["Closure", "Hoisting", "Event Bubbling", "Currying"],
    correct: 1,
    explanation: "'Hoisting' là cơ chế mặc định của JavaScript giúp đưa phần khai báo (declaration) lên đầu phạm vi của nó trong giai đoạn biên dịch."
  },
  {
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
    question: "Phương thức nào được dùng để chuyển đổi một chuỗi JSON thành đối tượng JavaScript?",
    options: ["JSON.stringify()", "JSON.parse()", "JSON.toObject()", "JSON.convert()"],
    correct: 1,
    explanation: "'JSON.parse()' phân tích một chuỗi văn bản JSON và tạo thành đối tượng/giá trị JavaScript tương ứng."
  },
  {
    question: "Sự kiện nào được kích hoạt khi toàn bộ cây DOM đã sẵn sàng mà không cần đợi ảnh và stylesheet tải xong?",
    options: ["load", "DOMContentLoaded", "beforeunload", "ready"],
    correct: 1,
    explanation: "'DOMContentLoaded' kích hoạt ngay khi tài liệu HTML đã được tải và phân tích cú pháp hoàn tất, nhanh hơn sự kiện 'load'."
  },
  {
    question: "Hàm nào sau đây chạy bất đồng bộ (Asynchronous) trong JavaScript?",
    options: ["Math.round()", "Array.prototype.sort()", "fetch()", "String.prototype.toUpperCase()"],
    correct: 2,
    explanation: "'fetch()' là API bất đồng bộ trả về một Promise đại diện cho phản hồi từ máy chủ mạng."
  },
  {
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
    question: "Phương thức nào sau đây dùng để ngăn chặn hành vi mặc định của một sự kiện (ví dụ: submit form làm tải lại trang)?",
    options: ["event.stopPropagation()", "event.preventDefault()", "event.stopImmediatePropagation()", "event.cancelBubble()"],
    correct: 1,
    explanation: "'event.preventDefault()' thông báo cho trình duyệt không thực thi hành động mặc định vốn có của sự kiện đó."
  }
];

let connectionPool = null;

/**
 * Lấy hoặc khởi tạo Connection Pool kết nối với SQL Server
 */
async function getPool() {
  if (connectionPool && connectionPool.connected) {
    return connectionPool;
  }

  try {
    connectionPool = await sql.connect(dbConfig);
    console.log(`[SQL Server] Đã kết nối thành công tới Database [${dbConfig.database}] tại máy chủ [${dbConfig.server}:${dbConfig.port}]`);
    return connectionPool;
  } catch (error) {
    console.error(`[SQL Server] Lỗi kết nối CSDL tại [${dbConfig.server}:${dbConfig.port}]:`, error.message);
    throw error;
  }
}

/**
 * Chuyển đổi câu truy vấn dạng placeholder `?` sang `@p0, @p1, ...`
 * để tương thích với mssql Request input parameters
 */
function prepareSqlAndInputs(request, sqlString, params = []) {
  const paramList = Array.isArray(params)
    ? params
    : (params !== undefined && params !== null ? [params] : []);

  if (paramList.length === 0) {
    return sqlString;
  }

  let paramIndex = 0;
  const transformedSql = sqlString.replace(/\?/g, () => {
    const paramName = `p${paramIndex}`;
    const value = paramList[paramIndex];
    request.input(paramName, value !== undefined ? value : null);
    paramIndex++;
    return `@${paramName}`;
  });

  return transformedSql;
}

/**
 * Thực thi truy vấn SELECT nhiều dòng dữ liệu (Array of rows)
 * @param {string} sqlString - Câu lệnh SQL (hỗ trợ cả @param hoặc ?)
 * @param {Array} params - Mảng tham số truyền vào
 */
async function dbAll(sqlString, params = []) {
  const pool = await getPool();
  const request = pool.request();
  const query = prepareSqlAndInputs(request, sqlString, params);
  const result = await request.query(query);
  return result.recordset || [];
}

/**
 * Thực thi truy vấn SELECT lấy 1 dòng dữ liệu (First row or null)
 * @param {string} sqlString - Câu lệnh SQL
 * @param {Array} params - Mảng tham số
 */
async function dbGet(sqlString, params = []) {
  const rows = await dbAll(sqlString, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Thực thi câu lệnh INSERT, UPDATE, DELETE
 * @param {string} sqlString - Câu lệnh SQL
 * @param {Array} params - Mảng tham số
 */
async function dbRun(sqlString, params = []) {
  const pool = await getPool();
  const request = pool.request();

  let query = prepareSqlAndInputs(request, sqlString, params);
  const trimmed = query.trim().replace(/;+$/, '');
  const isInsert = /^\s*INSERT\s+INTO/i.test(trimmed);

  // Nếu là INSERT mà chưa có SCOPE_IDENTITY hoặc OUTPUT, bổ sung để lấy ID vừa tạo
  if (isInsert && !/SELECT\s+SCOPE_IDENTITY\(\)/i.test(trimmed) && !/OUTPUT\s+INSERTED\./i.test(trimmed)) {
    query = `${trimmed}; SELECT SCOPE_IDENTITY() AS lastID;`;
  }

  const result = await request.query(query);
  const lastID = result.recordset && result.recordset[0] ? result.recordset[0].lastID : null;
  const rowsAffected = result.rowsAffected ? result.rowsAffected[0] : 0;

  return { lastID, changes: rowsAffected };
}

/**
 * Khởi tạo cấu trúc các bảng (users, quizzes, questions, quiz_results) và seed dữ liệu mẫu
 */
async function initDatabase() {
  const pool = await getPool();

  // 1. Tạo bảng users nếu chưa tồn tại
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    BEGIN
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(50) NOT NULL DEFAULT 'student',
        created_at DATETIME DEFAULT GETDATE()
      );
      PRINT '[SQL Server] Đã khởi tạo bảng [users].';
    END
  `);

  // 2. Tạo bảng quizzes nếu chưa tồn tại (và thêm cột nếu bảng đã có sẵn mà thiếu)
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'quizzes')
    BEGIN
      CREATE TABLE quizzes (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX),
        created_by INT NULL,
        created_at DATETIME DEFAULT GETDATE()
      );
      PRINT '[SQL Server] Đã khởi tạo bảng [quizzes].';
    END
    ELSE
    BEGIN
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quizzes') AND name = 'created_at')
      BEGIN
        ALTER TABLE quizzes ADD created_at DATETIME DEFAULT GETDATE();
        PRINT '[SQL Server] Đã thêm cột [created_at] vào bảng [quizzes].';
      END
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quizzes') AND name = 'created_by')
      BEGIN
        ALTER TABLE quizzes ADD created_by INT NULL;
        PRINT '[SQL Server] Đã thêm cột [created_by] vào bảng [quizzes].';
      END
    END
  `);

  // 3. Tạo bảng questions nếu chưa tồn tại (và bổ sung cột quiz_id nếu chưa có)
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'questions')
    BEGIN
      CREATE TABLE questions (
        id INT IDENTITY(1,1) PRIMARY KEY,
        quiz_id INT NULL,
        question NVARCHAR(MAX) NOT NULL,
        options NVARCHAR(MAX) NOT NULL,
        correct INT NOT NULL,
        explanation NVARCHAR(MAX) NOT NULL,
        created_at DATETIME DEFAULT GETDATE()
      );
      PRINT '[SQL Server] Đã khởi tạo bảng [questions].';
    END
    ELSE
    BEGIN
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('questions') AND name = 'quiz_id')
      BEGIN
        ALTER TABLE questions ADD quiz_id INT NULL;
        PRINT '[SQL Server] Đã thêm cột [quiz_id] vào bảng [questions].';
      END
    END
  `);

  // 4. Tạo bảng quiz_results nếu chưa tồn tại (và bổ sung các cột mở rộng nếu thiếu)
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'quiz_results')
    BEGIN
      CREATE TABLE quiz_results (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NULL,
        quiz_id INT NULL,
        score FLOAT NULL,
        total_questions INT NULL,
        correct_answers INT NULL,
        time_spent INT NULL,
        created_at DATETIME DEFAULT GETDATE()
      );
      PRINT '[SQL Server] Đã khởi tạo bảng [quiz_results].';
    END
    ELSE
    BEGIN
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quiz_results') AND name = 'correct_answers')
      BEGIN
        ALTER TABLE quiz_results ADD correct_answers INT NULL;
        PRINT '[SQL Server] Đã thêm cột [correct_answers] vào bảng [quiz_results].';
      END
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quiz_results') AND name = 'time_spent')
      BEGIN
        ALTER TABLE quiz_results ADD time_spent INT NULL;
        PRINT '[SQL Server] Đã thêm cột [time_spent] vào bảng [quiz_results].';
      END
      IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('quiz_results') AND name = 'created_at')
      BEGIN
        ALTER TABLE quiz_results ADD created_at DATETIME DEFAULT GETDATE();
        PRINT '[SQL Server] Đã thêm cột [created_at] vào bảng [quiz_results].';
      END
    END
  `);

  // 5. Seed tài khoản mặc định
  for (const user of DEFAULT_USERS) {
    const existing = await dbGet(`SELECT id FROM users WHERE LOWER(username) = LOWER(?)`, [user.username]);
    if (!existing) {
      await dbRun(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [user.username, user.password, user.role]
      );
      console.log(`[Seed] Đã tạo tài khoản mẫu trong SQL Server: ${user.username} (${user.role})`);
    }
  }

  // 6. Seed bài trắc nghiệm mẫu (Default Quizzes) nếu bảng quizzes chưa có bài thi nào
  const quizCountRow = await dbGet(`SELECT COUNT(*) as count FROM quizzes`);
  const quizCount = quizCountRow ? quizCountRow.count : 0;

  let defaultQuizId = null;

  if (quizCount === 0) {
    const teacherUser = await dbGet(`SELECT id FROM users WHERE role = 'teacher'`);
    const teacherId = teacherUser ? teacherUser.id : null;

    // Bài 1: JavaScript Cơ Bản
    await dbRun(
      `INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)`,
      [
        'Bài 1: JavaScript Cơ Bản & ES6+',
        'Kiểm tra kiến thức nền tảng: Biến, Scope, Closure, Hoisting, Toán tử và DOM.',
        teacherId
      ]
    );

    // Lấy ID chính xác từ database
    const topQuiz = await dbGet(`SELECT TOP 1 id FROM quizzes ORDER BY id ASC`);
    defaultQuizId = topQuiz ? topQuiz.id : 1;

    // Bài 2: JavaScript Nâng Cao
    await dbRun(
      `INSERT INTO quizzes (title, description, created_by) VALUES (?, ?, ?)`,
      [
        'Bài 2: JavaScript Nâng Cao & Bất Đồng Bộ',
        'Chuyên đề chuyên sâu về Event Loop, Microtask Queue, Promise, Async/Await và Web APIs.',
        teacherId
      ]
    );

    console.log(`[Seed] Đã tạo thành công các bài trắc nghiệm mẫu vào CSDL SQL Server (Quiz ID: ${defaultQuizId})!`);
  } else {
    const topQuiz = await dbGet(`SELECT TOP 1 id FROM quizzes ORDER BY id ASC`);
    defaultQuizId = topQuiz ? topQuiz.id : 1;
  }

  // 7. Seed câu hỏi mặc định nếu bảng questions chưa có câu hỏi nào
  const countRow = await dbGet(`SELECT COUNT(*) as count FROM questions`);
  const count = countRow ? countRow.count : 0;

  if (count === 0) {
    let questionsToSeed = FALLBACK_QUESTIONS;

    if (fs.existsSync(QUESTIONS_JSON_PATH)) {
      try {
        const fileContent = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed) && parsed.length > 0) {
          questionsToSeed = parsed;
        }
      } catch (e) {
        console.warn('[Seed] Không đọc được questions.json, dùng fallback data:', e.message);
      }
    }

    for (const q of questionsToSeed) {
      const optionsJson = JSON.stringify(q.options || []);
      await dbRun(
        `INSERT INTO questions (quiz_id, question, options, correct, explanation) VALUES (?, ?, ?, ?, ?)`,
        [defaultQuizId, q.question, optionsJson, q.correct, q.explanation]
      );
    }
    console.log(`[Seed] Đã nạp thành công ${questionsToSeed.length} câu hỏi ban đầu liên kết với Quiz ID ${defaultQuizId}!`);
  }

  // 8. Đảm bảo toàn bộ câu hỏi chưa có quiz_id được gắn vào defaultQuizId
  if (defaultQuizId) {
    const unassignedCount = await dbGet(`SELECT COUNT(*) as count FROM questions WHERE quiz_id IS NULL OR quiz_id = 0`);
    if (unassignedCount && unassignedCount.count > 0) {
      await pool.request().query(`UPDATE questions SET quiz_id = ${defaultQuizId} WHERE quiz_id IS NULL OR quiz_id = 0`);
      console.log(`[Seed] Đã cập nhật ${unassignedCount.count} câu hỏi cũ liên kết sang Quiz ID ${defaultQuizId}!`);
    }
  }

  // 9. Bổ sung câu hỏi mẫu cho Bài thi số 2 nếu Bài 2 chưa có câu hỏi
  const secondQuiz = await dbGet(`SELECT TOP 1 id FROM quizzes WHERE id > 1 ORDER BY id ASC`);
  if (secondQuiz) {
    const q2CountRow = await dbGet(`SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?`, [secondQuiz.id]);
    if (q2CountRow && q2CountRow.count === 0) {
      const asyncQuestions = [
        {
          question: "Thứ tự thực thi nào là đúng giữa Macro-task (setTimeout) và Micro-task (Promise)?",
          options: ["Macro-task chạy trước Micro-task", "Tất cả Micro-task trong hàng đợi được xử lý trước Macro-task tiếp theo", "Cả hai chạy cùng lúc song song", "Chạy ngẫu nhiên tùy thuộc vào trình duyệt"],
          correct: 1,
          explanation: "Event Loop luôn ưu tiên xử lý toàn bộ các công việc trong Microtask Queue (Promise.then, queueMicrotask) trước khi chuyển sang Macrotask tiếp theo (setTimeout, setInterval)."
        },
        {
          question: "Một hàm được khai báo với từ khóa `async` luôn trả về kiểu dữ liệu gì?",
          options: ["Object thông thường", "Promise", "Callback function", "undefined"],
          correct: 1,
          explanation: "Mọi hàm async luôn tự động bọc giá trị trả về trong một Promise. Nếu hàm ném ra lỗi, nó sẽ trả về một Promise bị rejected."
        },
        {
          question: "Phương thức nào của Promise sẽ chờ tất cả các Promise hoàn thành bất kể thành công hay thất bại?",
          options: ["Promise.all()", "Promise.race()", "Promise.any()", "Promise.allSettled()"],
          correct: 3,
          explanation: "Promise.allSettled() chờ cho tới khi toàn bộ mảng Promise đã kết thúc (dù resolve hay reject) và trả về mảng kết quả chi tiết từng promise."
        },
        {
          question: "Toán tử Optional Chaining (?.) trong JavaScript có tác dụng gì?",
          options: ["Truy cập thuộc tính an toàn mà không gây lỗi nếu object là null hoặc undefined", "Gán giá trị mặc định cho biến", "So sánh tuyệt đối kiểu dữ liệu", "Tạo một hàm callback ẩn danh"],
          correct: 0,
          explanation: "Toán tử ?. cho phép đọc giá trị của thuộc tính nằm sâu trong chuỗi object mà không cần kiểm tra từng mắt xích có null/undefined hay không."
        }
      ];

      for (const item of asyncQuestions) {
        await dbRun(
          `INSERT INTO questions (quiz_id, question, options, correct, explanation) VALUES (?, ?, ?, ?, ?)`,
          [secondQuiz.id, item.question, JSON.stringify(item.options), item.correct, item.explanation]
        );
      }
      console.log(`[Seed] Đã nạp thêm các câu hỏi mẫu cho Bài thi ID ${secondQuiz.id}!`);
    }
  }
}

/**
 * Khôi phục lại bộ câu hỏi mặc định trong SQL Server
 */
async function resetDefaultQuestions() {
  const pool = await getPool();
  await pool.request().query(`DELETE FROM questions; DBCC CHECKIDENT ('questions', RESEED, 0);`);

  const topQuiz = await dbGet(`SELECT TOP 1 id FROM quizzes ORDER BY id ASC`);
  const targetQuizId = topQuiz ? topQuiz.id : 1;

  let questionsToSeed = FALLBACK_QUESTIONS;
  if (fs.existsSync(QUESTIONS_JSON_PATH)) {
    try {
      const fileContent = fs.readFileSync(QUESTIONS_JSON_PATH, 'utf-8');
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        questionsToSeed = parsed;
      }
    } catch (e) {
      console.warn('[Reset] Dùng fallback data do lỗi đọc questions.json:', e.message);
    }
  }

  for (const q of questionsToSeed) {
    const optionsJson = JSON.stringify(q.options || []);
    await dbRun(
      `INSERT INTO questions (quiz_id, question, options, correct, explanation) VALUES (?, ?, ?, ?, ?)`,
      [targetQuizId, q.question, optionsJson, q.correct, q.explanation]
    );
  }

  return await dbAll(`SELECT * FROM questions ORDER BY id ASC`);
}

module.exports = {
  sql,
  dbConfig,
  getPool,
  dbAll,
  dbGet,
  dbRun,
  initDatabase,
  resetDefaultQuestions
};
