import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'quiz_bird_super_secure_jwt_secret_key_2026_x89f';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function register(req, res, next) {
  try {
    const { name, email, password, semester_id, college } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if user already exists
    const existingUser = db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Default semester if not provided
    let semId = semester_id;
    if (!semId) {
      const defaultSem = db.get('SELECT id FROM semesters ORDER BY order_num ASC LIMIT 1');
      semId = defaultSem ? defaultSem.id : null;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = db.run(
      `INSERT INTO users (name, email, password_hash, role, semester_id, college)
       VALUES (?, ?, ?, 'student', ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, semId, college || 'Studylink']
    );

    const newUserId = Number(result.lastInsertRowid);
    const user = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, s.name as semester_name, s.code as semester_code
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [newUserId]
    );

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    const user = db.get(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.college, u.semester_id, u.avatar, s.name as semester_name, s.code as semester_code
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Omit password hash in returned payload
    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const { semester_id } = req.query;

    const user = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, u.created_at,
              s.name as semester_name, s.code as semester_code
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Get user quick stats (optionally filtered by active semester)
    let statsSql = `
      SELECT 
         COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_tests,
         COUNT(CASE WHEN qa.status = 'paused' THEN 1 END) as paused_tests,
         COALESCE(SUM(qa.time_taken_seconds), 0) as total_test_time_seconds,
         COALESCE(AVG(CASE WHEN qa.status = 'completed' AND qa.total_questions > 0 THEN (qa.correct_count * 100.0 / qa.total_questions) END), 0) as average_accuracy
       FROM quiz_attempts qa
       LEFT JOIN subjects sub ON qa.subject_id = sub.id
       WHERE qa.user_id = ?
    `;
    const params = [req.user.id];

    if (semester_id) {
      statsSql += ` AND sub.semester_id = ? `;
      params.push(parseInt(semester_id, 10));
    }

    const stats = db.get(statsSql, params);

    return res.json({
      success: true,
      user,
      stats: {
        completed_tests: stats?.completed_tests || 0,
        paused_tests: stats?.paused_tests || 0,
        total_test_time_seconds: stats?.total_test_time_seconds || 0,
        average_accuracy: Math.round((stats?.average_accuracy || 0) * 10) / 10
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, college, semester_id, avatar } = req.body;
    const userId = req.user.id;

    // If user is student, they cannot directly change semester_id via profile update
    const canChangeSemester = req.user.role === 'admin';

    db.run(
      `UPDATE users
       SET name = COALESCE(?, name),
           college = COALESCE(?, college),
           avatar = CASE WHEN ? = 1 THEN ? ELSE avatar END,
           semester_id = CASE WHEN ? = 1 THEN COALESCE(?, semester_id) ELSE semester_id END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        college ? college.trim() : null,
        avatar !== undefined ? 1 : 0,
        avatar !== undefined ? avatar : null,
        canChangeSemester ? 1 : 0,
        semester_id || null,
        userId
      ]
    );

    const updatedUser = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, s.name as semester_name, s.code as semester_code
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

// Student submits semester change request
export async function createSemesterRequest(req, res, next) {
  try {
    const { requested_semester_id, reason } = req.body;
    const userId = req.user.id;

    if (!requested_semester_id) {
      return res.status(400).json({ success: false, message: 'Please select a requested semester.' });
    }

    const targetSem = db.get('SELECT id, name FROM semesters WHERE id = ?', [requested_semester_id]);
    if (!targetSem) {
      return res.status(404).json({ success: false, message: 'Requested semester does not exist.' });
    }

    if (req.user.semester_id === parseInt(requested_semester_id, 10)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this semester.' });
    }

    // Check if there is an existing pending request
    const pending = db.get(
      "SELECT id FROM semester_requests WHERE user_id = ? AND status = 'pending'",
      [userId]
    );

    if (pending) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending semester change request awaiting admin review.'
      });
    }

    const result = db.run(
      `INSERT INTO semester_requests (user_id, current_semester_id, requested_semester_id, reason, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, req.user.semester_id || null, requested_semester_id, reason ? reason.trim() : '']
    );

    const newRequest = db.get(
      `SELECT sr.id, sr.user_id, sr.reason, sr.status, sr.admin_comment, sr.created_at,
              cur.name as current_semester_name, req.name as requested_semester_name
       FROM semester_requests sr
       LEFT JOIN semesters cur ON sr.current_semester_id = cur.id
       LEFT JOIN semesters req ON sr.requested_semester_id = req.id
       WHERE sr.id = ?`,
      [Number(result.lastInsertRowid)]
    );

    return res.status(201).json({
      success: true,
      message: `Semester change request for ${targetSem.name} submitted successfully! Admin will review it shortly.`,
      request: newRequest
    });
  } catch (error) {
    next(error);
  }
}

// Student gets their semester change requests
export async function getMySemesterRequests(req, res, next) {
  try {
    const userId = req.user.id;
    const requests = db.query(
      `SELECT sr.id, sr.user_id, sr.reason, sr.status, sr.admin_comment, sr.created_at, sr.updated_at,
              cur.name as current_semester_name, req.name as requested_semester_name
       FROM semester_requests sr
       LEFT JOIN semesters cur ON sr.current_semester_id = cur.id
       LEFT JOIN semesters req ON sr.requested_semester_id = req.id
       WHERE sr.user_id = ?
       ORDER BY sr.id DESC`,
      [userId]
    );

    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
}

export async function redeemAccessCode(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide an access code.' });
    }

    const codeRecord = db.get(
      'SELECT * FROM access_codes WHERE code = ? AND is_active = 1',
      [code.trim().toUpperCase()]
    );

    if (!codeRecord) {
      return res.status(404).json({ success: false, message: 'Invalid or expired access code.' });
    }

    if (codeRecord.used_count >= codeRecord.max_uses) {
      return res.status(400).json({ success: false, message: 'This code has reached its maximum redemption limit.' });
    }

    // Increment used count
    db.run('UPDATE access_codes SET used_count = used_count + 1 WHERE id = ?', [codeRecord.id]);

    return res.json({
      success: true,
      message: `Code applied successfully! ${codeRecord.description}`,
      code: codeRecord.code
    });
  } catch (error) {
    next(error);
  }
}
