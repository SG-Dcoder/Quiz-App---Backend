const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : path.join(__dirname, '../../quiz.db');

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        createTables()
          .then(resolve)
          .catch(reject);
      }
    });
  });
};

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create quizzes table
      db.run(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create questions table
      db.run(`
        CREATE TABLE IF NOT EXISTS questions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quiz_id INTEGER NOT NULL,
          question_text TEXT NOT NULL,
          question_type TEXT NOT NULL CHECK(question_type IN ('multiple_choice', 'single_choice', 'text')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quiz_id) REFERENCES quizzes (id) ON DELETE CASCADE
        )
      `);

      // Create options table
      db.run(`
        CREATE TABLE IF NOT EXISTS options (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          question_id INTEGER NOT NULL,
          option_text TEXT NOT NULL,
          is_correct BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (question_id) REFERENCES questions (id) ON DELETE CASCADE
        )
      `);

      // Create quiz_submissions table
      db.run(`
        CREATE TABLE IF NOT EXISTS quiz_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quiz_id INTEGER NOT NULL,
          user_id TEXT,
          score INTEGER NOT NULL,
          total_questions INTEGER NOT NULL,
          submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quiz_id) REFERENCES quizzes (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('Database tables created successfully');
          resolve();
        }
      });
    });
  });
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

const closeDatabase = () => {
  return new Promise((resolve) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase
};