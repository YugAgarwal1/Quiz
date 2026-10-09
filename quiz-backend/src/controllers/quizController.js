import db from '../config/db.js';

export function generateQuestions(req, res, next) {
  try {
    const { subject, chapters = [], difficulty, numberOfQuestions = 10, testType = 'practise', timeLimit = 0 } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: 'Subject is required.' });
    }

    // Find Subject
    const subjectRecord = db.get(
      `SELECT id, name FROM subjects WHERE id = ? OR name = ? OR code = ?`,
      [subject, subject, subject]
    );

    if (!subjectRecord) {
      return res.status(404).json({ success: false, message: `Subject '${subject}' not found.` });
    }

    // Build Chapter Filter
    let chapterCondition = '';
    const queryParams = [subjectRecord.id];

    if (Array.isArray(chapters) && chapters.length > 0) {
      const placeholders = chapters.map(() => '?').join(',');
      chapterCondition = ` AND (ch.chapter_number IN (${placeholders}) OR ch.id IN (${placeholders}))`;
      queryParams.push(...chapters, ...chapters);
    }

    // Build Difficulty Filter
    let difficultyCondition = '';
    if (difficulty && difficulty !== 'All' && difficulty !== 'Mixed') {
      difficultyCondition = ` AND q.difficulty = ? COLLATE NOCASE`;
      queryParams.push(difficulty);
    }

    const sql = `
      SELECT q.id, q.question_text as question, q.difficulty, q.solution_explanation as solution, q.marks,
             ch.id as chapter_id, ch.chapter_number, ch.chapter_name
      FROM questions q
      JOIN chapters ch ON q.chapter_id = ch.id
      WHERE ch.subject_id = ?
      ${chapterCondition}
      ${difficultyCondition}
      ORDER BY RANDOM()
      LIMIT ?
    `;

    queryParams.push(parseInt(numberOfQuestions, 10) || 10);

    const questions = db.query(sql, queryParams);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions available matching your selected subject, chapters, and difficulty.'
      });
    }

    // Attach options for each question
    const questionIds = questions.map(q => q.id);
    const optionsPlaceholders = questionIds.map(() => '?').join(',');
    const options = db.query(
      `SELECT id, question_id, option_text, is_correct, option_index
       FROM question_options
       WHERE question_id IN (${optionsPlaceholders})
       ORDER BY question_id ASC, option_index ASC`,
      questionIds
    );

    const optionsByQuestion = new Map();
    for (const opt of options) {
      if (!optionsByQuestion.has(opt.question_id)) {
        optionsByQuestion.set(opt.question_id, []);
      }
      optionsByQuestion.get(opt.question_id).push(opt);
    }

    const formattedQuestions = questions.map(q => {
      const opts = optionsByQuestion.get(q.id) || [];
      const correctOpt = opts.find(o => o.is_correct === 1);
      return {
        id: q.id,
        question: q.question,
        difficulty: q.difficulty,
        solution: q.solution,
        options: opts.map(o => o.option_text),
        answer: correctOpt ? correctOpt.option_text : '',
        chapterNumber: q.chapter_number,
        chapterName: q.chapter_name
      };
    });

    // Create in-progress test attempt in database if user is logged in
    let attemptId = null;
    if (req.user) {
      const result = db.run(
        `INSERT INTO quiz_attempts (
           user_id, subject_id, test_title, test_type, status,
           total_questions, time_limit_seconds, saved_state_json
         ) VALUES (?, ?, ?, ?, 'in_progress', ?, ?, ?)`,
        [
          req.user.id,
          subjectRecord.id,
          `${subjectRecord.name} Practice Test`,
          testType,
          formattedQuestions.length,
          timeLimit,
          JSON.stringify({
            subject: subjectRecord.name,
            chapters,
            difficulty,
            questionsCount: formattedQuestions.length
          })
        ]
      );
      attemptId = Number(result.lastInsertRowid);
    }

    return res.json({
      success: true,
      testId: attemptId || `local_${Date.now()}`,
      subject: subjectRecord.name,
      questions: formattedQuestions,
      totalQuestions: formattedQuestions.length
    });
  } catch (error) {
    next(error);
  }
}

