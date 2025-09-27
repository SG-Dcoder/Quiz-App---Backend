const { getDatabase } = require('../config/database');

class Quiz {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(quizData) {
    const db = getDatabase();
    const { title, description } = quizData;

    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO quizzes (title, description) 
        VALUES (?, ?)
      `);
      
      stmt.run([title, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
      
      stmt.finalize();
    });
  }

  static async findById(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM quizzes WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve(new Quiz(row));
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  static async findAll() {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM quizzes ORDER BY created_at DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const quizzes = rows.map(row => new Quiz(row));
            resolve(quizzes);
          }
        }
      );
    });
  }

  static async delete(id) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM quizzes WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async update(updateData) {
    const db = getDatabase();
    const { title, description } = updateData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE quizzes 
         SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [title, description, this.id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async getQuestions(includeAnswers = false) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*, 
               json_group_array(
                 json_object(
                   'id', o.id,
                   'option_text', o.option_text
                   ${includeAnswers ? ", 'is_correct', o.is_correct" : ""}
                 )
               ) as options
        FROM questions q
        LEFT JOIN options o ON q.id = o.question_id
        WHERE q.quiz_id = ?
        GROUP BY q.id
        ORDER BY q.created_at ASC
      `;

      db.all(query, [this.id], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const questions = rows.map(row => ({
            id: row.id,
            quiz_id: row.quiz_id,
            question_text: row.question_text,
            question_type: row.question_type,
            created_at: row.created_at,
            options: JSON.parse(row.options).filter(opt => opt.id !== null)
          }));
          resolve(questions);
        }
      });
    });
  }

  async getQuestionCount() {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT COUNT(*) as count FROM questions WHERE quiz_id = ?',
        [this.id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.count);
          }
        }
      );
    });
  }
}

module.exports = Quiz;