const { sendMail } = require('../config/email');
const templates = require('../utils/emailTemplates');
const env = require('../config/env');
const logger = require('../utils/logger');

const emailService = {
  sendVerificationEmail: async (user, rawToken, otp) => {
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${rawToken}`;
    const emailData = templates.verifyEmail({
      name: user.name,
      verificationUrl,
      otp,
    });
    logger.info('EMAIL', `Dispatching verification email with OTP [${otp}] to ${user.email}`);
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendPasswordResetEmail: async (user, rawToken) => {
    const resetUrl = `${env.CLIENT_URL}/reset-password/${rawToken}`;
    const emailData = templates.passwordReset({
      name: user.name,
      resetUrl,
    });
    logger.info('EMAIL', `Dispatching password reset email to ${user.email}`);
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendMembershipActivatedEmail: async (user, payment) => {
    const emailData = templates.membershipActivated({
      name: user.name,
      expiresAt: payment.expiresAt,
      amount: payment.amount,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendAuctionJoinedEmail: async (user, auction, product) => {
    const emailData = templates.auctionJoined({
      name: user.name,
      productName: product.name,
      styleId: product.styleId,
      startTime: auction.startTime,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendOutbidEmail: async (user, product, currentBid, nextBid, auctionId) => {
    const auctionUrl = `${env.CLIENT_URL}/auction/${auctionId}`;
    const emailData = templates.outbid({
      name: user.name,
      productName: product.name,
      currentBid,
      nextBid,
      auctionUrl,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendAuctionWonEmail: async (user, product, winningBid, paymentDeadline, orderId) => {
    const orderUrl = `${env.CLIENT_URL}/orders`;
    const emailData = templates.auctionWon({
      name: user.name,
      productName: product.name,
      winningBid,
      paymentDeadline,
      orderUrl,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendPaymentReminderEmail: async (user, product, winningBid, hoursRemaining, orderId) => {
    const orderUrl = `${env.CLIENT_URL}/orders`;
    const emailData = templates.paymentReminder({
      name: user.name,
      productName: product.name,
      winningBid,
      hoursRemaining,
      orderUrl,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendPaymentSuccessfulEmail: async (user, product, amount, orderId) => {
    const emailData = templates.paymentSuccessful({
      name: user.name,
      productName: product.name,
      amount,
      orderId,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendPaymentExpiredEmail: async (user, product, winningBid) => {
    const emailData = templates.paymentExpired({
      name: user.name,
      productName: product.name,
      winningBid,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendOrderShippedEmail: async (user, product, orderId, trackingInfo) => {
    const emailData = templates.orderShipped({
      name: user.name,
      productName: product.name,
      orderId,
      trackingInfo,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },

  sendOrderDeliveredEmail: async (user, product, orderId) => {
    const emailData = templates.orderDelivered({
      name: user.name,
      productName: product.name,
      orderId,
    });
    return sendMail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    });
  },
};

module.exports = emailService;
