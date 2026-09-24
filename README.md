# GENZSTYLE — "Limited. Competitive. Yours."

A real, production-ready full-stack auction marketplace engineered for luxury streetwear and archival fashion drops. Powered by **Node.js, Express, MongoDB Atlas, Socket.IO, and React (Vite & Tailwind CSS)** with end-to-end cryptographic payments via **Razorpay**, automated lifecycle scheduling with **node-cron**, and Cloudinary media processing.

---

## 💎 Table of Contents

1. [Architectural Overview](#architectural-overview)
2. [Key Business Rules & State Machine](#key-business-rules--state-machine)
3. [Technology Stack](#technology-stack)
4. [Database Models & Indexes](#database-models--indexes)
5. [Prerequisites & Environment Configuration](#prerequisites--environment-configuration)
6. [Local Development Setup](#local-development-setup)
7. [Running End-to-End Automated Tests](#running-end-to-end-automated-tests)
8. [Development Seeding](#development-seeding)
9. [Payment & Razorpay Webhook Configuration](#payment--razorpay-webhook-configuration)
10. [Cloudinary Image Storage Setup](#cloudinary-image-storage-setup)
11. [SMTP Email Configuration](#smtp-email-configuration)
12. [Admin Account & Security Architecture](#admin-account--security-architecture)
13. [Production Deployment Guide](#production-deployment-guide)

---

## 🏗 Architectural Overview

GENZSTYLE is separated into independently deployable `/backend` and `/frontend` applications:

```text
/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Cloudinary, Razorpay, Nodemailer, Env validator
│   │   ├── controllers/     # Auth, User, Membership, Auction, Payment, Order, Admin, Notification
│   │   ├── jobs/            # Node-cron automated lifecycle & default schedulers
│   │   ├── middleware/      # JWT Auth, Admin guard, Rate limiters, Error sanitizer
│   │   ├── models/          # User, Product, Auction, Participant, Bid, Order, MembershipPayment, Notification, AuditLog
│   │   ├── routes/          # REST API endpoints with express-validator
│   │   ├── services/        # Atomic join, Bidding concurrency, Email dispatch, Razorpay, Sockets
│   │   ├── sockets/         # Socket.IO room management (auction:{auctionId}, user:{userId})
│   │   ├── tests/           # 20/20 Automated end-to-end regression test suite
│   │   └── utils/           # Structured logger, HTML email templates, Crypto token utils
│   ├── .env.example
│   └── server.js            # Server entrypoint with DB connection and Socket.IO
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios client with JWT interceptor
│   │   ├── components/      # Common, Auction, and Admin UI components
│   │   ├── context/         # AuthContext, SocketContext, NotificationContext
│   │   ├── pages/           # Public drops, live bidding room, admin suite
│   │   ├── App.jsx          # Protected route orchestrator
│   │   └── index.css        # Luxury dark aesthetic & glassmorphism utilities
│   ├── index.html
│   └── vite.config.js
```

---

## ⚡ Key Business Rules & State Machine

1. **One Account Per Email**: Strict unique database indexes on lowercase email strings.
2. **Mandatory Email Verification**: Hashed SHA-256 tokens stored with 24-hour expiration.
3. **Annual Collector Membership (₹49)**:
   - Valid for **365 calendar days** from verified Razorpay payment.
   - Does not extend upon login, joining drops, or winning drops.
   - When `now > membershipExpiresAt`, membership status becomes `EXPIRED` and auction access is `BLOCKED`.
4. **Strict 100-Participant Cap**:
   - Enforced atomically at the database engine level via `Participant` unique compound index `(auctionId, userId)` combined with `$inc` on `participantCount < participantLimit`.
   - The 101st user is rejected immediately even during simultaneous requests.
5. **Server-Authoritative ₹10 Increments**:
   - Bidders never manually enter bid amounts. Frontend button displays the exact server-calculated next bid (`currentBid + ₹10`).
6. **Bid Concurrency & Race Condition Safety**:
   - Utilizes atomic optimistic concurrency updates on `currentBid`. If two users submit identical bids concurrently, only one succeeds; the second request receives HTTP 409 `BID_CHANGED`, and the interface updates immediately.
7. **Auction State Machine**:
   $$\text{UPCOMING} \longrightarrow \text{OPEN} \longrightarrow \text{LIVE} \longrightarrow \text{ENDED} \longrightarrow \text{PAYMENT\_PENDING} \longrightarrow \text{COMPLETED} \quad \text{or} \quad \text{DEFAULTED}$$
8. **48-Hour Winner Payment Deadline**:
   - Winner must pay the winning bid via Razorpay within 48 hours.
   - Schedulers check pending deadlines every minute. If expired:
     - `orderStatus = 'DEFAULTED'`
     - `auction.status = 'DEFAULTED'`
     - `user.auctionAccessStatus = 'BLOCKED'`
     - `user.membershipStatus = 'FORFEITED'` (retains the original ₹49 fee).
9. **Reactivation After Default**:
   - Defaulted user can reactivate access by paying ₹49 again, unlocking a new 365-day access cycle.
10. **Immutable Bid History & Audit Logs**:
    - Neither users nor administrators can alter bid records or audit logs.

---

## 💻 Technology Stack

### Frontend
- **React 19 & Vite**
- **Tailwind CSS** with custom luxury dark aesthetic (`#08080A`, gold accents `#D4AF37`)
- **Socket.IO Client** (real-time bid updates, room join/leave, live notifications)
- **React Router 7** (Collector & Admin routing with role guards)
- **Axios** (JWT interceptor & error sanitization)
- **Lucide React** (high-end vector icons)
- **Canvas Confetti** (winner and activation celebrations)

### Backend
- **Node.js & Express.js**
- **Socket.IO** (room-based live bidding broadcasts)
- **Mongoose & MongoDB Atlas**
- **JWT (JSON Web Tokens) & BcryptJS (12 salt rounds)**
- **Razorpay Node SDK** (Orders & HMAC SHA-256 signature verification)
- **Nodemailer** (SMTP responsive transactional email templates)
- **Node-Cron** (automated background lifecycle transitions)
- **Express-Rate-Limit** (anti-abuse for auth, emails, and bidding)
- **Helmet, CORS, Express-Validator, Multer & Cloudinary**

---

## 🗄 Database Models & Indexes

| Model | Key Fields | Database Indexes |
|---|---|---|
| **User** | `name`, `email`, `passwordHash`, `role`, `emailVerified`, `membershipStatus`, `auctionAccessStatus`, `membershipExpiresAt` | Unique `email`, `role`, `membershipStatus` |
| **Product** | `name`, `styleId`, `description`, `category`, `brand`, `startingPrice`, `images`, `active` | Unique `styleId`, `category`, `active` |
| **Auction** | `productId`, `startingBid`, `currentBid`, `bidIncrement`, `participantLimit`, `participantCount`, `startTime`, `endTime`, `status`, `winnerId`, `paymentDeadline` | `(status, startTime)`, `(status, endTime)` |
| **Participant**| `auctionId`, `userId`, `joinedAt` | **Unique Compound `(auctionId, userId)`** |
| **Bid** | `auctionId`, `userId`, `amount`, `serverTimestamp` | `(auctionId, createdAt: -1)`, `(auctionId, amount: -1)` |
| **Order** | `orderId`, `auctionId`, `productId`, `userId`, `winningBid`, `paymentStatus`, `orderStatus`, `paymentDeadline`, `shippingAddress` | Unique `orderId`, `(paymentStatus, paymentDeadline)` |
| **MembershipPayment** | `userId`, `amount`, `razorpayOrderId`, `razorpayPaymentId`, `status`, `activatedAt`, `expiresAt` | Unique `razorpayPaymentId`, `userId` |
| **Notification** | `userId`, `type`, `title`, `message`, `data`, `read` | `(userId, read: 1, createdAt: -1)` |
| **AuditLog** | `actorId`, `actorEmail`, `action`, `entity`, `entityId`, `metadata`, `ipAddress` | `(entity, entityId)`, `createdAt: -1` |

---

## 🔑 Prerequisites & Environment Configuration

### Backend `.env` Setup
Create `backend/.env` based on `backend/.env.example`:

```env
PORT=5000
NODE_ENV=development
SERVER_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/genzstyle?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM="GENZSTYLE <no-reply@genzstyle.com>"

RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpayKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourRazorpayWebhookSecretHere

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ADMIN_EMAIL=admin@genzstyle.com
ADMIN_PASSWORD=AdminSecurePassword123!
```

---

## 🚀 Local Development Setup

### 1. Install Dependencies
From the repository root:
```bash
npm run install:all
```

### 2. Start Both Services Concurrently
```bash
npm run dev
```
- Backend starts at: `http://localhost:5000`
- Frontend starts at: `http://localhost:5173`

---

## 🧪 Running End-to-End Automated Tests

GENZSTYLE includes an in-memory regression suite that validates all 20 business rules (including duplicate prevention, race collisions, 100-cap rejections, 48h deadline defaults, and reactivation):

```bash
npm test
```

Expected output:
```text
✔ 1. Signup, Duplicate Email Prevention & Email Verification
✔ 2. Membership Payment Verification & 365-Day Validity
✔ 3. Auction Join, 100-Participant Limit & Duplicate Prevention
✔ 4. Atomic Bidding, Strict ₹10 Increments & Race-Condition Collision
✔ 5. Auction Conclusion, Winner Selection & 48-Hour Payment Window
✔ 6. Payment Expiry, Default Enforcement & ₹49 Reactivation
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

---

## 🌱 Development Seeding

To populate test products and sample drops for local inspection:
```bash
npm run seed
```
*(Notice: Seeding is blocked in production to protect real customer data).*

---

## 💳 Payment & Razorpay Webhook Configuration

1. In your Razorpay Dashboard, navigate to **Settings > Webhooks**.
2. Add Webhook URL: `https://your-domain.com/api/payments/razorpay/webhook`
3. Secret: Enter the same secret as `RAZORPAY_WEBHOOK_SECRET`.
4. Select active events:
   - `payment.captured`
   - `payment.failed`
5. The backend validates HMAC SHA-256 signatures idempotently so redundant webhooks never duplicate payments.

---

## 🛡 Security Notes

- **Password Storage**: Salting and hashing via Bcrypt (12 rounds).
- **Sanitized JSON**: Model transforms strip `passwordHash`, `emailVerificationTokenHash`, and internal tokens before sending to clients.
- **Structured Redaction**: Structured logging automatically redacts tokens, signatures, and credentials.
- **Admin Access**: Protected by dual middleware (`authenticate` and `requireAdmin`). Public signups cannot grant admin roles.
- **Anti-Abuse**: Rate limiting on login (10 attempts/15m), signup, email requests, and bid submissions.

---

## 📄 License
Proprietary &copy; GENZSTYLE Marketplace. All rights reserved.
