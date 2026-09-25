const nodemailer = require('nodemailer');
const https = require('https');
const env = require('./env');

let transporter = null;

// Initialize Nodemailer if SMTP is configured
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
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
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
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      };

  transporter = nodemailer.createTransport(transportConfig);

  transporter.verify((error) => {
    if (error) {
      console.warn(`[EMAIL NOTICE] SMTP direct socket unavailable: ${error.message}. (Render Free tier blocks outbound ports 465/587. HTTPS API / Resend / Console fallback active).`);
    } else {
      console.log(`[EMAIL] SMTP Transporter ready to send messages via ${isGmail ? 'Gmail Service' : env.SMTP_HOST} for ${env.SMTP_USER}`);
    }
  });
}

/**
 * Send email via Resend HTTPS REST API (Port 443 - 100% supported on Render Free Tier)
 */
const sendViaResend = ({ apiKey, to, subject, html, text }) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      from: env.EMAIL_FROM || 'GENZSTYLE <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    const req = https.request(
      'https://api.resend.com/emails',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 6000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(data);
              resolve({ success: true, messageId: parsed.id, provider: 'resend' });
            } catch (e) {
              resolve({ success: true, messageId: 'resend-ok', provider: 'resend' });
            }
          } else {
            reject(new Error(`Resend API HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Resend API request timed out'));
    });
    req.write(payload);
    req.end();
  });
};

/**
 * Send email via Brevo HTTPS REST API (Port 443 - 100% supported on Render Free Tier)
 */
const sendViaBrevo = ({ apiKey, to, subject, html, text }) => {
  return new Promise((resolve, reject) => {
    const senderEmail = env.SMTP_USER || 'arifshekh291172@gmail.com';
    const payload = JSON.stringify({
      sender: { name: 'GENZSTYLE', email: senderEmail },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    });

    const req = https.request(
      'https://api.brevo.com/v3/smtp/email',
      {
        method: 'POST',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 6000,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, provider: 'brevo' });
          } else {
            reject(new Error(`Brevo API HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Brevo API request timed out'));
    });
    req.write(payload);
    req.end();
  });
};

/**
 * Unified sendMail:
 * 1. Try Resend HTTPS API if RESEND_API_KEY is configured
 * 2. Try Brevo HTTPS API if BREVO_API_KEY is configured
 * 3. Try Nodemailer SMTP (5s timeout)
 * 4. Fallback to Server Console Log (so OTP is never lost)
 */
const sendMail = async ({ to, subject, html, text }) => {
  // Option 1: Resend HTTPS API (Recommended for Render Free tier)
  if (env.RESEND_API_KEY) {
    try {
      const result = await sendViaResend({
        apiKey: env.RESEND_API_KEY,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EMAIL SUCCESS - RESEND] Dispatched to ${to} | ID: ${result.messageId}`);
      return result;
    } catch (err) {
      console.error(`[EMAIL ERROR - RESEND] ${err.message}. Falling back to next method.`);
    }
  }

  // Option 2: Brevo HTTPS API
  if (env.BREVO_API_KEY) {
    try {
      const result = await sendViaBrevo({
        apiKey: env.BREVO_API_KEY,
        to,
        subject,
        html,
        text,
      });
      console.log(`[EMAIL SUCCESS - BREVO] Dispatched to ${to}`);
      return result;
    } catch (err) {
      console.error(`[EMAIL ERROR - BREVO] ${err.message}. Falling back to next method.`);
    }
  }

  // Option 3: Nodemailer SMTP
  if (transporter) {
    try {
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

      console.log(`[EMAIL SUCCESS - SMTP] Sent to: ${to} | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (err) {
      console.error(
        `[EMAIL NOTICE] SMTP delivery to ${to} timed out or failed (${err.code || err.message}). Render Free tier blocks outbound SMTP ports 465/587.`
      );
    }
  }

  // Option 4: Console Log Fallback (Guaranteed to succeed and never hang the request)
  console.log('==================================================');
  console.log(`[EMAIL DISPATCH - CONSOLE FALLBACK]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text || html}`);
  console.log('==================================================');
  return { success: true, fallbackLogged: true, provider: 'console' };
};

module.exports = {
  transporter,
  sendMail,
};
