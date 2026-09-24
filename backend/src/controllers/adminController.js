const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Participant = require('../models/Participant');
const Order = require('../models/Order');
const MembershipPayment = require('../models/MembershipPayment');
const AuditLog = require('../models/AuditLog');
const { uploadToCloudinary } = require('../config/cloudinary');
const auditService = require('../services/auditService');
const emailService = require('../services/emailService');
const { maskEmail } = require('../utils/tokenUtils');

const adminController = {
  /**
   * Real MongoDB Metrics Dashboard - Zero Fake Numbers
   */
  getDashboardMetrics: async (req, res, next) => {
    try {
      const [
        totalUsers,
        verifiedUsers,
        activeMemberships,
        activeAuctions,
        liveAuctions,
        totalParticipants,
        totalBids,
        paymentPendingOrders,
        completedOrders,
        defaultedAuctions,
        membershipPayments,
        paidOrders,
      ] = await Promise.all([
        User.countDocuments({ role: 'USER' }),
        User.countDocuments({ emailVerified: true, role: 'USER' }),
        User.countDocuments({ membershipStatus: 'ACTIVE', auctionAccessStatus: 'ACTIVE' }),
        Auction.countDocuments({ status: { $in: ['UPCOMING', 'OPEN', 'LIVE'] } }),
        Auction.countDocuments({ status: 'LIVE' }),
        Participant.countDocuments(),
        Bid.countDocuments(),
        Order.countDocuments({ orderStatus: 'PAYMENT_PENDING' }),
        Order.countDocuments({ orderStatus: { $in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } }),
        Auction.countDocuments({ status: 'DEFAULTED' }),
        MembershipPayment.aggregate([
          { $match: { status: 'CAPTURED' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
        ]),
        Order.aggregate([
          { $match: { paymentStatus: 'PAID' } },
          { $group: { _id: null, totalSales: { $sum: '$winningBid' } } },
        ]),
      ]);

      const membershipRevenue = membershipPayments.length > 0 ? membershipPayments[0].totalRevenue : 0;
      const auctionSales = paidOrders.length > 0 ? paidOrders[0].totalSales : 0;

      res.status(200).json({
        success: true,
        metrics: {
          totalUsers,
          verifiedUsers,
          activeMemberships,
          activeAuctions,
          liveAuctions,
          totalParticipants,
          totalBids,
          paymentPendingOrders,
          completedOrders,
          defaultedAuctions,
          membershipRevenue,
          auctionSales,
          totalGrossVolume: membershipRevenue + auctionSales,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // PRODUCT MANAGEMENT
  // ==========================================

  getProducts: async (req, res, next) => {
    try {
      const products = await Product.find().sort({ createdAt: -1 });
      res.status(200).json({ success: true, products });
    } catch (error) {
      next(error);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const {
        name,
        styleId,
        description,
        category,
        brand,
        size,
        color,
        condition,
        startingPrice,
      } = req.body;

      if (!name || !styleId || !description || !category || !brand || startingPrice === undefined) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Name, Style ID, Description, Category, Brand, and Starting Price are required.',
        });
      }

      // Process uploaded images via Multer & Cloudinary
      let images = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const uploadResult = await uploadToCloudinary(file.buffer);
          images.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: images.length === 0,
          });
        }
      } else if (req.body.imageUrl) {
        // Support direct image URL input for convenience
        images.push({
          url: req.body.imageUrl,
          publicId: `url_${Date.now()}`,
          isPrimary: true,
        });
      }

      const product = await Product.create({
        name: name.trim(),
        styleId: styleId.trim().toUpperCase(),
        description: description.trim(),
        category,
        brand: brand.trim(),
        size: size || 'M',
        color: color || 'Black',
        condition: condition || 'Brand New',
        startingPrice: Number(startingPrice),
        images,
        active: true,
      });

      await auditService.log({
        actor: req.user,
        action: 'PRODUCT_CREATED',
        entity: 'Product',
        entityId: product._id,
        metadata: { styleId: product.styleId, name: product.name },
        req,
      });

      res.status(201).json({
        success: true,
        message: 'Product catalog item created successfully.',
        product,
      });
    } catch (error) {
      next(error);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Handle new image uploads if present
      if (req.files && req.files.length > 0) {
        const newImages = [];
        for (const file of req.files) {
          const uploadResult = await uploadToCloudinary(file.buffer);
          newImages.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          });
        }
        updates.$push = { images: { $each: newImages } };
      }

      const product = await Product.findByIdAndUpdate(id, updates, { new: true });
      if (!product) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found.' });
      }

      await auditService.log({
        actor: req.user,
        action: 'PRODUCT_UPDATED',
        entity: 'Product',
        entityId: product._id,
        req,
      });

      res.status(200).json({ success: true, message: 'Product updated.', product });
    } catch (error) {
      next(error);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      // Check if product is currently associated with an active auction
      const activeAuction = await Auction.findOne({
        productId: id,
        status: { $in: ['UPCOMING', 'OPEN', 'LIVE', 'PAYMENT_PENDING'] },
      });

      if (activeAuction) {
        return res.status(400).json({
          success: false,
          error: 'PRODUCT_IN_USE',
          message: 'Cannot delete product because it is currently assigned to an active auction.',
        });
      }

      await Product.findByIdAndDelete(id);

      await auditService.log({
        actor: req.user,
        action: 'PRODUCT_DELETED',
        entity: 'Product',
        entityId: id,
        req,
      });

      res.status(200).json({ success: true, message: 'Product deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // AUCTION MANAGEMENT
  // ==========================================

  getAuctions: async (req, res, next) => {
    try {
      const auctions = await Auction.find()
        .populate('productId')
        .populate('winnerId', 'name email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, auctions });
    } catch (error) {
      next(error);
    }
  },

  createAuction: async (req, res, next) => {
    try {
      const {
        productId,
        startingBid,
        bidIncrement = 10,
        participantLimit = 100,
        startTime,
        endTime,
      } = req.body;

      if (!productId || startingBid === undefined || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Product, Starting Bid, Start Time, and End Time are required.',
        });
      }

      const start = new Date(startTime);
      const end = new Date(endTime);

      // Business Rules & Validations
      if (end <= start) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_DATES',
          message: 'Auction End Time must be later than Start Time.',
        });
      }

      if (Number(startingBid) < 0) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STARTING_BID',
          message: 'Starting bid cannot be negative.',
        });
      }

      if (Number(bidIncrement) < 1) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_INCREMENT',
          message: 'Bid increment must be at least ₹1.',
        });
      }

      if (Number(participantLimit) < 1) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_PARTICIPANT_LIMIT',
          message: 'Participant limit must be at least 1.',
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Product not found.' });
      }

      // Determine initial status based on start time
      const now = new Date();
      let initialStatus = 'UPCOMING';
      if (now >= start && now < end) {
        initialStatus = 'LIVE';
      }

      const auction = await Auction.create({
        productId,
        startingBid: Number(startingBid),
        currentBid: Number(startingBid),
        bidIncrement: Number(bidIncrement),
        participantLimit: Number(participantLimit),
        participantCount: 0,
        startTime: start,
        endTime: end,
        status: initialStatus,
      });

      await auditService.log({
        actor: req.user,
        action: 'AUCTION_CREATED',
        entity: 'Auction',
        entityId: auction._id,
        metadata: { productId, startingBid, startTime: start, endTime: end },
        req,
      });

      res.status(201).json({
        success: true,
        message: 'Auction created successfully.',
        auction,
      });
    } catch (error) {
      next(error);
    }
  },

  updateAuction: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { startTime, endTime, status } = req.body;

      const auction = await Auction.findById(id);
      if (!auction) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Auction not found.' });
      }

      // Immutability rule: Bid history and currentBid cannot be manually edited by admin!
      if (req.body.currentBid !== undefined || req.body.bids !== undefined) {
        return res.status(400).json({
          success: false,
          error: 'IMMUTABLE_AUCTION_BIDS',
          message: 'Bid values and history are strictly immutable and cannot be manually modified by admins.',
        });
      }

      if (startTime) auction.startTime = new Date(startTime);
      if (endTime) auction.endTime = new Date(endTime);
      if (status && ['UPCOMING', 'OPEN', 'LIVE', 'CANCELLED'].includes(status)) {
        auction.status = status;
      }

      await auction.save();

      await auditService.log({
        actor: req.user,
        action: 'AUCTION_UPDATED',
        entity: 'Auction',
        entityId: auction._id,
        metadata: { status: auction.status },
        req,
      });

      res.status(200).json({ success: true, message: 'Auction updated successfully.', auction });
    } catch (error) {
      next(error);
    }
  },

  deleteAuction: async (req, res, next) => {
    try {
      const { id } = req.params;
      const auction = await Auction.findById(id);

      if (!auction) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Auction not found.' });
      }

      if (auction.status === 'LIVE') {
        return res.status(400).json({
          success: false,
          error: 'CANNOT_DELETE_LIVE',
          message: 'Cannot delete an auction while it is LIVE. You can cancel it instead.',
        });
      }

      await Auction.findByIdAndDelete(id);

      await auditService.log({
        actor: req.user,
        action: 'AUCTION_DELETED',
        entity: 'Auction',
        entityId: id,
        req,
      });

      res.status(200).json({ success: true, message: 'Auction deleted successfully.' });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  getUsers: async (req, res, next) => {
    try {
      const users = await User.find({ role: 'USER' })
        .select('-passwordHash')
        .sort({ createdAt: -1 });

      // Enrich users with participation & win counts
      const enrichedUsers = await Promise.all(
        users.map(async (u) => {
          const [auctionsJoined, auctionsWon] = await Promise.all([
            Participant.countDocuments({ userId: u._id }),
            Order.countDocuments({ userId: u._id }),
          ]);

          const userObj = u.toObject();
          userObj.maskedEmail = maskEmail(u.email);
          userObj.auctionsJoined = auctionsJoined;
          userObj.auctionsWon = auctionsWon;
          return userObj;
        })
      );

      res.status(200).json({ success: true, users: enrichedUsers });
    } catch (error) {
      next(error);
    }
  },

  toggleUserAccess: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { action } = req.body; // 'SUSPEND' or 'RESTORE'

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'User not found.' });
      }

      if (action === 'SUSPEND') {
        user.auctionAccessStatus = 'BLOCKED';
      } else if (action === 'RESTORE') {
        user.auctionAccessStatus = 'ACTIVE';
      } else {
        return res.status(400).json({ success: false, error: 'INVALID_ACTION', message: 'Action must be SUSPEND or RESTORE.' });
      }

      await user.save();

      await auditService.log({
        actor: req.user,
        action: action === 'SUSPEND' ? 'USER_SUSPENDED' : 'USER_RESTORED',
        entity: 'User',
        entityId: user._id,
        metadata: { newStatus: user.auctionAccessStatus },
        req,
      });

      res.status(200).json({
        success: true,
        message: `User access ${action === 'SUSPEND' ? 'suspended' : 'restored'} successfully.`,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // PAYMENT & MEMBERSHIP RECORDS
  // ==========================================

  getMembershipRecords: async (req, res, next) => {
    try {
      const memberships = await MembershipPayment.find()
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, memberships });
    } catch (error) {
      next(error);
    }
  },

  getAuctionPaymentRecords: async (req, res, next) => {
    try {
      const payments = await Order.find({ paymentStatus: 'PAID' })
        .populate('userId', 'name email phone')
        .populate('productId')
        .populate('auctionId')
        .sort({ paidAt: -1 });

      res.status(200).json({ success: true, payments });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // ORDER MANAGEMENT
  // ==========================================

  getOrders: async (req, res, next) => {
    try {
      const orders = await Order.find()
        .populate('userId', 'name email phone shippingAddress')
        .populate('productId')
        .populate('auctionId')
        .sort({ createdAt: -1 });

      res.status(200).json({ success: true, orders });
    } catch (error) {
      next(error);
    }
  },

  updateOrderStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { orderStatus, trackingInfo, notes } = req.body;

      const validStatuses = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(orderStatus)) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_STATUS',
          message: `Order status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const order = await Order.findById(id).populate('userId productId');
      if (!order) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Order not found.' });
      }

      const now = new Date();
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        changedAt: now,
        notes: notes || `Status updated to ${orderStatus} by Admin`,
        changedBy: req.user.email,
      });

      await order.save();

      // Trigger shipping / delivery emails
      if (orderStatus === 'SHIPPED') {
        emailService.sendOrderShippedEmail(order.userId, order.productId, order.orderId, trackingInfo).catch(() => {});
      } else if (orderStatus === 'DELIVERED') {
        emailService.sendOrderDeliveredEmail(order.userId, order.productId, order.orderId).catch(() => {});
      }

      await auditService.log({
        actor: req.user,
        action: 'ORDER_STATUS_UPDATED',
        entity: 'Order',
        entityId: order._id,
        metadata: { newStatus: orderStatus, trackingInfo },
        req,
      });

      res.status(200).json({ success: true, message: `Order status updated to ${orderStatus}`, order });
    } catch (error) {
      next(error);
    }
  },

  // ==========================================
  // AUDIT LOGS & SETTINGS
  // ==========================================

  getAuditLogs: async (req, res, next) => {
    try {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      res.status(200).json({ success: true, logs });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminController;
