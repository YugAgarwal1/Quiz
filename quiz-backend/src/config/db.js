import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || './data/quizbird.sqlite';
const resolvedDbPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(__dirname, '../../', dbPath);

// Ensure directory exists
const dbDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance;

try {
  dbInstance = new DatabaseSync(resolvedDbPath);
  
  // Enable foreign keys and Write-Ahead Logging (WAL) for robust persistence and concurrency
  dbInstance.exec('PRAGMA foreign_keys = ON;');
  dbInstance.exec('PRAGMA journal_mode = WAL;');
  dbInstance.exec('PRAGMA synchronous = NORMAL;');
  dbInstance.exec('PRAGMA busy_timeout = 5000;');
  
  console.log(`[Database] SQLite connected successfully (WAL mode enabled) at: ${resolvedDbPath}`);
} catch (error) {
  console.error('[Database] Connection failed:', error);
  process.exit(1);
}

// Clean helper methods around DatabaseSync
export const db = {
  raw: dbInstance,
  
  exec(sql) {
    return dbInstance.exec(sql);
  },
  
  query(sql, params = []) {
    const stmt = dbInstance.prepare(sql);
    return stmt.all(...params);
  },
  
  get(sql, params = []) {
    const stmt = dbInstance.prepare(sql);
    return stmt.get(...params);
  },
  
  run(sql, params = []) {
    const stmt = dbInstance.prepare(sql);
    return stmt.run(...params);
  }
};

export default db;
