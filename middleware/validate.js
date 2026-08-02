// middleware/validate.js
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

/**
 * Middleware to check express-validator validation errors.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return apiResponse.error(res, formattedErrors, 'Validation failed', 400);
  }
  next();
};

module.exports = validate;
