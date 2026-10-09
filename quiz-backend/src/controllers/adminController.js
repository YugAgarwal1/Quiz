import bcrypt from 'bcryptjs';
import db from '../config/db.js';

// ==========================================
// 1. DASHBOARD OVERVIEW & METRICS
// ==========================================
export function getDashboardOverview(req, res, next) {
  try {
    const userStats = db.get(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as student_count,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_count
      FROM users
    `);

    const questionStats = db.get(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN difficulty = 'Easy' THEN 1 END) as easy_count,
        COUNT(CASE WHEN difficulty = 'Medium' THEN 1 END) as medium_count,
        COUNT(CASE WHEN difficulty = 'Hard' THEN 1 END) as hard_count
      FROM questions
    `);

    const academicStats = db.get(`
      SELECT 
        (SELECT COUNT(*) FROM semesters) as total_semesters,
        (SELECT COUNT(*) FROM subjects) as total_subjects,
        (SELECT COUNT(*) FROM chapters) as total_chapters
    `);

    const testStats = db.get(`
      SELECT 
        COUNT(*) as total_tests_taken,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tests,
        COUNT(CASE WHEN status = 'paused' THEN 1 END) as paused_tests,
        COALESCE(AVG(CASE WHEN status = 'completed' AND total_questions > 0 THEN (correct_count * 100.0 / total_questions) END), 0) as average_platform_accuracy
      FROM quiz_attempts
    `);

    const recentUsers = db.query(`
      SELECT u.id, u.name, u.email, u.role, u.college, u.created_at, s.name as semester_name
      FROM users u
      LEFT JOIN semesters s ON u.semester_id = s.id
      ORDER BY u.id DESC
      LIMIT 5
    `);

    const recentTests = db.query(`
      SELECT qa.id, qa.user_id, u.name as user_name, qa.test_title, qa.status,
             qa.score, qa.total_questions, qa.time_taken_seconds, qa.created_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      ORDER BY qa.id DESC
      LIMIT 8
    `);

    const subjectBreakdown = db.query(`
      SELECT sub.id, sub.name, COUNT(DISTINCT q.id) as question_count,
             COUNT(DISTINCT qa.id) as attempts_count
      FROM subjects sub
      LEFT JOIN chapters ch ON ch.subject_id = sub.id
      LEFT JOIN questions q ON q.chapter_id = ch.id
      LEFT JOIN quiz_attempts qa ON qa.subject_id = sub.id
      GROUP BY sub.id
      ORDER BY question_count DESC
    `);

    return res.json({
      success: true,
      stats: {
        users: {
          total: userStats?.total_users || 0,
          students: userStats?.student_count || 0,
          admins: userStats?.admin_count || 0
        },
        questions: {
          total: questionStats?.total_questions || 0,
          easy: questionStats?.easy_count || 0,
          medium: questionStats?.medium_count || 0,
          hard: questionStats?.hard_count || 0
        },
        academic: {
          semesters: academicStats?.total_semesters || 0,
          subjects: academicStats?.total_subjects || 0,
          chapters: academicStats?.total_chapters || 0
        },
        tests: {
          total: testStats?.total_tests_taken || 0,
          completed: testStats?.completed_tests || 0,
          paused: testStats?.paused_tests || 0,
          avgAccuracy: Math.round((testStats?.average_platform_accuracy || 0) * 10) / 10
        },
        recentUsers,
        recentTests,
        subjectBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 2. USER MANAGEMENT (CRUD)
// ==========================================
export function getUsers(req, res, next) {
  try {
    const { search, role, semester_id, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, u.created_at,
             s.name as semester_name, s.code as semester_code,
             COUNT(DISTINCT qa.id) as tests_taken
      FROM users u
      LEFT JOIN semesters s ON u.semester_id = s.id
      LEFT JOIN quiz_attempts qa ON qa.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND (u.name LIKE ? OR u.email LIKE ?) `;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      sql += ` AND u.role = ? `;
      params.push(role);
    }

    if (semester_id) {
      sql += ` AND u.semester_id = ? `;
      params.push(semester_id);
    }

    sql += ` GROUP BY u.id ORDER BY u.id DESC `;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    sql += ` LIMIT ? OFFSET ? `;
    params.push(parseInt(limit, 10), offset);

    const users = db.query(sql, params);

    const totalCountRow = db.get('SELECT COUNT(*) as count FROM users');

    return res.json({
      success: true,
      users,
      totalUsers: totalCountRow?.count || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, email, password, role = 'student', semester_id, college, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existing = db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = db.run(
      `INSERT INTO users (name, email, password_hash, role, semester_id, college, avatar)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, role, semester_id || null, college || 'Studylink', avatar || null]
    );

    const newUser = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, s.name as semester_name
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [Number(result.lastInsertRowid)]
    );

    return res.status(201).json({
      success: true,
      message: 'User created successfully!',
      user: newUser
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email, password, role, semester_id, college, avatar } = req.body;

    const user = db.get('SELECT id FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (password && password.trim().length > 0) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      db.run('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, id]);
    }

    db.run(
      `UPDATE users
       SET name = COALESCE(?, name),
           email = COALESCE(?, email),
           role = COALESCE(?, role),
           semester_id = COALESCE(?, semester_id),
           college = COALESCE(?, college),
           avatar = CASE WHEN ? = 1 THEN ? ELSE avatar END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        email ? email.toLowerCase().trim() : null,
        role || null,
        semester_id || null,
        college ? college.trim() : null,
        avatar !== undefined ? 1 : 0,
        avatar !== undefined ? avatar : null,
        id
      ]
    );

    const updatedUser = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, s.name as semester_name
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [id]
    );

    return res.json({
      success: true,
      message: 'User updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
}

export function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const result = db.run('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// Full User Analytics & Detailed Academic/Test Report for Admin
export function getUserDetailedReport(req, res, next) {
  try {
    const { id } = req.params;
    const { semester_id } = req.query;

    const user = db.get(
      `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, u.avatar, u.created_at,
              s.name as semester_name, s.code as semester_code
       FROM users u
       LEFT JOIN semesters s ON u.semester_id = s.id
       WHERE u.id = ?`,
      [id]
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Total study time logged
    const timeLog = db.get(
      `SELECT COALESCE(SUM(total_seconds), 0) as total_seconds FROM user_time_logs WHERE user_id = ?`,
      [id]
    );

    // Overall user stats (with optional semester filter)
    let statsSql = `
      SELECT 
         COUNT(qa.id) as total_tests,
         COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_tests,
         COUNT(CASE WHEN qa.status = 'paused' THEN 1 END) as paused_tests,
         COALESCE(SUM(qa.time_taken_seconds), 0) as total_test_time_seconds,
         COALESCE(SUM(qa.score), 0) as total_score,
         COALESCE(AVG(CASE WHEN qa.status = 'completed' AND qa.total_questions > 0 THEN (qa.correct_count * 100.0 / qa.total_questions) END), 0) as average_accuracy
       FROM quiz_attempts qa
       LEFT JOIN subjects sub ON qa.subject_id = sub.id
       WHERE qa.user_id = ?
    `;
    const statsParams = [id];
    if (semester_id) {
      statsSql += ` AND sub.semester_id = ? `;
      statsParams.push(parseInt(semester_id, 10));
    }
    const stats = db.get(statsSql, statsParams);

    // Semester-wise breakdown (only semesters with actual test attempts)
    const semesterBreakdown = db.query(
      `SELECT sem.id as semester_id, sem.name as semester_name, sem.code as semester_code,
              COUNT(qa.id) as total_tests,
              COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_tests,
              COALESCE(AVG(CASE WHEN qa.status = 'completed' AND qa.total_questions > 0 THEN (qa.correct_count * 100.0 / qa.total_questions) END), 0) as average_accuracy,
              COALESCE(SUM(qa.correct_count), 0) as correct_questions,
              COALESCE(SUM(qa.incorrect_count), 0) as incorrect_questions,
              COALESCE(SUM(qa.skipped_count), 0) as skipped_questions,
              COALESCE(SUM(qa.time_taken_seconds), 0) as time_spent_seconds
       FROM semesters sem
       JOIN subjects sub ON sub.semester_id = sem.id
       JOIN quiz_attempts qa ON qa.subject_id = sub.id AND qa.user_id = ?
       GROUP BY sem.id
       ORDER BY sem.order_num ASC`,
      [id]
    );

    // Subject-wise breakdown (only subjects with actual attempts)
    let subjectSql = `
      SELECT sub.id as subject_id, sub.name as subject_name, sub.code as subject_code,
             sem.id as semester_id, sem.name as semester_name,
             COUNT(qa.id) as total_tests,
             COUNT(CASE WHEN qa.status = 'completed' THEN 1 END) as completed_tests,
             COALESCE(AVG(CASE WHEN qa.status = 'completed' AND qa.total_questions > 0 THEN (qa.correct_count * 100.0 / qa.total_questions) END), 0) as average_accuracy,
             COALESCE(SUM(qa.correct_count), 0) as correct_questions,
             COALESCE(SUM(qa.incorrect_count), 0) as incorrect_questions,
             COALESCE(SUM(qa.skipped_count), 0) as skipped_questions,
             COALESCE(SUM(qa.time_taken_seconds), 0) as time_spent_seconds
      FROM subjects sub
      JOIN semesters sem ON sub.semester_id = sem.id
      JOIN quiz_attempts qa ON qa.subject_id = sub.id AND qa.user_id = ?
    `;
    const subjectParams = [id];

    if (semester_id) {
      subjectSql += ` WHERE sub.semester_id = ? `;
      subjectParams.push(parseInt(semester_id, 10));
    }

    subjectSql += ` GROUP BY sub.id HAVING COUNT(qa.id) > 0 ORDER BY sem.order_num ASC, sub.name ASC`;

    const subjectBreakdown = db.query(subjectSql, subjectParams);

    // Chapter-wise breakdown (only chapters with actual question answers)
    let chapterSql = `
      SELECT ch.id as chapter_id, ch.chapter_number, ch.chapter_name,
             sub.id as subject_id, sub.name as subject_name,
             COUNT(ans.id) as total_answered,
             COUNT(CASE WHEN ans.is_correct = 1 THEN 1 END) as total_correct,
             COUNT(CASE WHEN ans.is_correct = 0 AND (ans.status != 'skip' AND ans.status != 'skipped') THEN 1 END) as total_incorrect,
             COUNT(CASE WHEN ans.status = 'skip' OR ans.status = 'skipped' THEN 1 END) as total_skipped,
             COALESCE(SUM(ans.time_spent_seconds), 0) as total_time_spent
      FROM chapters ch
      JOIN subjects sub ON ch.subject_id = sub.id
      JOIN questions q ON q.chapter_id = ch.id
      JOIN quiz_answers ans ON ans.question_id = q.id
      JOIN quiz_attempts qa ON ans.attempt_id = qa.id AND qa.user_id = ?
    `;
    const chapterParams = [id];

    if (semester_id) {
      chapterSql += ` WHERE sub.semester_id = ? `;
      chapterParams.push(parseInt(semester_id, 10));
    }

    chapterSql += ` GROUP BY ch.id HAVING COUNT(ans.id) > 0 ORDER BY sub.id ASC, ch.chapter_number ASC`;

    const chapterBreakdown = db.query(chapterSql, chapterParams);

    // Test attempts history
    let attemptsSql = `
      SELECT qa.id, qa.subject_id, qa.test_title, qa.test_type, qa.status,
             qa.total_questions, qa.correct_count, qa.incorrect_count, qa.skipped_count, qa.unvisited_count,
             qa.score, qa.time_taken_seconds, qa.created_at, qa.completed_at, qa.saved_state_json,
             sub.name as subject_name, sem.name as semester_name, sem.id as semester_id
      FROM quiz_attempts qa
      LEFT JOIN subjects sub ON qa.subject_id = sub.id
      LEFT JOIN semesters sem ON sub.semester_id = sem.id
      WHERE qa.user_id = ?
    `;
    const attemptsParams = [id];

    if (semester_id) {
      attemptsSql += ` AND sub.semester_id = ? `;
      attemptsParams.push(parseInt(semester_id, 10));
    }

    attemptsSql += ` ORDER BY qa.id DESC`;

    const attempts = db.query(attemptsSql, attemptsParams);

    // Fetch individual answers for each attempt if available
    const attemptIds = attempts.map(a => a.id);
    let answersByAttempt = new Map();

    if (attemptIds.length > 0) {
      const placeholders = attemptIds.map(() => '?').join(',');
      const allAnswers = db.query(
        `SELECT ans.id, ans.attempt_id, ans.question_id, ans.selected_option, ans.is_correct, ans.status, ans.time_spent_seconds,
                q.question_text, q.difficulty, q.solution_explanation,
                ch.chapter_name, ch.chapter_number
         FROM quiz_answers ans
         LEFT JOIN questions q ON ans.question_id = q.id
         LEFT JOIN chapters ch ON q.chapter_id = ch.id
         WHERE ans.attempt_id IN (${placeholders})
         ORDER BY ans.id ASC`,
        attemptIds
      );

      // Get options for those questions
      const questionIds = [...new Set(allAnswers.map(a => a.question_id).filter(Boolean))];
      let optionsByQuestion = new Map();
      if (questionIds.length > 0) {
        const qPlaceholders = questionIds.map(() => '?').join(',');
        const qOptions = db.query(
          `SELECT question_id, option_text, is_correct FROM question_options WHERE question_id IN (${qPlaceholders})`,
          questionIds
        );
        for (const opt of qOptions) {
          if (!optionsByQuestion.has(opt.question_id)) optionsByQuestion.set(opt.question_id, []);
          optionsByQuestion.get(opt.question_id).push(opt);
        }
      }

      for (const ans of allAnswers) {
        if (!answersByAttempt.has(ans.attempt_id)) answersByAttempt.set(ans.attempt_id, []);
        const opts = optionsByQuestion.get(ans.question_id) || [];
        const correctOpt = opts.find(o => o.is_correct === 1);
        answersByAttempt.get(ans.attempt_id).push({
          ...ans,
          options: opts.map(o => o.option_text),
          correct_answer: correctOpt ? correctOpt.option_text : null
        });
      }
    }

    const detailedAttempts = attempts.map(att => {
      let detailedAnswers = answersByAttempt.get(att.id) || [];
      let savedState = null;
      if (att.saved_state_json) {
        try {
          savedState = JSON.parse(att.saved_state_json);
          if (detailedAnswers.length === 0 && savedState.questions && Array.isArray(savedState.questions)) {
            detailedAnswers = savedState.questions.map((q, idx) => {
              const userAns = savedState.answers ? (savedState.answers[idx] || savedState.answers[q.id]) : null;
              const selectedOpt = userAns?.selectedOption || userAns?.option || (typeof userAns === 'string' ? userAns : null);
              const isCorrect = userAns ? (userAns.isCorrect || userAns.is_correct ? 1 : (selectedOpt === q.answer ? 1 : 0)) : 0;
              const status = userAns?.status || (selectedOpt ? (isCorrect ? 'correct' : 'incorrect') : 'unvisited');
              const opts = Array.isArray(q.options) ? q.options.map(o => (typeof o === 'object' ? o.option_text : o)) : [];
              return {
                id: q.id || idx + 1,
                question_id: q.id,
                question_text: q.question_text || q.question || 'Question Text',
                difficulty: q.difficulty || 'Easy',
                solution_explanation: q.solution_explanation || q.explanation || '',
                options: opts,
                correct_answer: q.answer || (Array.isArray(q.options) ? q.options.find(o => o.is_correct)?.option_text : null),
                selected_option: selectedOpt,
                is_correct: isCorrect,
                status: status,
                time_spent_seconds: userAns?.timeSpent || userAns?.time_spent_seconds || 0
              };
            });
          }
        } catch (e) {}
      }

      const chaptersMap = new Map();
      for (const ans of detailedAnswers) {
        if (ans.chapter_name) {
          const key = ans.chapter_number ? `${ans.chapter_number}` : ans.chapter_name;
          if (!chaptersMap.has(key)) {
            chaptersMap.set(key, {
              chapter_number: ans.chapter_number,
              chapter_name: ans.chapter_name
            });
          }
        }
      }
      
      let chaptersIncluded = Array.from(chaptersMap.values());
      if (chaptersIncluded.length === 0 && savedState?.chapters && Array.isArray(savedState.chapters) && att.subject_id) {
        try {
          const chNums = savedState.chapters;
          const placeholders = chNums.map(() => '?').join(',');
          const foundChapters = db.query(
            `SELECT chapter_number, chapter_name FROM chapters WHERE subject_id = ? AND (chapter_number IN (${placeholders}) OR id IN (${placeholders}))`,
            [att.subject_id, ...chNums, ...chNums]
          );
          if (foundChapters.length > 0) {
            chaptersIncluded = foundChapters;
          }
        } catch (err) {}
      }

      return {
        ...att,
        savedState,
        detailedAnswers,
        chapters_included: chaptersIncluded
      };
    });

    // Weekly activity (last 7 days)
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysMap[d.getDay()];
      past7Days.push({ date: dateStr, day: dayName, count: 0, accuracy: 0, scores: [] });
    }

    attempts.filter(a => a.status === 'completed').forEach(test => {
      const testDate = test.completed_at ? test.completed_at.split(' ')[0].split('T')[0] : null;
      const dayEntry = past7Days.find(d => d.date === testDate);
      if (dayEntry) {
        dayEntry.count += 1;
        const acc = test.total_questions > 0 ? (test.correct_count / test.total_questions) * 100 : 0;
        dayEntry.scores.push(acc);
      }
    });

    past7Days.forEach(d => {
      if (d.scores.length > 0) {
        d.accuracy = Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length);
      }
    });

    // Calculate accurate aggregate question & time breakdown from actual answers
    let answerStatsSql = `
      SELECT 
        COALESCE(SUM(CASE WHEN ans.is_correct = 1 THEN ans.time_spent_seconds END), 0) as correct_time,
        COALESCE(SUM(CASE WHEN ans.is_correct = 0 AND (ans.status != 'skip' AND ans.status != 'skipped') THEN ans.time_spent_seconds END), 0) as incorrect_time,
        COALESCE(SUM(CASE WHEN ans.status = 'skip' OR ans.status = 'skipped' THEN ans.time_spent_seconds END), 0) as skipped_time,
        COUNT(CASE WHEN ans.is_correct = 1 THEN 1 END) as total_correct,
        COUNT(CASE WHEN ans.is_correct = 0 AND (ans.status != 'skip' AND ans.status != 'skipped') THEN 1 END) as total_incorrect,
        COUNT(CASE WHEN ans.status = 'skip' OR ans.status = 'skipped' THEN 1 END) as total_skipped
      FROM quiz_answers ans
      JOIN quiz_attempts qa ON ans.attempt_id = qa.id
      WHERE qa.user_id = ?
    `;
    const answerStatsParams = [id];
    if (semester_id) {
      answerStatsSql += ` AND qa.subject_id IN (SELECT id FROM subjects WHERE semester_id = ?)`;
      answerStatsParams.push(parseInt(semester_id, 10));
    }

    const answerStats = db.get(answerStatsSql, answerStatsParams);

    return res.json({
      success: true,
      user,
      stats: {
        total_study_time_seconds: timeLog?.total_seconds || 0,
        total_tests: stats?.total_tests || 0,
        completed_tests: stats?.completed_tests || 0,
        paused_tests: stats?.paused_tests || 0,
        total_test_time_seconds: stats?.total_test_time_seconds || 0,
        total_score: stats?.total_score || 0,
        average_accuracy: Math.round((stats?.average_accuracy || 0) * 10) / 10
      },
      answerStats: {
        correct: answerStats?.total_correct || 0,
        incorrect: answerStats?.total_incorrect || 0,
        skipped: answerStats?.total_skipped || 0,
        correct_time: answerStats?.correct_time || 0,
        incorrect_time: answerStats?.incorrect_time || 0,
        skipped_time: answerStats?.skipped_time || 0
      },
      semesterBreakdown,
      subjectBreakdown,
      chapterBreakdown,
      attempts: detailedAttempts,
      weeklyActivity: past7Days
    });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 3. SEMESTER MANAGEMENT (CRUD)
// ==========================================
export function createSemester(req, res, next) {
  try {
    const { code, name, order_num = 1 } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Code and Name are required.' });
    }

    const result = db.run(
      'INSERT INTO semesters (code, name, order_num) VALUES (?, ?, ?)',
      [code.trim().toUpperCase(), name.trim(), order_num]
    );

    const semester = db.get('SELECT * FROM semesters WHERE id = ?', [Number(result.lastInsertRowid)]);
    return res.status(201).json({ success: true, message: 'Semester created successfully!', semester });
  } catch (error) {
    next(error);
  }
}

export function updateSemester(req, res, next) {
  try {
    const { id } = req.params;
    const { code, name, order_num } = req.body;

    db.run(
      `UPDATE semesters
       SET code = COALESCE(?, code),
           name = COALESCE(?, name),
           order_num = COALESCE(?, order_num)
       WHERE id = ?`,
      [code ? code.trim().toUpperCase() : null, name ? name.trim() : null, order_num || null, id]
    );

    const semester = db.get('SELECT * FROM semesters WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Semester updated successfully!', semester });
  } catch (error) {
    next(error);
  }
}

export function deleteSemester(req, res, next) {
  try {
    const { id } = req.params;
    db.run('DELETE FROM semesters WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Semester deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 4. SUBJECT & CHAPTER MANAGEMENT (CRUD)
// ==========================================
export function createSubject(req, res, next) {
  try {
    const { semester_id, name, code, description, icon = 'book' } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const result = db.run(
      `INSERT INTO subjects (semester_id, name, code, description, icon)
       VALUES (?, ?, ?, ?, ?)`,
      [semester_id || null, name.trim(), code || name.toUpperCase().replace(/\s+/g, '_'), description || '', icon]
    );

    const subject = db.get('SELECT * FROM subjects WHERE id = ?', [Number(result.lastInsertRowid)]);
    return res.status(201).json({ success: true, message: 'Subject created successfully!', subject });
  } catch (error) {
    next(error);
  }
}

export function updateSubject(req, res, next) {
  try {
    const { id } = req.params;
    const { semester_id, name, code, description, icon } = req.body;

    db.run(
      `UPDATE subjects
       SET semester_id = COALESCE(?, semester_id),
           name = COALESCE(?, name),
           code = COALESCE(?, code),
           description = COALESCE(?, description),
           icon = COALESCE(?, icon)
       WHERE id = ?`,
      [semester_id || null, name ? name.trim() : null, code ? code.trim() : null, description, icon, id]
    );

    const subject = db.get('SELECT * FROM subjects WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Subject updated successfully!', subject });
  } catch (error) {
    next(error);
  }
}

export function deleteSubject(req, res, next) {
  try {
    const { id } = req.params;
    db.run('DELETE FROM subjects WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Subject and all related chapters/questions deleted.' });
  } catch (error) {
    next(error);
  }
}

export function createChapter(req, res, next) {
  try {
    const { subject_id, chapter_number, chapter_name, chapter_description } = req.body;
    if (!subject_id || !chapter_number || !chapter_name) {
      return res.status(400).json({ success: false, message: 'Subject ID, chapter number, and chapter name are required.' });
    }

    const result = db.run(
      `INSERT INTO chapters (subject_id, chapter_number, chapter_name, chapter_description)
       VALUES (?, ?, ?, ?)`,
      [subject_id, chapter_number, chapter_name.trim(), chapter_description || '']
    );

    const chapter = db.get('SELECT * FROM chapters WHERE id = ?', [Number(result.lastInsertRowid)]);
    return res.status(201).json({ success: true, message: 'Chapter created successfully!', chapter });
  } catch (error) {
    next(error);
  }
}

export function updateChapter(req, res, next) {
  try {
    const { id } = req.params;
    const { chapter_number, chapter_name, chapter_description } = req.body;

    db.run(
      `UPDATE chapters
       SET chapter_number = COALESCE(?, chapter_number),
           chapter_name = COALESCE(?, chapter_name),
           chapter_description = COALESCE(?, chapter_description)
       WHERE id = ?`,
      [chapter_number || null, chapter_name ? chapter_name.trim() : null, chapter_description, id]
    );

    const chapter = db.get('SELECT * FROM chapters WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Chapter updated successfully!', chapter });
  } catch (error) {
    next(error);
  }
}

export function deleteChapter(req, res, next) {
  try {
    const { id } = req.params;
    db.run('DELETE FROM chapters WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Chapter and related questions deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 5. QUESTION BANK MANAGEMENT (CRUD & Bulk)
// ==========================================
export function getQuestions(req, res, next) {
  try {
    const { search, subject_id, chapter_id, difficulty, page = 1, limit = 20 } = req.query;

    let sql = `
      SELECT q.id, q.question_text, q.difficulty, q.solution_explanation, q.marks, q.created_at,
             ch.id as chapter_id, ch.chapter_number, ch.chapter_name,
             sub.id as subject_id, sub.name as subject_name
      FROM questions q
      JOIN chapters ch ON q.chapter_id = ch.id
      JOIN subjects sub ON ch.subject_id = sub.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      sql += ` AND q.question_text LIKE ? `;
      params.push(`%${search}%`);
    }

    if (subject_id) {
      sql += ` AND sub.id = ? `;
      params.push(subject_id);
    }

    if (chapter_id) {
      sql += ` AND ch.id = ? `;
      params.push(chapter_id);
    }

    if (difficulty) {
      sql += ` AND q.difficulty = ? COLLATE NOCASE `;
      params.push(difficulty);
    }

    sql += ` ORDER BY q.id DESC `;

    const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    sql += ` LIMIT ? OFFSET ? `;
    params.push(parseInt(limit, 10), offset);

    const questions = db.query(sql, params);

    // Attach options for each question
    if (questions.length > 0) {
      const qIds = questions.map(q => q.id);
      const placeholders = qIds.map(() => '?').join(',');
      const options = db.query(
        `SELECT id, question_id, option_text, is_correct, option_index
         FROM question_options
         WHERE question_id IN (${placeholders})
         ORDER BY question_id ASC, option_index ASC`,
        qIds
      );

      const optsMap = new Map();
      for (const opt of options) {
        if (!optsMap.has(opt.question_id)) optsMap.set(opt.question_id, []);
        optsMap.get(opt.question_id).push(opt);
      }

      questions.forEach(q => {
        const opts = optsMap.get(q.id) || [];
        q.options = opts;
        const correct = opts.find(o => o.is_correct === 1);
        q.answer = correct ? correct.option_text : '';
      });
    }

    const totalCountRow = db.get('SELECT COUNT(*) as count FROM questions');

    return res.json({
      success: true,
      questions,
      totalQuestions: totalCountRow?.count || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
  } catch (error) {
    next(error);
  }
}

export function createQuestion(req, res, next) {
  try {
    const { chapter_id, question_text, difficulty = 'Easy', solution_explanation = '', marks = 1, options = [], answer } = req.body;

    if (!chapter_id || !question_text || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Chapter ID, question text, and at least 2 options are required.'
      });
    }

    const result = db.run(
      `INSERT INTO questions (chapter_id, question_text, difficulty, solution_explanation, marks)
       VALUES (?, ?, ?, ?, ?)`,
      [chapter_id, question_text.trim(), difficulty, solution_explanation.trim(), marks]
    );

    const questionId = Number(result.lastInsertRowid);

    const insertOptStmt = db.raw.prepare(`
      INSERT INTO question_options (question_id, option_index, option_text, is_correct)
      VALUES (?, ?, ?, ?)
    `);

    options.forEach((opt, idx) => {
      const optText = typeof opt === 'object' ? opt.option_text || opt.text : String(opt);
      let isCorrect = 0;
      if (typeof opt === 'object' && opt.is_correct !== undefined) {
        isCorrect = opt.is_correct ? 1 : 0;
      } else if (answer !== undefined && String(optText).trim() === String(answer).trim()) {
        isCorrect = 1;
      }

      insertOptStmt.run(questionId, idx, optText.trim(), isCorrect);
    });

    return res.status(201).json({
      success: true,
      message: 'Question created successfully!',
      questionId
    });
  } catch (error) {
    next(error);
  }
}

export function updateQuestion(req, res, next) {
  try {
    const { id } = req.params;
    const { chapter_id, question_text, difficulty, solution_explanation, marks, options, answer } = req.body;

    db.run(
      `UPDATE questions
       SET chapter_id = COALESCE(?, chapter_id),
           question_text = COALESCE(?, question_text),
           difficulty = COALESCE(?, difficulty),
           solution_explanation = COALESCE(?, solution_explanation),
           marks = COALESCE(?, marks)
       WHERE id = ?`,
      [chapter_id || null, question_text ? question_text.trim() : null, difficulty || null, solution_explanation, marks || null, id]
    );

    if (Array.isArray(options) && options.length > 0) {
      // Refresh options
      db.run('DELETE FROM question_options WHERE question_id = ?', [id]);
      const insertOptStmt = db.raw.prepare(`
        INSERT INTO question_options (question_id, option_index, option_text, is_correct)
        VALUES (?, ?, ?, ?)
      `);

      options.forEach((opt, idx) => {
        const optText = typeof opt === 'object' ? opt.option_text || opt.text : String(opt);
        let isCorrect = 0;
        if (typeof opt === 'object' && opt.is_correct !== undefined) {
          isCorrect = opt.is_correct ? 1 : 0;
        } else if (answer !== undefined && String(optText).trim() === String(answer).trim()) {
          isCorrect = 1;
        }
        insertOptStmt.run(id, idx, optText.trim(), isCorrect);
      });
    }

    return res.json({
      success: true,
      message: 'Question updated successfully!'
    });
  } catch (error) {
    next(error);
  }
}

export function deleteQuestion(req, res, next) {
  try {
    const { id } = req.params;
    db.run('DELETE FROM questions WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Question deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

// ==========================================
// 6. SEMESTER CHANGE REQUEST MANAGEMENT
// ==========================================
export function getAdminSemesterRequests(req, res, next) {
  try {
    const { status } = req.query; // 'pending' | 'approved' | 'rejected' | all

    let sql = `
      SELECT sr.id, sr.user_id, sr.reason, sr.status, sr.admin_comment, sr.created_at, sr.updated_at,
             u.name as user_name, u.email as user_email, u.college as user_college, u.avatar as user_avatar,
             cur.name as current_semester_name, req.name as requested_semester_name,
             sr.requested_semester_id
      FROM semester_requests sr
      JOIN users u ON sr.user_id = u.id
      LEFT JOIN semesters cur ON sr.current_semester_id = cur.id
      LEFT JOIN semesters req ON sr.requested_semester_id = req.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND sr.status = ? ';
      params.push(status);
    }

    sql += " ORDER BY CASE WHEN sr.status = 'pending' THEN 1 ELSE 2 END, sr.id DESC";

    const requests = db.query(sql, params);

    const pendingCount = db.get("SELECT COUNT(*) as count FROM semester_requests WHERE status = 'pending'")?.count || 0;

    return res.json({
      success: true,
      requests,
      pendingCount
    });
  } catch (error) {
    next(error);
  }
}

export function reviewSemesterRequest(req, res, next) {
  try {
    const { id } = req.params;
    const { status, admin_comment = '' } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected.' });
    }

    const request = db.get('SELECT * FROM semester_requests WHERE id = ?', [id]);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Semester request not found.' });
    }

    db.exec('BEGIN TRANSACTION;');

    try {
      // Update request status
      db.run(
        `UPDATE semester_requests
         SET status = ?,
             admin_comment = ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [status, admin_comment.trim(), id]
      );

      // If approved, update user's assigned semester in users table
      if (status === 'approved') {
        db.run(
          `UPDATE users
           SET semester_id = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [request.requested_semester_id, request.user_id]
        );
      }

      db.exec('COMMIT;');

      const updatedUser = db.get(
        `SELECT u.id, u.name, u.email, u.role, u.college, u.semester_id, s.name as semester_name
         FROM users u
         LEFT JOIN semesters s ON u.semester_id = s.id
         WHERE u.id = ?`,
        [request.user_id]
      );

      return res.json({
        success: true,
        message: status === 'approved' 
          ? `Request approved! Student assigned to new semester.` 
          : 'Request rejected.',
        updatedUser
      });
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error) {
    next(error);
  }
}
