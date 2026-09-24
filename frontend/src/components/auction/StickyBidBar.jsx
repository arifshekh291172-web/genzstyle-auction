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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:static bg-luxury-black/95 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none border-t md:border-t-0 border-luxury-border p-4 md:p-0 safe-area-inset-bottom">
      {/* Highest Bidder / Outbid Indicator */}
      {isHighestBidder && (
        <div className="mb-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>YOU ARE CURRENTLY HIGHEST BIDDER</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {/* Bid Status Summary */}
        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
            Next Authoritative Bid
          </div>
          <div className="font-display font-black text-xl md:text-2xl text-luxury-gold">
            ₹{nextBid.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Sticky Bid Action Button */}
        <div className="flex-1 max-w-xs">
          {!hasJoined ? (
            <div className="text-right">
              <span className="text-xs text-amber-400 font-semibold block">
                Join Drop Required
              </span>
            </div>
          ) : isHighestBidder ? (
            <button
              disabled
              className="w-full py-3 md:py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-950/50 border border-emerald-500/50 text-emerald-400 cursor-not-allowed"
            >
              IN THE LEAD
            </button>
          ) : !isLive ? (
            <button
              disabled
              className="w-full py-3 md:py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-luxury-card border border-luxury-border text-gray-500 cursor-not-allowed"
            >
              {disabledReason || 'AUCTION CLOSED'}
            </button>
          ) : (
            <button
              onClick={onBid}
              disabled={bidding}
              className="w-full py-3 md:py-3.5 px-6 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold-dark text-black hover:brightness-110 active:scale-95 transition-all shadow-luxury-gold flex items-center justify-center gap-2 font-display"
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
