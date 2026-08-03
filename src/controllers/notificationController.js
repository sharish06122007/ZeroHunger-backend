// controllers/notificationController.js - Notification Center APIs
const Notification = require('../models/Notification');
const apiResponse = require('../utils/apiResponse');

const getNotifications = async (req, res) => {
  const recipientId = req.user._id;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: recipientId }).sort({ createdAt: -1 }).limit(30),
    Notification.countDocuments({ recipient: recipientId, isRead: false }),
  ]);

  return apiResponse.success(res, { notifications, unreadCount }, 'Notifications retrieved');
};

const markRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return apiResponse.error(res, 'Notification not found', [], 404);
  }

  return apiResponse.success(res, notification, 'Notification marked as read');
};

const markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  return apiResponse.success(res, {}, 'All notifications marked as read');
};

module.exports = { getNotifications, markRead, markAllRead };
