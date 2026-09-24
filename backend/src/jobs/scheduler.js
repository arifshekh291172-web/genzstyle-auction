const cron = require('node-cron');
const Auction = require('../models/Auction');
const Order = require('../models/Order');
const User = require('../models/User');
const auctionService = require('../services/auctionService');
const notificationService = require('../services/notificationService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

/**
 * Initialize all automated backend cron jobs
 */
const initScheduledJobs = () => {
  logger.info('SCHEDULER', 'Initializing automated background cron jobs...');

  // 1. AUCTION LIFECYCLE & STATE TRANSITIONS (Runs every 10 seconds)
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const now = new Date();

      // A. Transition UPCOMING to OPEN (e.g., 24 hours prior to start, or if within 1 hour)
      const upcomingToOpen = await Auction.updateMany(
        {
          status: 'UPCOMING',
          startTime: { $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
        },
        { $set: { status: 'OPEN' } }
      );

      // B. Transition OPEN / FULL to LIVE when startTime is reached
      const openToLive = await Auction.updateMany(
        {
          status: { $in: ['OPEN', 'FULL', 'UPCOMING'] },
          startTime: { $lte: now },
          endTime: { $gt: now },
        },
        { $set: { status: 'LIVE' } }
      );

      // C. Transition expired LIVE auctions to ENDED and select winner
      const expiredAuctions = await Auction.find({
        status: { $in: ['LIVE', 'OPEN', 'FULL'] },
        endTime: { $lte: now },
      });

      for (const auction of expiredAuctions) {
        await auctionService.endAuctionAndSelectWinner(auction._id);
      }
    } catch (err) {
      logger.error('CRON_ERROR', `Error in Auction Lifecycle Job: ${err.message}`);
    }
  });

  // 2. DETECT EXPIRED 48-HOUR WINNER PAYMENTS (Runs every minute)
  cron.schedule('* * * * *', async () => {
    try {
      await auctionService.processExpiredPayments();
    } catch (err) {
      logger.error('CRON_ERROR', `Error in Expired Payments Job: ${err.message}`);
    }
  });

  // 3. EXPIRE MEMBERSHIPS PAST 365 DAYS (Runs every 10 minutes)
  cron.schedule('*/10 * * * *', async () => {
    try {
      const now = new Date();
      const expiredResult = await User.updateMany(
        {
          membershipStatus: 'ACTIVE',
          membershipExpiresAt: { $lt: now },
        },
        {
          $set: {
            membershipStatus: 'EXPIRED',
            auctionAccessStatus: 'BLOCKED',
          },
        }
      );

      if (expiredResult.modifiedCount > 0) {
        logger.scheduledJob('Membership Expiration Job', 'Expired Memberships', {
          count: expiredResult.modifiedCount,
        });
      }
    } catch (err) {
      logger.error('CRON_ERROR', `Error in Membership Expiration Job: ${err.message}`);
    }
  });

  // 4. 48-HOUR WINNER PAYMENT REMINDERS (24h, 6h, 1h) - Runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const pendingOrders = await Order.find({
        paymentStatus: 'PAYMENT_PENDING',
        paymentDeadline: { $gt: now },
      }).populate('userId productId');

      for (const order of pendingOrders) {
        if (!order.userId || !order.productId) continue;

        const hoursLeft = Math.ceil(
          (new Date(order.paymentDeadline).getTime() - now.getTime()) / (1000 * 60 * 60)
        );

        // 24 Hour Reminder
        if (hoursLeft <= 24 && hoursLeft > 6 && !order.reminder24Sent) {
          order.reminder24Sent = true;
          await order.save();

          await notificationService.createNotification({
            userId: order.userId._id,
            type: 'PAYMENT_REMINDER',
            title: `Payment Reminder: 24 Hours Remaining`,
            message: `You have 24 hours left to complete your winning purchase of ${order.productId.name} (₹${order.winningBid}).`,
            data: { orderId: order.orderId },
          });

          emailService
            .sendPaymentReminderEmail(
              order.userId,
              order.productId,
              order.winningBid,
              24,
              order.orderId
            )
            .catch(() => {});
        }

        // 6 Hour Reminder
        else if (hoursLeft <= 6 && hoursLeft > 1 && !order.reminder6Sent) {
          order.reminder6Sent = true;
          await order.save();

          await notificationService.createNotification({
            userId: order.userId._id,
            type: 'PAYMENT_REMINDER',
            title: `Urgent: 6 Hours Left to Pay!`,
            message: `Only 6 hours remaining before your win for ${order.productId.name} defaults.`,
            data: { orderId: order.orderId },
          });

          emailService
            .sendPaymentReminderEmail(
              order.userId,
              order.productId,
              order.winningBid,
              6,
              order.orderId
            )
            .catch(() => {});
        }

        // 1 Hour Final Reminder
        else if (hoursLeft <= 1 && !order.reminder1Sent) {
          order.reminder1Sent = true;
          await order.save();

          await notificationService.createNotification({
            userId: order.userId._id,
            type: 'PAYMENT_REMINDER',
            title: `FINAL NOTICE: 1 Hour Left to Complete Payment`,
            message: `Your winning piece ${order.productId.name} will be forfeited in 1 hour if payment is not completed.`,
            data: { orderId: order.orderId },
          });

          emailService
            .sendPaymentReminderEmail(
              order.userId,
              order.productId,
              order.winningBid,
              1,
              order.orderId
            )
            .catch(() => {});
        }
      }
    } catch (err) {
      logger.error('CRON_ERROR', `Error in Winner Payment Reminders: ${err.message}`);
    }
  });

  // 5. MEMBERSHIP EXPIRY REMINDERS (7d, 3d, 1d) - Runs once a day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const activeUsers = await User.find({
        membershipStatus: 'ACTIVE',
        membershipExpiresAt: { $gt: now },
      });

      for (const user of activeUsers) {
        const daysLeft = Math.ceil(
          (new Date(user.membershipExpiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysLeft === 7 && !user.membershipReminder7Sent) {
          user.membershipReminder7Sent = true;
          await user.save();
          await notificationService.createNotification({
            userId: user._id,
            type: 'MEMBERSHIP_EXPIRING',
            title: 'Membership Renewal Reminder',
            message: 'Your annual GENZSTYLE membership will expire in 7 days.',
          });
        } else if (daysLeft === 3 && !user.membershipReminder3Sent) {
          user.membershipReminder3Sent = true;
          await user.save();
          await notificationService.createNotification({
            userId: user._id,
            type: 'MEMBERSHIP_EXPIRING',
            title: 'Membership Expiring Soon',
            message: 'Your membership expires in 3 days. Renew for ₹49 to maintain uninterrupted drop access.',
          });
        } else if (daysLeft === 1 && !user.membershipReminder1Sent) {
          user.membershipReminder1Sent = true;
          await user.save();
          await notificationService.createNotification({
            userId: user._id,
            type: 'MEMBERSHIP_EXPIRING',
            title: 'Final Day of Membership',
            message: 'Today is the final day of your GENZSTYLE membership. Renew today.',
          });
        }
      }
    } catch (err) {
      logger.error('CRON_ERROR', `Error in Membership Expiry Reminders: ${err.message}`);
    }
  });

  logger.info('SCHEDULER', 'All background cron jobs registered successfully.');
};

module.exports = {
  initScheduledJobs,
};
