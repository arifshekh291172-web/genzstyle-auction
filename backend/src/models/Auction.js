const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Auction must have an associated product'],
      index: true,
    },
    startingBid: {
      type: Number,
      required: [true, 'Starting bid is required'],
      min: [0, 'Starting bid cannot be negative'],
    },
    currentBid: {
      type: Number,
      required: [true, 'Current bid is required'],
      min: [0, 'Current bid cannot be negative'],
    },
    bidIncrement: {
      type: Number,
      default: 10, // 10 INR default increment
      min: [1, 'Bid increment must be at least 1 INR'],
    },
    participantLimit: {
      type: Number,
      default: 100, // Strict 100 participant limit
      min: [1, 'Participant limit must be at least 1'],
    },
    participantCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
    startTime: {
      type: Date,
      required: [true, 'Auction start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'Auction end time is required'],
      index: true,
    },
    status: {
      type: String,
      enum: [
        'UPCOMING',
        'OPEN',
        'FULL',
        'LIVE',
        'ENDED',
        'PAYMENT_PENDING',
        'COMPLETED',
        'DEFAULTED',
        'CANCELLED',
      ],
      default: 'UPCOMING',
      index: true,
    },
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    winningBid: {
      type: Number,
      default: null,
    },
    winnerSelectedAt: {
      type: Date,
      default: null,
    },
    paymentDeadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for query performance and scheduling
auctionSchema.index({ status: 1, startTime: 1 });
auctionSchema.index({ status: 1, endTime: 1 });

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;
