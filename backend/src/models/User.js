const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    emailVerificationTokenHash: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    emailVerificationOtpHash: {
      type: String,
      default: null,
    },
    emailVerificationOtpExpires: {
      type: Date,
      default: null,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    acceptedTerms: {
      type: Boolean,
      default: false,
    },
    termsAcceptedAt: {
      type: Date,
      default: null,
    },
    membershipTermsAccepted: {
      type: Boolean,
      default: false,
    },
    membershipTermsAcceptedAt: {
      type: Date,
      default: null,
    },
    membershipStatus: {
      type: String,
      enum: ['INACTIVE', 'ACTIVE', 'EXPIRED', 'FORFEITED', 'BLOCKED'],
      default: 'INACTIVE',
      index: true,
    },
    membershipActivatedAt: {
      type: Date,
      default: null,
    },
    membershipExpiresAt: {
      type: Date,
      default: null,
    },
    auctionAccessStatus: {
      type: String,
      enum: ['BLOCKED', 'ACTIVE', 'PAUSED'],
      default: 'BLOCKED',
      index: true,
    },
    forfeitedMembershipCount: {
      type: Number,
      default: 0,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    shippingAddress: {
      fullName: { type: String, default: '' },
      phone: { type: String, default: '' },
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pinCode: { type: String, default: '' },
    },
    membershipReminder7Sent: { type: Boolean, default: false },
    membershipReminder3Sent: { type: Boolean, default: false },
    membershipReminder1Sent: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.emailVerificationTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to check active membership and access status
userSchema.methods.hasValidMembership = function () {
  if (this.membershipStatus !== 'ACTIVE' || this.auctionAccessStatus !== 'ACTIVE') {
    return false;
  }
  if (!this.membershipExpiresAt) {
    return false;
  }
  return new Date() < new Date(this.membershipExpiresAt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
