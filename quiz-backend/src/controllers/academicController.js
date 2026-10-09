import db from '../config/db.js';

export function getSemesters(req, res, next) {
  try {
    const semesters = db.query(
      `SELECT s.id, s.code, s.name, s.order_num,
              COUNT(DISTINCT sub.id) as subjects_count
       FROM semesters s
       LEFT JOIN subjects sub ON sub.semester_id = s.id
       GROUP BY s.id
       ORDER BY s.order_num ASC`
    );

    return res.json({
      success: true,
      semesters
    });
  } catch (error) {
    next(error);
  }
}

export function getSubjects(req, res, next) {
  try {
    const { semester_id, semester_code } = req.query;

    let sql = `
      SELECT sub.id, sub.name, sub.code, sub.description, sub.icon, sub.semester_id,
             sem.name as semester_name, sem.code as semester_code,
             COUNT(DISTINCT ch.id) as chapters_count,
             COUNT(DISTINCT q.id) as total_questions
      FROM subjects sub
      LEFT JOIN semesters sem ON sub.semester_id = sem.id
      LEFT JOIN chapters ch ON ch.subject_id = sub.id
      LEFT JOIN questions q ON q.chapter_id = ch.id
    `;
    const params = [];

    if (semester_id) {
      sql += ` WHERE sub.semester_id = ? `;
      params.push(semester_id);
    } else if (semester_code) {
      sql += ` WHERE sem.code = ? OR sem.name = ? `;
      params.push(semester_code, semester_code);
    }

    sql += ` GROUP BY sub.id ORDER BY sub.id ASC`;

    const subjects = db.query(sql, params);

    return res.json({
      success: true,
      subjects
    });
  } catch (error) {
    next(error);
  }
}

export function getSubjectSyllabus(req, res, next) {
  try {
    const { subjectIdentifier } = req.params; // Can be subject ID or subject Name (e.g. "Adv Java" or "1")

    const subject = db.get(
      `SELECT id, name, code, description, semester_id 
       FROM subjects 
       WHERE id = ? OR name = ? OR code = ?`,
      [subjectIdentifier, subjectIdentifier, subjectIdentifier]
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject '${subjectIdentifier}' not found.`
      });
    }

    const chapters = db.query(
      `SELECT ch.id, ch.chapter_number, ch.chapter_name, ch.chapter_description,
              COUNT(DISTINCT q.id) as question_count
       FROM chapters ch
       LEFT JOIN questions q ON q.chapter_id = ch.id
       WHERE ch.subject_id = ?
       GROUP BY ch.id
       ORDER BY ch.chapter_number ASC`,
      [subject.id]
    );

    return res.json({
      success: true,
      subject,
      chapters: chapters.map(ch => ({
        ChapterNumber: ch.chapter_number,
        ChapterName: ch.chapter_name,
        ChapterDescription: ch.chapter_description,
        id: ch.id,
        questionCount: ch.question_count
      }))
    });
  } catch (error) {
    next(error);
  }
}
