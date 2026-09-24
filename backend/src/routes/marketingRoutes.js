const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const marketingService = require('../services/marketingService');
const Auction = require('../models/Auction');

/**
 * @route   GET /api/marketing/ticker-items
 * @desc    Get live drop highlights for public real-time ticker
 * @access  Public
 */
router.get('/ticker-items', async (req, res) => {
  try {
    const liveAuctions = await Auction.find({ status: { $in: ['LIVE', 'UPCOMING'] } })
      .populate('productId', 'name styleId')
      .sort({ startTime: 1 })
      .limit(5)
      .lean();

    const tickerData = liveAuctions.map((a) => ({
      id: a._id,
      name: a.productId?.name || 'Archival Drop',
      currentPrice: a.currentPrice || a.startingBid,
      participantsCount: a.participants?.length || 0,
      participantLimit: a.participantLimit || 100,
      status: a.status,
      startTime: a.startTime,
    }));

    res.json({ success: true, items: tickerData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   GET /api/marketing/stats
 * @desc    Get marketing conversion metrics
 * @access  Admin only
 */
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const stats = await marketingService.getMarketingStats();
    res.json({ success: true, stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @route   POST /api/marketing/broadcast
 * @desc    1-Click Drop Announcement Broadcast to all verified collectors
 * @access  Admin only
 */
router.post('/broadcast', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { auctionId, subject, customMessage } = req.body;
    if (!auctionId) {
      return res.status(400).json({ success: false, error: 'auctionId is required' });
    }

    const result = await marketingService.broadcastDropAnnouncement({
      auctionId,
      subject,
      customMessage,
    });

    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
