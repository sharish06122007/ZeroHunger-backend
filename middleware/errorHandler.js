// middleware/errorHandler.js
const apiResponse = require('../utils/apiResponse');

// Centralized error handling middleware
// It expects an error object with "statusCode" and "message" (like HttpError) or falls back to 500
module.exports = (err, req, res, next) => {
  // If response already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Mongoose duplicate key error
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return apiResponse.error(res, `${field} "${value}" already exists`, [], 409);
  }

  // ValidationError from Mongoose schema
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return apiResponse.error(res, 'Validation failed', errors, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return apiResponse.error(res, 'Invalid or expired token', [], 401);
  }

  // Default fallback
  return apiResponse.error(res, message, [], statusCode);
};
