const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

if (env.SMTP_USER && env.SMTP_PASSWORD) {
  const isGmail = (env.SMTP_HOST && env.SMTP_HOST.includes('gmail')) || (env.SMTP_USER && env.SMTP_USER.includes('@gmail.com'));

  const transportConfig = isGmail
    ? {
        service: 'gmail',
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: env.SMTP_HOST || 'smtp.gmail.com',
        port: env.SMTP_PORT || 465,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      };

  transporter = nodemailer.createTransport(transportConfig);

  // Verify connection configuration
  transporter.verify((error) => {
    if (error) {
      console.warn(`[EMAIL WARNING] SMTP Connection failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    } else {
      console.log(`[EMAIL] SMTP Transporter ready to send messages via ${isGmail ? 'Gmail Service' : env.SMTP_HOST} for ${env.SMTP_USER}`);
    }
  });
} else {
  console.warn('[EMAIL WARNING] SMTP credentials (SMTP_USER / SMTP_PASSWORD) not fully configured in environment. Emails will be logged to server console in development.');
}

/**
 * Send an email using Nodemailer or console logging fallback
 */
const sendMail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      // Clean and ensure valid From header
      let fromAddress = env.EMAIL_FROM
        ? env.EMAIL_FROM.replace(/^["']|["']$/g, '').trim()
        : `"GENZSTYLE" <${env.SMTP_USER}>`;

      if (!fromAddress.includes('<') && !fromAddress.includes('@')) {
        fromAddress = `"${fromAddress}" <${env.SMTP_USER}>`;
      }

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
        text,
      });

      console.log(`[EMAIL SUCCESS] Sent to: ${to} | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message, err.code ? `(${err.code})` : '');
      if (env.NODE_ENV === 'production') {
        throw err;
      }
    }
  }

  // Fallback for development if SMTP is not configured yet
  console.log('--------------------------------------------------');
  console.log(`[EMAIL DISPATCH (FALLBACK)]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html}`);
  console.log('--------------------------------------------------');
  return { success: true, devMode: true };
};

module.exports = {
  transporter,
  sendMail,
};
