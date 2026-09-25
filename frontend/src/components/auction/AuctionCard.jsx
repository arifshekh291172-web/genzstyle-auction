import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Sparkles, ArrowRight, Check } from 'lucide-react';
import Badge from '../common/Badge';
import CountdownTimer from './CountdownTimer';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

const AuctionCard = ({ auction, onJoinSuccess = null }) => {
  const { isAuthenticated, hasActiveMembership } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(auction.hasJoined);
  const [participantCount, setParticipantCount] = useState(auction.participantCount || 0);

  const product = auction.productId || {};
  const isLive = auction.status === 'LIVE';
  const isOpen = auction.status === 'OPEN' || auction.status === 'UPCOMING';
  const isFull = participantCount >= (auction.participantLimit || 100);
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80';

  const handleJoin = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login?redirect=/auctions');
      return;
    }

    if (!hasActiveMembership) {
      navigate('/membership');
      return;
    }

    setJoining(true);
    try {
      const res = await api.post(`/auctions/${auction._id}/join`);
      if (res.data.success) {
        setJoined(true);
        setParticipantCount(res.data.participantCount);
        if (onJoinSuccess) onJoinSuccess(auction._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join auction.');
    } finally {
      setJoining(false);
    }
  };

  return (
    <Link
      to={`/auction/${auction._id}`}
      className="group royal-card rounded-2xl overflow-hidden flex flex-col justify-between luxury-card-hover relative"
    >
      {/* Visual Top Status Badges */}
      <div className="relative w-full aspect-[4/3] museum-frame overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name || 'Luxury Drop'}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-black/25 to-black/40"></div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge status={auction.status} size="sm" />
        </div>

        {/* Lot # / Style ID Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-luxury-gold/40 text-[9.5px] tracking-[0.16em] text-luxury-gold uppercase font-mono font-bold shadow-[0_0_12px_rgba(212,175,55,0.2)]">
          LOT #{product.styleId || `GZS-${auction._id.slice(-4).toUpperCase()}`}
        </div>

        {/* Countdown / Live Indicator Capsule */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between gap-2">
          <div className="bg-[#090A10]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-luxury-gold/25 shadow-md">
            {isLive ? (
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                LIVE SALON
              </span>
            ) : (
              <CountdownTimer targetDate={auction.startTime} />
            )}
          </div>

          <div className="bg-[#090A10]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-luxury-gold/25 text-[11px] text-gray-200 font-semibold flex items-center gap-1.5 shadow-md font-mono">
            <Users className="w-3.5 h-3.5 text-luxury-gold" />
            <span>
              {participantCount} / {auction.participantLimit || 100}
            </span>
          </div>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-luxury-gold/90 mb-1 flex items-center gap-1.5 font-mono">
            <span>{product.brand || 'Luxury Archive'}</span>
            <span className="text-gray-600">&bull;</span>
            <span className="text-gray-400">{product.category}</span>
          </div>
          <h3 className="font-bold text-sm md:text-base text-white group-hover:text-luxury-gold transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Participant Progress Bar */}
        <div className="mt-4 pt-3 border-t border-luxury-border/60">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium font-mono">Seat Capacity</span>
            <span className="font-bold text-[11px] text-luxury-gold font-mono">
              {Math.min(100, Math.round((participantCount / (auction.participantLimit || 100)) * 100))}% Filled
            </span>
          </div>
          <div className="w-full bg-[#151620] rounded-full h-1.5 overflow-hidden border border-luxury-gold/20">
            <div
              className={`h-full transition-all duration-700 ${
                isFull ? 'bg-red-500' : 'bg-gradient-to-r from-luxury-gold via-yellow-300 to-luxury-gold-dark shadow-[0_0_10px_rgba(212,175,55,0.4)]'
              }`}
              style={{
                width: `${Math.min(100, (participantCount / (auction.participantLimit || 100)) * 100)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Pricing & Join Action */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">
              {isLive ? 'Current Highest Bid' : 'Starting Reserve'}
            </span>
            <span className="font-bold font-price text-base sm:text-lg md:text-xl text-white flex items-baseline">
              <span className="text-luxury-gold mr-0.5 text-sm font-bold">₹</span>
              {(isLive ? auction.currentBid : auction.startingBid || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {joined ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-3.5 py-2 rounded-xl whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.2)]">
              <Check className="w-3.5 h-3.5" /> SEAT RESERVED
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-black text-black luxury-gradient-gold px-4 py-2.5 rounded-xl group-hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.35)] transition whitespace-nowrap luxury-shimmer-btn">
              ENTER SALON <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : isFull ? (
            <span className="text-[11px] sm:text-xs font-bold text-gray-400 bg-[#12131D] px-3 py-2 rounded-xl border border-luxury-border whitespace-nowrap">
              ROOM FULL (100/100)
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="text-[11px] sm:text-xs font-bold text-luxury-gold bg-luxury-gold/15 hover:bg-luxury-gold hover:text-black border border-luxury-gold/40 px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:shadow-[0_0_18px_rgba(212,175,55,0.4)] luxury-shimmer-btn"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {joining ? 'RESERVING...' : 'RESERVE SEAT'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
