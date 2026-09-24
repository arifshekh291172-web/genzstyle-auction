const logger = require('../utils/logger');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  // Log server-side with structured logger
  logger.error('SERVER_ERROR', err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: 'DUPLICATE_ENTRY',
      message: `An entry with this ${field} already exists.`,
    });
  }

  // Handle Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message: messages[0] || 'Invalid data submitted.',
    });
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_ID',
      message: `Resource not found with specified identifier.`,
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Authentication token is invalid or expired. Please log in again.',
    });
  }

  // Default internal server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.errorCode || 'INTERNAL_SERVER_ERROR',
    message:
      statusCode === 500 && env.NODE_ENV === 'production'
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'Server error',
  });
};

module.exports = errorHandler;
