import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, MessageCircle } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, auctionTitle, currentPrice, auctionUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = auctionUrl || window.location.href;
  const message = `🔥 Check out this exclusive street luxury drop on GENZSTYLE: "${auctionTitle || 'Limited Streetwear Piece'}"! Starting/Current bid: ₹${currentPrice || '---'}. Strictly 100 collectors allowed per room. Join the drop before it locks: ${shareUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const handleTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
    window.open(twUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-luxury-surface border border-luxury-border rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-2xl shadow-luxury-gold/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition rounded-xl bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white uppercase font-display">
              Spread The Drop
            </h3>
            <p className="text-xs text-gray-400">Invite your circle into the 100-collector sanctuary</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-luxury-card border border-luxury-border/60 mb-6">
          <span className="text-[11px] font-bold text-luxury-gold uppercase block mb-1">
            Drop Preview
          </span>
          <p className="text-xs text-white font-bold truncate">{auctionTitle || 'Exclusive Archival Drop'}</p>
          <span className="text-[10px] text-gray-400 font-mono">
            Current Price: ₹{currentPrice || '---'} &bull; 100 Seats Max
          </span>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={handleTwitter}
            className="w-full py-3 px-4 rounded-xl bg-black border border-luxury-border hover:border-gray-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2.5"
          >
            <Send className="w-4 h-4" />
            <span>Post on X (Twitter)</span>
          </button>

          {/* Copy Link input */}
          <div className="pt-2">
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black border border-luxury-border">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-transparent px-3 py-1.5 text-xs text-gray-300 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-lg bg-luxury-gold text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shrink-0 flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
