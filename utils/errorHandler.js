import logger from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return;

  const isDevelopment = process.env.NODE_ENV === 'development';
  let statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: 'Something went wrong'
  };

  // Always log full error details
  logger.error(`${statusCode} - ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip} - ${err.stack}`);

  // Handle specific error types
  switch (err.constructor.name) {
    case 'ValidationError':
      statusCode = 400;
      response.message = isDevelopment ? err.message : 'Invalid request';
      if (isDevelopment) response.errors = err.details?.map(e => e.message) || [err.message];
      break;

    case 'ConflictError':
      statusCode = 409;
      response.message = isDevelopment ? err.message : 'Resource conflict occurred';
      break;

    case 'UnauthorizedError':
      statusCode = 401;
      response.message = isDevelopment ? err.message : 'Invalid credentials';
      break;

    case 'ForbiddenError':
      statusCode = 403;
      response.message = 'Access denied';
      break;

    case 'NotFoundError':
      statusCode = 404;
      response.message = 'Resource not found';
      break;

    case 'InternalServerError':
    default:
      response.message = isDevelopment ? err.message : 'Internal server error';
      break;
  }

  // Development-only properties
  if (isDevelopment) {
    response.stack = err.stack;
  }

  // Production security cleanup
  if (!isDevelopment) {
    // Remove sensitive error information
    delete response.stack;
    delete response.errors;
    delete response.details;

    // Generic message for server errors
    if (statusCode >= 500) {
      response.message = 'Internal server error';
    }
  }

  return res.status(statusCode).json(response);
};

// Custom Error Classes
export class ValidationError extends Error {
  constructor(message = 'Invalid input', details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class ConflictError extends Error {
  constructor(message = 'Resource conflict occurred') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class InternalServerError extends Error {
  constructor(message = 'Internal server error') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}