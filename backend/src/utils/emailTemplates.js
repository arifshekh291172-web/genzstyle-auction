/**
 * Luxury HTML Email Templates for GENZSTYLE
 * Palette: Near-black (#0B0C10), Gold (#D4AF37), Warm white (#F7F7F8), Muted Grey (#888899)
 */

const baseEmailLayout = ({ title, preheader, content }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0B0C10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #E5E7EB; }
    .wrapper { width: 100%; max-width: 600px; margin: 0 auto; background-color: #12131A; border: 1px solid #232430; border-radius: 12px; overflow: hidden; }
    .header { padding: 36px 32px 24px; text-align: center; border-bottom: 1px solid #1E202B; }
    .brand { font-size: 26px; font-weight: 800; letter-spacing: 4px; color: #FFFFFF; text-transform: uppercase; margin: 0; }
    .brand span { color: #D4AF37; }
    .tagline { font-size: 11px; letter-spacing: 2px; color: #9CA3AF; text-transform: uppercase; margin-top: 6px; }
    .content { padding: 36px 32px; font-size: 15px; line-height: 1.6; color: #D1D5DB; }
    .btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D4AF37 0%, #AA820A 100%); color: #000000 !important; font-weight: 700; text-decoration: none; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; font-size: 13px; margin: 24px 0; }
    .footer { padding: 24px 32px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #1E202B; }
    .card { background-color: #181924; border: 1px solid #282A3A; border-radius: 8px; padding: 20px; margin: 20px 0; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding: 40px 10px; background-color: #0B0C10;">
    <tr>
      <td align="center">
        <div class="wrapper">
          <div class="header">
            <h1 class="brand">GENZ<span>STYLE</span></h1>
            <div class="tagline">Limited. Competitive. Yours.</div>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} GENZSTYLE Marketplace Inc. All rights reserved.</p>
            <p>100 Exclusive Participants per Drop. Guaranteed Authenticity.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const templates = {
  verifyEmail: ({ name, verificationUrl }) => ({
    subject: 'Verify your GENZSTYLE Account',
    html: baseEmailLayout({
      title: 'Verify Your Email',
      preheader: 'Complete your registration to access 100-participant exclusive auctions.',
      content: `
        <h2>Welcome to GENZSTYLE, ${name || 'Collector'}.</h2>
        <p>You're one step away from accessing curated, 100-participant luxury street and archive drops.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="btn" target="_blank">VERIFY EMAIL</a>
        </div>
        <p style="font-size: 13px; color: #9CA3AF;">This verification link will expire in 24 hours. If you did not create this account, please disregard this email.</p>
      `
    }),
    text: `Welcome to GENZSTYLE! Please verify your email by opening this link: ${verificationUrl}`
  }),

  passwordReset: ({ name, resetUrl }) => ({
    subject: 'Reset your GENZSTYLE Password',
    html: baseEmailLayout({
      title: 'Password Reset',
      preheader: 'Reset instructions for your GENZSTYLE account.',
      content: `
        <h2>Password Reset Request</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password. Click the secure link below to choose a new password:</p>
        <div style="text-align: center;">
          <a href="${resetUrl}" class="btn" target="_blank">RESET PASSWORD</a>
        </div>
        <p style="font-size: 13px; color: #9CA3AF;">This link is valid for 1 hour. If you didn't request this, your account is safe and no changes were made.</p>
      `
    }),
    text: `Reset your password with this link: ${resetUrl}`
  }),

  membershipActivated: ({ name, expiresAt, amount = 49 }) => ({
    subject: 'Membership Activated — Welcome to GENZSTYLE',
    html: baseEmailLayout({
      title: 'Membership Confirmed',
      preheader: 'Your annual GENZSTYLE membership is active for 365 days.',
      content: `
        <h2>Access Granted, ${name}.</h2>
        <p>Your GENZSTYLE Annual Membership (₹${amount}) has been successfully activated.</p>
        <div class="card">
          <p style="margin: 0; color: #D4AF37; font-weight: 700; font-size: 16px;">GENZSTYLE VIP PASSPORT</p>
          <p style="margin: 8px 0 0 0; color: #9CA3AF; font-size: 13px;">Status: <strong style="color: #10B981;">ACTIVE</strong></p>
          <p style="margin: 4px 0 0 0; color: #9CA3AF; font-size: 13px;">Valid Through: <strong>${new Date(expiresAt).toLocaleDateString()}</strong> (365 Days)</p>
          <p style="margin: 4px 0 0 0; color: #9CA3AF; font-size: 13px;">Privilege: 100-Participant Drop Access & Real-Time Bidding</p>
        </div>
        <p>Head to the drops section to explore tomorrow's live auctions.</p>
      `
    }),
    text: `Your GENZSTYLE membership of ₹${amount} is now active through ${new Date(expiresAt).toLocaleDateString()}.`
  }),

  auctionJoined: ({ name, productName, startTime, styleId }) => ({
    subject: `Spot Reserved: ${productName} (${styleId})`,
    html: baseEmailLayout({
      title: 'Auction Spot Secured',
      preheader: `You have secured 1 of 100 seats for ${productName}.`,
      content: `
        <h2>You are in, ${name}.</h2>
        <p>Your seat has been atomically reserved for the upcoming drop:</p>
        <div class="card">
          <p style="font-size: 17px; font-weight: 700; margin: 0; color: #FFFFFF;">${productName}</p>
          <p style="font-size: 12px; color: #D4AF37; margin: 4px 0 12px;">STYLE ID: ${styleId}</p>
          <p style="font-size: 13px; color: #9CA3AF; margin: 0;">Start Time: <strong>${new Date(startTime).toLocaleString()}</strong></p>
          <p style="font-size: 13px; color: #9CA3AF; margin: 4px 0 0;">Participant Cap: <strong>Strictly 100 Collectors</strong></p>
        </div>
        <p>Be ready when the timer hits zero. Bids increase in ₹10 increments.</p>
      `
    }),
    text: `You have joined the auction for ${productName}. Start time: ${new Date(startTime).toLocaleString()}.`
  }),

  outbid: ({ name, productName, currentBid, nextBid, auctionUrl }) => ({
    subject: `OUTBID ALERT: ${productName}`,
    html: baseEmailLayout({
      title: 'You Have Been Outbid',
      preheader: `A new bid of ₹${currentBid} was placed on ${productName}.`,
      content: `
        <h2 style="color: #EF4444;">You've Been Outbid!</h2>
        <p>Hello ${name}, another collector placed a bid on <strong>${productName}</strong>.</p>
        <div class="card">
          <p style="margin: 0; font-size: 14px; color: #9CA3AF;">Current Highest Bid: <strong style="color: #FFFFFF; font-size: 18px;">₹${currentBid}</strong></p>
          <p style="margin: 6px 0 0 0; font-size: 14px; color: #9CA3AF;">Next Valid Bid: <strong style="color: #D4AF37; font-size: 18px;">₹${nextBid}</strong></p>
        </div>
        <div style="text-align: center;">
          <a href="${auctionUrl}" class="btn">RETAKE THE LEAD</a>
        </div>
      `
    }),
    text: `You have been outbid on ${productName}. Current bid: ₹${currentBid}. Next bid: ₹${nextBid}. Retake lead at: ${auctionUrl}`
  }),

  auctionWon: ({ name, productName, winningBid, paymentDeadline, orderUrl }) => ({
    subject: `CONGRATULATIONS: You Won ${productName}!`,
    html: baseEmailLayout({
      title: 'Drop Won!',
      preheader: `You won ${productName} for ₹${winningBid}. Complete payment within 48 hours.`,
      content: `
        <h2 style="color: #D4AF37;">CONGRATULATIONS, YOU WON!</h2>
        <p>Hello ${name}, you emerged as the highest bidder for <strong>${productName}</strong>.</p>
        <div class="card" style="border-color: #D4AF37;">
          <p style="margin: 0; font-size: 14px; color: #9CA3AF;">Winning Bid: <strong style="color: #D4AF37; font-size: 22px;">₹${winningBid}</strong></p>
          <p style="margin: 8px 0 0 0; font-size: 14px; color: #EF4444; font-weight: 600;">Payment Deadline: 48 Hours (${new Date(paymentDeadline).toLocaleString()})</p>
          <p style="margin: 6px 0 0 0; font-size: 12px; color: #9CA3AF;">Note: Failing to complete payment within 48 hours will mark the order as DEFAULTED and pause auction access.</p>
        </div>
        <div style="text-align: center;">
          <a href="${orderUrl}" class="btn">PAY ₹${winningBid} & SUBMIT SHIPPING</a>
        </div>
      `
    }),
    text: `Congratulations! You won ${productName} with a bid of ₹${winningBid}. Pay within 48 hours at: ${orderUrl}`
  }),

  paymentReminder: ({ name, productName, winningBid, hoursRemaining, orderUrl }) => ({
    subject: `URGENT: ${hoursRemaining} Hours Left to Pay for ${productName}`,
    html: baseEmailLayout({
      title: 'Payment Deadline Reminder',
      preheader: `Only ${hoursRemaining} hours remaining to secure your win.`,
      content: `
        <h2 style="color: #F59E0B;">Payment Reminder: ${hoursRemaining} Hours Remaining</h2>
        <p>Hello ${name}, this is a reminder to complete payment for <strong>${productName}</strong>.</p>
        <div class="card">
          <p style="margin: 0; color: #9CA3AF;">Amount Due: <strong style="color: #FFFFFF; font-size: 20px;">₹${winningBid}</strong></p>
          <p style="margin: 8px 0 0 0; color: #EF4444; font-weight: 700;">Remaining Time: ${hoursRemaining} Hours</p>
        </div>
        <div style="text-align: center;">
          <a href="${orderUrl}" class="btn">COMPLETE PAYMENT NOW</a>
        </div>
      `
    }),
    text: `Urgent: You have ${hoursRemaining} hours left to pay ₹${winningBid} for ${productName}. Link: ${orderUrl}`
  }),

  paymentSuccessful: ({ name, productName, amount, orderId, trackingUrl }) => ({
    subject: `Payment Confirmed: Order #${orderId}`,
    html: baseEmailLayout({
      title: 'Payment Received',
      preheader: `Payment of ₹${amount} confirmed for Order #${orderId}.`,
      content: `
        <h2 style="color: #10B981;">Payment Received & Confirmed</h2>
        <p>Hello ${name}, your payment for <strong>${productName}</strong> has been verified.</p>
        <div class="card">
          <p style="margin: 0;">Order Reference: <strong>#${orderId}</strong></p>
          <p style="margin: 6px 0 0 0;">Amount Paid: <strong>₹${amount}</strong></p>
          <p style="margin: 6px 0 0 0;">Status: <strong style="color: #10B981;">CONFIRMED</strong></p>
        </div>
        <p>Our curation team is preparing your piece for dispatch. You will receive tracking details once shipped.</p>
      `
    }),
    text: `Payment of ₹${amount} confirmed for order #${orderId} (${productName}).`
  }),

  paymentExpired: ({ name, productName, winningBid }) => ({
    subject: `Notice: 48-Hour Payment Window Expired for ${productName}`,
    html: baseEmailLayout({
      title: 'Order Defaulted',
      preheader: 'Payment window has expired. Auction access is paused.',
      content: `
        <h2 style="color: #EF4444;">Payment Window Expired</h2>
        <p>Hello ${name}, the 48-hour payment window for your winning bid of ₹${winningBid} on <strong>${productName}</strong> has elapsed.</p>
        <div class="card">
          <p style="margin: 0; color: #EF4444; font-weight: 700;">Order Status: DEFAULTED</p>
          <p style="margin: 6px 0 0 0; color: #9CA3AF;">Auction Access: PAUSED</p>
          <p style="margin: 6px 0 0 0; color: #9CA3AF; font-size: 13px;">In accordance with GENZSTYLE rules, the ₹49 membership fee is forfeited and auction access is paused.</p>
        </div>
        <p>You may reactivate your access at any time by renewing your membership for ₹49 in your dashboard.</p>
      `
    }),
    text: `Your 48-hour payment window for ${productName} expired. Order marked defaulted and auction access paused.`
  }),

  orderShipped: ({ name, productName, orderId, trackingInfo }) => ({
    subject: `Dispatched: Your Order #${orderId} is on the way!`,
    html: baseEmailLayout({
      title: 'Order Dispatched',
      preheader: `Your piece ${productName} has shipped.`,
      content: `
        <h2>Your Piece is En Route, ${name}.</h2>
        <p>Your order #${orderId} for <strong>${productName}</strong> has been packaged and handed over to our courier partner.</p>
        <div class="card">
          <p style="margin: 0;">Order: <strong>#${orderId}</strong></p>
          <p style="margin: 6px 0 0 0;">Status: <strong style="color: #3B82F6;">SHIPPED</strong></p>
          ${trackingInfo ? `<p style="margin: 6px 0 0 0;">Tracking: <strong>${trackingInfo}</strong></p>` : ''}
        </div>
      `
    }),
    text: `Your order #${orderId} for ${productName} has shipped!`
  }),

  orderDelivered: ({ name, productName, orderId }) => ({
    subject: `Delivered: Your GENZSTYLE Drop #${orderId}`,
    html: baseEmailLayout({
      title: 'Delivered',
      preheader: `Your order #${orderId} has been successfully delivered.`,
      content: `
        <h2 style="color: #10B981;">Delivered, ${name}.</h2>
        <p>Your order #${orderId} for <strong>${productName}</strong> has been marked as delivered.</p>
        <p>Tag us @GENZSTYLE to show off your winning pickup!</p>
      `
    }),
    text: `Your order #${orderId} for ${productName} has been delivered. Enjoy!`
  })
};

module.exports = templates;
