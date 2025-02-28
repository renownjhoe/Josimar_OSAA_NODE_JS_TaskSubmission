import logger from "./logger.js";

export const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.details?.map(e => e.message) || err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      details: err.message
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      details: err.message
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Resource not found',
      details: err.message
    });
  }

  // Handle generic errors
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

// Custom error constructors
export class ValidationError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
    this.statusCode = 400;
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
export class ConflictError extends Error {
    constructor(message) {
      super(message);
      this.name = 'ConflictError';
      this.statusCode = 409;
    }
  }
  
  export class InternalServerError extends Error {
    constructor(message) {
      super(message);
      this.name = 'InternalServerError';
      this.statusCode = 500;
    }
  }