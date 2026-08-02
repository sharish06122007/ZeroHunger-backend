// routes/donations.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const {
  createDonation,
  getMyDonations,
  getDonationById,
  adminGetAllDonations,
} = require('../controllers/donationController');
const { createDonationValidator } = require('../validators/donationValidator');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');

const router = express.Router();

// User donation endpoints (Protected)
router.post('/', protect, createDonationValidator, validate, asyncHandler(createDonation));
router.get('/me', protect, asyncHandler(getMyDonations));
router.get('/:id', protect, asyncHandler(getDonationById));

// Admin donation endpoints
router.get('/admin/all', protect, role('admin'), asyncHandler(adminGetAllDonations));

module.exports = router;
