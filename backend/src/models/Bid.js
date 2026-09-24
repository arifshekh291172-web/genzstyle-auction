const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: [true, 'Auction reference is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [0, 'Bid amount cannot be negative'],
    },
    serverTimestamp: {
      type: Date,
      default: Date.now, // Server-generated timestamp only
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes specified in prompt: auctionId + createdAt, auctionId + amount
bidSchema.index({ auctionId: 1, createdAt: -1 });
bidSchema.index({ auctionId: 1, amount: -1 });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
