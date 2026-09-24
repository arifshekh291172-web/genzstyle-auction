const express = require('express');
const auctionController = require('../controllers/auctionController');
const { authenticate } = require('../middleware/auth');
const { bidLimiter } = require('../middleware/rateLimiter');
const { verifyJwtToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const router = express.Router();

// Middleware: Optional authentication (attaches req.user if valid token provided, but doesn't block guests)
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = verifyJwtToken(token);
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (e) {
        // Token invalid or expired: proceed as guest
      }
    }
    next();
  } catch (err) {
    next();
  }
};

// GET /api/auctions (Public with optional user state)
router.get('/', optionalAuth, auctionController.getAuctions);

// GET /api/auctions/:id (Public with optional user state)
router.get('/:id', optionalAuth, auctionController.getAuctionById);

// GET /api/auctions/:id/bids (Public)
router.get('/:id/bids', optionalAuth, auctionController.getAuctionBids);

// POST /api/auctions/:id/join (Protected: Requires active membership & verified email)
router.post('/:id/join', authenticate, auctionController.joinAuction);

// POST /api/auctions/:id/bid (Protected: Requires participant status & active membership)
router.post('/:id/bid', authenticate, bidLimiter, auctionController.placeBid);

module.exports = router;
