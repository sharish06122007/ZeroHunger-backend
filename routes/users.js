// routes/users.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  getProfile,
  updateProfile,
  changePassword,
  adminGetAllUsers,
  adminUpdateUserRole,
  adminDeleteUser,
} = require('../controllers/userController');
const {
  updateProfileValidator,
  changePasswordValidator,
  updateRoleValidator,
} = require('../validators/userValidator');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// User profile endpoints (Authenticated)
router.get('/me', protect, asyncHandler(getProfile));
router.put('/me', protect, updateProfileValidator, validate, asyncHandler(updateProfile));
router.put('/me/password', protect, changePasswordValidator, validate, asyncHandler(changePassword));

// Admin user management endpoints
router.get('/admin/users', protect, role('admin'), asyncHandler(adminGetAllUsers));
router.put('/admin/users/:id/role', protect, role('admin'), updateRoleValidator, validate, asyncHandler(adminUpdateUserRole));
router.delete('/admin/users/:id', protect, role('admin'), asyncHandler(adminDeleteUser));

module.exports = router;
