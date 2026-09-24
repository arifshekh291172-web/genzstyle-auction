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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:static bg-luxury-black/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t md:border-t-0 border-luxury-border p-3 sm:p-4 md:p-0 safe-area-inset-bottom">
      {/* Highest Bidder / Outbid Indicator */}
      {isHighestBidder && (
        <div className="mb-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-bold py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center justify-center gap-1.5 sm:gap-2 animate-fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span className="truncate">YOU ARE CURRENTLY HIGHEST BIDDER</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 sm:gap-4">
        {/* Bid Status Summary */}
        <div className="flex-1 min-w-0">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-400 font-medium truncate">
            Next Authoritative Bid
          </div>
          <div className="font-display font-black text-lg xs:text-xl md:text-2xl text-luxury-gold truncate">
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
              className="w-full py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 cursor-not-allowed whitespace-nowrap"
            >
              IN THE LEAD
            </button>
          ) : !isLive ? (
            <button
              disabled
              className="w-full py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider bg-luxury-card border border-luxury-border text-gray-500 cursor-not-allowed whitespace-nowrap"
            >
              {disabledReason || 'AUCTION CLOSED'}
            </button>
          ) : (
            <button
              onClick={onBid}
              disabled={bidding}
              className="w-full py-2.5 sm:py-3 md:py-3.5 px-3 sm:px-6 rounded-xl font-bold text-[11px] sm:text-xs md:text-sm uppercase tracking-wider bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold-dark text-black hover:brightness-110 active:scale-95 transition-all shadow-luxury-gold flex items-center justify-center gap-1.5 sm:gap-2 font-display whitespace-nowrap"
            >
              <Gavel className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{bidding ? 'VALIDATING...' : `BID ₹${nextBid.toLocaleString('en-IN')}`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StickyBidBar;
