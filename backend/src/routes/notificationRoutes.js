const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications);

// PATCH /api/notifications/:id/read
router.patch('/:id/read', notificationController.markAsRead);

// PATCH /api/notifications/read-all
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;
