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
      className="group bg-luxury-surface/90 border border-luxury-border/80 rounded-2xl overflow-hidden flex flex-col justify-between luxury-card-hover relative"
    >
      {/* Visual Top Status Badges */}
      <div className="relative w-full aspect-[4/3] bg-luxury-card overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name || 'Luxury Drop'}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-transparent to-black/30"></div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge status={auction.status} size="sm" />
        </div>

        {/* Style ID Badge */}
        <div className="absolute top-3 right-3 z-10 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-luxury-border/80 text-[10px] font-mono tracking-wider text-luxury-gold uppercase font-bold">
          {product.styleId || 'GZS-ARCHIVE'}
        </div>

        {/* Countdown / Live Indicator */}
        <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
          <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-luxury-border/60">
            {isLive ? (
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                LIVE NOW
              </span>
            ) : (
              <CountdownTimer targetDate={auction.startTime} />
            )}
          </div>

          <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-luxury-border/60 text-[11px] text-gray-300 font-semibold flex items-center gap-1.5">
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
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
            {product.brand || 'Luxury Archive'} &bull; {product.category}
          </div>
          <h3 className="font-bold text-sm md:text-base text-white group-hover:text-luxury-gold transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        {/* Participant Progress Bar */}
        <div className="mt-4 pt-3 border-t border-luxury-border/60">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-gray-400 text-[11px]">Seat Allocation</span>
            <span className="font-bold text-[11px] text-luxury-gold">
              {Math.min(100, Math.round((participantCount / (auction.participantLimit || 100)) * 100))}% Filled
            </span>
          </div>
          <div className="w-full bg-luxury-card rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFull ? 'bg-red-500' : 'bg-gradient-to-r from-luxury-gold to-luxury-gold-dark'
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
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
              {isLive ? 'Current Bid' : 'Starting Bid'}
            </span>
            <span className="font-display font-black text-base sm:text-lg md:text-xl text-white">
              ₹{(isLive ? auction.currentBid : auction.startingBid || 0).toLocaleString('en-IN')}
            </span>
          </div>

          {joined ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl whitespace-nowrap">
              <Check className="w-3.5 h-3.5" /> SEAT SECURED
            </span>
          ) : isLive ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-black bg-gradient-to-r from-luxury-gold to-luxury-gold-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl group-hover:brightness-110 shadow-luxury-gold transition whitespace-nowrap">
              ENTER LIVE ROOM <ArrowRight className="w-3.5 h-3.5" />
            </span>
          ) : isFull ? (
            <span className="text-[11px] sm:text-xs font-bold text-gray-400 bg-luxury-card px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-luxury-border whitespace-nowrap">
              CAP REACHED
            </span>
          ) : (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="text-[11px] sm:text-xs font-bold text-luxury-gold bg-luxury-gold/10 hover:bg-luxury-gold hover:text-black border border-luxury-gold/40 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3" />
              {joining ? 'RESERVING...' : 'JOIN DROP'}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default AuctionCard;
