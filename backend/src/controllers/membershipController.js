const User = require('../models/User');
const MembershipPayment = require('../models/MembershipPayment');
const razorpayService = require('../services/razorpayService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
const env = require('../config/env');
const logger = require('../utils/logger');

const membershipController = {
  /**
   * Create Razorpay Order for ₹49 Membership
   */
  createOrder: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Please verify your email address before activating membership.',
        });
      }

      // Check if user already has an active, non-expired membership
      if (user.hasValidMembership()) {
        return res.status(400).json({
          success: false,
          error: 'MEMBERSHIP_ALREADY_ACTIVE',
          message: 'Your GENZSTYLE membership is already active.',
          expiresAt: user.membershipExpiresAt,
        });
      }

      const { acceptedTerms } = req.body;

      if (!acceptedTerms) {
        return res.status(400).json({
          success: false,
          error: 'TERMS_REQUIRED',
          message: 'You must review and accept the Membership Terms & Conditions (365 days, non-refundable, forfeiture on default) to proceed.',
        });
      }

      const order = await razorpayService.createMembershipOrder(user._id);

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: order.amount, // 4900 paise
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone || '',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Razorpay Payment Signature and Grant 365-Day Membership
   */
  verifyPayment: async (req, res, next) => {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_PAYMENT_PROOF',
          message: 'Razorpay order ID, payment ID, and signature are required for verification.',
        });
      }

      // 1. Cryptographically verify signature server-side
      const isValid = razorpayService.verifyPayment(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        logger.authFailure('Invalid Razorpay signature submitted for membership', {
          userId: req.user._id,
          razorpayOrderId,
          razorpayPaymentId,
        });

        return res.status(400).json({
          success: false,
          error: 'INVALID_SIGNATURE',
          message: 'Payment verification failed. The provided cryptographic signature is invalid.',
        });
      }

      // 2. Prevent duplicate processing (Idempotency)
      const existingPayment = await MembershipPayment.findOne({ razorpayPaymentId });
      if (existingPayment) {
        return res.status(200).json({
          success: true,
          message: 'Payment already verified.',
          payment: existingPayment,
        });
      }

      // 3. Calculate 365 days from server time
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 365 Days
      const wasReactivation = req.user.membershipStatus === 'FORFEITED' || req.user.auctionAccessStatus === 'BLOCKED';

      // 4. Update user state atomically
      const user = await User.findById(req.user._id);
      user.membershipStatus = 'ACTIVE';
      user.auctionAccessStatus = 'ACTIVE';
      user.membershipActivatedAt = now;
      user.membershipExpiresAt = expiresAt;
      user.membershipReminder7Sent = false;
      user.membershipReminder3Sent = false;
      user.membershipReminder1Sent = false;
      user.membershipTermsAccepted = true;
      user.membershipTermsAcceptedAt = now;
      await user.save();

      // 5. Store immutable payment record
      const paymentRecord = await MembershipPayment.create({
        userId: user._id,
        amount: 49,
        currency: 'INR',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        status: 'CAPTURED',
        type: wasReactivation ? 'REACTIVATION' : 'NEW_MEMBERSHIP',
        activatedAt: now,
        expiresAt,
      });

      // 6. Record audit log
      await auditService.log({
        actor: user,
        action: wasReactivation ? 'MEMBERSHIP_REACTIVATED' : 'MEMBERSHIP_ACTIVATED',
        entity: 'MembershipPayment',
        entityId: paymentRecord._id,
        metadata: { razorpayOrderId, razorpayPaymentId, amount: 49 },
        req,
      });

      // 7. Push notification & email
      await notificationService.createNotification({
        userId: user._id,
        type: 'MEMBERSHIP_ACTIVATED',
        title: 'VIP Access Unlocked!',
        message: 'Your GENZSTYLE annual membership is now active for 365 days.',
        data: { expiresAt, amount: 49 },
      });

      emailService.sendMembershipActivatedEmail(user, paymentRecord).catch(() => {});

      logger.paymentEvent('Membership Activated Successfully', {
        userId: user._id,
        razorpayPaymentId,
        expiresAt,
      });

      res.status(200).json({
        success: true,
        message: 'Membership activated successfully for 365 days!',
        membership: {
          status: user.membershipStatus,
          auctionAccessStatus: user.auctionAccessStatus,
          activatedAt: user.membershipActivatedAt,
          expiresAt: user.membershipExpiresAt,
          daysRemaining: 365,
        },
        payment: paymentRecord,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Current Membership Status
   */
  getStatus: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      let daysRemaining = 0;
      if (user.membershipExpiresAt) {
        const diffTime = new Date(user.membershipExpiresAt).getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      res.status(200).json({
        success: true,
        membership: {
          status: user.membershipStatus,
          auctionAccessStatus: user.auctionAccessStatus,
          activatedAt: user.membershipActivatedAt,
          expiresAt: user.membershipExpiresAt,
          daysRemaining,
          forfeitedCount: user.forfeitedMembershipCount,
          isValid: user.hasValidMembership(),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = membershipController;
