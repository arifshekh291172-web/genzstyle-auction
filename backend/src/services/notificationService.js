const Notification = require('../models/Notification');
const { sendUserNotification } = require('./socketService');
const logger = require('../utils/logger');

const notificationService = {
  createNotification: async ({ userId, type, title, message, data = {} }) => {
    try {
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        data,
        read: false,
      });

      // Push real-time via socket
      sendUserNotification(userId, notification);
      return notification;
    } catch (err) {
      logger.error('NOTIFICATION_ERROR', `Failed to create notification: ${err.message}`, { userId, type });
      return null;
    }
  },

  getUserNotifications: async (userId, limit = 50, page = 1) => {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, read: false }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      pages: Math.ceil(total / limit),
    };
  },

  markAsRead: async (userId, notificationId) => {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  },

  markAllAsRead: async (userId) => {
    return Notification.updateMany({ userId, read: false }, { read: true });
  },
};

module.exports = notificationService;
