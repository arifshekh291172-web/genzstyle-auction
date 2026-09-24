const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');
const { upload } = require('../config/cloudinary');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Strict security: ALL admin routes require authentication AND role === 'ADMIN'
router.use(authenticate, requireAdmin);

// Dashboard metrics
router.get('/metrics', adminController.getDashboardMetrics);

// Product routes
router.get('/products', adminController.getProducts);
router.post(
  '/products',
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Product name is required.'),
    body('styleId').trim().notEmpty().withMessage('Style ID is required.'),
    body('description').trim().notEmpty().withMessage('Description is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
    body('brand').notEmpty().withMessage('Brand is required.'),
    body('startingPrice').isNumeric().withMessage('Starting price must be a valid number.'),
  ],
  validateRequest,
  adminController.createProduct
);
router.patch('/products/:id', upload.array('images', 5), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Auction routes
router.get('/auctions', adminController.getAuctions);
router.post(
  '/auctions',
  [
    body('productId').notEmpty().withMessage('Product ID is required.'),
    body('startingBid').isNumeric().withMessage('Starting bid must be a number.'),
    body('startTime').notEmpty().withMessage('Start time is required.'),
    body('endTime').notEmpty().withMessage('End time is required.'),
  ],
  validateRequest,
  adminController.createAuction
);
router.patch('/auctions/:id', adminController.updateAuction);
router.delete('/auctions/:id', adminController.deleteAuction);

// User routes
router.get('/users', adminController.getUsers);
router.patch('/users/:id/access', adminController.toggleUserAccess);

// Payments & Memberships
router.get('/memberships', adminController.getMembershipRecords);
router.get('/payments', adminController.getAuctionPaymentRecords);

// Order routes
router.get('/orders', adminController.getOrders);
router.patch(
  '/orders/:id/status',
  [body('orderStatus').notEmpty().withMessage('Order status is required.')],
  validateRequest,
  adminController.updateOrderStatus
);

// Audit logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
