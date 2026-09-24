const express = require('express');
const { body } = require('express-validator');
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// POST /api/payments/auction/create-order
router.post(
  '/auction/create-order',
  authenticate,
  [body('orderId').notEmpty().withMessage('Order ID is required.')],
  validateRequest,
  paymentController.createAuctionOrder
);

// POST /api/payments/verify
router.post(
  '/verify',
  authenticate,
  [
    body('orderId').notEmpty().withMessage('Order ID is required.'),
    body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required.'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required.'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required.'),
  ],
  validateRequest,
  paymentController.verifyAuctionPayment
);

// POST /api/payments/razorpay/webhook (Webhook endpoint)
router.post('/razorpay/webhook', paymentController.handleWebhook);

module.exports = router;
