const express = require('express');
const { body } = require('express-validator');
const membershipController = require('../controllers/membershipController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

// Protected membership endpoints
router.use(authenticate);

// POST /api/membership/create-order
router.post('/create-order', membershipController.createOrder);

// POST /api/membership/verify-payment
router.post(
  '/verify-payment',
  [
    body('razorpayOrderId').notEmpty().withMessage('Razorpay Order ID is required.'),
    body('razorpayPaymentId').notEmpty().withMessage('Razorpay Payment ID is required.'),
    body('razorpaySignature').notEmpty().withMessage('Razorpay Signature is required.'),
  ],
  validateRequest,
  membershipController.verifyPayment
);

// GET /api/membership/status
router.get('/status', membershipController.getStatus);

module.exports = router;
