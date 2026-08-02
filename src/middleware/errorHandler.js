// middleware/errorHandler.js
const logger = require('../config/logger');

module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  logger.error(`${err.message} | ${req.method} ${req.originalUrl}`);

  const statusCode = err.statusCode || 500;

  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `${field} already exists`, errors: [] });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', errors: [] });
  }

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: [],
  });
};
