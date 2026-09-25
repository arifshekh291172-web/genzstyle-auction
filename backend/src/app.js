const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketingRoutes = require('./routes/marketingRoutes');

const app = express();

// Trust proxy - Required for Render and reverse proxies so express-rate-limit reads client IP correctly
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible media hosting and external assets
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development or configure strictly in production
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature'],
  })
);

// Request body parser with rawBody preservation for Razorpay webhook verification
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
    limit: '10mb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Global API Rate Limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'HEALTHY',
    service: 'GENZSTYLE Marketplace API',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Email Diagnostic Endpoint to verify Render SMTP status
app.get('/api/health/test-email', async (req, res) => {
  const targetEmail = req.query.to || env.SMTP_USER;
  try {
    const { sendMail, transporter } = require('./config/email');
    if (!transporter && !env.BREVO_API_KEY && !env.RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'EMAIL_CONFIG_MISSING',
        message: 'No email provider configured. Please set BREVO_API_KEY or SMTP_USER/PASSWORD.',
        brevoConfigured: Boolean(env.BREVO_API_KEY),
        resendConfigured: Boolean(env.RESEND_API_KEY),
        smtpConfigured: Boolean(env.SMTP_USER && env.SMTP_PASSWORD),
      });
    }

    const testOtp = Math.floor(100000 + Math.random() * 900000);
    const result = await sendMail({
      to: targetEmail,
      subject: `GENZSTYLE Test Verification Code: ${testOtp}`,
      text: `Your test verification code is ${testOtp}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#08080A;color:#fff;border:1px solid #D4AF37;border-radius:12px;">
        <h2 style="color:#D4AF37;margin-top:0;">GENZSTYLE TEST EMAIL</h2>
        <p>Your test verification code is: <strong style="font-size:20px;letter-spacing:4px;color:#D4AF37;">${testOtp}</strong></p>
        <p style="color:#888;">Render server SMTP is 100% active and running.</p>
      </div>`,
    });

    res.json({
      success: true,
      message: `Test email successfully dispatched to ${targetEmail}`,
      details: result,
      smtpUser: env.SMTP_USER,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'EMAIL_SEND_FAILED',
      message: err.message,
      code: err.code || null,
      response: err.response || null,
      smtpUser: env.SMTP_USER,
      passConfigured: Boolean(env.SMTP_PASSWORD),
    });
  }
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/marketing', marketingRoutes);

// Static frontend serving for production deployment
const path = require('path');
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

// Dedicated SEO routes for search engines (Googlebot, Bingbot)
app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(__dirname, '../../frontend/public/robots.txt');
  if (fs.existsSync(robotsPath)) {
    res.type('text/plain');
    return res.sendFile(robotsPath);
  }
  res.type('text/plain').send("User-agent: *\nAllow: /\nSitemap: https://genzstyle-auction.onrender.com/sitemap.xml\n");
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapDist = path.join(frontendDistPath, 'sitemap.xml');
  const sitemapPublic = path.join(__dirname, '../../frontend/public/sitemap.xml');
  const target = fs.existsSync(sitemapDist) ? sitemapDist : sitemapPublic;
  if (fs.existsSync(target)) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.sendFile(target);
  }
  res.status(404).send('Sitemap not found');
});

// Google Search Console Site Verification
app.get('/google30dd34e798d48329.html', (req, res) => {
  res.type('text/html').send('google-site-verification: google30dd34e798d48329.html');
});

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for client-side routing
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/socket.io')) {
      return next();
    }
    const indexPath = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'ENDPOINT_NOT_FOUND',
    message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
