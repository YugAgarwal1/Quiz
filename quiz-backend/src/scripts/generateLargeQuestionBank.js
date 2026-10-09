import db from '../config/db.js';

export function generateLargeQuestionBank() {
  console.log('[Large Question Bank] Generating comprehensive questions for Sem VII, Sem VIII, Sem IX...');

  // Get all subjects in Sem VII, VIII, IX
  const subjects = db.query(`
    SELECT sub.id, sub.name, sub.semester_id, sem.name as sem_name
    FROM subjects sub
    JOIN semesters sem ON sub.semester_id = sem.id
    WHERE sem.code IN ('SEM_VII', 'SEM_VIII', 'SEM_IX')
  `);

  const insertQStmt = db.raw.prepare(`
    INSERT INTO questions (chapter_id, question_text, difficulty, solution_explanation, marks)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertOptStmt = db.raw.prepare(`
    INSERT INTO question_options (question_id, option_index, option_text, is_correct)
    VALUES (?, ?, ?, ?)
  `);

  db.exec('BEGIN TRANSACTION;');

  try {
    let totalAdded = 0;

    for (const sub of subjects) {
      const chapters = db.query('SELECT * FROM chapters WHERE subject_id = ? ORDER BY chapter_number ASC', [sub.id]);

      for (const ch of chapters) {
        // We will generate 35 Easy, 35 Medium, 35 Hard questions per chapter
        const difficulties = ['Easy', 'Medium', 'Hard'];

        for (const diff of difficulties) {
          // Check how many questions already exist
          const existingCount = db.get(
            'SELECT COUNT(*) as c FROM questions WHERE chapter_id = ? AND difficulty = ? COLLATE NOCASE',
            [ch.id, diff]
          )?.c || 0;

          const needed = Math.max(0, 40 - existingCount);

          for (let i = 1; i <= needed; i++) {
            const qNum = existingCount + i;
            let questionText = '';
            let options = [];
            let answer = '';
            let solution = '';

            if (sub.name.includes('Cloud')) {
              questionText = `[${ch.chapter_name}] ${diff} Q${qNum}: What is the core principle of ${ch.chapter_name} regarding resource allocation, elasticity, and fault isolation in multi-tenant environments?`;
              options = [
                `Decoupled stateless service orchestration with automated horizontal scaling and health checking`,
                `Single point of failure monolithic execution without redundant backups`,
                `Manual server rebooting upon CPU threshold breaches above 95%`,
                `Static memory pre-allocation restricting dynamically provisioned container instances`
              ];
              answer = options[0];
              solution = `In ${ch.chapter_name}, elasticity and fault isolation rely on decoupled stateless orchestration and horizontal autoscaling.`;
            } else if (sub.name.includes('Distributed')) {
              questionText = `[${ch.chapter_name}] ${diff} Q${qNum}: In distributed consensus and data synchronization for ${ch.chapter_name}, how are concurrent race conditions resolved safely?`;
              options = [
                `Utilizing distributed locks, vector clocks, and quorum-based consensus protocols (e.g. Raft/Paxos)`,
                `Ignoring network partition events and assuming zero latency across all geographic regions`,
                `Overwriting existing records without validating version timestamps or revision IDs`,
                `Routing all write requests through unauthenticated broadcast UDP packets`
              ];
              answer = options[0];
              solution = `Distributed synchronization requires monotonic vector clocks or quorum consensus to resolve split-brain conflicts safely.`;
            } else if (sub.name.includes('AI') || sub.name.includes('Machine')) {
              questionText = `[${ch.chapter_name}] ${diff} Q${qNum}: In training and optimization within ${ch.chapter_name}, which strategy effectively minimizes generalization error and prevents overfitting?`;
              options = [
                `Applying cross-validation, weight decay regularization (L2), dropout layers, and early stopping`,
                `Increasing model parameter capacity indefinitely until training loss hits zero exactly`,
                `Training strictly on 100% of the data without setting aside validation or test splits`,
                `Fixing all learning rates to 10.0 to accelerate gradient descent convergence`
              ];
              answer = options[0];
              solution = `Regularization, dropout, and validation monitoring ensure models generalize beyond training set noise.`;
            } else if (sub.name.includes('Security') || sub.name.includes('Cyber')) {
              questionText = `[${ch.chapter_name}] ${diff} Q${qNum}: Regarding threat mitigation and cryptographic integrity in ${ch.chapter_name}, which architectural measure provides non-repudiation and access security?`;
              options = [
                `Enforcing asymmetric digital signatures, multi-factor authentication, and strict least-privilege RBAC`,
                `Disabling TLS certificate verification in production to reduce handshake latency overhead`,
                `Hardcoding administrative API keys directly into public client-side JavaScript bundles`,
                `Storing database session tokens in plaintext URL query parameters`
              ];
              answer = options[0];
              solution = `Cryptographic digital signatures and least-privilege RBAC enforce non-repudiation and prevent privilege escalation.`;
            } else {
              // System Design & others
              questionText = `[${ch.chapter_name}] ${diff} Q${qNum}: When architecting high-throughput scalable systems for ${ch.chapter_name}, how is consistent low-latency maintained at scale?`;
              options = [
                `Implementing distributed caching (Redis), database sharding, asynchronous event queues, and CDN edge caching`,
                `Executing all computationally heavy database reporting queries synchronously on the primary OLTP master`,
                `Disabling horizontal load balancing and running the entire application on a single large compute core`,
                `Polling backend servers every 50 milliseconds from all connected mobile clients synchronously`
              ];
              answer = options[0];
              solution = `Scalability and low latency are achieved through caching tiers, sharding, and asynchronous event-driven queues.`;
            }

            // Shuffle options slightly
            const shuffledOptions = [...options].sort(() => (Math.random() - 0.5));

            const qRes = insertQStmt.run(
              ch.id,
              questionText,
              diff,
              solution,
              1
            );
            const questionId = Number(qRes.lastInsertRowid);

            shuffledOptions.forEach((optText, optIdx) => {
              const isCorrect = (optText === answer) ? 1 : 0;
              insertOptStmt.run(questionId, optIdx, optText, isCorrect);
            });

            totalAdded++;
          }
        }
      }
    }

    db.exec('COMMIT;');
    console.log(`[Large Question Bank Success] Successfully populated ${totalAdded} high-volume questions across all chapters!`);
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Large Question Bank Error]', err);
    throw err;
  }
}

generateLargeQuestionBank();
