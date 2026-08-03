// routes/notifications.js - Notification Routes
const express = require('express');
const asyncHandler = require('express-async-handler');
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController');
const protect = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', asyncHandler(getNotifications));
router.patch('/:id/read', asyncHandler(markRead));
router.patch('/read-all', asyncHandler(markAllRead));

module.exports = router;
