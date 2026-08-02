// middleware/auth.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const apiResponse = require('../utils/apiResponse');

// Extract token from Authorization header (Bearer) or from httpOnly cookie named 'refreshToken'
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.refreshToken) {
    token = req.cookies.refreshToken;
  }

  if (!token) {
    return apiResponse.error(res, 'Not authorized, no token', [], 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return apiResponse.error(res, 'User not found', [], 401);
    }
    next();
  } catch (err) {
    return apiResponse.error(res, 'Not authorized, token failed', [], 401);
  }
});

module.exports = protect;
