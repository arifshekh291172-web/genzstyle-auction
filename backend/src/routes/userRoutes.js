const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// GET /api/users/me
router.get('/me', userController.getMe);

// PATCH /api/users/me
router.patch('/me', userController.updateMe);

// GET /api/users/me/auctions
router.get('/me/auctions', userController.getMyAuctions);

// GET /api/users/me/bids
router.get('/me/bids', userController.getMyBids);

// GET /api/users/me/orders
router.get('/me/orders', userController.getMyOrders);

// GET /api/users/me/notifications
router.get('/me/notifications', userController.getMyNotifications);

module.exports = router;
