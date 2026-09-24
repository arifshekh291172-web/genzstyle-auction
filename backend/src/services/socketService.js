let ioInstance = null;

const initSocket = (io) => {
  ioInstance = io;
};

const getIO = () => {
  return ioInstance;
};

const broadcastBidPlaced = (auctionId, payload) => {
  if (ioInstance) {
    ioInstance.to(`auction:${auctionId}`).emit('bid:placed', payload);
  }
};

const broadcastAuctionEnded = (auctionId, payload) => {
  if (ioInstance) {
    ioInstance.to(`auction:${auctionId}`).emit('auction:ended', payload);
  }
};

const sendUserOutbid = (userId, payload) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:outbid', payload);
  }
};

const sendUserNotification = (userId, notification) => {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit('notification:new', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  broadcastBidPlaced,
  broadcastAuctionEnded,
  sendUserOutbid,
  sendUserNotification,
};
