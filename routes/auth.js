// routes/auth.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require('../controllers/authController');
const {
  registerValidator,
  loginValidator,
  changePasswordValidator,
} = require('../validators/authValidator');
const validate = require('../middleware/validate');
const rateLimiter = require('../middleware/rateLimiter');
const protect = require('../middleware/auth');

const router = express.Router();

// Apply rate limiting to authentication routes
router.use(rateLimiter.auth);

// Public Auth Endpoints
router.post('/register', registerValidator, validate, asyncHandler(register));
router.post('/login', loginValidator, validate, asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.post('/refresh-token', asyncHandler(refreshToken));

// Protected Profile & Account Endpoints
router.get('/profile', protect, asyncHandler(getProfile));
router.put('/profile', protect, asyncHandler(updateProfile));
router.put('/change-password', protect, changePasswordValidator, validate, asyncHandler(changePassword));
router.delete('/delete-account', protect, asyncHandler(deleteAccount));

module.exports = router;
