// routes/chat.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const protect = require('../middleware/auth'); 

router.use(protect);

router.get('/:orderId', chatController.getChatHistory);

module.exports = router;
