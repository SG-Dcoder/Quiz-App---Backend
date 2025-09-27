const express = require('express');
const router = express.Router();
const quizRoutes = require('./quizRoutes');

// API version prefix
const API_VERSION = '/v1';

// Mount quiz routes
router.use(`${API_VERSION}/quizzes`, quizRoutes);

// API documentation endpoint 
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Quiz API v1',
    version: '1.0.0',
    endpoints: {
      quizzes: {
        'POST /api/v1/quizzes': 'Create a new quiz',
        'GET /api/v1/quizzes': 'Get all quizzes',
        'GET /api/v1/quizzes/:id': 'Get quiz by ID',
        'DELETE /api/v1/quizzes/:id': 'Delete a quiz',
        'GET /api/v1/quizzes/:id/statistics': 'Get quiz statistics'
      },
      questions: {
        'POST /api/v1/quizzes/:id/questions': 'Add question to quiz',
        'GET /api/v1/quizzes/:id/questions': 'Get quiz questions for taking'
      },
      submissions: {
        'POST /api/v1/quizzes/:id/submit': 'Submit quiz answers and get score'
      }
    },
    documentation: 'https://github.com/your-repo/quiz-api#api-documentation'
  });
});

module.exports = router;