const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    winningBid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['PAYMENT_PENDING', 'PAID', 'EXPIRED', 'FAILED'],
      default: 'PAYMENT_PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'DEFAULTED',
      ],
      default: 'PAYMENT_PENDING',
      index: true,
    },
    paymentDeadline: {
      type: Date,
      required: true,
      index: true, // 48-hour payment deadline
    },
    razorpayOrderId: {
      type: String,
      default: null,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pinCode: { type: String, default: '' },
    },
    shippingUpdatedAt: {
      type: Date,
      default: null,
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        changedBy: { type: String, default: 'SYSTEM' },
      },
    ],
    // Reminder flags for 48h payment window (24h, 6h, 1h)
    reminder24Sent: {
      type: Boolean,
      default: false,
    },
    reminder6Sent: {
      type: Boolean,
      default: false,
    },
    reminder1Sent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for scheduler deadline checks
orderSchema.index({ paymentStatus: 1, paymentDeadline: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
