const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateRandomToken, generateOtp, hashToken, generateJwtToken } = require('../utils/tokenUtils');
const emailService = require('../services/emailService');
const auditService = require('../services/auditService');
const logger = require('../utils/logger');

const authController = {
  /**
   * User Registration with 6-Digit Email OTP and Terms & Conditions Enforcement
   */
  signup: async (req, res, next) => {
    try {
      const { name, email, phone, password, confirmPassword, acceptedTerms } = req.body;

      if (!name || !email || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'All fields (Name, Email, Password, Confirm Password) are required.',
        });
      }

      // Mandatory Terms & Conditions acceptance
      if (!acceptedTerms) {
        return res.status(400).json({
          success: false,
          error: 'TERMS_REQUIRED',
          message: 'You must review and accept the GENZSTYLE Terms & Conditions to create an account.',
        });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'PASSWORDS_DO_NOT_MATCH',
          message: 'Password confirmation does not match.',
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check unique email
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        });
      }

      // Hash password securely with bcrypt
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      // Generate verification token and 6-digit OTP
      const rawVerificationToken = generateRandomToken(32);
      const emailVerificationTokenHash = hashToken(rawVerificationToken);
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const rawOtp = generateOtp(6);
      const emailVerificationOtpHash = hashToken(rawOtp);
      const emailVerificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? phone.trim() : '',
        passwordHash,
        emailVerified: false,
        emailVerificationTokenHash,
        emailVerificationExpires,
        emailVerificationOtpHash,
        emailVerificationOtpExpires,
        acceptedTerms: true,
        termsAcceptedAt: new Date(),
        role: 'USER',
        membershipStatus: 'INACTIVE',
        auctionAccessStatus: 'BLOCKED',
      });

      console.log(`\n==================================================`);
      console.log(`[VERIFICATION OTP] For: ${normalizedEmail}`);
      console.log(`>>> OTP CODE: ${rawOtp} <<< (Expires in 15 mins)`);
      console.log(`==================================================\n`);

      // Send verification email with 6-digit OTP and direct link
      try {
        await emailService.sendVerificationEmail(user, rawVerificationToken, rawOtp);
      } catch (err) {
        logger.error('EMAIL_DISPATCH_FAILED', `Failed to send verification email: ${err.message}`);
      }

      // Audit log
      await auditService.log({
        actor: user,
        action: 'USER_SIGNUP',
        entity: 'User',
        entityId: user._id,
        req,
      });

      res.status(201).json({
        success: true,
        message: 'Account created. We sent a 6-digit verification code to your email.',
        email: normalizedEmail,
        userId: user._id,
        previewOtp: rawOtp,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify Email via 6-digit OTP or link Token
   */
  verifyEmail: async (req, res, next) => {
    try {
      const { token, otp, email, code } = req.body;

      let lookupToken = token;
      let lookupOtp = otp;

      // Handle unified code input if provided
      if (code) {
        const cleanCode = String(code).trim();
        if (/^\d{6}$/.test(cleanCode)) {
          lookupOtp = cleanCode;
        } else {
          lookupToken = cleanCode;
        }
      }

      if (!lookupToken && !lookupOtp) {
        return res.status(400).json({
          success: false,
          error: 'CODE_REQUIRED',
          message: 'Please provide either the 6-digit OTP or verification token.',
        });
      }

      let user = null;

      if (lookupToken) {
        const hashedToken = hashToken(lookupToken);
        user = await User.findOne({
          emailVerificationTokenHash: hashedToken,
          emailVerificationExpires: { $gt: new Date() },
        });
      } else if (lookupOtp) {
        const cleanOtp = String(lookupOtp).trim();
        const hashedOtp = hashToken(cleanOtp);
        const query = {
          emailVerificationOtpHash: hashedOtp,
          emailVerificationOtpExpires: { $gt: new Date() },
        };
        if (email) {
          query.email = email.toLowerCase().trim();
        }
        user = await User.findOne(query);
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_OR_EXPIRED_CODE',
          message: 'The verification code or token is invalid or has expired. Please check your email or request a new OTP.',
        });
      }

      user.emailVerified = true;
      user.emailVerificationTokenHash = null;
      user.emailVerificationExpires = null;
      user.emailVerificationOtpHash = null;
      user.emailVerificationOtpExpires = null;
      await user.save();

      const jwtToken = generateJwtToken(user._id, user.role);

      await auditService.log({
        actor: user,
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: user._id,
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Account successfully verified! You can now access your dashboard and activate VIP membership.',
        token: jwtToken,
        user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Resend Verification OTP & Token
   */
  resendVerification: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'EMAIL_REQUIRED',
          message: 'Email is required.',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });

      // Always return success message to avoid account enumeration
      if (!user || user.emailVerified) {
        return res.status(200).json({
          success: true,
          message: 'If the email exists and is unverified, a new verification code has been sent.',
        });
      }

      const rawVerificationToken = generateRandomToken(32);
      const rawOtp = generateOtp(6);

      user.emailVerificationTokenHash = hashToken(rawVerificationToken);
      user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      user.emailVerificationOtpHash = hashToken(rawOtp);
      user.emailVerificationOtpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      console.log(`\n==================================================`);
      console.log(`[VERIFICATION OTP RESENT] For: ${user.email}`);
      console.log(`>>> NEW OTP CODE: ${rawOtp} <<< (Expires in 15 mins)`);
      console.log(`==================================================\n`);

      try {
        await emailService.sendVerificationEmail(user, rawVerificationToken, rawOtp);
      } catch (err) {
        logger.error('EMAIL_DISPATCH_FAILED', `Failed to resend verification email: ${err.message}`);
      }

      res.status(200).json({
        success: true,
        message: 'A new 6-digit verification code has been dispatched to your email.',
        previewOtp: rawOtp,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Real Login with Bcrypt and Email Verification Check
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_CREDENTIALS',
          message: 'Please provide both email and password.',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

      if (!user) {
        logger.authFailure('User not found during login', { email: email.toLowerCase().trim() });
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        logger.authFailure('Password mismatch during login', { userId: user._id });
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        return res.status(403).json({
          success: false,
          error: 'EMAIL_NOT_VERIFIED',
          message: 'Your email address has not been verified. Please check your inbox.',
          email: user.email,
        });
      }

      // Dynamically check membership expiration on login
      if (
        user.membershipStatus === 'ACTIVE' &&
        user.membershipExpiresAt &&
        new Date() > new Date(user.membershipExpiresAt)
      ) {
        user.membershipStatus = 'EXPIRED';
        user.auctionAccessStatus = 'BLOCKED';
        await user.save();
      }

      const token = generateJwtToken(user._id, user.role);

      await auditService.log({
        actor: user,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user._id,
        req,
      });

      // Remove passwordHash from JSON response
      const userResponse = user.toJSON();

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        token,
        user: userResponse,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Forgot Password - Safe against account enumeration
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'EMAIL_REQUIRED',
          message: 'Email address is required.',
        });
      }

      const user = await User.findOne({ email: email.toLowerCase().trim() });

      if (user) {
        const rawResetToken = generateRandomToken(32);
        user.passwordResetTokenHash = hashToken(rawResetToken);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        emailService.sendPasswordResetEmail(user, rawResetToken).catch((err) => {
          logger.error('EMAIL_DISPATCH_FAILED', `Failed to send password reset email: ${err.message}`);
        });

        await auditService.log({
          actor: user,
          action: 'PASSWORD_RESET_REQUESTED',
          entity: 'User',
          entityId: user._id,
          req,
        });
      }

      // Always return generic confirmation to prevent account enumeration
      res.status(200).json({
        success: true,
        message: 'If that email address is in our database, we have sent password reset instructions.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset Password
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'MISSING_FIELDS',
          message: 'Reset token, new password, and confirmation are required.',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'PASSWORDS_DO_NOT_MATCH',
          message: 'Password confirmation does not match.',
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          error: 'WEAK_PASSWORD',
          message: 'Password must be at least 8 characters long.',
        });
      }

      const hashedToken = hashToken(token);

      const user = await User.findOne({
        passwordResetTokenHash: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      }).select('+passwordHash');

      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Password reset link is invalid or has expired.',
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      user.passwordHash = await bcrypt.hash(newPassword, salt);
      user.passwordResetTokenHash = null;
      user.passwordResetExpires = null;
      await user.save();

      await auditService.log({
        actor: user,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'User',
        entityId: user._id,
        req,
      });

      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout
   */
  logout: async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  },
};

module.exports = authController;