export function submitQuiz(req, res, next) {
  try {
    const { testId, subject, answers = {}, timeTaken = 0, questions: rawQuestions, data: rawData } = req.body;
    const userId = req.user ? req.user.id : null;

    let questions = Array.isArray(rawQuestions) && rawQuestions.length > 0 
      ? rawQuestions 
      : (Array.isArray(rawData) && rawData.length > 0 ? rawData : []);

    // If questions was not passed directly, try to load questions by IDs from answers
    if (questions.length === 0) {
      let qIds = [];
      if (Array.isArray(answers)) {
        qIds = answers.map(a => a.questionId || a.id).filter(Boolean);
      } else if (answers && typeof answers === 'object') {
        qIds = Object.keys(answers).map(Number).filter(n => !isNaN(n) && n > 0);
      }

      if (qIds.length > 0) {
        const placeholders = qIds.map(() => '?').join(',');
        const dbQuestions = db.query(`
          SELECT q.id, q.question_text, q.difficulty, q.solution_explanation, q.marks,
                 ch.chapter_name, ch.chapter_number, sub.name as subject_name
          FROM questions q
          JOIN chapters ch ON q.chapter_id = ch.id
          JOIN subjects sub ON ch.subject_id = sub.id
          WHERE q.id IN (${placeholders})
        `, qIds);

        // Fetch options for these questions
        const opts = db.query(`
          SELECT question_id, option_text, is_correct 
          FROM question_options 
          WHERE question_id IN (${placeholders})
        `, qIds);

        const optsMap = new Map();
        for (const opt of opts) {
          if (!optsMap.has(opt.question_id)) optsMap.set(opt.question_id, []);
          optsMap.get(opt.question_id).push(opt);
        }

        questions = dbQuestions.map(q => {
          const qOpts = optsMap.get(q.id) || [];
          const correctOpt = qOpts.find(o => o.is_correct === 1);
          return {
            id: q.id,
            question: q.question_text,
            question_text: q.question_text,
            difficulty: q.difficulty,
            solution: q.solution_explanation,
            solution_explanation: q.solution_explanation,
            options: qOpts.map(o => o.option_text),
            answer: correctOpt ? correctOpt.option_text : ''
          };
        });
      }
    }

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;
    let unvisitedCount = 0;

    const detailedAnswers = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let answerData = {};
      
      if (Array.isArray(answers)) {
        answerData = answers.find(a => String(a.questionId) === String(q.id) || String(a.id) === String(q.id)) || answers[i] || {};
      } else if (answers && typeof answers === 'object') {
        answerData = answers[q.id] || answers[String(q.id)] || answers[i] || {};
      }

      const selectedOption = answerData.selectedOption !== undefined && answerData.selectedOption !== null 
        ? answerData.selectedOption 
        : (answerData.option !== undefined ? answerData.option : null);
      const timeSpent = answerData.timeSpent || answerData.time_spent_seconds || 0;

      const correctAnswer = q.answer || q.correct_answer || (Array.isArray(q.options) && typeof q.options[0] === 'object' ? q.options.find(o => o.is_correct)?.option_text : '');

      let status = 'unvisited';
      let isCorrect = 0;

      if (selectedOption !== null && selectedOption !== '') {
        if (correctAnswer && String(selectedOption).trim().toLowerCase() === String(correctAnswer).trim().toLowerCase()) {
          status = 'correct';
          isCorrect = 1;
          correctCount++;
        } else {
          status = 'incorrect';
          isCorrect = 0;
          incorrectCount++;
        }
      } else if (answerData.status === 'skip' || answerData.status === 'skipped') {
        status = 'skipped';
        skippedCount++;
      } else {
        status = 'unvisited';
        unvisitedCount++;
      }

      detailedAnswers.push({
        questionIndex: i,
        questionId: q.id,
        question: q.question || q.question_text,
        question_text: q.question || q.question_text,
        selectedOption,
        selected_option: selectedOption,
        correctAnswer,
        correct_answer: correctAnswer,
        status,
        isCorrect,
        is_correct: isCorrect,
        timeSpent,
        time_spent_seconds: timeSpent,
        solution: q.solution || q.solution_explanation || '',
        solution_explanation: q.solution || q.solution_explanation || '',
        options: Array.isArray(q.options) ? q.options.map(o => (typeof o === 'object' ? o.option_text : o)) : []
      });
    }

    const totalQuestions = questions.length || detailedAnswers.length;
    const score = correctCount; // 1 mark per question

    // Robust subject resolution
    let sub = null;
    if (subject) {
      sub = db.get('SELECT id, semester_id, name FROM subjects WHERE LOWER(name) = LOWER(?) OR id = ?', [String(subject).trim(), Number(subject) || 0]);
      if (!sub) {
        sub = db.get('SELECT id, semester_id, name FROM subjects WHERE LOWER(name) LIKE ?', [`%${String(subject).trim().toLowerCase()}%`]);
      }
    }
    if (!sub && questions.length > 0 && questions[0]?.id) {
      sub = db.get(`
        SELECT s.id, s.semester_id, s.name 
        FROM subjects s 
        JOIN chapters c ON c.subject_id = s.id 
        JOIN questions q ON q.chapter_id = c.id 
        WHERE q.id = ? LIMIT 1
      `, [questions[0].id]);
    }
    if (!sub && userId) {
      const userRec = db.get('SELECT semester_id FROM users WHERE id = ?', [userId]);
      if (userRec?.semester_id) {
        sub = db.get('SELECT id, semester_id, name FROM subjects WHERE semester_id = ? LIMIT 1', [userRec.semester_id]);
      }
      if (!sub) {
        sub = db.get('SELECT id, semester_id, name FROM subjects LIMIT 1');
      }
    }

    let finalAttemptId = testId;

    if (userId) {
      let numericAttemptId = Number(testId);
      let existingAttempt = !isNaN(numericAttemptId) && numericAttemptId > 0
        ? db.get('SELECT id, status FROM quiz_attempts WHERE id = ? AND user_id = ?', [numericAttemptId, userId])
        : null;

      if (!existingAttempt && sub) {
        // Check if there is an active paused or in_progress attempt for this user and subject
        const openAttempt = db.get(
          "SELECT id FROM quiz_attempts WHERE user_id = ? AND subject_id = ? AND status IN ('paused', 'in_progress') ORDER BY id DESC LIMIT 1",
          [userId, sub.id]
        );
        if (openAttempt) {
          numericAttemptId = openAttempt.id;
          existingAttempt = openAttempt;
        }
      }

      if (!existingAttempt) {
        const result = db.run(
          `INSERT INTO quiz_attempts (
             user_id, subject_id, test_title, test_type, status,
             total_questions, correct_count, incorrect_count, skipped_count, unvisited_count,
             score, time_taken_seconds, completed_at
           ) VALUES (?, ?, ?, 'practise', 'completed', ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [
            userId,
            sub ? sub.id : null,
            `${(sub ? sub.name : subject) || 'General'} Practice Test`,
            totalQuestions,
            correctCount,
            incorrectCount,
            skippedCount,
            unvisitedCount,
            score,
            timeTaken
          ]
        );
        numericAttemptId = Number(result.lastInsertRowid);
      } else {
        db.run(
          `UPDATE quiz_attempts
           SET status = 'completed',
               subject_id = COALESCE(?, subject_id),
               total_questions = ?,
               correct_count = ?,
               incorrect_count = ?,
               skipped_count = ?,
               unvisited_count = ?,
               score = ?,
               time_taken_seconds = ?,
               saved_state_json = NULL,
               completed_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
          [
            sub ? sub.id : null,
            totalQuestions,
            correctCount,
            incorrectCount,
            skippedCount,
            unvisitedCount,
            score,
            timeTaken,
            numericAttemptId,
            userId
          ]
        );

        db.run('DELETE FROM quiz_answers WHERE attempt_id = ?', [numericAttemptId]);
      }

      finalAttemptId = numericAttemptId;

      // Save individual question answers into quiz_answers safely
      db.exec('BEGIN TRANSACTION;');
      try {
        const insertAnswerStmt = db.raw.prepare(`
          INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct, status, time_spent_seconds)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        for (const ans of detailedAnswers) {
          let validQId = null;
          if (ans.questionId && Number.isInteger(Number(ans.questionId))) {
            const exists = db.get('SELECT id FROM questions WHERE id = ?', [Number(ans.questionId)]);
            if (exists) {
              validQId = exists.id;
            }
          }

          // Fallback: match by question text or register if missing
          if (!validQId && (ans.question || ans.question_text)) {
            const qPrompt = ans.question || ans.question_text;
            const byText = db.get('SELECT id FROM questions WHERE question_text = ? LIMIT 1', [qPrompt]);
            if (byText) {
              validQId = byText.id;
            } else if (sub) {
              const firstChapter = db.get('SELECT id FROM chapters WHERE subject_id = ? LIMIT 1', [sub.id]);
              if (firstChapter) {
                const qRes = db.run(
                  'INSERT INTO questions (chapter_id, question_text, difficulty, solution_explanation) VALUES (?, ?, ?, ?)',
                  [firstChapter.id, qPrompt, 'Easy', ans.solution || ans.solution_explanation || '']
                );
                validQId = Number(qRes.lastInsertRowid);
                if (ans.options && Array.isArray(ans.options)) {
                  ans.options.forEach((optText, oIdx) => {
                    db.run(
                      'INSERT INTO question_options (question_id, option_index, option_text, is_correct) VALUES (?, ?, ?, ?)',
                      [validQId, oIdx, String(optText), String(optText).trim().toLowerCase() === String(ans.correctAnswer || ans.correct_answer).trim().toLowerCase() ? 1 : 0]
                    );
                  });
                }
              }
            }
          }

          if (validQId) {
            insertAnswerStmt.run(
              numericAttemptId,
              validQId,
              ans.selectedOption !== null && ans.selectedOption !== undefined ? String(ans.selectedOption) : null,
              ans.isCorrect ? 1 : 0,
              ans.status || 'unvisited',
              ans.timeSpent || 0
            );
          }
        }
        db.exec('COMMIT;');
      } catch (err) {
        db.exec('ROLLBACK;');
        console.error('[Quiz Submit] Error saving answers:', err);
      }
    }

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    return res.json({
      success: true,
      message: 'Quiz submitted successfully!',
      testId: finalAttemptId,
      attemptId: finalAttemptId,
      result: {
        testId: finalAttemptId,
        subject: sub ? sub.name : subject,
        score,
        totalQuestions,
        correctCount,
        incorrectCount,
        skippedCount,
        unvisitedCount,
        accuracy,
        timeTaken,
        status: 'completed',
        completedAt: new Date().toISOString(),
        answers: detailedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
}

export function pauseQuiz(req, res, next) {
  try {
    const { testId, subject, answers = {}, timeTaken = 0, currentQuestionIndex = 0, questions = [] } = req.body;
    const userId = req.user ? req.user.id : null;

    // Resolve subject
    let sub = null;
    if (subject) {
      sub = db.get('SELECT id, semester_id, name FROM subjects WHERE LOWER(name) = LOWER(?) OR id = ?', [String(subject).trim(), Number(subject) || 0]);
      if (!sub) {
        sub = db.get('SELECT id, semester_id, name FROM subjects WHERE LOWER(name) LIKE ?', [`%${String(subject).trim().toLowerCase()}%`]);
      }
    }
    if (!sub && questions.length > 0 && questions[0]?.id) {
      sub = db.get(`
        SELECT s.id, s.semester_id, s.name 
        FROM subjects s 
        JOIN chapters c ON c.subject_id = s.id 
        JOIN questions q ON q.chapter_id = c.id 
        WHERE q.id = ? LIMIT 1
      `, [questions[0].id]);
    }
    if (!sub && userId) {
      const userRec = db.get('SELECT semester_id FROM users WHERE id = ?', [userId]);
      if (userRec?.semester_id) {
        sub = db.get('SELECT id, semester_id, name FROM subjects WHERE semester_id = ? LIMIT 1', [userRec.semester_id]);
      }
    }

    const savedState = {
      subject: sub ? sub.name : subject,
      answers,
      timeTaken,
      currentQuestionIndex,
      questions,
      pausedAt: new Date().toISOString()
    };

    let attemptId = testId;

    if (userId) {
      const numericAttemptId = Number(testId);
      let existingAttempt = !isNaN(numericAttemptId) && numericAttemptId > 0
        ? db.get('SELECT id FROM quiz_attempts WHERE id = ? AND user_id = ?', [numericAttemptId, userId])
        : null;

      if (existingAttempt) {
        db.run(
          `UPDATE quiz_attempts
           SET status = 'paused',
               subject_id = COALESCE(?, subject_id),
               time_taken_seconds = ?,
               saved_state_json = ?
           WHERE id = ? AND user_id = ?`,
          [sub ? sub.id : null, timeTaken, JSON.stringify(savedState), numericAttemptId, userId]
        );
        attemptId = numericAttemptId;
      } else {
        const result = db.run(
          `INSERT INTO quiz_attempts (
             user_id, subject_id, test_title, status, total_questions, time_taken_seconds, saved_state_json
           ) VALUES (?, ?, ?, 'paused', ?, ?, ?)`,
          [
            userId,
            sub ? sub.id : null,
            `${(sub ? sub.name : subject) || 'General'} Paused Test`,
            questions.length,
            timeTaken,
            JSON.stringify(savedState)
          ]
        );
        attemptId = Number(result.lastInsertRowid);
      }
    }

    return res.json({
      success: true,
      message: 'Test paused and progress saved.',
      testId: attemptId,
      savedState
    });
  } catch (error) {
    next(error);
  }
}

export function getAttemptById(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    let sql = `
      SELECT qa.id, qa.user_id, qa.subject_id, qa.test_title, qa.test_type, qa.status,
             qa.total_questions, qa.correct_count, qa.incorrect_count, qa.skipped_count, qa.unvisited_count,
             qa.score, qa.time_taken_seconds, qa.created_at, qa.completed_at, qa.saved_state_json,
             sub.name as subject_name, sem.name as semester_name
      FROM quiz_attempts qa
      LEFT JOIN subjects sub ON qa.subject_id = sub.id
      LEFT JOIN semesters sem ON sub.semester_id = sem.id
      WHERE qa.id = ?
    `;
    const params = [id];
    if (!isAdmin && userId) {
      sql += ` AND qa.user_id = ?`;
      params.push(userId);
    }

    const attempt = db.get(sql, params);
    if (!attempt) {
      return res.status(404).json({ success: false, message: 'Test attempt not found.' });
    }

    // Fetch answers
    const answers = db.query(
      `SELECT ans.id, ans.question_id, ans.selected_option, ans.is_correct, ans.status, ans.time_spent_seconds,
              q.question_text, q.difficulty, q.solution_explanation, ch.chapter_name, ch.chapter_number
       FROM quiz_answers ans
       LEFT JOIN questions q ON ans.question_id = q.id
       LEFT JOIN chapters ch ON q.chapter_id = ch.id
       WHERE ans.attempt_id = ?
       ORDER BY ans.id ASC`,
      [id]
    );

    // Fetch options for questions
    const questionIds = [...new Set(answers.map(a => a.question_id).filter(Boolean))];
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

    let detailedAnswers = answers.map(ans => {
      const opts = optionsByQuestion.get(ans.question_id) || [];
      const correctOpt = opts.find(o => o.is_correct === 1);
      return {
        ...ans,
        options: opts.map(o => o.option_text),
        correct_answer: correctOpt ? correctOpt.option_text : null
      };
    });

    let savedState = null;
    if (attempt.saved_state_json) {
      try {
        savedState = JSON.parse(attempt.saved_state_json);
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

    return res.json({
      success: true,
      attempt: {
        ...attempt,
        savedState,
        detailedAnswers
      }
    });
  } catch (error) {
    next(error);
  }
}

export function getQuizHistory(req, res, next) {
  try {
    const userId = req.user.id;
    const { status, semester_id } = req.query; // 'completed' | 'paused' | all

    let sql = `
      SELECT qa.id, qa.subject_id, qa.test_title, qa.test_type, qa.status,
             qa.total_questions, qa.correct_count, qa.incorrect_count, qa.skipped_count, qa.unvisited_count,
             qa.score, qa.time_taken_seconds, qa.created_at, qa.completed_at, qa.saved_state_json,
             sub.name as subject_name, sub.semester_id
      FROM quiz_attempts qa
      LEFT JOIN subjects sub ON qa.subject_id = sub.id
      WHERE qa.user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ` AND qa.status = ? `;
      params.push(status);
    }

    if (semester_id) {
      sql += ` AND sub.semester_id = ? `;
      params.push(parseInt(semester_id, 10));
    }

    sql += ` ORDER BY qa.id DESC LIMIT 50`;

    const attempts = db.query(sql, params);

    return res.json({
      success: true,
      history: attempts.map(att => ({
        ...att,
        savedState: att.saved_state_json ? JSON.parse(att.saved_state_json) : null
      }))
    });
  } catch (error) {
    next(error);
  }
}

export function getAnalytics(req, res, next) {
  try {
    const userId = req.user.id;
    const { semester_id } = req.query;

    let testsSql = `
      SELECT qa.id, qa.subject_id, qa.score, qa.total_questions, qa.correct_count,
             qa.incorrect_count, qa.skipped_count, qa.time_taken_seconds, qa.completed_at,
             sub.name as subject_name, sub.semester_id
      FROM quiz_attempts qa
      LEFT JOIN subjects sub ON qa.subject_id = sub.id
      WHERE qa.user_id = ? AND qa.status = 'completed'
    `;
    const testsParams = [userId];

    if (semester_id) {
      testsSql += ` AND sub.semester_id = ? `;
      testsParams.push(parseInt(semester_id, 10));
    }

    testsSql += ` ORDER BY qa.id DESC`;

    // Fetch all completed tests for this user (filtered by semester)
    const completedTests = db.query(testsSql, testsParams);

    // Fetch answers time breakdown
    let answersSql = `
      SELECT 
         COUNT(CASE WHEN ans.status = 'correct' THEN 1 END) as total_correct,
         COUNT(CASE WHEN ans.status = 'incorrect' THEN 1 END) as total_incorrect,
         COUNT(CASE WHEN ans.status = 'skipped' OR ans.status = 'skip' THEN 1 END) as total_skipped,
         COALESCE(SUM(CASE WHEN ans.status = 'correct' THEN ans.time_spent_seconds END), 0) as correct_time,
         COALESCE(SUM(CASE WHEN ans.status = 'incorrect' THEN ans.time_spent_seconds END), 0) as incorrect_time,
         COALESCE(SUM(CASE WHEN ans.status = 'skipped' OR ans.status = 'skip' THEN ans.time_spent_seconds END), 0) as skipped_time
       FROM quiz_answers ans
       JOIN quiz_attempts att ON ans.attempt_id = att.id
       LEFT JOIN subjects sub ON att.subject_id = sub.id
       WHERE att.user_id = ?
    `;
    const answersParams = [userId];

    if (semester_id) {
      answersSql += ` AND sub.semester_id = ? `;
      answersParams.push(parseInt(semester_id, 10));
    }

    const answersStats = db.get(answersSql, answersParams);

    const totalCorrect = answersStats?.total_correct || 0;
    const totalIncorrect = answersStats?.total_incorrect || 0;
    const totalSkipped = answersStats?.total_skipped || 0;
    const totalAnswered = totalCorrect + totalIncorrect + totalSkipped;

    const correctTime = answersStats?.correct_time || 0;
    const incorrectTime = answersStats?.incorrect_time || 0;
    const skippedTime = answersStats?.skipped_time || 0;

    const avgCorrectTime = totalCorrect > 0 ? Math.round(correctTime / totalCorrect) : 0;
    const avgIncorrectTime = totalIncorrect > 0 ? Math.round(incorrectTime / totalIncorrect) : 0;
    const avgSkippedTime = totalSkipped > 0 ? Math.round(skippedTime / totalSkipped) : 0;

    // Calculate Past 7 Days Activity (Mon - Sun / Last 7 Days)
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysMap[d.getDay()];
      past7Days.push({ date: dateStr, day: dayName, count: 0, accuracy: 0, scores: [] });
    }

    completedTests.forEach(test => {
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

    return res.json({
      success: true,
      analytics: {
        completedTestsCount: completedTests.length,
        questionPerformance: [totalCorrect, totalIncorrect, totalSkipped],
        timeWiseBreakdown: [correctTime, incorrectTime, skippedTime],
        questionWiseAverageTime: [avgCorrectTime, avgIncorrectTime, avgSkippedTime],
        totalQuestionsAnswered: totalAnswered,
        recentTests: completedTests.slice(0, 10),
        weeklyActivity: past7Days
      }
    });
  } catch (error) {
    next(error);
  }
}

export function logActiveTime(req, res, next) {
  try {
    const userId = req.user.id;
    const { seconds = 10 } = req.body;

    const addedSeconds = Math.max(0, parseInt(seconds, 10));

    db.run(
      `INSERT INTO user_time_logs (user_id, log_date, total_seconds)
       VALUES (?, DATE('now'), ?)
       ON CONFLICT(user_id, log_date) DO UPDATE SET
         total_seconds = total_seconds + excluded.total_seconds,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, addedSeconds]
    );

    const totalTime = db.get(
      `SELECT COALESCE(SUM(total_seconds), 0) as total_seconds
       FROM user_time_logs
       WHERE user_id = ?`,
      [userId]
    );

    return res.json({
      success: true,
      totalTimeElapsedSeconds: totalTime?.total_seconds || 0
    });
  } catch (error) {
    next(error);
  }
}
