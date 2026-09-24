/**
 * DEVELOPMENT SEED SCRIPT
 * For local testing and development demonstration only.
 * DO NOT run in production.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const User = require('../models/User');
const Product = require('../models/Product');
const Auction = require('../models/Auction');
const Participant = require('../models/Participant');
const Bid = require('../models/Bid');
const Order = require('../models/Order');
const MembershipPayment = require('../models/MembershipPayment');

if (env.NODE_ENV === 'production') {
  console.error('[SECURITY ERROR] Seeding script is strictly prohibited in production.');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('[SEED] Connected to MongoDB for development seeding...');

    // Clean existing test collections
    await Promise.all([
      User.deleteMany({ email: { $regex: /@genzstyle\.dev$/ } }),
      Product.deleteMany({ styleId: { $regex: /^GZS-DEV-/ } }),
      Auction.deleteMany({}),
      Participant.deleteMany({}),
      Bid.deleteMany({}),
      Order.deleteMany({}),
      MembershipPayment.deleteMany({}),
    ]);

    console.log('[SEED] Cleaned previous test data.');

    // 1. Create Verified Dev Users
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('GenzTest2026!', salt);

    const now = new Date();
    const expiryDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const users = await User.create([
      {
        name: 'Aarav Varma',
        email: 'aarav@genzstyle.dev',
        passwordHash,
        role: 'USER',
        emailVerified: true,
        membershipStatus: 'ACTIVE',
        auctionAccessStatus: 'ACTIVE',
        membershipActivatedAt: now,
        membershipExpiresAt: expiryDate,
        phone: '+91 98765 43210',
        shippingAddress: {
          fullName: 'Aarav Varma',
          phone: '+91 98765 43210',
          street: 'Flat 402, Highline Residency, Bandra West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pinCode: '400050',
        },
      },
      {
        name: 'Rhea Sen',
        email: 'rhea@genzstyle.dev',
        passwordHash,
        role: 'USER',
        emailVerified: true,
        membershipStatus: 'ACTIVE',
        auctionAccessStatus: 'ACTIVE',
        membershipActivatedAt: now,
        membershipExpiresAt: expiryDate,
        phone: '+91 98111 22334',
        shippingAddress: {
          fullName: 'Rhea Sen',
          phone: '+91 98111 22334',
          street: '12 Defence Colony, Ring Road',
          city: 'New Delhi',
          state: 'Delhi',
          pinCode: '110024',
        },
      },
      {
        name: 'Kabir Malhotra',
        email: 'kabir@genzstyle.dev',
        passwordHash,
        role: 'USER',
        emailVerified: true,
        membershipStatus: 'ACTIVE',
        auctionAccessStatus: 'ACTIVE',
        membershipActivatedAt: now,
        membershipExpiresAt: expiryDate,
        phone: '+91 99000 88776',
      },
    ]);

    console.log(`[SEED] Created ${users.length} test collectors.`);

    // 2. Create Luxury Streetwear Products
    const products = await Product.create([
      {
        name: 'Balenciaga Cargo Runner Sneakers Distressed Edition',
        styleId: 'GZS-DEV-BAL-01',
        description: 'Iconic chunky platform runner crafted in distressed mesh and technical polyurethane. Limited archival piece featuring signature exaggerated sole and hand-weathered finish.',
        category: 'Footwear',
        brand: 'Balenciaga',
        size: 'UK 9 / EU 43',
        color: 'Black/Worn Silver',
        condition: 'Pristine Archive',
        startingPrice: 2150,
        images: [
          { url: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=80', isPrimary: false },
        ],
        active: true,
      },
      {
        name: 'Rick Owens Bauhaus Flight Jacket Heavy Waxed Lambskin',
        styleId: 'GZS-DEV-RO-02',
        description: 'Cult Bauhaus flight jacket in full heavyweight blistered lambskin. Features curved silver zip accents, industrial rib-knit trims, and exaggerated signature neck collar.',
        category: 'Jackets',
        brand: 'Rick Owens',
        size: '48 / Medium',
        color: 'Onyx Black',
        condition: 'Brand New',
        startingPrice: 4200,
        images: [
          { url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
          { url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80', isPrimary: false },
        ],
        active: true,
      },
      {
        name: 'Chrome Hearts Double Dagger Pendant in Solid 925 Silver',
        styleId: 'GZS-DEV-CH-03',
        description: 'Heavy solid .925 sterling silver Double Dagger pendant featuring intricate Gothic floral engravings and high-luster hand oxidation. Serial engraved bail.',
        category: 'Accessories',
        brand: 'Chrome Hearts',
        size: 'One Size (5.5cm)',
        color: 'Antique Silver',
        condition: 'Pristine Archive',
        startingPrice: 1850,
        images: [
          { url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
        ],
        active: true,
      },
      {
        name: "Arc'teryx Veilance Monitor Gore-Tex Pro Down Coat",
        styleId: 'GZS-DEV-ARC-04',
        description: 'Stealth minimalist technical winter coat in 3-layer Gore-Tex Pro with 850 fill European goose down. Fully seam-taped with concealed Cohaesive tension adjusters.',
        category: 'Outerwear',
        brand: "Arc'teryx Veilance",
        size: 'L / Large',
        color: 'Soot Black',
        condition: 'Brand New',
        startingPrice: 3100,
        images: [
          { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
        ],
        active: true,
      },
      {
        name: 'Maison Margiela Split-Toe Tabi Boots in Washed Leather',
        styleId: 'GZS-DEV-MM-05',
        description: 'The defining silhouette of avant-garde fashion. 60mm cylindrical wooden heel covered in buttery supple Italian calfskin with traditional Japanese hook-and-eye closures.',
        category: 'Footwear',
        brand: 'Maison Margiela',
        size: 'EU 41',
        color: 'Matte White',
        condition: 'Brand New',
        startingPrice: 2800,
        images: [
          { url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
        ],
        active: true,
      },
      {
        name: 'Yohji Yamamoto Pour Homme Asymmetrical Deconstructed Blazer',
        styleId: 'GZS-DEV-YY-06',
        description: 'Dramatic flowing wool gabardine blazer with raw edge frayed silk organza layering. Masterful draping with adjustable internal harness straps.',
        category: 'Jackets',
        brand: 'Yohji Yamamoto',
        size: 'Size 3 (Loose Fit)',
        color: 'Midnight Black',
        condition: 'Vintage Excellent',
        startingPrice: 2450,
        images: [
          { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80', isPrimary: true },
        ],
        active: true,
      },
    ]);

    console.log(`[SEED] Created ${products.length} luxury catalog products.`);

    // 3. Create Real Auctions (1 LIVE, 2 OPEN, 1 UPCOMING)
    const auctions = await Auction.create([
      {
        productId: products[0]._id, // Balenciaga
        startingBid: 2150,
        currentBid: 2150,
        bidIncrement: 10,
        participantLimit: 100,
        participantCount: 73, // As in user mockup reference
        startTime: new Date(now.getTime() - 10 * 60 * 1000), // Started 10 mins ago
        endTime: new Date(now.getTime() + 45 * 60 * 1000), // Ends in 45 mins
        status: 'LIVE',
      },
      {
        productId: products[1]._id, // Rick Owens
        startingBid: 4200,
        currentBid: 4200,
        bidIncrement: 10,
        participantLimit: 100,
        participantCount: 42,
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // Starts in 2 hours
        endTime: new Date(now.getTime() + 4 * 60 * 60 * 1000),
        status: 'OPEN',
      },
      {
        productId: products[2]._id, // Chrome Hearts
        startingBid: 1850,
        currentBid: 1850,
        bidIncrement: 10,
        participantLimit: 100,
        participantCount: 88,
        startTime: new Date(now.getTime() + 6 * 60 * 60 * 1000), // Starts in 6 hours
        endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000),
        status: 'OPEN',
      },
      {
        productId: products[3]._id, // Arc'teryx
        startingBid: 3100,
        currentBid: 3100,
        bidIncrement: 10,
        participantLimit: 100,
        participantCount: 15,
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Starts tomorrow
        endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
        status: 'UPCOMING',
      },
    ]);

    // Add participations for the LIVE auction
    await Participant.create([
      { auctionId: auctions[0]._id, userId: users[0]._id },
      { auctionId: auctions[0]._id, userId: users[1]._id },
    ]);

    console.log(`[SEED] Created ${auctions.length} auctions with live slots.`);
    console.log('==================================================');
    console.log('  DEV SEED COMPLETED SUCCESSFULLY');
    console.log('  Admin User  : ' + env.ADMIN_EMAIL);
    console.log('  Admin Pass  : ' + env.ADMIN_PASSWORD);
    console.log('  Test User 1 : aarav@genzstyle.dev (Pass: GenzTest2026!)');
    console.log('  Test User 2 : rhea@genzstyle.dev (Pass: GenzTest2026!)');
    console.log('==================================================');

    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    process.exit(1);
  }
};

seed();
