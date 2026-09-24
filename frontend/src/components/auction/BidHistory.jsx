import React from 'react';
import { History, Crown } from 'lucide-react';

const BidHistory = ({ bids = [], currentBid = 0 }) => {
  return (
    <div className="bg-luxury-surface/80 border border-luxury-border/80 rounded-2xl p-4 md:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-luxury-border/80 mb-3">
        <h4 className="text-xs md:text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
          <History className="w-4 h-4 text-luxury-gold" /> LIVE BID FEED
        </h4>
        <span className="text-[11px] font-mono text-gray-400">
          {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'} Placed
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[360px] divide-y divide-luxury-border/30">
        {bids.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500">
            No bids placed yet. Be the first collector to bid!
          </div>
        ) : (
          bids.map((bid, index) => {
            const isHighest = index === 0;
            const timeStr = bid.timestamp
              ? new Date(bid.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Just now';

            return (
              <div
                key={bid._id || index}
                className={`pt-2 flex items-center justify-between py-2.5 px-3 rounded-xl transition ${
                  isHighest
                    ? 'bg-luxury-gold/10 border border-luxury-gold/30'
                    : bid.isCurrentUser
                    ? 'bg-blue-950/20 border border-blue-500/20'
                    : 'hover:bg-luxury-card/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isHighest
                        ? 'bg-luxury-gold text-black shadow-luxury-gold'
                        : 'bg-luxury-card text-gray-300 border border-luxury-border'
                    }`}
                  >
                    {isHighest ? <Crown className="w-3.5 h-3.5" /> : `#${index + 1}`}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-200 block">
                      {bid.bidderId} {bid.isCurrentUser && <span className="text-luxury-gold text-[10px]">(YOU)</span>}
                    </span>
                    <span className="text-[10px] text-gray-500">{timeStr}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-display font-black text-sm md:text-base ${
                      isHighest ? 'text-luxury-gold' : 'text-white'
                    }`}
                  >
                    ₹{bid.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BidHistory;
