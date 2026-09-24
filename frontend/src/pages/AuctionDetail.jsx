import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Users,
  Shield,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowLeft,
  Crown,
  Share2,
} from 'lucide-react';
import ImageGallery from '../components/auction/ImageGallery';
import BidHistory from '../components/auction/BidHistory';
import CountdownTimer from '../components/auction/CountdownTimer';
import StickyBidBar from '../components/auction/StickyBidBar';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../api/client';

const AuctionDetail = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, hasActiveMembership } = useAuth();
  const { socket, joinAuction, leaveAuction } = useSocket();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [joining, setJoining] = useState(false);
  const [bidError, setBidError] = useState(null);
  const [justOutbid, setJustOutbid] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Fetch auction and initial bids
  const loadAuctionData = useCallback(async () => {
    try {
      const res = await api.get(`/auctions/${auctionId}`);
      if (res.data.success) {
        setAuction(res.data.auction);
        setBids(res.data.bids || []);
      }
    } catch (err) {
      console.error('Failed to load auction detail:', err.message);
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadAuctionData();
  }, [loadAuctionData]);

  // Socket.IO Room management & Live Events
  useEffect(() => {
    if (!socket || !auctionId) return;

    // Join room auction:{auctionId}
    joinAuction(auctionId);

    const handleBidPlaced = (payload) => {
      // Update auction state in real-time
      setAuction((prev) => {
        if (!prev) return prev;
        const isMe = user ? payload.bidderId.includes(user._id.toString().slice(-3).toUpperCase()) : false;
        return {
          ...prev,
          currentBid: payload.currentBid,
          nextBid: payload.nextBid,
          isHighestBidder: isMe,
        };
      });

      // Prepend to bid history
      setBids((prev) => [
        {
          _id: `bid_${Date.now()}`,
          amount: payload.amount,
          bidderId: payload.bidderId,
          isCurrentUser: false,
          timestamp: payload.timestamp,
        },
        ...prev,
      ]);

      // Clear any previous collision error
      setBidError(null);
    };

    const handleAuctionEnded = (payload) => {
      setAuction((prev) => (prev ? { ...prev, status: payload.status } : prev));
      setWinnerInfo({
        winnerMasked: payload.winnerMasked,
        winningBid: payload.winningBid,
      });

      // Trigger celebration if current user won
      if (auction?.isHighestBidder) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    };

    socket.on('bid:placed', handleBidPlaced);
    socket.on('auction:ended', handleAuctionEnded);

    return () => {
      socket.off('bid:placed', handleBidPlaced);
      socket.off('auction:ended', handleAuctionEnded);
      leaveAuction(auctionId);
    };
  }, [socket, auctionId, joinAuction, leaveAuction, user, auction?.isHighestBidder]);

  // Join Auction Action
  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/auction/${auctionId}`);
      return;
    }
    if (!hasActiveMembership) {
      navigate('/membership');
      return;
    }

    setJoining(true);
    try {
      const res = await api.post(`/auctions/${auctionId}/join`);
      if (res.data.success) {
        setAuction((prev) => ({
          ...prev,
          hasJoined: true,
          participantCount: res.data.participantCount,
          status: res.data.status,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join auction.');
    } finally {
      setJoining(false);
    }
  };

  // Place Bid Action with Concurrency Safety
  const handleBid = async () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/auction/${auctionId}`);
      return;
    }
    if (!hasActiveMembership) {
      navigate('/membership');
      return;
    }

    setBidding(true);
    setBidError(null);

    try {
      const res = await api.post(`/auctions/${auctionId}/bid`);
      if (res.data.success) {
        setAuction((prev) => ({
          ...prev,
          currentBid: res.data.currentBid,
          nextBid: res.data.nextBid,
          isHighestBidder: true,
        }));
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Bid rejected by server.';
      setBidError(errMsg);

      // If race condition: refresh auction with new price immediately
      if (err.response?.data?.error === 'BID_CHANGED') {
        setAuction((prev) => ({
          ...prev,
          currentBid: err.response.data.currentBid,
          nextBid: err.response.data.nextBid,
          isHighestBidder: false,
        }));
      }
    } finally {
      setBidding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">
          Synchronizing Live Auction Feed...
        </p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Auction Not Found</h2>
        <p className="text-xs text-gray-400 mb-6">
          This drop may have been cancelled or the link is invalid.
        </p>
        <Link
          to="/auctions"
          className="text-xs font-bold text-luxury-gold border border-luxury-gold/50 px-4 py-2 rounded-xl"
        >
          Return to Drops
        </Link>
      </div>
    );
  }

  const product = auction.productId || {};
  const isLive = auction.status === 'LIVE';
  const isPendingPayment = auction.status === 'PAYMENT_PENDING';
  const isEnded = auction.status === 'ENDED' || isPendingPayment || auction.status === 'COMPLETED';
  const nextBidAmount = auction.nextBid || auction.currentBid + (auction.bidIncrement || 10);
  const participantLimit = auction.participantLimit || 100;
  const participantCount = auction.participantCount || 0;
  const isFull = participantCount >= participantLimit;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 pb-mobile-nav">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/auctions"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Drops</span>
        </Link>

        <div className="flex items-center gap-3">
          <Badge status={auction.status} size="sm" />
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Drop link copied to clipboard!');
              }
            }}
            className="p-2 rounded-lg bg-luxury-surface border border-luxury-border text-gray-400 hover:text-white transition"
            aria-label="Share drop"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Visual Product Gallery (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <ImageGallery images={product.images} productName={product.name} />

          {/* Product Specifications & Details */}
          <div className="bg-luxury-surface/60 border border-luxury-border/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-luxury-border/60">
              Piece Specification &amp; Provenance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6">
              <div>
                <span className="text-gray-500 uppercase text-[10px] block">Brand</span>
                <span className="font-semibold text-gray-200">{product.brand || 'Luxury'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] block">Size</span>
                <span className="font-semibold text-gray-200">{product.size || 'M'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] block">Color</span>
                <span className="font-semibold text-gray-200">{product.color || 'Black'}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase text-[10px] block">Condition</span>
                <span className="font-semibold text-emerald-400">{product.condition || 'Brand New'}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        </div>

        {/* Right Column: Live Bidding Console (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Header Card with Style ID & Name */}
          <div className="bg-luxury-surface/90 border border-luxury-border rounded-2xl p-6 shadow-card-dark">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-luxury-gold tracking-widest uppercase">
                STYLE ID: {product.styleId || 'GZS-ARCHIVE'}
              </span>
              <span className="text-[11px] font-semibold text-gray-400 uppercase">
                {product.category}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight font-display mb-4">
              {product.name}
            </h1>

            {/* Winner Announcement Banner if Ended */}
            {isPendingPayment && (
              <div className="p-4 rounded-xl bg-luxury-gold/10 border border-luxury-gold/40 text-center mb-6 animate-fade-in">
                <Crown className="w-6 h-6 text-luxury-gold mx-auto mb-1" />
                <h4 className="font-bold text-white text-sm uppercase tracking-wide">
                  DROP CONCLUDED
                </h4>
                <p className="text-xs text-gray-300 mt-1">
                  Winning Bid: <strong className="text-luxury-gold">₹{auction.currentBid.toLocaleString('en-IN')}</strong>
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Winner has 48 hours to complete payment.
                </p>
              </div>
            )}

            {/* Real-time Bid & Participant Metric Grid */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-luxury-card/70 border border-luxury-border/60 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                  {isLive ? 'CURRENT HIGHEST BID' : 'STARTING BID'}
                </span>
                <span className="font-display font-black text-2xl md:text-3xl text-white">
                  ₹{auction.currentBid.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1">
                  COLLECTORS JOINED
                </span>
                <span className="font-display font-black text-2xl md:text-3xl text-luxury-gold flex items-center gap-1.5">
                  <Users className="w-5 h-5 shrink-0" />
                  {participantCount} <span className="text-sm text-gray-500 font-normal">/ {participantLimit}</span>
                </span>
              </div>
            </div>

            {/* Countdown / Auction Timer */}
            <div className="p-3.5 rounded-xl border border-luxury-border/60 bg-luxury-surface flex items-center justify-between mb-6">
              <span className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-luxury-gold" />
                {isLive ? 'Bidding Concludes In' : 'Bidding Commences In'}
              </span>
              <CountdownTimer
                targetDate={isLive ? auction.endTime : auction.startTime}
                size="md"
              />
            </div>

            {/* Seat Capacity Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-gray-400 text-[11px]">Strict 100-Seat Cap</span>
                <span className="font-bold text-luxury-gold text-[11px]">
                  {Math.min(100, Math.round((participantCount / participantLimit) * 100))}% Capacity
                </span>
              </div>
              <div className="w-full bg-luxury-card rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    isFull ? 'bg-red-500' : 'bg-gradient-to-r from-luxury-gold to-luxury-gold-dark'
                  }`}
                  style={{
                    width: `${Math.min(100, (participantCount / participantLimit) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Dynamic Bid Error Display (e.g., BID_CHANGED concurrency notification) */}
            {bidError && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{bidError}</span>
              </div>
            )}

            {/* Desktop Join / Bidding Actions */}
            {!auction.hasJoined ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-luxury-gold/5 border border-luxury-gold/20 text-xs text-gray-300">
                  <p className="font-semibold text-white mb-0.5">Seat Reservation Required</p>
                  <p className="text-[11px] text-gray-400">
                    To maintain fair competition, only 100 collectors can join this room. Bidding increments are locked at +₹10.
                  </p>
                </div>

                <button
                  onClick={handleJoin}
                  disabled={joining || isFull || isEnded}
                  className="w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{joining ? 'RESERVING SEAT...' : isFull ? 'ROOM AT FULL CAPACITY' : 'JOIN THIS DROP'}</span>
                </button>
              </div>
            ) : isEnded ? (
              <div className="p-4 rounded-xl bg-luxury-card border border-luxury-border text-center text-xs text-gray-400 font-semibold">
                THIS AUCTION HAS ENDED
              </div>
            ) : (
              <div className="hidden md:block">
                <StickyBidBar
                  currentBid={auction.currentBid}
                  nextBid={nextBidAmount}
                  isHighestBidder={auction.isHighestBidder}
                  isLive={isLive}
                  hasJoined={auction.hasJoined}
                  onBid={handleBid}
                  bidding={bidding}
                />
              </div>
            )}
          </div>

          {/* Real-time Bid Feed Feed Component */}
          <BidHistory bids={bids} currentBid={auction.currentBid} />
        </div>
      </div>

      {/* Mobile Sticky Bottom Bidding CTA */}
      {auction.hasJoined && !isEnded && (
        <div className="md:hidden">
          <StickyBidBar
            currentBid={auction.currentBid}
            nextBid={nextBidAmount}
            isHighestBidder={auction.isHighestBidder}
            isLive={isLive}
            hasJoined={auction.hasJoined}
            onBid={handleBid}
            bidding={bidding}
          />
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;
