const notificationService = require('../services/notificationService');

const notificationController = {
  getNotifications: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '30', 10);
      const data = await notificationService.getUserNotifications(req.user._id, limit, page);
      res.status(200).json({ success: true, ...data });
    } catch (error) {
      next(error);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await notificationService.markAsRead(req.user._id, id);
      res.status(200).json({ success: true, notification: updated });
    } catch (error) {
      next(error);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({ success: true, message: 'All notifications marked as read.' });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = notificationController;
