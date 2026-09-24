const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'AUCTION_STARTING',
        'OUTBID',
        'AUCTION_WON',
        'PAYMENT_REMINDER',
        'PAYMENT_SUCCESS',
        'PAYMENT_EXPIRED',
        'MEMBERSHIP_ACTIVATED',
        'MEMBERSHIP_EXPIRING',
        'ORDER_SHIPPED',
        'ORDER_DELIVERED',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      auctionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Auction' },
      orderId: { type: String },
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      bidAmount: { type: Number },
      nextBid: { type: Number },
      url: { type: String },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast unread count queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
