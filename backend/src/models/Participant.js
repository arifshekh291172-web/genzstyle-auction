const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema(
  {
    auctionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: prevents duplicate participation at the database engine level
participantSchema.index({ auctionId: 1, userId: 1 }, { unique: true });

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
