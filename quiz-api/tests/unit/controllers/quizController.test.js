const quizController = require('../../../src/controllers/quizController');
const quizService = require('../../../src/services/quizService');
const { AppError } = require('../../../src/middleware/errorHandler');

// Mock the service
jest.mock('../../../src/services/quizService');

describe('QuizController Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create quiz and return 201 status', async () => {
      const quizData = { title: 'Test Quiz', description: 'Test Description' };
      const createdQuiz = { id: 1, ...quizData };

      req.body = quizData;
      quizService.createQuiz.mockResolvedValue(createdQuiz);

      await quizController.createQuiz(req, res, next);

      expect(quizService.createQuiz).toHaveBeenCalledWith(quizData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz created successfully',
          data: createdQuiz
        })
      );
    });

    it('should handle service errors', async () => {
      const error = new AppError('Creation failed', 500);
      req.body = { title: 'Test Quiz' };
      quizService.createQuiz.mockRejectedValue(error);

      try {
        await quizController.createQuiz(req, res, next);
      } catch (err) {
        expect(next).toHaveBeenCalledWith(error);
      }
    });
  });

  describe('getAllQuizzes', () => {
    it('should return all quizzes with 200 status', async () => {
      const mockQuizzes = [
        { id: 1, title: 'Quiz 1', question_count: 5 },
        { id: 2, title: 'Quiz 2', question_count: 3 }
      ];

      quizService.getAllQuizzes.mockResolvedValue(mockQuizzes);

      await quizController.getAllQuizzes(req, res, next);

      expect(quizService.getAllQuizzes).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quizzes fetched successfully',
          data: mockQuizzes
        })
      );
    });
  });

  describe('getQuizById', () => {
    it('should return quiz by ID with 200 status', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz', question_count: 5 };
      req.params.id = '1';

      quizService.getQuizById.mockResolvedValue(mockQuiz);

      await quizController.getQuizById(req, res, next);

      expect(quizService.getQuizById).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz fetched successfully',
          data: mockQuiz
        })
      );
    });

    it('should handle quiz not found error', async () => {
      const error = new AppError('Quiz not found', 404);
      req.params.id = '999';

      quizService.getQuizById.mockRejectedValue(error);

      try {
        await quizController.getQuizById(req, res, next);
      } catch (err) {
        expect(next).toHaveBeenCalledWith(error);
      }
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz and return 200 status', async () => {
      req.params.id = '1';
      quizService.deleteQuiz.mockResolvedValue(true);

      await quizController.deleteQuiz(req, res, next);

      expect(quizService.deleteQuiz).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz deleted successfully'
        })
      );
    });
  });

  describe('getQuizQuestions', () => {
    it('should return quiz questions without answers', async () => {
      const mockQuestions = [
        { id: 1, question_text: 'Question 1', options: [] },
        { id: 2, question_text: 'Question 2', options: [] }
      ];

      req.params.quizId = '1';
      quizService.getQuizQuestions.mockResolvedValue(mockQuestions);

      await quizController.getQuizQuestions(req, res, next);

      expect(quizService.getQuizQuestions).toHaveBeenCalledWith(1, false);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz questions fetched successfully',
          data: mockQuestions
        })
      );
    });
  });

  describe('submitQuizAnswers', () => {
    it('should submit answers and return score', async () => {
      const answers = [
        { question_id: 1, selected_option_ids: [1] },
        { question_id: 2, text_answer: 'Answer text' }
      ];

      const mockResult = {
        score: 2,
        total: 2,
        percentage: 100,
        results: []
      };

      req.params.quizId = '1';
      req.body.answers = answers;
      quizService.submitQuizAnswers.mockResolvedValue(mockResult);

      await quizController.submitQuizAnswers(req, res, next);

      expect(quizService.submitQuizAnswers).toHaveBeenCalledWith(1, answers);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz submitted successfully',
          data: mockResult
        })
      );
    });

    it('should handle invalid answers error', async () => {
      const error = new AppError('Invalid question ID', 400);
      req.params.quizId = '1';
      req.body.answers = [];

      quizService.submitQuizAnswers.mockRejectedValue(error);

      try {
        await quizController.submitQuizAnswers(req, res, next);
      } catch (err) {
        expect(next).toHaveBeenCalledWith(error);
      }
    });
  });

  describe('addQuestionToQuiz', () => {
    it('should add question to quiz and return 201 status', async () => {
      const questionData = {
        question_text: 'Test Question',
        question_type: 'single_choice',
        options: [
          { option_text: 'Option 1', is_correct: true },
          { option_text: 'Option 2', is_correct: false }
        ]
      };

      const createdQuestion = { id: 1, ...questionData, quiz_id: 1 };

      req.params.quizId = '1';
      req.body = questionData;
      quizService.addQuestionToQuiz.mockResolvedValue(createdQuestion);

      await quizController.addQuestionToQuiz(req, res, next);

      expect(quizService.addQuestionToQuiz).toHaveBeenCalledWith(1, questionData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Question added to quiz successfully',
          data: createdQuestion
        })
      );
    });
  });

  describe('getQuizStatistics', () => {
    it('should return quiz statistics', async () => {
      const mockStats = {
        total_submissions: 10,
        average_score: 75.5,
        highest_score: 100,
        lowest_score: 50
      };

      req.params.quizId = '1';
      quizService.getQuizStatistics.mockResolvedValue(mockStats);

      await quizController.getQuizStatistics(req, res, next);

      expect(quizService.getQuizStatistics).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Quiz statistics fetched successfully',
          data: mockStats
        })
      );
    });
  });
});