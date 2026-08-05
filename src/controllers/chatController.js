// controllers/chatController.js
const Chat = require('../models/Chat');

exports.getChatHistory = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    
    const chat = await Chat.findOne({ orderId }).populate('messages.senderId', 'fullName');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this chat' });
    }

    res.status(200).json({ success: true, data: chat });
  } catch (error) {
    next(error);
  }
};
