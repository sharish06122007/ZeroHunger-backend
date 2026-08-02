// middleware/validate.js
const { validationResult } = require('express-validator');
const apiResponse = require('../utils/apiResponse');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map(e => ({ field: e.path, message: e.msg }));
    return apiResponse.error(res, 'Validation failed', formatted, 422);
  }
  next();
};

module.exports = validate;
