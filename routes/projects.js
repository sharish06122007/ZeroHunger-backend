// routes/projects.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  adminUpdateProjectStatus,
} = require('../controllers/projectController');
const {
  createProjectValidator,
  updateProjectValidator,
  updateStatusValidator,
} = require('../validators/projectValidator');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// Public routes
router.get('/', asyncHandler(getProjects));
router.get('/:id', asyncHandler(getProjectById));

// Protected user / NGO / admin routes
router.post('/', protect, createProjectValidator, validate, asyncHandler(createProject));
router.put('/:id', protect, updateProjectValidator, validate, asyncHandler(updateProject));
router.delete('/:id', protect, asyncHandler(deleteProject));

// Admin route for project approval/status update
router.put('/admin/projects/:id/status', protect, role('admin'), updateStatusValidator, validate, asyncHandler(adminUpdateProjectStatus));

module.exports = router;
