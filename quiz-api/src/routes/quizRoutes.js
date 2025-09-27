const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const {
  validateCreateQuiz,
  validateCreateQuestion,
  validateQuizSubmission,
  validateGetQuizQuestions,
  validateId
} = require('../middleware/validation');

// Quiz routes
router.post('/', validateCreateQuiz, quizController.createQuiz);
router.get('/', quizController.getAllQuizzes);
router.get('/:id', validateId, quizController.getQuizById);
router.delete('/:id', validateId, quizController.deleteQuiz);

// Quiz statistics 
router.get('/:quizId/statistics', validateGetQuizQuestions, quizController.getQuizStatistics);

// Question routes
router.post('/:quizId/questions', validateCreateQuestion, quizController.addQuestionToQuiz);
router.get('/:quizId/questions', validateGetQuizQuestions, quizController.getQuizQuestions);

// Quiz submission route
router.post('/:quizId/submit', validateQuizSubmission, quizController.submitQuizAnswers);

module.exports = router;