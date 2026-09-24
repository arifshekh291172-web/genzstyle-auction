const mongoose = require('mongoose');

const membershipPaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 49, // Exactly 49 INR
    },
    currency: {
      type: String,
      default: 'INR',
    },
    razorpayOrderId: {
      type: String,
      required: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpaySignature: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['CAPTURED', 'FORFEITED', 'REFUNDED'],
      default: 'CAPTURED',
      index: true,
    },
    type: {
      type: String,
      enum: ['NEW_MEMBERSHIP', 'REACTIVATION'],
      default: 'NEW_MEMBERSHIP',
    },
    activatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true, // ActivatedAt + 365 days
    },
  },
  {
    timestamps: true,
  }
);

const MembershipPayment = mongoose.model('MembershipPayment', membershipPaymentSchema);

module.exports = MembershipPayment;
