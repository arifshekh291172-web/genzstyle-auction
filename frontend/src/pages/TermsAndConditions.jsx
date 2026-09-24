import React from 'react';
import { ShieldAlert, Award, Clock, DollarSign, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-luxury-black text-gray-300 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-luxury-gold transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </Link>

        {/* Header */}
        <div className="border-b border-luxury-border/80 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold text-xs font-mono mb-4">
            <Award className="w-3.5 h-3.5" />
            <span>OPERATING BINDING PROTOCOL</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide font-display uppercase">
            GENZSTYLE Terms & Conditions
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-mono">
            Last Updated: September 2026 • Effective Immediately Across All Drops & Memberships
          </p>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <Users className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">100 Collectors Cap</h2>
            <p className="text-[11px] text-gray-400 mt-1">Strict limit enforced atomically. 101st collector is locked out.</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <DollarSign className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">Strict +₹10 Increment</h2>
            <p className="text-[11px] text-gray-400 mt-1">Fixed ₹10 step. Bids calculated server-side; manual inputs blocked.</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <Clock className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">48-Hour Deadline</h2>
            <p className="text-[11px] text-gray-400 mt-1">Winners must settle winning bid within 48h via Razorpay.</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">Forfeiture Rule</h2>
            <p className="text-[11px] text-gray-400 mt-1">Defaulted orders forfeit ₹49 pass and pause auction access.</p>
          </div>
        </div>

        {/* Core Sections */}
        <div className="space-y-10 text-sm leading-relaxed">
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>1. Annual Collector Membership (₹49 / 365 Days)</span>
            </h2>
            <p className="mb-3">
              1.1 Access to participate in GENZSTYLE drops requires an active VIP Membership Passport priced at ₹49 per 365-day calendar cycle.
            </p>
            <p className="mb-3">
              1.2 Membership duration begins at the exact second the Razorpay payment signature is verified by our servers and remains active for exactly 365 days.
            </p>
            <p className="text-luxury-gold text-xs font-mono bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg p-3">
              1.3 The ₹49 fee is strictly non-refundable and does not extend automatically on login or winning drops. Upon expiry, members must renew for ₹49 to regain active bidding privileges.
            </p>
          </section>

          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>2. Limited 100-Participant Cap & Atomic Reservation</span>
            </h2>
            <p className="mb-3">
              2.1 To maintain true exclusivity and high competition, every individual auction drop is strictly capped at a maximum of 100 verified collectors.
            </p>
            <p className="mb-3">
              2.2 Reservation of an auction slot is executed atomically via database-level concurrency constraints. Once the 100th slot is reserved, all subsequent join attempts are unconditionally rejected.
            </p>
            <p>
              2.3 One collector can only join a drop once. Duplicate participation attempts are cryptographically blocked.
            </p>
          </section>

          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>3. Real-Time Bidding Mechanics & ₹10 Rule</span>
            </h2>
            <p className="mb-3">
              3.1 Every valid bid increases the current bid by exactly ₹10 (INR). Manual input of custom amounts is disabled across all platforms.
            </p>
            <p className="mb-3">
              3.2 The auction timer and bid order are 100% server-authoritative. In the event of simultaneous clicks by two participants, optimistic concurrency guarantees that only the first received packet succeeds; the second request receives an immediate notification to place the next increment.
            </p>
            <p>
              3.3 Highest bidders cannot place consecutive bids against themselves.
            </p>
          </section>

          <section className="bg-luxury-surface/50 border border-red-500/20 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-red-300 uppercase font-display flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <span>4. Winner Determination, 48-Hour Deadline & Default Forfeiture</span>
            </h2>
            <p className="mb-3">
              4.1 The highest valid bidder when the countdown clock strikes 00:00 is automatically declared the winner and receives an immediate order invoice.
            </p>
            <p className="mb-3">
              4.2 The winner has exactly <strong>48 hours (2,880 minutes)</strong> from the conclusion of the drop to settle the winning bid via our secure Razorpay gateway.
            </p>
            <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 text-xs text-red-200 space-y-2 font-mono">
              <p className="font-bold uppercase tracking-wider text-red-300">Default & Penalty Policy:</p>
              <p>
                • If the winning bid remains unpaid when the 48-hour deadline lapses, the order is declared DEFAULTED.
              </p>
              <p>
                • The winner's auction access is immediately BLOCKED and their current ₹49 membership is permanently FORFEITED.
              </p>
              <p>
                • The original ₹49 membership fee is non-refundable. To regain auction access, the user must pay a new ₹49 reactivation fee to start a new 365-day access cycle.
              </p>
            </div>
          </section>

          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>5. Shipping, Authentication & Delivery</span>
            </h2>
            <p className="mb-3">
              5.1 Once payment is confirmed, the winner must provide a valid domestic Indian shipping address with PIN code.
            </p>
            <p className="mb-3">
              5.2 All items undergo thorough physical condition authentication at our lead curation vault before white-glove dispatched delivery with tracking.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-luxury-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <p>© {new Date().getFullYear()} GENZSTYLE Marketplace Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="hover:text-luxury-gold transition">FAQ</Link>
            <Link to="/membership" className="hover:text-luxury-gold transition">Membership</Link>
            <Link to="/contact" className="hover:text-luxury-gold transition">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
