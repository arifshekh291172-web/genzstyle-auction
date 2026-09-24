import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Lock, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-luxury-border/60 bg-luxury-charcoal/70 text-gray-400 text-sm mt-20">
      {/* Trust Badges */}
      <div className="border-b border-luxury-border/40 py-8 bg-luxury-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wider uppercase">100 Collectors Cap</p>
              <p className="text-[11px] text-gray-400">Strictly limited seats per drop</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wider uppercase">Real-Time Bidding</p>
              <p className="text-[11px] text-gray-400">Authoritative ₹10 increments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wider uppercase">Guaranteed Genuine</p>
              <p className="text-[11px] text-gray-400">100% verified archival luxury</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-xs tracking-wider uppercase">Razorpay Secured</p>
              <p className="text-[11px] text-gray-400">256-bit encrypted checkout</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid grid-cols-1 md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-luxury-surface border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold">
              G
            </div>
            <span className="font-display font-black text-xl tracking-[0.2em] text-white">
              GENZ<span className="text-luxury-gold">STYLE</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-sm mb-4">
            India's foremost competitive drop marketplace. Curated luxury street fashion, avant-garde footwear, and rare archival accessories reserved for 100 passionate collectors at a time.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-luxury-gold uppercase tracking-widest">
            <span>Limited</span>
            <span>&bull;</span>
            <span>Competitive</span>
            <span>&bull;</span>
            <span>Yours</span>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/auctions" className="hover:text-luxury-gold transition">Upcoming Drops</Link></li>
            <li><Link to="/auctions?status=LIVE" className="hover:text-luxury-gold transition flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>Live Auctions</Link></li>
            <li><Link to="/membership" className="hover:text-luxury-gold transition">Annual Membership (₹49)</Link></li>
            <li><Link to="/how-it-works" className="hover:text-luxury-gold transition">Drop Rules &amp; ₹10 Bidding</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4">Collector Hub</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/my-auctions" className="hover:text-luxury-gold transition">My Joined Auctions</Link></li>
            <li><Link to="/orders" className="hover:text-luxury-gold transition">Won Orders &amp; 48h Window</Link></li>
            <li><Link to="/profile" className="hover:text-luxury-gold transition">Shipping Address</Link></li>
            <li><Link to="/dashboard" className="hover:text-luxury-gold transition">Account Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-4">Assurance</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/faq" className="hover:text-luxury-gold transition">Frequently Asked Questions</Link></li>
            <li><Link to="/contact" className="hover:text-luxury-gold transition">Concierge Support</Link></li>
            <li><span className="text-gray-500">Authenticity Guarantee</span></li>
            <li><Link to="/terms" className="hover:text-luxury-gold transition">Terms &amp; Conditions</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-luxury-border/40 py-6 text-center text-xs text-gray-500">
        <p>&copy; {new Date().getFullYear()} GENZSTYLE Technologies Pvt Ltd. All rights reserved. Authoritative server time: {new Date().getFullYear()}.</p>
      </div>
    </footer>
  );
};

export default Footer;
