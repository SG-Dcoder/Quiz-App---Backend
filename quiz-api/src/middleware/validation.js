const { body, param, validationResult } = require('express-validator');

// Validation middleware to handle errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  next();
};

// Quiz validation rules
const validateCreateQuiz = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim(),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  handleValidationErrors
];

// Question validation rules
const validateCreateQuestion = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a positive integer'),
  body('question_text')
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Question text must be between 5 and 1000 characters')
    .trim(),
  body('question_type')
    .isIn(['multiple_choice', 'single_choice', 'text'])
    .withMessage('Question type must be multiple_choice, single_choice, or text'),
  body('options')
    .custom((options, { req }) => {
      const questionType = req.body.question_type;
      
      // Text questions don't need options
      if (questionType === 'text') {
        return true;
      }

      // Multiple choice and single choice questions need options
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error('Questions with choices must have at least 2 options');
      }

      if (options.length > 10) {
        throw new Error('Questions cannot have more than 10 options');
      }

      // Validate each option
      options.forEach((option, index) => {
        if (!option.option_text || typeof option.option_text !== 'string') {
          throw new Error(`Option ${index + 1} must have valid text`);
        }

        if (option.option_text.trim().length === 0) {
          throw new Error(`Option ${index + 1} text cannot be empty`);
        }

        if (option.option_text.length > 500) {
          throw new Error(`Option ${index + 1} text cannot exceed 500 characters`);
        }
      });

      // Check for correct answers
      const correctOptions = options.filter(opt => opt.is_correct === true);

      if (questionType === 'single_choice' && correctOptions.length !== 1) {
        throw new Error('Single choice questions must have exactly one correct answer');
      }

      if (questionType === 'multiple_choice' && correctOptions.length === 0) {
        throw new Error('Multiple choice questions must have at least one correct answer');
      }

      if (questionType === 'multiple_choice' && correctOptions.length === options.length) {
        throw new Error('Multiple choice questions cannot have all options as correct');
      }

      return true;
    }),
  handleValidationErrors
];

// Text answer validation for text questions
const validateTextAnswer = (value) => {
  if (!value || typeof value !== 'string') {
    throw new Error('Text answer is required');
  }

  const trimmedValue = value.trim();
  if (trimmedValue.length === 0) {
    throw new Error('Text answer cannot be empty');
  }

  if (trimmedValue.length > 300) {
    throw new Error('Text answer cannot exceed 300 characters');
  }

  return trimmedValue;
};

// Quiz submission validation
const validateQuizSubmission = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a positive integer'),
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers array is required and must contain at least one answer'),
  body('answers.*.question_id')
    .isInt({ min: 1 })
    .withMessage('Each answer must have a valid question ID'),
  body('answers.*.selected_option_ids')
    .custom((value, { req, path }) => {
      const answerIndex = path.split('[')[1].split(']')[0];
      const answer = req.body.answers[answerIndex];
      
      // For text questions, we expect a text_answer instead
      if (answer.text_answer !== undefined) {
        validateTextAnswer(answer.text_answer);
        return true;
      }

      // For choice questions, validate selected options
      if (!Array.isArray(value) && typeof value !== 'number') {
        throw new Error('Selected option IDs must be an array or a number');
      }

      const optionIds = Array.isArray(value) ? value : [value];
      
      if (optionIds.length === 0) {
        throw new Error('At least one option must be selected');
      }

      optionIds.forEach(id => {
        if (!Number.isInteger(Number(id)) || Number(id) < 1) {
          throw new Error('Option IDs must be positive integers');
        }
      });

      return true;
    }),
  body('answers.*.text_answer')
    .optional()
    .custom(validateTextAnswer),
  handleValidationErrors
];

// Get quiz questions validation
const validateGetQuizQuestions = [
  param('quizId')
    .isInt({ min: 1 })
    .withMessage('Quiz ID must be a positive integer'),
  handleValidationErrors
];

// General ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];

module.exports = {
  validateCreateQuiz,
  validateCreateQuestion,
  validateQuizSubmission,
  validateGetQuizQuestions,
  validateId,
  handleValidationErrors
};