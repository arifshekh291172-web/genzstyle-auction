const Razorpay = require('razorpay');
const crypto = require('crypto');
const env = require('./env');

let razorpayInstance = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('[RAZORPAY WARNING] Razorpay Key ID or Secret not provided in environment. Payment orders will require valid keys.');
}

/**
 * Verify Razorpay payment signature
 * HMAC SHA256 of (orderId + "|" + paymentId) using key_secret
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay secret not configured on server.');
  }

  const generatedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verify Razorpay webhook signature
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('Razorpay webhook secret not configured on server.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  razorpayInstance,
  verifyPaymentSignature,
  verifyWebhookSignature
};
