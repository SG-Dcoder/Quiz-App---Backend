const { successResponse, errorResponse } = require('../utils/responseHelper');

// Custom error class for application-specific errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found handler
const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (in production, use proper logging service)
  console.error(err);

  // SQLite constraint errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    if (err.message.includes('UNIQUE constraint failed')) {
      error = new AppError('Resource already exists', 409);
    } else if (err.message.includes('FOREIGN KEY constraint failed')) {
      error = new AppError('Invalid reference to related resource', 400);
    } else {
      error = new AppError('Database constraint violation', 400);
    }
  }

  // SQLite database errors
  if (err.code === 'SQLITE_ERROR') {
    error = new AppError('Database operation failed', 500);
  }

  // Cast error for invalid IDs
  if (err.name === 'CastError') {
    error = new AppError('Invalid resource ID format', 400);
  }

  // Validation errors (from express-validator)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(`Validation Error: ${messages}`, 400);
  }

  // JSON syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = new AppError('Invalid JSON format in request body', 400);
  }

  // Payload too large
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File size too large', 413);
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  // Different error response format based on environment
  const errorResponse = {
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  };

  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to catch errors in async route handlers
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED'
  });
};

module.exports = {
  AppError,
  notFound,
  errorHandler,
  asyncHandler,
  rateLimitHandler
};