const quizService = require('../../../src/services/quizService');
const Quiz = require('../../../src/models/Quiz');
const Question = require('../../../src/models/Question');
const { AppError } = require('../../../src/middleware/errorHandler');

// Mock the models
jest.mock('../../../src/models/Quiz');
jest.mock('../../../src/models/Question');

describe('QuizService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createQuiz', () => {
    it('should create a quiz successfully', async () => {
      const quizData = {
        title: 'Test Quiz',
        description: 'Test Description'
      };

      const mockQuiz = { id: 1, ...quizData };
      Quiz.create.mockResolvedValue(1);
      Quiz.findById.mockResolvedValue(mockQuiz);

      const result = await quizService.createQuiz(quizData);

      expect(Quiz.create).toHaveBeenCalledWith(quizData);
      expect(Quiz.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockQuiz);
    });

    it('should throw AppError when creation fails', async () => {
      const quizData = { title: 'Test Quiz' };
      Quiz.create.mockRejectedValue(new Error('Database error'));

      await expect(quizService.createQuiz(quizData))
        .rejects.toThrow(AppError);
    });
  });

  describe('getAllQuizzes', () => {
    it('should return all quizzes with question counts', async () => {
      const mockQuizzes = [
        { id: 1, title: 'Quiz 1', getQuestionCount: jest.fn().mockResolvedValue(5) },
        { id: 2, title: 'Quiz 2', getQuestionCount: jest.fn().mockResolvedValue(3) }
      ];

      Quiz.findAll.mockResolvedValue(mockQuizzes);

      const result = await quizService.getAllQuizzes();

      expect(Quiz.findAll).toHaveBeenCalled();
      expect(result).toMatchObject([
        { id: 1, title: 'Quiz 1', question_count: 5 },
        { id: 2, title: 'Quiz 2', question_count: 3 }
      ]);
    });

    it('should throw AppError when fetch fails', async () => {
      Quiz.findAll.mockRejectedValue(new Error('Database error'));

      await expect(quizService.getAllQuizzes())
        .rejects.toThrow(AppError);
    });
  });

  describe('getQuizById', () => {
    it('should return quiz by ID with question count', async () => {
      const mockQuiz = { 
        id: 1, 
        title: 'Test Quiz',
        getQuestionCount: jest.fn().mockResolvedValue(5)
      };

      Quiz.findById.mockResolvedValue(mockQuiz);

      const result = await quizService.getQuizById(1);

      expect(Quiz.findById).toHaveBeenCalledWith(1);
      expect(result).toMatchObject({
        id: 1,
        title: 'Test Quiz',
        question_count: 5
      });
    });

    it('should throw 404 AppError when quiz not found', async () => {
      Quiz.findById.mockResolvedValue(null);

      await expect(quizService.getQuizById(1))
        .rejects.toThrow(new AppError('Quiz not found', 404));
    });
  });

  describe('deleteQuiz', () => {
    it('should delete quiz successfully', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      Quiz.findById.mockResolvedValue(mockQuiz);
      Quiz.delete.mockResolvedValue(true);

      const result = await quizService.deleteQuiz(1);

      expect(Quiz.findById).toHaveBeenCalledWith(1);
      expect(Quiz.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw 404 AppError when quiz not found', async () => {
      Quiz.findById.mockResolvedValue(null);

      await expect(quizService.deleteQuiz(1))
        .rejects.toThrow(new AppError('Quiz not found', 404));
    });
  });

  describe('getQuizQuestions', () => {
    it('should return quiz questions without answers', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const mockQuestions = [
        { id: 1, question_text: 'Question 1', options: [] },
        { id: 2, question_text: 'Question 2', options: [] }
      ];

      Quiz.findById.mockResolvedValue(mockQuiz);
      Question.findByQuizId.mockResolvedValue(mockQuestions);

      const result = await quizService.getQuizQuestions(1, false);

      expect(Quiz.findById).toHaveBeenCalledWith(1);
      expect(Question.findByQuizId).toHaveBeenCalledWith(1, false);
      expect(result).toEqual(mockQuestions);
    });

    it('should throw 404 AppError when quiz not found', async () => {
      Quiz.findById.mockResolvedValue(null);

      await expect(quizService.getQuizQuestions(1))
        .rejects.toThrow(new AppError('Quiz not found', 404));
    });
  });

  describe('submitQuizAnswers', () => {
    it('should calculate score correctly for correct answers', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const mockQuestions = [
        { 
          id: 1, 
          question_text: 'Question 1', 
          question_type: 'single_choice',
          options: [{ id: 1, is_correct: true }]
        },
        {
          id: 2,
          question_text: 'Question 2',
          question_type: 'text',
          options: []
        }
      ];

      const answers = [
        { question_id: 1, selected_option_ids: [1] },
        { question_id: 2, text_answer: 'Some answer' }
      ];

      Quiz.findById.mockResolvedValue(mockQuiz);
      Question.findByQuizId.mockResolvedValue(mockQuestions);
      Question.checkAnswer.mockResolvedValue(true);

      const result = await quizService.submitQuizAnswers(1, answers);

      expect(result).toEqual({
        score: 2,
        total: 2,
        percentage: 100,
        results: expect.arrayContaining([
          expect.objectContaining({
            question_id: 1,
            is_correct: true
          }),
          expect.objectContaining({
            question_id: 2,
            is_correct: true
          })
        ])
      });
    });

    it('should throw 404 AppError when quiz not found', async () => {
      Quiz.findById.mockResolvedValue(null);

      await expect(quizService.submitQuizAnswers(1, []))
        .rejects.toThrow(new AppError('Quiz not found', 404));
    });

    it('should throw 400 AppError for invalid question ID', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const mockQuestions = [
        { id: 1, question_text: 'Question 1', question_type: 'single_choice' }
      ];

      const answers = [
        { question_id: 999, selected_option_ids: [1] } // Invalid question ID
      ];

      Quiz.findById.mockResolvedValue(mockQuiz);
      Question.findByQuizId.mockResolvedValue(mockQuestions);

      await expect(quizService.submitQuizAnswers(1, answers))
        .rejects.toThrow(new AppError('Question 999 not found in quiz', 400));
    });
  });

  describe('addQuestionToQuiz', () => {
    it('should add question to quiz successfully', async () => {
      const mockQuiz = { id: 1, title: 'Test Quiz' };
      const questionData = {
        question_text: 'Test Question',
        question_type: 'single_choice',
        options: []
      };
      const mockQuestion = { id: 1, ...questionData, quiz_id: 1 };

      Quiz.findById.mockResolvedValue(mockQuiz);
      Question.create.mockResolvedValue(1);
      Question.findById.mockResolvedValue(mockQuestion);

      const result = await quizService.addQuestionToQuiz(1, questionData);

      expect(Quiz.findById).toHaveBeenCalledWith(1);
      expect(Question.create).toHaveBeenCalledWith({
        ...questionData,
        quiz_id: 1
      });
      expect(result).toEqual(mockQuestion);
    });

    it('should throw 404 AppError when quiz not found', async () => {
      const questionData = { question_text: 'Test', question_type: 'text' };
      Quiz.findById.mockResolvedValue(null);

      await expect(quizService.addQuestionToQuiz(1, questionData))
        .rejects.toThrow(new AppError('Quiz not found', 404));
    });
  });
});