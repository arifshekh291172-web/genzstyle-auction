const User = require('../models/User');
const Participant = require('../models/Participant');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const Auction = require('../models/Auction');
const notificationService = require('../services/notificationService');

const userController = {
  /**
   * Get Current User Profile & Membership Health
   */
  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'USER_NOT_FOUND', message: 'User not found' });
      }

      // Calculate days remaining
      let daysRemaining = 0;
      if (user.membershipExpiresAt) {
        const diffTime = new Date(user.membershipExpiresAt).getTime() - Date.now();
        daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      }

      res.status(200).json({
        success: true,
        user,
        membership: {
          status: user.membershipStatus,
          auctionAccessStatus: user.auctionAccessStatus,
          activatedAt: user.membershipActivatedAt,
          expiresAt: user.membershipExpiresAt,
          daysRemaining,
          forfeitedCount: user.forfeitedMembershipCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update Profile Details & Shipping Address
   */
  updateMe: async (req, res, next) => {
    try {
      const { name, phone, shippingAddress } = req.body;
      const user = await User.findById(req.user._id);

      if (name) user.name = name.trim();
      if (phone) user.phone = phone.trim();
      if (shippingAddress) {
        user.shippingAddress = {
          fullName: shippingAddress.fullName || user.shippingAddress?.fullName || '',
          phone: shippingAddress.phone || user.shippingAddress?.phone || '',
          street: shippingAddress.street || user.shippingAddress?.street || '',
          city: shippingAddress.city || user.shippingAddress?.city || '',
          state: shippingAddress.state || user.shippingAddress?.state || '',
          pinCode: shippingAddress.pinCode || user.shippingAddress?.pinCode || '',
        };
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Auctions Joined By Current User
   */
  getMyAuctions: async (req, res, next) => {
    try {
      const { status } = req.query; // UPCOMING, LIVE, COMPLETED
      const participations = await Participant.find({ userId: req.user._id }).select('auctionId joinedAt');
      const auctionIds = participations.map((p) => p.auctionId);

      let query = { _id: { $in: auctionIds } };
      if (status) {
        if (status === 'COMPLETED') {
          query.status = { $in: ['ENDED', 'PAYMENT_PENDING', 'COMPLETED', 'DEFAULTED'] };
        } else {
          query.status = status;
        }
      }

      const auctions = await Auction.find(query)
        .populate('productId')
        .sort({ startTime: -1 });

      res.status(200).json({
        success: true,
        auctions,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Bids Placed by Current User
   */
  getMyBids: async (req, res, next) => {
    try {
      const bids = await Bid.find({ userId: req.user._id })
        .populate({
          path: 'auctionId',
          populate: { path: 'productId' },
        })
        .sort({ createdAt: -1 })
        .limit(100);

      res.status(200).json({
        success: true,
        bids,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Current User Orders (Won Auctions)
   */
  getMyOrders: async (req, res, next) => {
    try {
      const { status } = req.query;
      let query = { userId: req.user._id };
      if (status) {
        query.orderStatus = status;
      }

      const orders = await Order.find(query)
        .populate('productId')
        .populate('auctionId')
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get User Notifications
   */
  getMyNotifications: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '30', 10);

      const result = await notificationService.getUserNotifications(req.user._id, limit, page);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark Notification as Read
   */
  markNotificationRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await notificationService.markAsRead(req.user._id, id);
      res.status(200).json({
        success: true,
        notification: updated,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark All Notifications as Read
   */
  markAllNotificationsRead: async (req, res, next) => {
    try {
      await notificationService.markAllAsRead(req.user._id);
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
