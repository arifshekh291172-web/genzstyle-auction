const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validateRequest } = require('../middleware/validator');
const { loginLimiter, signupLimiter, emailActionLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/signup
router.post(
  '/signup',
  signupLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required.'),
  ],
  validateRequest,
  authController.signup
);

// POST /api/auth/verify-email
router.post(
  '/verify-email',
  [body('token').trim().notEmpty().withMessage('Verification token is required.')],
  validateRequest,
  authController.verifyEmail
);

// POST /api/auth/resend-verification
router.post(
  '/resend-verification',
  emailActionLimiter,
  [body('email').isEmail().withMessage('Valid email is required.').normalizeEmail()],
  validateRequest,
  authController.resendVerification
);

// POST /api/auth/login
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required.').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateRequest,
  authController.login
);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  emailActionLimiter,
  [body('email').isEmail().withMessage('Valid email is required.').normalizeEmail()],
  validateRequest,
  authController.forgotPassword
);

// POST /api/auth/reset-password
router.post(
  '/reset-password',
  [
    body('token').trim().notEmpty().withMessage('Reset token is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('confirmPassword').notEmpty().withMessage('Confirm password is required.'),
  ],
  validateRequest,
  authController.resetPassword
);

module.exports = router;
