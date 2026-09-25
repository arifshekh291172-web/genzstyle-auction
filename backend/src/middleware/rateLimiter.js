const rateLimit = require('express-rate-limit');

/**
 * Standard API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP. Please try again after a few minutes.',
  },
});

/**
 * Strict Auth Limiter for Login
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'RATE_LIMIT_LOGIN',
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
});

/**
 * Strict Signup Limiter
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 accounts per hour per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'RATE_LIMIT_SIGNUP',
    message: 'Too many accounts created from this IP. Please try again later.',
  },
});

/**
 * Verification & Password Reset Email Limiter
 */
const emailActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'RATE_LIMIT_EMAIL',
    message: 'Too many email requests. Please wait a few minutes before trying again.',
  },
});

/**
 * Bidding Endpoint Limiter: Allows rapid bidding in active auction, but prevents automated DDoS script flood
 */
const bidLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 5, // max 5 bids per second per IP
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false },
  message: {
    success: false,
    error: 'RATE_LIMIT_BID',
    message: 'Bidding too fast. Please wait a fraction of a second.',
  },
});

module.exports = {
  apiLimiter,
  loginLimiter,
  signupLimiter,
  emailActionLimiter,
  bidLimiter,
};
