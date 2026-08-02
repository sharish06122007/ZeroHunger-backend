// routes/dashboard.js
const express = require('express');
const asyncHandler = require('express-async-handler');
const { getStats, getRecentActivity, getChartData, adminGetAllUsers, adminUpdateUser, adminDeleteUser } = require('../controllers/dashboardController');
const protect = require('../middleware/auth');
const role = require('../middleware/role');

const router = express.Router();

router.use(protect);

router.get('/stats', asyncHandler(getStats));
router.get('/activity', asyncHandler(getRecentActivity));
router.get('/charts', asyncHandler(getChartData));

// Admin only
router.get('/users', role('admin'), asyncHandler(adminGetAllUsers));
router.put('/users/:id', role('admin'), asyncHandler(adminUpdateUser));
router.delete('/users/:id', role('admin'), asyncHandler(adminDeleteUser));

module.exports = router;
