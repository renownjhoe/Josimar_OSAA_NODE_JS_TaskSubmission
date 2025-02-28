import logger from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return;

  const isDevelopment = process.env.NODE_ENV === 'development';
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  // Log the error with additional details
  logger.error(`${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Handle specific error types
  switch (err.constructor.name) {
    case 'ValidationError':
      response.message = 'Validation failed';
      response.errors = err.details?.map(e => e.message) || [err.message];
      break;

    case 'ConflictError':
      response.message = err.message;
      break;

    case 'UnauthorizedError':
      response.message = 'Authentication failed';
      break;

    case 'ForbiddenError':
      response.message = 'Insufficient permissions';
      break;

    case 'NotFoundError':
      response.message = 'Resource not found';
      break;

    case 'InternalServerError':
      response.message = 'Internal Server Error';
      break;

    default:
      if (isDevelopment) {
        response.stack = err.stack;
      }
      break;
  }

  // Never expose stack traces in production
  if (!isDevelopment) {
    delete response.stack;
    delete response.errors;
    delete response.details;
  }

  res.status(statusCode).json(response);
};

// Custom Error Classes
export class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Authentication required') {
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
  constructor(message = 'Internal Server Error') {
    super(message);
    this.name = 'InternalServerError';
    this.statusCode = 500;
  }
}