const { getDatabase } = require('../config/database');

class Question {
  constructor(data) {
    this.id = data.id;
    this.quiz_id = data.quiz_id;
    this.question_text = data.question_text;
    this.question_type = data.question_type;
    this.created_at = data.created_at;
    this.options = data.options || [];
  }

  static async create(questionData) {
    const db = getDatabase();
    const { quiz_id, question_text, question_type, options } = questionData;

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        const questionStmt = db.prepare(`
          INSERT INTO questions (quiz_id, question_text, question_type)
          VALUES (?, ?, ?)
        `);

        questionStmt.run([quiz_id, question_text, question_type], function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          const questionId = this.lastID;

          if (options && options.length > 0) {
            const optionStmt = db.prepare(`
              INSERT INTO options (question_id, option_text, is_correct)
              VALUES (?, ?, ?)
            `);

            let completed = 0;
            let hasError = false;

            options.forEach(option => {
              optionStmt.run(
                [questionId, option.option_text, option.is_correct || false],
                err => {
                  if (err && !hasError) {
                    hasError = true;
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }

                  completed++;
                  if (completed === options.length && !hasError) {
                    db.run('COMMIT');
                    resolve(questionId);
                  }
                }
              );
            });

            optionStmt.finalize();
          } else {
            db.run('COMMIT');
            resolve(questionId);
          }
        });

        questionStmt.finalize();
      });
    });
  }

  static async findById(id, includeOptions = true) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      if (!includeOptions) {
        db.get(
          'SELECT * FROM questions WHERE id = ?',
          [id],
          (err, row) => {
            if (err) return reject(err);
            if (!row) return resolve(null);
            resolve(new Question(row));
          }
        );
      } else {
        const query = `
          SELECT q.*,
                 json_group_array(
                   json_object(
                     'id', o.id,
                     'option_text', o.option_text,
                     'is_correct', o.is_correct
                   )
                 ) as options
          FROM questions q
          LEFT JOIN options o ON q.id = o.question_id
          WHERE q.id = ?
          GROUP BY q.id
        `;

        db.get(query, [id], (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);

          const opts = JSON.parse(row.options).filter(opt => opt.id !== null);
          const mapped = opts.map(opt => ({
            id: opt.id,
            option_text: opt.option_text,
            is_correct: !!opt.is_correct
          }));

          resolve(new Question({ ...row, options: mapped }));
        });
      }
    });
  }

  static async findByQuizId(quizId, includeAnswers = false) {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      const query = `
        SELECT q.*,
               json_group_array(
                 json_object(
                   'id', o.id,
                   'option_text', o.option_text
                   ${includeAnswers ? ", 'is_correct', o.is_correct" : ''}
                 )
               ) as options
        FROM questions q
        LEFT JOIN options o ON q.id = o.question_id
        WHERE q.quiz_id = ?
        GROUP BY q.id
        ORDER BY q.created_at ASC
      `;

      db.all(query, [quizId], (err, rows) => {
        if (err) return reject(err);

        const questions = rows.map(row => {
          const opts = JSON.parse(row.options).filter(opt => opt.id !== null);
          const mapped = opts.map(opt => ({
            id: opt.id,
            option_text: opt.option_text,
            ...(includeAnswers ? { is_correct: !!opt.is_correct } : {})
          }));
          return new Question({ ...row, options: mapped });
        });

        resolve(questions);
      });
    });
  }

  static async delete(id) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM questions WHERE id = ?',
        [id],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  async getCorrectOptions() {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM options WHERE question_id = ? AND is_correct = 1',
        [this.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async checkAnswer(questionId, selectedOptionIds) {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT id FROM options WHERE question_id = ? AND is_correct = 1',
        [questionId],
        (err, correctOptions) => {
          if (err) return reject(err);

          const correctIds = correctOptions.map(o => o.id);
          const selected = Array.isArray(selectedOptionIds)
            ? selectedOptionIds
            : [selectedOptionIds];

          const isCorrect =
            correctIds.length === selected.length &&
            correctIds.every(id => selected.includes(id));

          resolve(isCorrect);
        }
      );
    });
  }
}

module.exports = Question;
