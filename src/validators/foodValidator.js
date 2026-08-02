// validators/foodValidator.js
const { body } = require('express-validator');

const createFoodValidator = [
  body('title').trim().notEmpty().withMessage('Food title is required').isLength({ min: 2, max: 100 }),
  body('quantity').trim().notEmpty().withMessage('Quantity is required'),
  body('expiryTime').notEmpty().withMessage('Expiry time is required').isISO8601().withMessage('Invalid date format'),
  body('category').optional().isIn(['cooked', 'raw', 'packaged', 'beverage', 'bakery', 'dairy', 'other']),
];

const updateFoodValidator = [
  body('title').optional().trim().isLength({ min: 2, max: 100 }),
  body('status').optional().isIn(['available', 'reserved', 'collected', 'expired']),
  body('expiryTime').optional().isISO8601().withMessage('Invalid date format'),
];

module.exports = { createFoodValidator, updateFoodValidator };
