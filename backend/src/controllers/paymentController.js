const Order = require('../models/Order');
const Auction = require('../models/Auction');
const razorpayService = require('../services/razorpayService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
const env = require('../config/env');
const logger = require('../utils/logger');

const paymentController = {
  /**
   * Create Razorpay Order for Winning Auction Piece
   */
  createAuctionOrder: async (req, res, next) => {
    try {
      const { orderId } = req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          error: 'ORDER_ID_REQUIRED',
          message: 'Order reference is required.',
        });
      }

      const order = await Order.findOne({ orderId }).populate('productId');

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Winning order not found.',
        });
      }

      // Ensure authenticated user is the legitimate winner
      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'UNAUTHORIZED_ORDER_ACCESS',
          message: 'You are not authorized to pay for this order.',
        });
      }

      if (order.paymentStatus === 'PAID') {
        return res.status(400).json({
          success: false,
          error: 'ORDER_ALREADY_PAID',
          message: 'This order has already been paid for.',
        });
      }

      if (order.orderStatus === 'DEFAULTED' || order.paymentStatus === 'EXPIRED') {
        return res.status(400).json({
          success: false,
          error: 'ORDER_EXPIRED',
          message: 'The 48-hour payment deadline has expired for this order.',
        });
      }

      if (new Date() > new Date(order.paymentDeadline)) {
        return res.status(400).json({
          success: false,
          error: 'PAYMENT_DEADLINE_PASSED',
          message: 'The 48-hour payment deadline has passed.',
        });
      }

      // Create Razorpay Order with authoritative winningBid amount
      const razorpayOrder = await razorpayService.createAuctionOrder(
        order.orderId,
        order.winningBid,
        req.user._id
      );

      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      res.status(200).json({
        success: true,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: env.RAZORPAY_KEY_ID,
        orderReference: order.orderId,
        product: {
          name: order.productId ? order.productId.name : 'Exclusive Piece',
          styleId: order.productId ? order.productId.styleId : '',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Razorpay Payment Signature for Winning Auction
   */
  verifyAuctionPayment: async (req, res, next) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PAYMENT_DETAILS',
          message: 'All payment verification parameters are required.',
        });
      }

      // 1. Verify Cryptographic Signature
      const isValid = razorpayService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        logger.authFailure('Invalid Razorpay signature for auction order', {
          userId: req.user._id,
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
        });

        return res.status(400).json({
          success: false,
          error: 'INVALID_SIGNATURE',
          message: 'Payment verification failed. Invalid cryptographic signature.',
        });
      }

      // 2. Fetch and update order
      const order = await Order.findOne({ orderId }).populate('productId');

      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Order reference not found.',
        });
      }

      if (order.paymentStatus === 'PAID') {
        return res.status(200).json({
          success: true,
          message: 'Order already marked as paid.',
          order,
        });
      }

      const now = new Date();
      order.paymentStatus = 'PAID';
      order.orderStatus = 'CONFIRMED';
      order.paidAt = now;
      order.razorpayOrderId = razorpayOrderId;
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.statusHistory.push({
        status: 'CONFIRMED',
        changedAt: now,
        notes: `Payment verified via Razorpay ID: ${razorpayPaymentId}`,
        changedBy: req.user.email,
      });

      await order.save();

      // Update Auction status to COMPLETED
      await Auction.findByIdAndUpdate(order.auctionId, { status: 'COMPLETED' });

      // Audit log
      await auditService.log({
        actor: req.user,
        action: 'AUCTION_PAYMENT_VERIFIED',
        entity: 'Order',
        entityId: order.orderId,
        metadata: {
          winningBid: order.winningBid,
          razorpayPaymentId,
          razorpayOrderId,
        },
        req,
      });

      // Send in-app notification & confirmation email
      await notificationService.createNotification({
        userId: req.user._id,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Confirmed!',
        message: `Your payment of ₹${order.winningBid} for ${
          order.productId ? order.productId.name : 'your win'
        } has been verified.`,
        data: { orderId: order.orderId },
      });

      emailService
        .sendPaymentSuccessfulEmail(
          req.user,
          order.productId,
          order.winningBid,
          order.orderId
        )
        .catch(() => {});

      logger.paymentEvent('Auction Winning Payment Verified Successfully', {
        orderId: order.orderId,
        userId: req.user._id,
        amount: order.winningBid,
        razorpayPaymentId,
      });

      res.status(200).json({
        success: true,
        message: 'Payment verified and order confirmed successfully!',
        order,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Razorpay Webhook Handler (Idempotent authoritative payment reconciliation)
   */
  handleWebhook: async (req, res) => {
    try {
      const signature = req.headers['x-razorpay-signature'];

      if (!signature) {
        return res.status(400).send('Webhook signature missing');
      }

      // Verify webhook signature
      const rawBody = typeof req.rawBody === 'string' ? req.rawBody : JSON.stringify(req.body);
      const isValid = razorpayService.verifyWebhook(rawBody, signature);

      if (!isValid) {
        logger.authFailure('Razorpay webhook signature verification failed');
        return res.status(400).send('Invalid signature');
      }

      const event = req.body.event;
      const payload = req.body.payload;

      logger.webhookEvent(`Received Razorpay webhook: ${event}`, { event });

      if (event === 'payment.captured') {
        const paymentEntity = payload.payment.entity;
        const notes = paymentEntity.notes || {};

        if (notes.type === 'MEMBERSHIP_ACTIVATION' && notes.userId) {
          // Reconcile membership if not already processed
          const existing = await MembershipPayment.findOne({
            razorpayPaymentId: paymentEntity.id,
          });

          if (!existing) {
            const User = require('../models/User');
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

            await User.findByIdAndUpdate(notes.userId, {
              membershipStatus: 'ACTIVE',
              auctionAccessStatus: 'ACTIVE',
              membershipActivatedAt: now,
              membershipExpiresAt: expiresAt,
            });

            await MembershipPayment.create({
              userId: notes.userId,
              amount: paymentEntity.amount / 100,
              currency: paymentEntity.currency,
              razorpayOrderId: paymentEntity.order_id,
              razorpayPaymentId: paymentEntity.id,
              razorpaySignature: 'WEBHOOK_VERIFIED',
              status: 'CAPTURED',
              activatedAt: now,
              expiresAt,
            });
          }
        } else if (notes.type === 'AUCTION_WINNING_PAYMENT' && notes.orderId) {
          // Reconcile order payment
          const order = await Order.findOne({ orderId: notes.orderId });
          if (order && order.paymentStatus !== 'PAID') {
            const now = new Date();
            order.paymentStatus = 'PAID';
            order.orderStatus = 'CONFIRMED';
            order.paidAt = now;
            order.razorpayPaymentId = paymentEntity.id;
            order.statusHistory.push({
              status: 'CONFIRMED',
              changedAt: now,
              notes: `Confirmed via Razorpay Webhook [${paymentEntity.id}]`,
              changedBy: 'RAZORPAY_WEBHOOK',
            });
            await order.save();
            await Auction.findByIdAndUpdate(order.auctionId, { status: 'COMPLETED' });
          }
        }
      }

      res.status(200).json({ status: 'ok' });
    } catch (err) {
      logger.error('WEBHOOK_ERROR', `Error processing webhook: ${err.message}`);
      res.status(500).send('Internal Server Error');
    }
  },
};

module.exports = paymentController;
