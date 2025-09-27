const request = require('supertest');
const app = require('../../app');

describe('Quiz API Integration Tests', () => {
  let quizId;
  let questionId;

  describe('POST /api/v1/quizzes', () => {
    it('should create a new quiz', async () => {
      const quizData = {
        title: 'JavaScript Basics',
        description: 'Test your knowledge of JavaScript fundamentals'
      };

      const response = await request(app)
        .post('/api/v1/quizzes')
        .send(quizData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz created successfully',
        data: expect.objectContaining({
          id: expect.any(Number),
          title: quizData.title,
          description: quizData.description
        })
      });

      quizId = response.body.data.id;
    });

    it('should return validation error for missing title', async () => {
      const invalidData = {
        description: 'Quiz without title'
      };

      const response = await request(app)
        .post('/api/v1/quizzes')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: 'Title is required'
          })
        ])
      });
    });

    it('should return validation error for title too short', async () => {
      const invalidData = {
        title: 'JS'
      };

      const response = await request(app)
        .post('/api/v1/quizzes')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: 'Title must be between 3 and 200 characters'
          })
        ])
      });
    });
  });

  describe('GET /api/v1/quizzes', () => {
    it('should get all quizzes', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quizzes fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            id: quizId,
            title: 'JavaScript Basics'
          })
        ])
      });
    });
  });

  describe('GET /api/v1/quizzes/:id', () => {
    it('should get quiz by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/quizzes/${quizId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz fetched successfully',
        data: expect.objectContaining({
          id: quizId,
          title: 'JavaScript Basics',
          question_count: 0
        })
      });
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes/99999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Quiz not found'
      });
    });

    it('should return validation error for invalid ID', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/quizzes/:quizId/questions', () => {
    it('should add a multiple choice question to quiz', async () => {
      const questionData = {
        question_text: 'What is the correct way to declare a variable in JavaScript?',
        question_type: 'single_choice',
        options: [
          { option_text: 'var myVar = 5;', is_correct: true },
          { option_text: 'variable myVar = 5;', is_correct: false },
          { option_text: 'v myVar = 5;', is_correct: false },
          { option_text: 'declare myVar = 5;', is_correct: false }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Question added to quiz successfully',
        data: expect.objectContaining({
          id: expect.any(Number),
          question_text: questionData.question_text,
          question_type: questionData.question_type,
          quiz_id: quizId,
          options: expect.arrayContaining([
            expect.objectContaining({
              option_text: 'var myVar = 5;',
              is_correct: true
            })
          ])
        })
      });

      questionId = response.body.data.id;
    });

    it('should add a text question to quiz', async () => {
      const questionData = {
        question_text: 'Explain the concept of closures in JavaScript',
        question_type: 'text'
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Question added to quiz successfully',
        data: expect.objectContaining({
          question_text: questionData.question_text,
          question_type: questionData.question_type
        })
      });
    });

    it('should return validation error for single choice with multiple correct answers', async () => {
      const invalidData = {
        question_text: 'Invalid question',
        question_type: 'single_choice',
        options: [
          { option_text: 'Option 1', is_correct: true },
          { option_text: 'Option 2', is_correct: true }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/questions`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation failed');
    });

    it('should return validation error for questions with insufficient options', async () => {
      const invalidData = {
        question_text: 'Question with one option',
        question_type: 'single_choice',
        options: [
          { option_text: 'Only option', is_correct: true }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/questions`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/quizzes/:quizId/questions', () => {
    it('should get quiz questions without correct answers', async () => {
      const response = await request(app)
        .get(`/api/v1/quizzes/${quizId}/questions`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz questions fetched successfully',
        data: expect.arrayContaining([
          expect.objectContaining({
            question_text: 'What is the correct way to declare a variable in JavaScript?',
            question_type: 'single_choice',
            options: expect.arrayContaining([
              expect.objectContaining({
                option_text: 'var myVar = 5;'
                // is_correct should not be included
              })
            ])
          })
        ])
      });

      // Ensure correct answers are not included with safe check
      const question = response.body.data.find(q => q.id === questionId);
      if (question && question.options && question.options.length > 0) {
        expect(question.options[0]).not.toHaveProperty('is_correct');
      }
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/v1/quizzes/99999/questions')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Quiz not found'
      });
    });
  });

  describe('POST /api/v1/quizzes/:quizId/submit', () => {
    it('should submit quiz answers and return score', async () => {
      // Get questions to find option IDs
      const questionsResponse = await request(app)
        .get(`/api/v1/quizzes/${quizId}/questions`);

      const questions = questionsResponse.body.data;
      const multipleChoiceQuestion = questions.find(q => q.question_type === 'single_choice');
      const textQuestion = questions.find(q => q.question_type === 'text');

      const submissionData = {
        answers: [
          {
            question_id: multipleChoiceQuestion.id,
            selected_option_ids: [multipleChoiceQuestion.options[0].id]
          },
          {
            question_id: textQuestion.id,
            text_answer: 'A closure is a function that has access to variables in its outer scope even after the outer function returns.'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/submit`)
        .send(submissionData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz submitted successfully',
        data: expect.objectContaining({
          score: expect.any(Number),
          total: questions.length,
          percentage: expect.any(Number),
          results: expect.arrayContaining([
            expect.objectContaining({
              question_id: expect.any(Number),
              is_correct: expect.any(Boolean)
            })
          ])
        })
      });
    });

    it('should return validation error for missing answers', async () => {
      const invalidData = {};

      const response = await request(app)
        .post(`/api/v1/quizzes/${quizId}/submit`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should return validation error for text answer exceeding character limit', async () => {
      // Get a text question
      const questionsResponse = await request(app)
        .get(`/api/v1/quizzes/${quizId}/questions`);

      const textQuestion = questionsResponse.body.data.find(q => q.question_type === 'text');

      if (textQuestion) {
        const longText = 'a'.repeat(301); // Exceeds 300 character limit
        const invalidData = {
          answers: [
            {
              question_id: textQuestion.id,
              text_answer: longText
            }
          ]
        };

        const response = await request(app)
          .post(`/api/v1/quizzes/${quizId}/submit`)
          .send(invalidData)
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('DELETE /api/v1/quizzes/:id', () => {
    it('should delete a quiz', async () => {
      const response = await request(app)
        .delete(`/api/v1/quizzes/${quizId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz deleted successfully'
      });

      // Verify quiz is deleted
      await request(app)
        .get(`/api/v1/quizzes/${quizId}`)
        .expect(404);
    });

    it('should return 404 for deleting non-existent quiz', async () => {
      const response = await request(app)
        .delete('/api/v1/quizzes/99999')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Quiz not found'
      });
    });
  });

  describe('API Documentation Endpoint', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api/')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz API v1',
        version: '1.0.0',
        endpoints: expect.any(Object)
      });
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Quiz API is running!'
      });
    });
  });
});