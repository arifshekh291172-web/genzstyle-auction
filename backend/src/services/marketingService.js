const User = require('../models/User');
const Auction = require('../models/Auction');
const Notification = require('../models/Notification');
const { getIO } = require('./socketService');
const { sendMail } = require('../config/email');
const env = require('../config/env');
const logger = require('../utils/logger');

const marketingService = {
  /**
   * Broadcast drop announcement to all registered collectors
   */
  broadcastDropAnnouncement: async ({ auctionId, subject, customMessage }) => {
    try {
      const io = getIO();
      const auction = await Auction.findById(auctionId).populate('productId');
      if (!auction) throw new Error('Auction not found');

      const title = subject || `🔥 EXCLUSIVE DROP: ${auction.productId?.name || 'Street Luxury Piece'}`;
      const message = customMessage || `100-collector live drop starting soon at ₹${auction.startingBid}. Reserve your seat before room locks!`;

      // 1. Real-time Socket Broadcast
      if (io) {
        io.emit('marketing:announcement', {
          auctionId,
          title,
          message,
          productName: auction.productId?.name,
          startingBid: auction.startingBid,
          timestamp: new Date().toISOString(),
        });
      }

      // 2. Fetch all verified users
      const users = await User.find({ emailVerified: true }).select('email name _id').lean();

      // 3. Batch in-app notifications
      const notifications = users.map((u) => ({
        userId: u._id,
        type: 'AUCTION_STARTED',
        title,
        message,
        data: { auctionId, link: `/auction/${auctionId}` },
        read: false,
      }));

      await Notification.insertMany(notifications, { ordered: false }).catch(() => {});

      // 4. Send email dispatch to verified collectors (capped to avoid rate limits)
      const recipientEmails = users.slice(0, 50).map((u) => u.email);
      for (const email of recipientEmails) {
        sendMail({
          to: email,
          subject: title,
          text: message,
          html: `
            <div style="background-color: #08080A; color: #F8F9FA; font-family: sans-serif; padding: 32px; border-radius: 12px; border: 1px solid #D4AF37;">
              <h2 style="color: #D4AF37; margin-bottom: 8px;">${title}</h2>
              <p style="color: #CCCCCC; font-size: 14px; line-height: 1.6;">${message}</p>
              <div style="margin: 24px 0;">
                <a href="${env.CLIENT_URL}/auction/${auctionId}" style="display: inline-block; background: linear-gradient(135deg, #D4AF37, #AA820A); color: #000; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; text-transform: uppercase;">
                  ENTER 100-COLLECTOR DROP
                </a>
              </div>
              <p style="color: #666666; font-size: 11px;">GENZSTYLE Concierge • Mumbai MMR Exclusive Delivery</p>
            </div>
          `,
        }).catch((err) => logger.warn('MARKETING_MAIL_SKIP', err.message));
      }

      logger.info('MARKETING_BROADCAST', `Dispatched broadcast to ${users.length} collectors for drop ${auctionId}`);
      return { success: true, count: users.length };
    } catch (err) {
      logger.error('MARKETING_ERROR', err.message);
      throw err;
    }
  },

  /**
   * Instant re-engagement when a collector is outbid
   */
  notifyOutbidCollector: async ({ outbidUserId, auctionId, auctionTitle, newHighestBid }) => {
    try {
      const io = getIO();
      const user = await User.findById(outbidUserId).select('email name').lean();
      if (!user) return;

      const title = '⚡ OUTBID ALERT: Retake Your Lead';
      const message = `Another collector just raised the bid to ₹${newHighestBid} on ${auctionTitle}. Jump back in before the timer expires!`;

      // In-app notification
      await Notification.create({
        userId: user._id,
        type: 'BID_OUTBID',
        title,
        message,
        data: { auctionId, link: `/auction/${auctionId}` },
        read: false,
      });

      // Targeted socket ping
      if (io) {
        io.to(`user:${user._id}`).emit('marketing:outbid', {
          auctionId,
          newHighestBid,
          message,
        });
      }

      // Quick email nudge
      sendMail({
        to: user.email,
        subject: `⚡ You've been outbid on ${auctionTitle}! (Lead: ₹${newHighestBid})`,
        text: message,
        html: `
          <div style="background-color: #08080A; color: #FFFFFF; font-family: sans-serif; padding: 24px; border-radius: 12px; border: 1px solid #FF4444;">
            <h3 style="color: #FF4444; margin-top: 0;">⚡ YOU HAVE BEEN OUTBID</h3>
            <p style="color: #DDDDDD; font-size: 14px;">A rival collector just placed ₹${newHighestBid} on <strong>${auctionTitle}</strong>.</p>
            <p style="color: #999999; font-size: 12px;">Only ₹10 more needed to seize the winning spot!</p>
            <a href="${env.CLIENT_URL}/auction/${auctionId}" style="display: inline-block; background-color: #D4AF37; color: #000000; font-weight: bold; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 12px;">RETAKE THE LEAD</a>
          </div>
        `,
      }).catch((err) => logger.warn('OUTBID_EMAIL_FAILED', err.message));
    } catch (err) {
      logger.error('OUTBID_NOTIFY_ERROR', err.message);
    }
  },

  /**
   * Fetch automated marketing and platform traction metrics
   */
  getMarketingStats: async () => {
    const [totalUsers, activeMembers, totalAuctions, totalBids] = await Promise.all([
      User.countDocuments({ role: 'COLLECTOR' }),
      User.countDocuments({ role: 'COLLECTOR', membershipStatus: 'ACTIVE' }),
      Auction.countDocuments(),
      Notification.countDocuments({ type: 'AUCTION_STARTED' }),
    ]);

    return {
      totalCollectors: totalUsers,
      activeMembers,
      conversionRate: totalUsers > 0 ? ((activeMembers / totalUsers) * 100).toFixed(1) + '%' : '0%',
      totalAuctions,
      campaignsSent: totalBids,
    };
  },
};

module.exports = marketingService;
