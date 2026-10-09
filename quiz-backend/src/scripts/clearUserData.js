import db from '../config/db.js';

console.log('[Cleanup] Clearing all user quiz attempts, answers, and study time logs...');

try {
  db.exec('DELETE FROM quiz_answers;');
  db.exec('DELETE FROM quiz_attempts;');
  db.exec('DELETE FROM user_time_logs;');
  db.exec('VACUUM;');

  const attemptsCount = db.get('SELECT COUNT(*) as count FROM quiz_attempts');
  const answersCount = db.get('SELECT COUNT(*) as count FROM quiz_answers');
  const timeLogsCount = db.get('SELECT COUNT(*) as count FROM user_time_logs');

  console.log(`[Cleanup] Success! Remaining records:`);
  console.log(`  - Quiz Attempts: ${attemptsCount?.count || 0}`);
  console.log(`  - Quiz Answers: ${answersCount?.count || 0}`);
  console.log(`  - Time Logs: ${timeLogsCount?.count || 0}`);
} catch (error) {
  console.error('[Cleanup] Failed:', error);
  process.exit(1);
}
