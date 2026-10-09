import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { initializeDatabase } from './initDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  console.log('[Seed] Starting database migration from frontend JSON files...');
  
  initializeDatabase();

  // 1. Seed Semesters
  const defaultSemesters = [
    { code: 'SEM_VI', name: 'Sem VI', order_num: 1 },
    { code: 'SEM_VII', name: 'Sem VII', order_num: 2 },
    { code: 'SEM_VIII', name: 'Sem VIII', order_num: 3 },
    { code: 'SEM_IX', name: 'Sem IX', order_num: 4 }
  ];

  const insertSemStmt = db.raw.prepare(`
    INSERT OR IGNORE INTO semesters (code, name, order_num) 
    VALUES (?, ?, ?)
  `);

  for (const sem of defaultSemesters) {
    insertSemStmt.run(sem.code, sem.name, sem.order_num);
  }
  console.log('[Seed] Semesters seeded.');

  // Get default semester ID (Sem VI or first)
  const defaultSem = db.get('SELECT id FROM semesters ORDER BY order_num ASC LIMIT 1');
  const defaultSemId = defaultSem ? defaultSem.id : null;

  // 2. Seed Default Admin and Student Users
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@quizbird.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123456';
  const adminName = process.env.ADMIN_DEFAULT_NAME || 'Quiz Administrator';

  const salt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash(adminPassword, salt);
  const studentHashedPassword = await bcrypt.hash('Student@123456', salt);

  const insertUserStmt = db.raw.prepare(`
    INSERT OR IGNORE INTO users (name, email, password_hash, role, semester_id, college)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertUserStmt.run(adminName, adminEmail, adminHashedPassword, 'admin', defaultSemId, 'Studylink Admin');
  insertUserStmt.run('Yug Agarwal', 'student@quizbird.com', studentHashedPassword, 'student', defaultSemId, 'Studylink');
  console.log(`[Seed] Admin user created (${adminEmail}) and Student user created (student@quizbird.com)`);

  // 3. Seed Access Codes
  const insertCodeStmt = db.raw.prepare(`
    INSERT OR IGNORE INTO access_codes (code, description, max_uses, used_count)
    VALUES (?, ?, ?, ?)
  `);
  insertCodeStmt.run('BIRD2026', 'Full Access Pass to All Semesters', 500, 0);
  insertCodeStmt.run('STUDYLINK', 'Studylink Student Discount Pass', 1000, 0);

  // 4. Read Frontend ChapterData.json
  const chapterDataPath = path.resolve(__dirname, '../../../quiz-frontend/src/json/ChapterData.json');
  const tempQuestionsPath = path.resolve(__dirname, '../../../quiz-frontend/src/json/temp_questions.json');

  if (!fs.existsSync(chapterDataPath) || !fs.existsSync(tempQuestionsPath)) {
    console.warn('[Seed] Warning: JSON files not found in frontend path:', { chapterDataPath, tempQuestionsPath });
    return;
  }

  const chapterDataRaw = fs.readFileSync(chapterDataPath, 'utf8');
  const chapterData = JSON.parse(chapterDataRaw);

  const tempQuestionsRaw = fs.readFileSync(tempQuestionsPath, 'utf8');
  const tempQuestions = JSON.parse(tempQuestionsRaw);

  // Map to hold Subject Name/ID -> SQL subject_id & ChapterNumber -> SQL chapter_id
  const subjectMap = new Map(); // key: subject name or old subjectId -> sqlSubjectId
  const chapterMap = new Map(); // key: `${sqlSubjectId}_${chapterNumber}` -> sqlChapterId

  const insertSubjectStmt = db.raw.prepare(`
    INSERT INTO subjects (semester_id, name, code, description, icon)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertChapterStmt = db.raw.prepare(`
    INSERT INTO chapters (subject_id, chapter_number, chapter_name, chapter_description)
    VALUES (?, ?, ?, ?)
  `);

  // Clean existing academic and questions data before reseeding to avoid duplicates
  db.exec('DELETE FROM question_options;');
  db.exec('DELETE FROM questions;');
  db.exec('DELETE FROM chapters;');
  db.exec('DELETE FROM subjects;');

  console.log('[Seed] Importing Subjects and Chapters...');
  
  for (const item of chapterData) {
    const subjectName = item.Subject;
    const oldSubjectId = item.SubjectID;
    
    const subjectResult = insertSubjectStmt.run(
      defaultSemId,
      subjectName,
      subjectName.toUpperCase().replace(/\s+/g, '_'),
      `${subjectName} comprehensive curriculum and quiz bank`,
      'book'
    );
    const sqlSubjectId = Number(subjectResult.lastInsertRowid);
    
    subjectMap.set(subjectName, sqlSubjectId);
    if (oldSubjectId) {
      subjectMap.set(String(oldSubjectId), sqlSubjectId);
    }

    if (Array.isArray(item.Chapters)) {
      for (const chap of item.Chapters) {
        const chapResult = insertChapterStmt.run(
          sqlSubjectId,
          chap.ChapterNumber,
          chap.ChapterName,
          chap.ChapterDescription || ''
        );
        const sqlChapterId = Number(chapResult.lastInsertRowid);
        chapterMap.set(`${sqlSubjectId}_${chap.ChapterNumber}`, sqlChapterId);
      }
    }
  }

  console.log(`[Seed] Imported ${chapterData.length} Subjects.`);

  // 5. Import Questions and Options from temp_questions.json
  console.log('[Seed] Importing Questions and Options...');

  const insertQuestionStmt = db.raw.prepare(`
    INSERT INTO questions (chapter_id, question_text, difficulty, solution_explanation, marks)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertOptionStmt = db.raw.prepare(`
    INSERT INTO question_options (question_id, option_index, option_text, is_correct)
    VALUES (?, ?, ?, ?)
  `);

  let totalQuestionsImported = 0;
  let totalOptionsImported = 0;

  // Execute in a single batch/transaction
  db.exec('BEGIN TRANSACTION;');

  try {
    for (const subItem of tempQuestions) {
      const subjectName = subItem.Subject;
      const oldSubjectId = subItem.SubjectID;
      
      const sqlSubjectId = subjectMap.get(subjectName) || subjectMap.get(String(oldSubjectId));
      if (!sqlSubjectId) {
        continue;
      }

      if (Array.isArray(subItem.Chapters)) {
        for (const chapItem of subItem.Chapters) {
          const chapterNumber = chapItem.ChapterNumber;
          const sqlChapterId = chapterMap.get(`${sqlSubjectId}_${chapterNumber}`);

          if (!sqlChapterId) {
            continue;
          }

          if (Array.isArray(chapItem.Difficulty)) {
            for (const diffItem of chapItem.Difficulty) {
              const level = diffItem.Level || 'Easy';
              const questionsList = diffItem.Questions || [];

              for (const q of questionsList) {
                const qText = q.question;
                const difficulty = q.difficulty || level;
                const solution = q.solution || '';
                const answerText = q.answer;
                const options = q.options || [];

                if (!qText || options.length === 0) continue;

                const qResult = insertQuestionStmt.run(
                  sqlChapterId,
                  qText,
                  difficulty,
                  solution,
                  1
                );
                const sqlQuestionId = Number(qResult.lastInsertRowid);
                totalQuestionsImported++;

                options.forEach((optText, idx) => {
                  const isCorrect = (String(optText).trim() === String(answerText).trim()) ? 1 : 0;
                  insertOptionStmt.run(
                    sqlQuestionId,
                    idx,
                    optText,
                    isCorrect
                  );
                  totalOptionsImported++;
                });
              }
            }
          }
        }
      }
    }

    db.exec('COMMIT;');
    console.log(`[Seed] Migration successful! Total questions imported: ${totalQuestionsImported}, Total options imported: ${totalOptionsImported}`);

    // Seed Subjects & Questions for other semesters (Sem VII, VIII, IX)
    const { seedOtherSemesters } = await import('./seedOtherSemesters.js');
    seedOtherSemesters();
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Seed] Error during questions migration:', err);
    throw err;
  }
}

// If run directly via CLI
if (process.argv[1] && process.argv[1].endsWith('seedFromFrontend.js')) {
  seedDatabase().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
