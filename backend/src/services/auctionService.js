const mongoose = require('mongoose');
const Auction = require('../models/Auction');
const Participant = require('../models/Participant');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const socketService = require('./socketService');
const notificationService = require('./notificationService');
const emailService = require('./emailService');
const auditService = require('./auditService');
const logger = require('../utils/logger');
const { maskBidderId } = require('../utils/tokenUtils');

const auctionService = {
  /**
   * ATOMIC AUCTION JOINING WITH STRICT 100-PARTICIPANT ENFORCEMENT
   */
  joinAuction: async (auctionId, user) => {
    // 1. Authenticated & Email Verified
    if (!user.emailVerified) {
      const error = new Error('Your email address has not been verified.');
      error.statusCode = 403;
      error.errorCode = 'EMAIL_NOT_VERIFIED';
      throw error;
    }

    // 2. Membership active & not expired
    if (!user.hasValidMembership()) {
      const error = new Error(
        user.membershipStatus === 'EXPIRED'
          ? 'Your membership has expired. Please renew for ₹49.'
          : 'Active GENZSTYLE membership is required to join auctions.'
      );
      error.statusCode = 403;
      error.errorCode = user.membershipStatus === 'EXPIRED' ? 'MEMBERSHIP_EXPIRED' : 'MEMBERSHIP_REQUIRED';
      throw error;
    }

    // 3. Auction access status ACTIVE (no payment defaults)
    if (user.auctionAccessStatus !== 'ACTIVE') {
      const error = new Error(
        'Your auction access is currently paused because a previous winning payment expired.'
      );
      error.statusCode = 403;
      error.errorCode = 'ACCESS_BLOCKED';
      throw error;
    }

    // 4. Fetch auction & check joinability
    const auction = await Auction.findById(auctionId).populate('productId');
    if (!auction) {
      const error = new Error('Auction not found.');
      error.statusCode = 404;
      error.errorCode = 'AUCTION_NOT_FOUND';
      throw error;
    }

    if (!['UPCOMING', 'OPEN'].includes(auction.status)) {
      const error = new Error(`Auction is not currently open for joining (Status: ${auction.status}).`);
      error.statusCode = 400;
      error.errorCode = 'AUCTION_NOT_OPEN';
      throw error;
    }

    if (auction.participantCount >= auction.participantLimit) {
      const error = new Error(`This auction has reached its ${auction.participantLimit} participant limit.`);
      error.statusCode = 400;
      error.errorCode = 'AUCTION_FULL';
      throw error;
    }

    // 5. Atomic reservation & duplicate prevention
    // Step A: Insert into Participant collection with unique compound index (auctionId + userId)
    let participant;
    try {
      participant = await Participant.create({
        auctionId,
        userId: user._id,
        joinedAt: new Date(),
      });
    } catch (err) {
      if (err.code === 11000) {
        const error = new Error('You have already joined this auction.');
        error.statusCode = 400;
        error.errorCode = 'ALREADY_JOINED';
        throw error;
      }
      throw err;
    }

    // Step B: Atomically increment participantCount strictly while < participantLimit
    const updatedAuction = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        participantCount: { $lt: auction.participantLimit },
        status: { $in: ['UPCOMING', 'OPEN'] },
      },
      {
        $inc: { participantCount: 1 },
      },
      { new: true }
    );

    // If update returned null, the slot was grabbed concurrently!
    if (!updatedAuction) {
      // Rollback participant document
      await Participant.deleteOne({ _id: participant._id });
      const error = new Error(`This auction has reached its ${auction.participantLimit} participant limit.`);
      error.statusCode = 400;
      error.errorCode = 'AUCTION_FULL';
      throw error;
    }

    // If auction reached 100 participants, update status to FULL
    if (updatedAuction.participantCount >= updatedAuction.participantLimit && updatedAuction.status === 'OPEN') {
      updatedAuction.status = 'FULL';
      await updatedAuction.save();
    }

    // Audit log
    await auditService.log({
      actor: user,
      action: 'AUCTION_JOINED',
      entity: 'Auction',
      entityId: auctionId,
      metadata: { participantCount: updatedAuction.participantCount },
    });

    // Send confirmation email asynchronously
    if (auction.productId) {
      emailService.sendAuctionJoinedEmail(user, updatedAuction, auction.productId).catch(() => {});
    }

    return {
      success: true,
      participantCount: updatedAuction.participantCount,
      participantLimit: updatedAuction.participantLimit,
      status: updatedAuction.status,
    };
  },

  /**
   * ATOMIC BID PLACEMENT WITH CONCURRENCY CONTROL
   */
  placeBid: async (auctionId, user) => {
    // 1. Verify user can bid
    if (!user.emailVerified || !user.hasValidMembership() || user.auctionAccessStatus !== 'ACTIVE') {
      const error = new Error('Active membership and verified email required to place bids.');
      error.statusCode = 403;
      error.errorCode = 'MEMBERSHIP_REQUIRED';
      throw error;
    }

    // 2. User must have joined the auction
    const hasJoined = await Participant.exists({ auctionId, userId: user._id });
    if (!hasJoined) {
      const error = new Error('You must join this auction before placing a bid.');
      error.statusCode = 403;
      error.errorCode = 'NOT_A_PARTICIPANT';
      throw error;
    }

    // 3. Retrieve current auction state
    const auction = await Auction.findById(auctionId).populate('productId');
    if (!auction) {
      const error = new Error('Auction not found.');
      error.statusCode = 404;
      error.errorCode = 'AUCTION_NOT_FOUND';
      throw error;
    }

    if (auction.status !== 'LIVE') {
      const error = new Error(`Bidding is only accepted while auction is LIVE (Current Status: ${auction.status}).`);
      error.statusCode = 400;
      error.errorCode = 'AUCTION_NOT_LIVE';
      throw error;
    }

    const now = new Date();
    if (now > auction.endTime) {
      const error = new Error('Auction bidding period has concluded.');
      error.statusCode = 400;
      error.errorCode = 'AUCTION_ENDED';
      throw error;
    }

    // Calculate expected next bid
    const previousBidAmount = auction.currentBid;
    const bidIncrement = auction.bidIncrement || 10;
    const expectedNextBid = previousBidAmount + bidIncrement;

    // Find previous highest bidder before atomic update
    const previousHighestBid = await Bid.findOne({ auctionId }).sort({ amount: -1 });

    if (previousHighestBid && previousHighestBid.userId.toString() === user._id.toString()) {
      const error = new Error('You are already the highest bidder.');
      error.statusCode = 400;
      error.errorCode = 'ALREADY_HIGHEST_BIDDER';
      throw error;
    }

    // 4. ATOMIC OPTIMISTIC CONCURRENCY UPDATE
    // The currentBid must EXACTLY match previousBidAmount
    const updateResult = await Auction.findOneAndUpdate(
      {
        _id: auctionId,
        currentBid: previousBidAmount,
        status: 'LIVE',
      },
      {
        $set: { currentBid: expectedNextBid },
      },
      { new: true }
    );

    // If updateResult is null, another participant placed the bid first!
    if (!updateResult) {
      // Re-fetch the latest bid to inform the user
      const freshAuction = await Auction.findById(auctionId);
      const freshCurrentBid = freshAuction ? freshAuction.currentBid : previousBidAmount;
      const freshNextBid = freshCurrentBid + (freshAuction ? freshAuction.bidIncrement : 10);

      logger.bidConflict('Simultaneous bid rejected due to price increment collision', {
        auctionId,
        userId: user._id,
        attemptedBid: expectedNextBid,
        actualCurrentBid: freshCurrentBid,
      });

      const error = new Error(
        `Another participant placed the bid first. The current bid is now ₹${freshCurrentBid.toLocaleString('en-IN')}.`
      );
      error.statusCode = 409;
      error.errorCode = 'BID_CHANGED';
      error.currentBid = freshCurrentBid;
      error.nextBid = freshNextBid;
      throw error;
    }

    // 5. Record immutable Bid document with serverTimestamp
    const bidRecord = await Bid.create({
      auctionId,
      userId: user._id,
      amount: expectedNextBid,
      serverTimestamp: new Date(),
    });

    const totalBids = await Bid.countDocuments({ auctionId });
    const maskedBidder = maskBidderId(user._id);

    // 6. Real-time broadcast to room auction:{auctionId}
    const broadcastPayload = {
      auctionId: auctionId.toString(),
      bidderId: maskedBidder,
      amount: expectedNextBid,
      currentBid: expectedNextBid,
      nextBid: expectedNextBid + bidIncrement,
      timestamp: bidRecord.serverTimestamp,
      bidCount: totalBids,
    };

    socketService.broadcastBidPlaced(auctionId, broadcastPayload);

    // 7. Outbid notification to previous highest bidder
    if (previousHighestBid && previousHighestBid.userId.toString() !== user._id.toString()) {
      const outbidUserId = previousHighestBid.userId;
      const outbidUser = await User.findById(outbidUserId);

      if (outbidUser) {
        socketService.sendUserOutbid(outbidUserId, {
          auctionId: auctionId.toString(),
          productName: auction.productId ? auction.productId.name : 'Exclusive Drop',
          currentBid: expectedNextBid,
          nextBid: expectedNextBid + bidIncrement,
        });

        notificationService.createNotification({
          userId: outbidUserId,
          type: 'OUTBID',
          title: "You've been outbid!",
          message: `A new bid of ₹${expectedNextBid.toLocaleString('en-IN')} was placed on ${
            auction.productId ? auction.productId.name : 'the auction'
          }.`,
          data: {
            auctionId,
            bidAmount: expectedNextBid,
            nextBid: expectedNextBid + bidIncrement,
          },
        });
      }
    }

    return {
      success: true,
      currentBid: expectedNextBid,
      nextBid: expectedNextBid + bidIncrement,
      bidCount: totalBids,
      timestamp: bidRecord.serverTimestamp,
    };
  },

  /**
   * END EXPIRED AUCTION & SELECT WINNER & CREATE 48-HR PAYMENT ORDER
   */
  endAuctionAndSelectWinner: async (auctionId) => {
    const auction = await Auction.findById(auctionId).populate('productId');
    if (!auction || !['LIVE', 'FULL', 'OPEN'].includes(auction.status)) {
      return null;
    }

    const highestBid = await Bid.findOne({ auctionId }).sort({ amount: -1 });

    if (highestBid) {
      const winnerId = highestBid.userId;
      const winningAmount = highestBid.amount;
      const now = new Date();
      const paymentDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 Hours

      auction.status = 'PAYMENT_PENDING';
      auction.winnerId = winnerId;
      auction.winningBid = winningAmount;
      auction.winnerSelectedAt = now;
      auction.paymentDeadline = paymentDeadline;
      await auction.save();

      // Create Order
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const order = await Order.create({
        orderId,
        auctionId,
        productId: auction.productId._id,
        userId: winnerId,
        winningBid: winningAmount,
        paymentStatus: 'PAYMENT_PENDING',
        orderStatus: 'PAYMENT_PENDING',
        paymentDeadline,
        statusHistory: [
          {
            status: 'PAYMENT_PENDING',
            changedAt: now,
            notes: 'Auction won. 48-hour payment window initiated.',
            changedBy: 'SYSTEM',
          },
        ],
      });

      const winnerUser = await User.findById(winnerId);
      if (winnerUser) {
        // In-app Notification
        await notificationService.createNotification({
          userId: winnerId,
          type: 'AUCTION_WON',
          title: 'Congratulations! You Won the Drop',
          message: `You won ${auction.productId ? auction.productId.name : 'Exclusive Piece'} with a bid of ₹${winningAmount}. Complete payment within 48 hours.`,
          data: { auctionId, orderId, winningBid: winningAmount },
        });

        // Email Notification
        emailService
          .sendAuctionWonEmail(winnerUser, auction.productId, winningAmount, paymentDeadline, orderId)
          .catch(() => {});
      }

      // Broadcast auction ended to room
      socketService.broadcastAuctionEnded(auctionId, {
        auctionId: auctionId.toString(),
        winnerMasked: maskBidderId(winnerId),
        winningBid: winningAmount,
        status: 'PAYMENT_PENDING',
      });

      logger.auctionTransition(auctionId, 'LIVE', 'PAYMENT_PENDING', {
        winnerId,
        winningAmount,
        orderId,
      });

      return { auction, order };
    } else {
      // No bids were placed
      auction.status = 'ENDED';
      await auction.save();

      socketService.broadcastAuctionEnded(auctionId, {
        auctionId: auctionId.toString(),
        winnerMasked: null,
        winningBid: null,
        status: 'ENDED',
      });

      logger.auctionTransition(auctionId, 'LIVE', 'ENDED', { reason: 'No bids placed' });
      return { auction, order: null };
    }
  },

  /**
   * DETECT AND HANDLE EXPIRED WINNER PAYMENTS (48-HOUR DEFAULT)
   */
  processExpiredPayments: async () => {
    const now = new Date();
    const expiredOrders = await Order.find({
      paymentStatus: 'PAYMENT_PENDING',
      paymentDeadline: { $lt: now },
    }).populate('productId userId auctionId');

    let processedCount = 0;

    for (const order of expiredOrders) {
      order.paymentStatus = 'EXPIRED';
      order.orderStatus = 'DEFAULTED';
      order.statusHistory.push({
        status: 'DEFAULTED',
        changedAt: now,
        notes: '48-hour payment deadline expired without receipt of payment.',
        changedBy: 'CRON_SCHEDULER',
      });
      await order.save();

      // Update Auction
      if (order.auctionId) {
        await Auction.findByIdAndUpdate(order.auctionId, { status: 'DEFAULTED' });
      }

      // Block User Access and Forfeit Membership Fee
      const user = await User.findById(order.userId);
      if (user) {
        user.auctionAccessStatus = 'BLOCKED';
        user.membershipStatus = 'FORFEITED';
        user.forfeitedMembershipCount = (user.forfeitedMembershipCount || 0) + 1;
        await user.save();

        // Notification
        await notificationService.createNotification({
          userId: user._id,
          type: 'PAYMENT_EXPIRED',
          title: 'Auction Access Paused: Payment Deadline Expired',
          message: `The 48-hour deadline to pay ₹${order.winningBid} for ${
            order.productId ? order.productId.name : 'the drop'
          } expired. Auction access is paused.`,
          data: { orderId: order.orderId, auctionId: order.auctionId },
        });

        // Email
        emailService.sendPaymentExpiredEmail(user, order.productId, order.winningBid).catch(() => {});
      }

      processedCount++;
    }

    if (processedCount > 0) {
      logger.scheduledJob('Payment Expiration Check', 'Processed Defaults', { processedCount });
    }

    return processedCount;
  },
};

module.exports = auctionService;
