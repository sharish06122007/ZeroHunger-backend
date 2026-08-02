// validators/projectValidator.js
const { body } = require('express-validator');

const createProjectValidator = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('neededItems').optional().isArray().withMessage('Needed items must be an array'),
];

const updateProjectValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('neededItems').optional().isArray().withMessage('Needed items must be an array'),
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'completed']).withMessage('Invalid status'),
];

const updateStatusValidator = [
  body('status').isIn(['pending', 'approved', 'rejected', 'completed']).withMessage('Invalid status specified'),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
  updateStatusValidator,
};
