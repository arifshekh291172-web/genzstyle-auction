const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const env = require('../config/env');

/**
 * Generate a cryptographically secure random token (hex string)
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Hash a plain token using SHA-256 for safe storage in the database
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a signed JWT token
 */
const generateJwtToken = (userId, role = 'USER') => {
  return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT token
 */
const verifyJwtToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Mask bidder identity to preserve privacy while maintaining competitive excitement
 * e.g., creates "USER #A92" from userId
 */
const maskBidderId = (userId) => {
  if (!userId) return 'USER #000';
  const str = userId.toString();
  // Hash the userId or pick deterministic letters/numbers
  const hash = crypto.createHash('md5').update(str).digest('hex').toUpperCase();
  const letter = String.fromCharCode(65 + (hash.charCodeAt(0) % 26)); // A-Z
  const num = hash.substring(1, 4); // 3 digits
  return `USER #${letter}${num}`;
};

/**
 * Mask an email address for admin overview: "a***d@domain.com"
 */
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return '***@***.com';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 */
const generateOtp = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[bytes[i] % 10];
  }
  return otp;
};

module.exports = {
  generateRandomToken,
  generateOtp,
  hashToken,
  generateJwtToken,
  verifyJwtToken,
  maskBidderId,
  maskEmail,
};

