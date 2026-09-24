const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      console.warn(`[EMAIL WARNING] SMTP Connection failed: ${error.message}. Emails will be logged to console in development.`);
    } else {
      console.log('[EMAIL] SMTP Transporter ready to send messages');
    }
  });
} else {
  console.warn('[EMAIL WARNING] SMTP credentials not fully configured in environment. Emails will be logged to server console in development.');
}

/**
 * Send an email using Nodemailer or console logging fallback
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        text,
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message);
      if (env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Fallback for development if SMTP is not configured yet
  console.log('--------------------------------------------------');
  console.log(`[EMAIL DISPATCH]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html}`);
  console.log('--------------------------------------------------');
  return { success: true, devMode: true };
};

module.exports = {
  transporter,
  sendMail
};
