// validators/userValidator.js
const { body } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

const updateRoleValidator = [
  body('role').isIn(['user', 'admin', 'volunteer', 'donor', 'ngo']).withMessage('Invalid role specified'),
];

module.exports = {
  updateProfileValidator,
  changePasswordValidator,
  updateRoleValidator,
};
