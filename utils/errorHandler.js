import logger from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return;

  const isDevelopment = process.env.NODE_ENV === 'development';
  let statusCode = err.statusCode || 500;
  let response = {
    success: false,
    message: 'Something went wrong'
  };

  // Log detailed error information
  logger.error(`${statusCode} - ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);

  // Handle specific error types
  switch (err.constructor.name) {
    case 'ValidationError':
      statusCode = 400;
      response.message = isDevelopment ? err.message : err.prodMessage;
      if (isDevelopment) {
        response.errors = err.details?.map(e => e.message) || [err.message];
        response.stack = err.stack;
      }
      break;

    case 'ConflictError':
      statusCode = 409;
      response.message = isDevelopment ? err.message : err.prodMessage;
      if (isDevelopment) response.stack = err.stack;
      break;

    case 'UnauthorizedError':
      statusCode = 401;
      response.message = isDevelopment ? err.message : err.prodMessage;
      if (isDevelopment) response.stack = err.stack;
      break;

    case 'ForbiddenError':
      statusCode = 403;
      response.message = isDevelopment ? err.message : err.prodMessage;
      if (isDevelopment) response.stack = err.stack;
      break;

    case 'NotFoundError':
      statusCode = 404;
      response.message = isDevelopment ? err.message : err.prodMessage;
      if (isDevelopment) response.stack = err.stack;
      break;

    case 'InternalServerError':
    default:
      response.message = isDevelopment ? err.message : 'Internal server error';
      if (isDevelopment) response.stack = err.stack;
      break;
  }

  // Production cleanup
  if (!isDevelopment) {
    delete response.stack;
    delete response.errors;
    delete response.details;
    
    // Generic messages for production
    if (statusCode >= 500) {
      response.message = 'Internal server error';
    }
  }

  return res.status(statusCode).json(response);
};

// Custom Error Classes with environment-aware messages
export class ValidationError extends Error {
  constructor(
    devMessage = 'Invalid input', 
    prodMessage = 'Invalid request',
    details = []
  ) {
    super(devMessage);
    this.name = 'ValidationError';
    this.prodMessage = prodMessage;
    this.details = details;
    this.statusCode = 400;
  }
}

export class ConflictError extends Error {
  constructor(
    devMessage = 'Resource already exists', 
    prodMessage = 'Resource conflict occurred'
  ) {
    super(devMessage);
    this.name = 'ConflictError';
    this.prodMessage = prodMessage;
    this.statusCode = 409;
  }
}

export class UnauthorizedError extends Error {
  constructor(
    devMessage = 'Authentication required', 
    prodMessage = 'Invalid credentials'
  ) {
    super(devMessage);
    this.name = 'UnauthorizedError';
    this.prodMessage = prodMessage;
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(
    devMessage = 'Insufficient permissions', 
    prodMessage = 'Access denied'
  ) {
    super(devMessage);
    this.name = 'ForbiddenError';
    this.prodMessage = prodMessage;
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(
    devMessage = 'Resource not found', 
    prodMessage = 'Resource not found'
  ) {
    super(devMessage);
    this.name = 'NotFoundError';
    this.prodMessage = prodMessage;
    this.statusCode = 404;
  }
}

export class InternalServerError extends Error {
  constructor(
    devMessage = 'Internal server error', 
    prodMessage = 'Internal server error'
  ) {
    super(devMessage);
    this.name = 'InternalServerError';
    this.prodMessage = prodMessage;
    this.statusCode = 500;
  }
}