// routes/auth.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  register, verifyEmail, resendOtp, login, refreshToken, logout,
  forgotPassword, verifyOtp, resetPassword,
  getProfile, updateProfile, changePassword,
} = require('../controllers/authController');
const {
  registerValidator, loginValidator, forgotPasswordValidator,
  verifyOtpValidator, resetPasswordValidator, changePasswordValidator,
} = require('../validators/authValidator');
const validate = require('../middleware/validate');
const protect = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimiter');

const router = express.Router();

router.use(rateLimiter.auth);

router.post('/register', registerValidator, validate, asyncHandler(register));
router.post('/verify-email', asyncHandler(verifyEmail));
router.post('/resend-otp', asyncHandler(resendOtp));
router.post('/login', loginValidator, validate, asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));
router.post('/logout', asyncHandler(logout));
router.post('/forgot-password', forgotPasswordValidator, validate, asyncHandler(forgotPassword));
router.post('/verify-otp', verifyOtpValidator, validate, asyncHandler(verifyOtp));
router.post('/reset-password', resetPasswordValidator, validate, asyncHandler(resetPassword));

router.get('/me', protect, asyncHandler(getProfile));
router.put('/me', protect, asyncHandler(updateProfile));
router.put('/me/password', protect, changePasswordValidator, validate, asyncHandler(changePassword));

module.exports = router;
