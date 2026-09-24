import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Flame, Shield, ArrowRight } from 'lucide-react';

const UrgencyTicker = () => {
  return (
    <div className="bg-gradient-to-r from-[#0a0a0d] via-luxury-charcoal to-[#0a0a0d] border-b border-luxury-gold/25 text-white py-1.5 px-3 overflow-hidden text-[10.5px] font-mono tracking-wider relative z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Animated Marquee Stream */}
        <div className="flex items-center gap-6 overflow-hidden whitespace-nowrap min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-bold text-luxury-gold uppercase flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-red-500" />
              LIVE ARCHIVE DROPS
            </span>
          </div>

          <span className="text-gray-400 hidden sm:inline">&bull;</span>
          <span className="text-gray-300 hidden sm:inline truncate">
            Strictly 100 collectors per drop. Atomic ₹10 bid increments.
          </span>

          <span className="text-gray-400 hidden md:inline">&bull;</span>
          <span className="text-gray-300 hidden md:inline truncate">
            📍 Mumbai MMR Exclusive Delivery & 48-Hour Winner Dispatch
          </span>
        </div>

        {/* Call to action */}
        <Link
          to="/membership"
          className="shrink-0 flex items-center gap-1.5 text-luxury-gold hover:text-white transition font-bold uppercase text-[10px] pl-2 border-l border-luxury-border/60"
        >
          <span>Get ₹49 Passport</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};

export default UrgencyTicker;
