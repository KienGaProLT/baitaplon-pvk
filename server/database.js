/**
 * ==========================================================================
 * Database Module (SQLite) - server/database.js
 * Kết nối CSDL SQLite, tạo các bảng `users`, `questions` và khởi tạo
 * dữ liệu mẫu mặc định (Seed data).
 * Hỗ trợ linh hoạt cả thư viện `sqlite3` và built-in `node:sqlite` của Node.js.
 * ==========================================================================
 */

const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'quiz.db');
const QUESTIONS_JSON_PATH = path.join(__dirname, '../questions.json');

// Khởi tạo các tài khoản mẫu ban đầu
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

let dbDriver = null;
let sqlite3Instance = null;
let nodeSqliteInstance = null;

// Khởi tạo adapter cơ sở dữ liệu
function getDatabase() {
  if (dbDriver) return dbDriver;

  // Thử dùng sqlite3 thông qua npm package
  try {
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(DB_PATH);
    sqlite3Instance = db;
    dbDriver = 'sqlite3';
    console.log('[SQLite] Đã kết nối thành công với SQLite (driver: sqlite3) tại:', DB_PATH);
    return dbDriver;
  } catch (err) {
    console.warn('[SQLite] Không nạp được thư viện sqlite3 qua npm, chuyển sang built-in node:sqlite:', err.message);
  }

  // Thử dùng node:sqlite có sẵn từ Node.js v22.5+
  try {
    const { DatabaseSync } = require('node:sqlite');
    nodeSqliteInstance = new DatabaseSync(DB_PATH);
    dbDriver = 'node:sqlite';
    console.log('[SQLite] Đã kết nối thành công với SQLite (driver: node:sqlite) tại:', DB_PATH);
    return dbDriver;
  } catch (err) {
    console.error('[SQLite] Không thể khởi tạo SQLite driver:', err);
    throw err;
  }
}

/**
 * Thực thi câu lệnh SQL chạy nhiều dòng kết quả (SELECT)
 */
function dbAll(sql, params = []) {
  getDatabase();
  return new Promise((resolve, reject) => {
    if (dbDriver === 'sqlite3') {
      sqlite3Instance.all(sql, params, (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    } else {
      try {
        const query = nodeSqliteInstance.prepare(sql);
        const rows = query.all(...params);
        resolve(rows || []);
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Thực thi câu lệnh SQL lấy 1 dòng kết quả (SELECT TOP 1)
 */
function dbGet(sql, params = []) {
  getDatabase();
  return new Promise((resolve, reject) => {
    if (dbDriver === 'sqlite3') {
      sqlite3Instance.get(sql, params, (err, row) => {
        if (err) return reject(err);
        resolve(row || null);
      });
    } else {
      try {
        const query = nodeSqliteInstance.prepare(sql);
        const row = query.get(...params);
        resolve(row || null);
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Thực thi câu lệnh INSERT, UPDATE, DELETE
 */
function dbRun(sql, params = []) {
  getDatabase();
  return new Promise((resolve, reject) => {
    if (dbDriver === 'sqlite3') {
      sqlite3Instance.run(sql, params, function (err) {
        if (err) return reject(err);
        resolve({ lastID: this.lastID, changes: this.changes });
      });
    } else {
      try {
        const query = nodeSqliteInstance.prepare(sql);
        const result = query.run(...params);
        resolve({ lastID: result.lastInsertRowid, changes: result.changes });
      } catch (err) {
        reject(err);
      }
    }
  });
}

/**
 * Khởi tạo bảng CSDL và seed dữ liệu nếu bảng rỗng
 */
async function initDatabase() {
  getDatabase();

  // 1. Tạo bảng users
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Tạo bảng questions
  await dbRun(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Seed tài khoản mặc định
  for (const user of DEFAULT_USERS) {
    const existing = await dbGet(`SELECT id FROM users WHERE LOWER(username) = LOWER(?)`, [user.username]);
    if (!existing) {
      await dbRun(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [user.username, user.password, user.role]
      );
      console.log(`[Seed] Đã tạo tài khoản mẫu: ${user.username} (${user.role})`);
    }
  }

  // 4. Seed câu hỏi mặc định nếu bảng questions chưa có bản ghi nào
  const qCountRow = await dbGet(`SELECT COUNT(*) as count FROM questions`);
  const count = qCountRow ? qCountRow.count : 0;

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
        `INSERT INTO questions (question, options, correct, explanation) VALUES (?, ?, ?, ?)`,
        [q.question, optionsJson, q.correct, q.explanation]
      );
    }
    console.log(`[Seed] Đã nạp thành công ${questionsToSeed.length} câu hỏi ban đầu vào SQLite!`);
  }
}

/**
 * Đặt lại (Reset) bộ câu hỏi về danh sách mặc định
 */
async function resetDefaultQuestions() {
  await dbRun(`DELETE FROM questions`);

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
      `INSERT INTO questions (question, options, correct, explanation) VALUES (?, ?, ?, ?)`,
      [q.question, optionsJson, q.correct, q.explanation]
    );
  }

  return await dbAll(`SELECT * FROM questions ORDER BY id ASC`);
}

module.exports = {
  initDatabase,
  dbAll,
  dbGet,
  dbRun,
  resetDefaultQuestions
};
