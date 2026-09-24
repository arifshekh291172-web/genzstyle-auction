const http = require('http');
const { Server } = require('socket.io');
const bcrypt = require('bcryptjs');
const app = require('./src/app');
const env = require('./src/config/env');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const { initSocket } = require('./src/services/socketService');
const setupAuctionSocket = require('./src/sockets/auctionSocket');
const { initScheduledJobs } = require('./src/jobs/scheduler');
const logger = require('./src/utils/logger');

const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: [
      env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
});

// Attach socket to service and setup handlers
initSocket(io);
setupAuctionSocket(io);

/**
 * Bootstrap Secure Admin Account if none exists
 */
const bootstrapAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'ADMIN' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

      await User.create({
        name: 'GENZSTYLE Lead Curator',
        email: env.ADMIN_EMAIL.toLowerCase().trim(),
        passwordHash,
        role: 'ADMIN',
        emailVerified: true,
        membershipStatus: 'ACTIVE',
        auctionAccessStatus: 'ACTIVE',
      });

      console.log(`[BOOTSTRAP] Default Admin created: ${env.ADMIN_EMAIL}`);
    }
  } catch (err) {
    logger.error('ADMIN_BOOTSTRAP_ERROR', `Failed to bootstrap admin: ${err.message}`);
  }
};

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas
    await connectDB();

    // Bootstrap initial admin
    await bootstrapAdmin();

    // Start background schedulers
    initScheduledJobs();

    server.listen(env.PORT, () => {
      console.log('==================================================');
      console.log(`  GENZSTYLE API SERVER RUNNING ON PORT ${env.PORT}`);
      console.log(`  ENVIRONMENT : ${env.NODE_ENV}`);
      console.log(`  URL         : ${env.SERVER_URL}`);
      console.log(`  CLIENT URL  : ${env.CLIENT_URL}`);
      console.log('==================================================');
    });
  } catch (error) {
    console.error(`[FATAL ERROR] Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Handle Uncaught Exceptions & Rejections
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT_EXCEPTION', err.message, { stack: err.stack });
});

process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED_REJECTION', typeof reason === 'string' ? reason : reason.message);
});

// Graceful Shutdown
const handleGracefulShutdown = (signal) => {
  logger.info('SERVER_SHUTDOWN', `Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    logger.info('SERVER_SHUTDOWN', 'HTTP and Socket server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

startServer();

module.exports = { app, server };
