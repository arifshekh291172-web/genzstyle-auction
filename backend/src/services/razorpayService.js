const { razorpayInstance, verifyPaymentSignature, verifyWebhookSignature } = require('../config/razorpay');
const env = require('../config/env');
const logger = require('../utils/logger');

const razorpayService = {
  /**
   * Create Razorpay order for ₹49 Membership
   */
  createMembershipOrder: async (userId) => {
    if (!razorpayInstance) {
      throw new Error('Razorpay is not configured with valid API keys.');
    }

    const options = {
      amount: 49 * 100, // Razorpay takes amount in paise (4900 paise = ₹49)
      currency: 'INR',
      receipt: `mb_${userId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`,
      notes: {
        userId: userId.toString(),
        type: 'MEMBERSHIP_ACTIVATION',
        durationDays: '365',
      },
    };

    const order = await razorpayInstance.orders.create(options);
    logger.paymentEvent('Created Razorpay Membership Order', {
      orderId: order.id,
      userId,
      amount: 49,
    });

    return order;
  },

  /**
   * Create Razorpay order for Auction Winning Bid
   */
  createAuctionOrder: async (orderId, winningBid, userId) => {
    if (!razorpayInstance) {
      throw new Error('Razorpay is not configured with valid API keys.');
    }

    if (winningBid <= 0) {
      throw new Error('Winning bid must be greater than zero.');
    }

    const options = {
      amount: Math.round(winningBid * 100), // in paise
      currency: 'INR',
      receipt: `auc_${orderId.slice(-8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        orderId,
        userId: userId.toString(),
        type: 'AUCTION_WINNING_PAYMENT',
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);
    logger.paymentEvent('Created Razorpay Auction Order', {
      razorpayOrderId: razorpayOrder.id,
      orderId,
      amount: winningBid,
    });

    return razorpayOrder;
  },

  /**
   * Cryptographically verify payment signature
   */
  verifyPayment: (orderId, paymentId, signature) => {
    return verifyPaymentSignature(orderId, paymentId, signature);
  },

  /**
   * Verify webhook signature
   */
  verifyWebhook: (rawBody, signature) => {
    return verifyWebhookSignature(rawBody, signature);
  },
};

module.exports = razorpayService;
