// middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return apiResponse.error(res, 'Not authorized, no token provided', [], 401);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'supersecretkey123';
    const decoded = jwt.verify(token, jwtSecret);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return apiResponse.error(res, 'Not authorized, user not found', [], 401);
    }
    next();
  } catch (err) {
    return apiResponse.error(res, 'Not authorized, invalid or expired token', [], 401);
  }
});

module.exports = protect;
