// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

// Global limiter – applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    errors: []
  }
});

// Auth-specific limiter (tighter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth attempts, please wait.',
    errors: []
  }
});

module.exports = { global: globalLimiter, auth: authLimiter };
