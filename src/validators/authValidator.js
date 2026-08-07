// validators/authValidator.js
const { body } = require('express-validator');

const registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 60 }).withMessage('Name must be 2–60 characters'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').trim().notEmpty().withMessage('Phone number is required').matches(/^[\+]?[\d\s\-\(\)]{7,15}$/).withMessage('Valid phone number is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('role')
    .optional()
    .isIn(['restaurant', 'volunteer', 'ngo', 'donor', 'receiver', 'admin'])
    .withMessage('Invalid role selected'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const verifyOtpValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const resetPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('otp').trim().notEmpty().withMessage('OTP is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
