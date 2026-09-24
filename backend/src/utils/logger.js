/**
 * Structured Logger for GENZSTYLE Production Server
 * Masks and sanitizes all sensitive fields (passwords, tokens, secrets)
 */

const SENSITIVE_KEYS = [
  'password',
  'passwordHash',
  'token',
  'secret',
  'razorpay_signature',
  'signature',
  'authorization',
  'jwt',
  'emailVerificationToken',
  'passwordResetToken'
];

function sanitize(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()));
    if (isSensitive) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitize(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

function formatLog(level, category, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const cleanMeta = sanitize(meta);
  const logObj = {
    timestamp,
    level,
    category,
    message,
    ...(Object.keys(cleanMeta).length > 0 ? { meta: cleanMeta } : {})
  };
  return JSON.stringify(logObj);
}

const logger = {
  info: (category, message, meta) => {
    console.log(formatLog('INFO', category, message, meta));
  },
  warn: (category, message, meta) => {
    console.warn(formatLog('WARN', category, message, meta));
  },
  error: (category, message, meta) => {
    console.error(formatLog('ERROR', category, message, meta));
  },
  authFailure: (reason, meta) => {
    console.warn(formatLog('WARN', 'AUTH_FAILURE', reason, meta));
  },
  paymentEvent: (event, meta) => {
    console.log(formatLog('INFO', 'PAYMENT', event, meta));
  },
  webhookEvent: (event, meta) => {
    console.log(formatLog('INFO', 'WEBHOOK', event, meta));
  },
  bidConflict: (reason, meta) => {
    console.warn(formatLog('WARN', 'BID_CONFLICT', reason, meta));
  },
  auctionTransition: (auctionId, fromState, toState, meta) => {
    console.log(formatLog('INFO', 'AUCTION_TRANSITION', `Auction ${auctionId} changed ${fromState} -> ${toState}`, meta));
  },
  scheduledJob: (jobName, status, meta) => {
    console.log(formatLog('INFO', 'SCHEDULED_JOB', `${jobName}: ${status}`, meta));
  }
};

module.exports = logger;
