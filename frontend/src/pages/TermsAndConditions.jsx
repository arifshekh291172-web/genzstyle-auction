import React from 'react';
import { ShieldCheck, Award, Clock, DollarSign, Users, AlertTriangle, ArrowLeft, MapPin, CheckCircle, Scale, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-luxury-black text-gray-300 py-8 sm:py-12 md:py-16 px-3 sm:px-6 lg:px-8 pb-mobile-nav">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-luxury-gold transition mb-6 sm:mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Marketplace</span>
        </Link>

        {/* Header */}
        <div className="border-b border-luxury-border/80 pb-6 sm:pb-8 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs font-mono mb-4 max-w-full">
            <Scale className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">LEGAL OPERATING PROTOCOL & TERMS OF SERVICE</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-wide font-display uppercase">
            GENZSTYLE Terms & Conditions
          </h1>
          <p className="mt-3 text-[11px] sm:text-sm text-gray-400 font-mono leading-relaxed">
            Effective Date: September 2026 • Governing Law: Republic of India • Exclusive Jurisdiction: Mumbai, Maharashtra
          </p>
          <p className="mt-2 text-[11px] sm:text-xs text-luxury-gold font-mono leading-relaxed">
            Notice: By registering an account, purchasing an Annual Collector Passport (₹49), or participating in any auction drop, you unconditionally enter into a legally binding contract under the Indian Contract Act, 1872 and Information Technology Act, 2000.
          </p>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <MapPin className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">Mumbai Delivery Only</h2>
            <p className="text-[11px] text-gray-400 mt-1">Exclusively serviceable across Mumbai Metropolitan Region (MMR).</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <ShieldCheck className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">Age 18 to 40 Curated</h2>
            <p className="text-[11px] text-gray-400 mt-1">Strict legal majority (18+). Target demographic 18–40 collectors.</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <Clock className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">48-Hour Winner Deadline</h2>
            <p className="text-[11px] text-gray-400 mt-1">Time is of the essence. Default results in ₹49 forfeiture & access block.</p>
          </div>
          <div className="p-4 rounded-xl border border-luxury-border bg-luxury-card/60">
            <DollarSign className="w-5 h-5 text-luxury-gold mb-2" />
            <h2 className="text-xs font-bold text-white uppercase font-mono">₹49 Non-Refundable</h2>
            <p className="text-[11px] text-gray-400 mt-1">Annual platform curation & concurrency fee. 100% non-refundable.</p>
          </div>
        </div>

        {/* Comprehensive Legal Sections */}
        <div className="space-y-8 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>1. Eligibility & Mandatory Age Requirement (18 to 40 Years)</span>
            </h2>
            <p className="mb-3">
              1.1 <strong>Legal Majority:</strong> You must be an individual at least 18 years of age who is competent to enter into a legally enforceable contract under Section 11 of the Indian Contract Act, 1872. Individuals under the age of 18 ("Minors") are strictly prohibited from creating accounts, bidding, or activating memberships.
            </p>
            <p className="mb-3">
              1.2 <strong>Target Demographic:</strong> GENZSTYLE is an exclusive curation marketplace specifically tailored for contemporary and archival fashion collectors aged <strong>18 to 40 years</strong>.
            </p>
            <p className="text-gray-400">
              1.3 <strong>Falsification of Identity:</strong> Providing false age, name, phone number, or identity credentials constitutes material breach and fraud. GENZSTYLE reserves the absolute right to suspend any suspected account immediately and permanently forfeit all associated payments without recourse.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-luxury-surface/50 border border-luxury-gold/30 rounded-2xl p-6 sm:p-8 shadow-luxury-glow/10">
            <h2 className="text-base sm:text-lg font-bold text-luxury-gold uppercase font-display flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-luxury-gold" />
              <span>2. Geographic Service Scope: Mumbai Metropolitan Region (MMR) Only</span>
            </h2>
            <p className="mb-3">
              2.1 <strong>Exclusive Delivery Zone:</strong> All physical drop fulfillment, white-glove courier dispatches, and order deliveries operated by GENZSTYLE are strictly confined to the <strong>Mumbai Metropolitan Region (MMR)</strong>.
            </p>
            <p className="mb-3">
              2.2 <strong>Covered Municipalities:</strong> Eligible delivery locations comprise Mumbai City, Mumbai Suburban District, Thane, Navi Mumbai, Mira-Bhayandar, Kalyan-Dombivli, and Ulhasnagar.
            </p>
            <div className="bg-black/60 border border-luxury-border rounded-xl p-4 text-xs font-mono text-gray-300 space-y-1.5">
              <p className="font-bold text-white uppercase tracking-wider">Outstation Addresses:</p>
              <p>• If an auction winner provides a shipping address located outside the serviceable Mumbai Metropolitan Region, the order cannot be fulfilled via standard delivery.</p>
              <p>• The collector shall be responsible for either providing a verified Mumbai consignee address within the 48-hour window or bearing specialized inter-state freight and transit insurance surcharges.</p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>3. Annual Collector Passport (₹49 / 365 Days) — Absolute Non-Refundability</span>
            </h2>
            <p className="mb-3">
              3.1 <strong>Nature of the Fee:</strong> The ₹49 annual membership fee is an administrative, technical infrastructure, and curation access charge that covers real-time WebSocket room allocations, atomic database slot reservations, and high-frequency auction concurrency for a period of 365 calendar days.
            </p>
            <p className="mb-3">
              3.2 <strong>No Guarantee of Winning:</strong> Payment of the ₹49 fee grants bidding eligibility only. It does NOT guarantee that the user will win an auction, reserve a drop slot before it reaches capacity, or obtain any merchandise.
            </p>
            <div className="bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl p-4 text-xs text-luxury-gold font-mono">
              3.3 <strong>Absolute Non-Refundability:</strong> The ₹49 membership fee is 100% non-refundable under all circumstances, including but not limited to: failure to participate, failure to win any drop, dissatisfaction with drop pricing, account suspension for breach of terms, or default on a winning auction.
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>4. Limited 100-Participant Cap & Atomic Concurrency</span>
            </h2>
            <p className="mb-3">
              4.1 To safeguard true exclusivity and fair competitive bidding, every auction drop on GENZSTYLE is strictly capped at a maximum of 100 verified participants.
            </p>
            <p className="mb-3">
              4.2 Participation slots are allocated atomically on a first-come, first-served basis. The 101st collector attempting to join will be rejected automatically by our backend database engine.
            </p>
            <p>
              4.3 GENZSTYLE accepts zero liability for internet latency, device lag, or carrier delays that prevent a collector from claiming one of the 100 available slots.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>5. Real-Time Bidding Mechanics & ₹10 Increment Rule</span>
            </h2>
            <p className="mb-3">
              5.1 <strong>Authoritative Increment:</strong> Every valid bid increments the current highest bid by exactly ₹10 (INR). Manual entry of arbitrary bid amounts is disabled.
            </p>
            <p className="mb-3">
              5.2 <strong>Irrevocable Legal Commitment:</strong> Placing a bid constitutes a legally binding, irrevocable tender of purchase at the indicated price. Bids cannot be withdrawn, retracted, or cancelled once registered on the server.
            </p>
            <p>
              5.3 <strong>Concurrency Collision Handling:</strong> In the event of simultaneous clicks by multiple collectors, our optimistic locking ensures only the first received packet updates the ledger; subsequent simultaneous requests receive an immediate notification to place the next valid bid.
            </p>
          </section>

          {/* Section 6 - HIGH RISK / BUSINESS PROTECTION */}
          <section className="bg-luxury-surface/50 border border-red-500/30 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-red-300 uppercase font-display flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span>6. 48-Hour Winner Settlement Deadline & Default Liquidated Damages</span>
            </h2>
            <p className="mb-3">
              6.1 <strong>Time is of the Essence:</strong> The collector holding the highest valid bid at the conclusion of the countdown timer is declared the winner and must pay the exact winning bid amount via our secure Razorpay gateway within exactly <strong>48 hours (2,880 minutes)</strong>.
            </p>
            <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 text-xs text-red-200 font-mono space-y-2 mb-4">
              <p className="font-bold text-red-300 uppercase tracking-wider">Default & Forfeiture Policy (Binding Contract Clause):</p>
              <p>• If the winning collector fails to remit full payment within the 48-hour deadline, the order is irrevocably marked as <strong>DEFAULTED</strong>.</p>
              <p>• The collector's current ₹49 membership is <strong>IMMEDIATELY AND PERMANENTLY FORFEITED</strong> as pre-estimated liquidated damages for withholding limited inventory from genuine buyers and distorting drop competition.</p>
              <p>• The defaulting collector's auction access status is immediately <strong>BLOCKED</strong> across the platform.</p>
              <p>• To regain bidding privileges, the defaulting user must pay a fresh ₹49 reactivation fee to initiate a new 365-day access passport.</p>
            </div>
            <p className="text-xs text-gray-400">
              6.2 GENZSTYLE reserves the right to re-auction defaulted inventory or allocate it to the second highest bidder at its sole discretion without any liability to the defaulting bidder.
            </p>
          </section>

          {/* Section 7 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>7. Product Authenticity, Condition Grading & Finality of Sales</span>
            </h2>
            <p className="mb-3">
              7.1 <strong>Condition Grading:</strong> Products offered on GENZSTYLE consist of rare, limited-edition streetwear and archival pieces graded transparently (e.g., Pristine Archive, Brand New, Curated Vintage). High-resolution images and style identifiers are provided.
            </p>
            <p className="mb-3">
              7.2 <strong>Finality of Auction Purchases:</strong> Because auction sales represent competitive liquidation drops with limited quantities, all auction transactions are <strong>FINAL AND NON-RETURNABLE</strong> once delivered and verified against transit damage.
            </p>
            <p>
              7.3 <strong>Transit Damage Claims:</strong> Any physical transit damage must be reported with unboxing video proof within 24 hours of package delivery to our concierge team at support@genzstyle.com.
            </p>
          </section>

          {/* Section 8 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>8. Anti-Chargeback Policy & Fraud Remedies</span>
            </h2>
            <p className="mb-3">
              8.1 Any fraudulent chargeback, payment reversal, or unauthorized dispute filed against verified Razorpay payments (for ₹49 membership or winning bid fulfillment) shall constitute a criminal and civil offense under the Information Technology Act, 2000 and the Indian Penal Code.
            </p>
            <p>
              8.2 GENZSTYLE will pursue immediate legal recovery of all contested sums, legal costs, and damages through competent authorities in Mumbai.
            </p>
          </section>

          {/* Section 9 */}
          <section className="bg-luxury-surface/50 border border-luxury-border/60 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <span>9. Limitation of Liability & Indemnification</span>
            </h2>
            <p className="mb-3">
              9.1 To the maximum extent permitted under applicable law, GENZSTYLE, its promoters, directors, employees, and technological partners shall not be liable for any indirect, incidental, punitive, or consequential damages arising out of your participation in drops or inability to place bids.
            </p>
            <p className="mb-3">
              9.2 In all circumstances, the total cumulative liability of GENZSTYLE to any user for any cause of action shall be strictly limited to the amount of the ₹49 membership fee actually received by GENZSTYLE from that user.
            </p>
            <p>
              9.3 You agree to defend, indemnify, and hold harmless GENZSTYLE from and against any third-party claims, liabilities, damages, or costs resulting from your breach of these Terms.
            </p>
          </section>

          {/* Section 10 */}
          <section className="bg-luxury-surface/50 border border-luxury-gold/40 rounded-2xl p-6 sm:p-8">
            <h2 className="text-base sm:text-lg font-bold text-white uppercase font-display flex items-center gap-2 mb-4">
              <Scale className="w-5 h-5 text-luxury-gold" />
              <span>10. Governing Law, Dispute Resolution & Exclusive Mumbai Jurisdiction</span>
            </h2>
            <p className="mb-3">
              10.1 These Terms and any dispute or claim arising out of or in connection with them shall be governed by and construed exclusively in accordance with the substantive laws of the <strong>Republic of India</strong>.
            </p>
            <p className="text-luxury-gold font-mono bg-luxury-gold/5 border border-luxury-gold/20 rounded-xl p-4">
              10.2 <strong>Exclusive Jurisdiction:</strong> You irrevocably agree that the courts and tribunals situated exclusively in <strong>Mumbai, Maharashtra, India</strong> shall have sole and exclusive jurisdiction over any suit, action, dispute, or proceeding arising out of or relating to your use of the GENZSTYLE platform, membership, auctions, or orders.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-luxury-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-gray-500">
          <p>© {new Date().getFullYear()} GENZSTYLE Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/faq" className="hover:text-luxury-gold transition">FAQ</Link>
            <Link to="/membership" className="hover:text-luxury-gold transition">Membership</Link>
            <Link to="/contact" className="hover:text-luxury-gold transition">Concierge Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
