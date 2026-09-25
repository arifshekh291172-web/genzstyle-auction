import React from 'react';
import { Gavel, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

const StickyBidBar = ({
  currentBid,
  nextBid,
  isHighestBidder,
  isLive,
  hasJoined,
  onBid,
  bidding,
  disabledReason = null,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:static bg-[#060608]/95 md:bg-transparent backdrop-blur-2xl md:backdrop-blur-none border-t md:border-t-0 border-luxury-gold/30 p-3.5 sm:p-4 md:p-0 safe-area-inset-bottom shadow-[0_-12px_32px_rgba(0,0,0,0.9)] md:shadow-none">
      {/* Highest Bidder / Outbid Indicator */}
      {isHighestBidder && (
        <div className="mb-2.5 bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-[11px] sm:text-xs font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="truncate tracking-wide">YOU ARE CURRENTLY HIGHEST BIDDER</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Bid Status Summary */}
        <div className="flex-1 min-w-0">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-bold truncate">
            Next Authoritative Bid (+₹10)
          </div>
          <div className="font-display font-black text-xl xs:text-2xl md:text-3xl text-luxury-gold truncate font-price">
            ₹{nextBid.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Sticky Bid Action Button */}
        <div className="flex-1 max-w-xs shrink-0">
          {!hasJoined ? (
            <div className="text-right">
              <span className="text-xs text-amber-400 font-semibold block">
                Join Drop Required
              </span>
            </div>
          ) : isHighestBidder ? (
            <button
              disabled
              className="w-full py-3 sm:py-3.5 md:py-4 px-3 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 cursor-not-allowed whitespace-nowrap shadow-inner"
            >
              IN THE LEAD
            </button>
          ) : !isLive ? (
            <button
              disabled
              className="w-full py-3 sm:py-3.5 md:py-4 px-3 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider bg-[#14151E] border border-luxury-border text-gray-500 cursor-not-allowed whitespace-nowrap"
            >
              {disabledReason || 'AUCTION CLOSED'}
            </button>
          ) : (
            <button
              onClick={onBid}
              disabled={bidding}
              className="w-full py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 rounded-xl font-extrabold text-xs sm:text-sm uppercase tracking-wider luxury-gradient-gold text-black hover:brightness-110 active:scale-95 transition-all shadow-[0_0_24px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 font-display whitespace-nowrap luxury-shimmer-btn"
            >
              <Gavel className="w-4 h-4 shrink-0" />
              <span>{bidding ? 'VALIDATING...' : `BID ₹${nextBid.toLocaleString('en-IN')}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyBidBar;
