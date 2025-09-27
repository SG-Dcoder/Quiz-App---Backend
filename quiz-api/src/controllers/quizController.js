const quizService = require('../services/quizService');
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  successResponse, 
  createdResponse, 
  notFoundResponse,
  noContentResponse 
} = require('../utils/responseHelper');

// Create a new quiz
const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body);
  
  createdResponse(res, quiz, 'Quiz created successfully');
});

// Get all quizzes (bonus feature)
const getAllQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await quizService.getAllQuizzes();
  
  successResponse(res, quizzes, 'Quizzes fetched successfully');
});

// Get a specific quiz by ID
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await quizService.getQuizById(parseInt(req.params.id));
  
  successResponse(res, quiz, 'Quiz fetched successfully');
});

// Delete a quiz
const deleteQuiz = asyncHandler(async (req, res) => {
  await quizService.deleteQuiz(parseInt(req.params.id));
  
  noContentResponse(res, 'Quiz deleted successfully');
});

// Get quiz questions for taking the quiz (without correct answers)
const getQuizQuestions = asyncHandler(async (req, res) => {
  const questions = await quizService.getQuizQuestions(
    parseInt(req.params.quizId), 
    false // Don't include correct answers
  );
  
  successResponse(res, questions, 'Quiz questions fetched successfully');
});

// Submit quiz answers and get score
const submitQuizAnswers = asyncHandler(async (req, res) => {
  const result = await quizService.submitQuizAnswers(
    parseInt(req.params.quizId),
    req.body.answers
  );
  
  successResponse(res, result, 'Quiz submitted successfully');
});

// Add a question to a quiz
const addQuestionToQuiz = asyncHandler(async (req, res) => {
  const question = await quizService.addQuestionToQuiz(
    parseInt(req.params.quizId),
    req.body
  );
  
  createdResponse(res, question, 'Question added to quiz successfully');
});

// Get quiz statistics (bonus feature)
const getQuizStatistics = asyncHandler(async (req, res) => {
  const stats = await quizService.getQuizStatistics(parseInt(req.params.quizId));
  
  successResponse(res, stats, 'Quiz statistics fetched successfully');
});

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz,
  getQuizQuestions,
  submitQuizAnswers,
  addQuestionToQuiz,
  getQuizStatistics
};