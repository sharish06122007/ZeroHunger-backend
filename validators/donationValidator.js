// validators/donationValidator.js
const { body } = require('express-validator');

const createDonationValidator = [
  body('project').isMongoId().withMessage('Valid project ID is required'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a number greater than 0'),
  body('paymentStatus').optional().isIn(['pending', 'succeeded', 'failed']).withMessage('Invalid payment status'),
  body('receiptUrl').optional().isURL().withMessage('Receipt URL must be a valid URL'),
];

module.exports = {
  createDonationValidator,
};
