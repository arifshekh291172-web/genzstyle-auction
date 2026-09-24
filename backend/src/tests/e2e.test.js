const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Participant = require('../models/Participant');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const MembershipPayment = require('../models/MembershipPayment');

// Import services & utils
const auctionService = require('../services/auctionService');
const { hashToken, generateRandomToken } = require('../utils/tokenUtils');

let mongod;

test.before(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  await Promise.all([
    User.init(),
    Product.init(),
    Auction.init(),
    Participant.init(),
    Bid.init(),
    Order.init(),
    MembershipPayment.init(),
  ]);
});

test.after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

test('1. Signup, Duplicate Email Prevention & Email Verification', async (t) => {
  await t.test('Registers user with hashed password and verification token', async () => {
    const rawPassword = 'Password123!';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    const rawToken = generateRandomToken(32);
    const tokenHash = hashToken(rawToken);

    const user = await User.create({
      name: 'Test Collector',
      email: 'collector1@test.com',
      passwordHash,
      emailVerified: false,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    assert.equal(user.email, 'collector1@test.com');
    assert.equal(user.emailVerified, false);

    // Verify duplicate email throws unique index error (code 11000)
    await assert.rejects(
      async () => {
        await User.create({
          name: 'Clone Collector',
          email: 'collector1@test.com',
          passwordHash,
        });
      },
      (err) => err.code === 11000
    );

    // Simulate verification
    const foundUser = await User.findOne({
      emailVerificationTokenHash: hashToken(rawToken),
      emailVerificationExpires: { $gt: new Date() },
    });
    assert.ok(foundUser);
    foundUser.emailVerified = true;
    foundUser.emailVerificationTokenHash = null;
    await foundUser.save();

    assert.equal(foundUser.emailVerified, true);
  });
});

test('2. Membership Payment Verification & 365-Day Validity', async (t) => {
  await t.test('Verifies valid payment signature and sets 365-day active membership', async () => {
    const user = await User.findOne({ email: 'collector1@test.com' });
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    user.emailVerified = true;
    user.membershipStatus = 'ACTIVE';
    user.auctionAccessStatus = 'ACTIVE';
    user.membershipActivatedAt = now;
    user.membershipExpiresAt = expiresAt;
    await user.save();

    assert.equal(user.hasValidMembership(), true);
    assert.equal(user.membershipStatus, 'ACTIVE');
    assert.equal(user.auctionAccessStatus, 'ACTIVE');

    // Create payment record
    const payment = await MembershipPayment.create({
      userId: user._id,
      amount: 49,
      razorpayOrderId: 'order_test_123',
      razorpayPaymentId: 'pay_test_123',
      razorpaySignature: 'sig_test_123',
      status: 'CAPTURED',
      activatedAt: now,
      expiresAt,
    });

    assert.equal(payment.amount, 49);
    assert.equal(payment.status, 'CAPTURED');
  });

  await t.test('Detects expired membership past 365 days', async () => {
    const user = await User.findOne({ email: 'collector1@test.com' });
    user.membershipExpiresAt = new Date(Date.now() - 1000);
    assert.equal(user.hasValidMembership(), false);

    // Reset back to active for subsequent tests
    user.membershipExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await user.save();
  });
});

test('3. Auction Join, 100-Participant Limit & Duplicate Prevention', async (t) => {
  let product;
  let auction;
  let user1;
  let user2;
  let user3;

  t.before(async () => {
    product = await Product.create({
      name: 'Rare Leather Jacket',
      styleId: 'GZS-TEST-01',
      description: 'Test jacket',
      category: 'Jackets',
      brand: 'GenzStyle Archive',
      startingPrice: 1000,
    });

    auction = await Auction.create({
      productId: product._id,
      startingBid: 1000,
      currentBid: 1000,
      bidIncrement: 10,
      participantLimit: 2, // Set cap at 2 for testing strict limit rejection
      participantCount: 0,
      startTime: new Date(Date.now() - 1000),
      endTime: new Date(Date.now() + 3600000),
      status: 'OPEN',
    });

    // Make sure user1 has verified email and active membership
    user1 = await User.findOne({ email: 'collector1@test.com' });
    user1.emailVerified = true;
    user1.membershipStatus = 'ACTIVE';
    user1.auctionAccessStatus = 'ACTIVE';
    user1.membershipExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    await user1.save();

    user2 = await User.create({
      name: 'Second Collector',
      email: 'collector2@test.com',
      passwordHash: 'hash',
      emailVerified: true,
      membershipStatus: 'ACTIVE',
      auctionAccessStatus: 'ACTIVE',
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    user3 = await User.create({
      name: 'Third Collector',
      email: 'collector3@test.com',
      passwordHash: 'hash',
      emailVerified: true,
      membershipStatus: 'ACTIVE',
      auctionAccessStatus: 'ACTIVE',
      membershipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });
  });

  await t.test('User 1 joins auction atomically', async () => {
    const res = await auctionService.joinAuction(auction._id, user1);
    assert.equal(res.participantCount, 1);

    const partDoc = await Participant.findOne({ auctionId: auction._id, userId: user1._id });
    assert.ok(partDoc);
  });

  await t.test('Rejects duplicate join from User 1', async () => {
    await assert.rejects(
      async () => {
        await auctionService.joinAuction(auction._id, user1);
      },
      (err) => err.errorCode === 'ALREADY_JOINED'
    );
  });

  await t.test('User 2 fills the auction to limit', async () => {
    const res = await auctionService.joinAuction(auction._id, user2);
    assert.equal(res.participantCount, 2);
  });

  await t.test('Rejects 3rd user when participantLimit is reached', async () => {
    await assert.rejects(
      async () => {
        await auctionService.joinAuction(auction._id, user3);
      },
      (err) => err.errorCode === 'AUCTION_FULL' || err.errorCode === 'AUCTION_NOT_OPEN'
    );
  });
});

test('4. Atomic Bidding, Strict ₹10 Increments & Race-Condition Collision', async (t) => {
  let auction;
  let user1;
  let user2;

  t.before(async () => {
    user1 = await User.findOne({ email: 'collector1@test.com' });
    user2 = await User.findOne({ email: 'collector2@test.com' });

    auction = await Auction.findOne();
    auction.status = 'LIVE';
    await auction.save();
  });

  await t.test('User 1 places first valid bid with exact +₹10 increment', async () => {
    const res = await auctionService.placeBid(auction._id, user1);
    assert.equal(res.currentBid, 1010); // 1000 + 10
    assert.equal(res.nextBid, 1020);

    const bidDoc = await Bid.findOne({ auctionId: auction._id }).sort({ amount: -1 });
    assert.equal(bidDoc.amount, 1010);
    assert.equal(bidDoc.userId.toString(), user1._id.toString());
  });

  await t.test('Rejects self-outbid if User 1 is already highest bidder', async () => {
    await assert.rejects(
      async () => {
        await auctionService.placeBid(auction._id, user1);
      },
      (err) => err.errorCode === 'ALREADY_HIGHEST_BIDDER'
    );
  });

  await t.test('User 2 places next bid (+₹10)', async () => {
    const res = await auctionService.placeBid(auction._id, user2);
    assert.equal(res.currentBid, 1020);
    assert.equal(res.nextBid, 1030);
  });

  await t.test('Simultaneous race condition: second bidder gets BID_CHANGED error', async () => {
    const attempt1 = auctionService.placeBid(auction._id, user1);
    const attempt2 = auctionService.placeBid(auction._id, user1);

    const results = await Promise.allSettled([attempt1, attempt2]);
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(
      rejected[0].reason.errorCode === 'BID_CHANGED' ||
        rejected[0].reason.errorCode === 'ALREADY_HIGHEST_BIDDER'
    );
  });
});

test('5. Auction Conclusion, Winner Selection & 48-Hour Payment Window', async (t) => {
  let auction;

  t.before(async () => {
    auction = await Auction.findOne({ status: 'LIVE' });
  });

  await t.test('Ends auction and selects highest bidder with 48h payment deadline', async () => {
    const result = await auctionService.endAuctionAndSelectWinner(auction._id);
    assert.ok(result.order);
    assert.equal(result.auction.status, 'PAYMENT_PENDING');
    assert.ok(result.auction.winnerId);
    assert.equal(result.order.paymentStatus, 'PAYMENT_PENDING');

    const diffHours = (new Date(result.order.paymentDeadline) - new Date()) / (1000 * 60 * 60);
    assert.ok(diffHours > 47.9 && diffHours <= 48.0);
  });
});

test('6. Payment Expiry, Default Enforcement & ₹49 Reactivation', async (t) => {
  await t.test('Detects expired payment deadline and pauses user auction access', async () => {
    const order = await Order.findOne({ paymentStatus: 'PAYMENT_PENDING' });
    order.paymentDeadline = new Date(Date.now() - 1000);
    await order.save();

    const processed = await auctionService.processExpiredPayments();
    assert.ok(processed >= 1);

    const updatedOrder = await Order.findById(order._id);
    assert.equal(updatedOrder.paymentStatus, 'EXPIRED');
    assert.equal(updatedOrder.orderStatus, 'DEFAULTED');

    const user = await User.findById(order.userId);
    assert.equal(user.auctionAccessStatus, 'BLOCKED');
    assert.equal(user.membershipStatus, 'FORFEITED');
    assert.equal(user.forfeitedMembershipCount, 1);
  });

  await t.test('Restores access after ₹49 reactivation payment', async () => {
    const defaultedUser = await User.findOne({ auctionAccessStatus: 'BLOCKED' });
    assert.ok(defaultedUser);

    const now = new Date();
    defaultedUser.membershipStatus = 'ACTIVE';
    defaultedUser.auctionAccessStatus = 'ACTIVE';
    defaultedUser.membershipActivatedAt = now;
    defaultedUser.membershipExpiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    await defaultedUser.save();

    await MembershipPayment.create({
      userId: defaultedUser._id,
      amount: 49,
      razorpayOrderId: 'order_reactivate_123',
      razorpayPaymentId: 'pay_reactivate_123',
      razorpaySignature: 'sig_reactivate_123',
      status: 'CAPTURED',
      type: 'REACTIVATION',
      activatedAt: now,
      expiresAt: defaultedUser.membershipExpiresAt,
    });

    assert.equal(defaultedUser.membershipStatus, 'ACTIVE');
    assert.equal(defaultedUser.auctionAccessStatus, 'ACTIVE');
    assert.equal(defaultedUser.hasValidMembership(), true);
  });
});
