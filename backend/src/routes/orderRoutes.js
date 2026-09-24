const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validator');

const router = express.Router();

router.use(authenticate);

// GET /api/orders
router.get('/', orderController.getOrders);

// GET /api/orders/:id
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/shipping
router.patch(
  '/:id/shipping',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required.'),
    body('phone').trim().notEmpty().withMessage('Phone number is required.'),
    body('street').trim().notEmpty().withMessage('Street address is required.'),
    body('city').trim().notEmpty().withMessage('City is required.'),
    body('state').trim().notEmpty().withMessage('State is required.'),
    body('pinCode').trim().notEmpty().withMessage('PIN code is required.'),
  ],
  validateRequest,
  orderController.updateShippingAddress
);

module.exports = router;
