import db from '../config/db.js';

export function initializeDatabase() {
  console.log('[Database] Initializing SQL tables...');

  // Create Semesters Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      order_num INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create Subjects Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      semester_id INTEGER,
      name TEXT NOT NULL,
      code TEXT,
      description TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL
    );
  `);

  // Create Chapters Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      chapter_number INTEGER NOT NULL,
      chapter_name TEXT NOT NULL,
      chapter_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );
  `);

  // Create Questions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      chapter_id INTEGER NOT NULL,
      question_text TEXT NOT NULL,
      difficulty TEXT CHECK(difficulty IN ('Easy', 'Medium', 'Hard')) DEFAULT 'Easy',
      solution_explanation TEXT,
      marks INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
    );
  `);

  // Create Question Options Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS question_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      option_index INTEGER NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);

  // Create Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin', 'student')) DEFAULT 'student',
      semester_id INTEGER,
      college TEXT DEFAULT 'Studylink',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (semester_id) REFERENCES semesters(id) ON DELETE SET NULL
    );
  `);

  // Ensure avatar column exists on existing databases
  try {
    db.exec('ALTER TABLE users ADD COLUMN avatar TEXT;');
  } catch (e) {
    // Column already exists
  }

  // Create Semester Requests Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS semester_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_semester_id INTEGER,
      requested_semester_id INTEGER NOT NULL,
      reason TEXT,
      status TEXT CHECK(status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
      admin_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (current_semester_id) REFERENCES semesters(id) ON DELETE SET NULL,
      FOREIGN KEY (requested_semester_id) REFERENCES semesters(id) ON DELETE CASCADE
    );
  `);

  // Create Quiz Attempts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject_id INTEGER,
      test_title TEXT,
      test_type TEXT CHECK(test_type IN ('practise', 'customized', 'timed')) DEFAULT 'practise',
      status TEXT CHECK(status IN ('in_progress', 'completed', 'paused')) DEFAULT 'in_progress',
      total_questions INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      incorrect_count INTEGER DEFAULT 0,
      skipped_count INTEGER DEFAULT 0,
      unvisited_count INTEGER DEFAULT 0,
      score INTEGER DEFAULT 0,
      total_marks INTEGER DEFAULT 0,
      time_taken_seconds INTEGER DEFAULT 0,
      time_limit_seconds INTEGER DEFAULT 0,
      saved_state_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
    );
  `);

  // Create Quiz Answers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      attempt_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT,
      is_correct INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('correct', 'incorrect', 'skipped', 'unvisited')) DEFAULT 'unvisited',
      time_spent_seconds INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);

  // Create Access Codes Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS access_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      max_uses INTEGER DEFAULT 100,
      used_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME
    );
  `);

  // Create User Time Logs Table (for tracking total active study time)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_time_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      log_date DATE DEFAULT (DATE('now')),
      total_seconds INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, log_date),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Create Performance Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_questions_chapter_diff ON questions(chapter_id, difficulty);
    CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);
    CREATE INDEX IF NOT EXISTS idx_chapters_subject ON chapters(subject_id);
    CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester_id);
    CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_attempts(user_id, status);
    CREATE INDEX IF NOT EXISTS idx_answers_attempt ON quiz_answers(attempt_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  console.log('[Database] All SQL tables and indexes created successfully!');
}

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('initDb.js')) {
  initializeDatabase();
}
