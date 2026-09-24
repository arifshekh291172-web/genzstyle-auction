const { verifyJwtToken } = require('../utils/tokenUtils');
const logger = require('../utils/logger');

const setupAuctionSocket = (io) => {
  io.use((socket, next) => {
    // Authenticate socket if token is provided in handshake
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = verifyJwtToken(token);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
      } catch (err) {
        logger.warn('SOCKET', 'Socket handshake token invalid, connecting as guest');
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info('SOCKET', `Socket client connected: ${socket.id}`, {
      userId: socket.userId || 'GUEST',
    });

    // If authenticated, join user's private notification channel
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.info('SOCKET', `Socket joined personal channel user:${socket.userId}`);
    }

    // Join specific auction room
    socket.on('auction:join', ({ auctionId }) => {
      if (auctionId) {
        socket.join(`auction:${auctionId}`);
        logger.info('SOCKET', `Socket ${socket.id} joined room auction:${auctionId}`);
      }
    });

    // Leave auction room
    socket.on('auction:leave', ({ auctionId }) => {
      if (auctionId) {
        socket.leave(`auction:${auctionId}`);
        logger.info('SOCKET', `Socket ${socket.id} left room auction:${auctionId}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info('SOCKET', `Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupAuctionSocket;
