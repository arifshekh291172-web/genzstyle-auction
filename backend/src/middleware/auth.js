const { verifyJwtToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_REQUIRED',
        message: 'Authentication required to access this resource.',
      });
    }

    let decoded;
    try {
      decoded = verifyJwtToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Your session has expired or is invalid. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Account not found.',
      });
    }

    // Check membership expiration dynamically
    if (
      user.membershipStatus === 'ACTIVE' &&
      user.membershipExpiresAt &&
      new Date() > new Date(user.membershipExpiresAt)
    ) {
      user.membershipStatus = 'EXPIRED';
      user.auctionAccessStatus = 'BLOCKED';
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
};
