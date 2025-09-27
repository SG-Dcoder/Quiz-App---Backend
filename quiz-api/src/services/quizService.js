const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const { AppError } = require('../middleware/errorHandler');

class QuizService {
  async createQuiz(quizData) {
    try {
      const quizId = await Quiz.create(quizData);
      const quiz = await Quiz.findById(quizId);
      return quiz;
    } catch (error) {
      throw new AppError('Failed to create quiz', 500);
    }
  }

  async getAllQuizzes() {
    try {
      const quizzes = await Quiz.findAll();
      
      // Add question count to each quiz
      const quizzesWithStats = await Promise.all(
        quizzes.map(async (quiz) => {
          const questionCount = await quiz.getQuestionCount();
          return {
            ...quiz,
            question_count: questionCount
          };
        })
      );

      return quizzesWithStats;
    } catch (error) {
      throw new AppError('Failed to fetch quizzes', 500);
    }
  }

  async getQuizById(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      const questionCount = await quiz.getQuestionCount();
      return {
        ...quiz,
        question_count: questionCount
      };
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to fetch quiz', 500);
    }
  }

  async deleteQuiz(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      const deleted = await Quiz.delete(quizId);
      if (!deleted) {
        throw new AppError('Failed to delete quiz', 500);
      }

      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to delete quiz', 500);
    }
  }

  async getQuizQuestions(quizId, includeAnswers = false) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      const questions = await Question.findByQuizId(quizId, includeAnswers);
      return questions;
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to fetch quiz questions', 500);
    }
  }

  async submitQuizAnswers(quizId, answers) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      // Get all questions for this quiz with correct answers
      const questions = await Question.findByQuizId(quizId, true);
      const questionMap = new Map(questions.map(q => [q.id, q]));

      let score = 0;
      const results = [];

      for (const answer of answers) {
        const question = questionMap.get(answer.question_id);
        if (!question) {
          throw new AppError(`Question ${answer.question_id} not found in quiz`, 400);
        }

        let isCorrect = false;

        if (question.question_type === 'text') {
          // For text questions, we'll accept any non-empty answer as correct
          // In a real application, you might want to implement text matching logic
          isCorrect = answer.text_answer && answer.text_answer.trim().length > 0;
        } else {
          // For choice questions, check if selected options match correct ones
          const selectedIds = Array.isArray(answer.selected_option_ids) 
            ? answer.selected_option_ids 
            : [answer.selected_option_ids];

          isCorrect = await Question.checkAnswer(answer.question_id, selectedIds);
        }

        if (isCorrect) {
          score++;
        }

        results.push({
          question_id: answer.question_id,
          question_text: question.question_text,
          is_correct: isCorrect,
          user_answer: answer.selected_option_ids || answer.text_answer
        });
      }

      // Save submission to database (optional)
      // await this.saveSubmission(quizId, score, questions.length);

      return {
        score,
        total: questions.length,
        percentage: Math.round((score / questions.length) * 100),
        results
      };
    } catch (error) {
      if (error.statusCode) {
        throw error;
      }
      throw new AppError('Failed to submit quiz answers', 500);
    }
  }

  async addQuestionToQuiz(quizId, questionData) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      const questionId = await Question.create({
        ...questionData,
        quiz_id: quizId
      });

      const question = await Question.findById(questionId);
      return question;
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to add question to quiz', 500);
    }
  }

  // Optional: Save quiz submission to database
  async saveSubmission(quizId, score, totalQuestions, userId = null) {
    const { getDatabase } = require('../config/database');
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO quiz_submissions (quiz_id, user_id, score, total_questions)
         VALUES (?, ?, ?, ?)`,
        [quizId, userId, score, totalQuestions],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getQuizStatistics(quizId) {
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        throw new AppError('Quiz not found', 404);
      }

      const { getDatabase } = require('../config/database');
      const db = getDatabase();

      return new Promise((resolve, reject) => {
        db.all(
          `SELECT 
             COUNT(*) as total_submissions,
             AVG(score * 1.0 / total_questions * 100) as average_score,
             MAX(score * 1.0 / total_questions * 100) as highest_score,
             MIN(score * 1.0 / total_questions * 100) as lowest_score
           FROM quiz_submissions 
           WHERE quiz_id = ?`,
          [quizId],
          (err, rows) => {
            if (err) {
              reject(new AppError('Failed to fetch quiz statistics', 500));
            } else {
              resolve(rows[0] || {
                total_submissions: 0,
                average_score: 0,
                highest_score: 0,
                lowest_score: 0
              });
            }
          }
        );
      });
    } catch (error) {
      if (error.statusCode === 404) {
        throw error;
      }
      throw new AppError('Failed to fetch quiz statistics', 500);
    }
  }
}

module.exports = new QuizService();