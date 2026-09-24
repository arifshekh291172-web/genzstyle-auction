const Auction = require('../models/Auction');
const Product = require('../models/Product');
const Bid = require('../models/Bid');
const Participant = require('../models/Participant');
const auctionService = require('../services/auctionService');
const { maskBidderId } = require('../utils/tokenUtils');

const auctionController = {
  /**
   * Get Auctions with Filtering, Searching, and Status Segregation
   */
  getAuctions: async (req, res, next) => {
    try {
      const { status, category, search, page = 1, limit = 20 } = req.query;
      const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

      let productQuery = { active: true };
      if (category && category !== 'All') {
        productQuery.category = category;
      }
      if (search) {
        productQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { styleId: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
        ];
      }

      const matchingProducts = await Product.find(productQuery).select('_id');
      const productIds = matchingProducts.map((p) => p._id);

      let auctionQuery = { productId: { $in: productIds } };
      if (status) {
        if (status === 'ACTIVE') {
          auctionQuery.status = { $in: ['UPCOMING', 'OPEN', 'LIVE'] };
        } else if (status === 'COMPLETED') {
          auctionQuery.status = { $in: ['ENDED', 'PAYMENT_PENDING', 'COMPLETED', 'DEFAULTED'] };
        } else {
          auctionQuery.status = status;
        }
      }

      const [auctions, total] = await Promise.all([
        Auction.find(auctionQuery)
          .populate('productId')
          .sort({ startTime: 1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit, 10)),
        Auction.countDocuments(auctionQuery),
      ]);

      // If user is authenticated, check which auctions they have already joined
      let joinedMap = {};
      if (req.user) {
        const joined = await Participant.find({
          userId: req.user._id,
          auctionId: { $in: auctions.map((a) => a._id) },
        }).select('auctionId');
        joined.forEach((j) => {
          joinedMap[j.auctionId.toString()] = true;
        });
      }

      const formattedAuctions = auctions.map((a) => {
        const doc = a.toObject();
        doc.hasJoined = Boolean(joinedMap[a._id.toString()]);
        doc.nextBid = a.currentBid + (a.bidIncrement || 10);
        return doc;
      });

      res.status(200).json({
        success: true,
        auctions: formattedAuctions,
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Auction Details by ID with Live Synchronized State
   */
  getAuctionById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const auction = await Auction.findById(id).populate('productId');

      if (!auction) {
        return res.status(404).json({
          success: false,
          error: 'AUCTION_NOT_FOUND',
          message: 'Auction not found.',
        });
      }

      // Check participation
      let hasJoined = false;
      let isHighestBidder = false;

      if (req.user) {
        const participant = await Participant.exists({ auctionId: id, userId: req.user._id });
        hasJoined = Boolean(participant);
      }

      // Fetch top bids with masked identity
      const bids = await Bid.find({ auctionId: id })
        .sort({ amount: -1 })
        .limit(50)
        .lean();

      if (bids.length > 0 && req.user) {
        isHighestBidder = bids[0].userId.toString() === req.user._id.toString();
      }

      const maskedBids = bids.map((b) => ({
        _id: b._id,
        amount: b.amount,
        bidderId: maskBidderId(b.userId),
        isCurrentUser: req.user ? b.userId.toString() === req.user._id.toString() : false,
        timestamp: b.serverTimestamp,
        createdAt: b.createdAt,
      }));

      const nextBid = auction.currentBid + (auction.bidIncrement || 10);

      res.status(200).json({
        success: true,
        auction: {
          ...auction.toObject(),
          nextBid,
          hasJoined,
          isHighestBidder,
          serverTime: new Date(),
        },
        bids: maskedBids,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Join Auction (Atomic 100-Participant Reservation)
   */
  joinAuction: async (req, res, next) => {
    try {
      const result = await auctionService.joinAuction(req.params.id, req.user);
      res.status(200).json({
        success: true,
        message: 'Successfully reserved your seat for this auction!',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Place Bid with Atomic Concurrency Check (Fixed ₹10 increment, server calculated)
   */
  placeBid: async (req, res, next) => {
    try {
      const result = await auctionService.placeBid(req.params.id, req.user);
      res.status(200).json({
        success: true,
        message: `Bid placed successfully for ₹${result.currentBid.toLocaleString('en-IN')}`,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get Auction Bid History
   */
  getAuctionBids: async (req, res, next) => {
    try {
      const { id } = req.params;
      const bids = await Bid.find({ auctionId: id })
        .sort({ amount: -1 })
        .limit(100)
        .lean();

      const maskedBids = bids.map((b) => ({
        _id: b._id,
        amount: b.amount,
        bidderId: maskBidderId(b.userId),
        isCurrentUser: req.user ? b.userId.toString() === req.user._id.toString() : false,
        timestamp: b.serverTimestamp,
      }));

      res.status(200).json({
        success: true,
        bids: maskedBids,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = auctionController;
