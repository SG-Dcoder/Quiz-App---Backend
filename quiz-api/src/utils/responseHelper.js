// Standardized API response helper functions

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const errorResponse = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString()
  });
};

const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      pages: Math.ceil(pagination.total / pagination.limit)
    },
    timestamp: new Date().toISOString()
  });
};

const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors,
    timestamp: new Date().toISOString()
  });
};

const notFoundResponse = (res, resource = 'Resource') => {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    timestamp: new Date().toISOString()
  });
};

const createdResponse = (res, data, message = 'Resource created successfully') => {
  return res.status(201).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const noContentResponse = (res, message = 'Resource deleted successfully') => {
  return res.status(200).json({
    success: true,
    message,
    timestamp: new Date().toISOString()
  });
};

const conflictResponse = (res, message = 'Resource already exists') => {
  return res.status(409).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

const badRequestResponse = (res, message = 'Bad request') => {
  return res.status(400).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return res.status(401).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

const forbiddenResponse = (res, message = 'Access forbidden') => {
  return res.status(403).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  validationErrorResponse,
  notFoundResponse,
  createdResponse,
  noContentResponse,
  conflictResponse,
  badRequestResponse,
  unauthorizedResponse,
  forbiddenResponse
};