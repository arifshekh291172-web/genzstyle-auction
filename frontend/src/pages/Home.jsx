import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Users, Gavel, Award } from 'lucide-react';
import AuctionCard from '../components/auction/AuctionCard';
import { AuctionCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { hasActiveMembership } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Footwear',
    'Jackets',
    'Accessories',
    'Outerwear',
    'Topwear',
    'Bottomwear',
    'Shirts',
  ];

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          limit: 12,
        });
        if (selectedCategory !== 'All') {
          queryParams.append('category', selectedCategory);
        }
        const res = await api.get(`/auctions?${queryParams.toString()}`);
        if (res.data.success) {
          setAuctions(res.data.auctions);
        }
      } catch (err) {
        console.error('Error fetching drops:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen royal-bg-atmosphere">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-28 md:pt-28 md:pb-36 overflow-hidden border-b border-luxury-gold/20 royal-spotlight">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[800px] max-w-full h-[450px] bg-luxury-gold/15 blur-[160px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Pill with Emblem */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs font-bold uppercase tracking-[0.22em] mb-8 animate-fade-in shadow-[0_0_24px_rgba(212,175,55,0.25)] max-w-full">
            <img src="/images/logo-icon.png" alt="Emblem" className="w-4 h-4 object-contain shrink-0" />
            <span className="truncate">HAUTE ARCHIVE SALON &bull; MUMBAI, EST. 2026 &bull; STRICTLY 100 VERIFIED SEATS</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] text-white uppercase leading-[0.92] mb-6 font-display">
            HAUTE ARCHIVE <br />
            <span className="luxury-text-gold">PRIVATE AUCTIONS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 font-normal tracking-wide max-w-2xl mx-auto mb-8 sm:mb-10 px-2 leading-relaxed">
            India's premier collector salon. Curated archival grails, bespoke luxury streetwear, and avant-garde footwear accessible only to 100 verified collectors with atomic ₹10 bid increments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 max-w-md mx-auto sm:max-w-none">
            <Link
              to="/auctions"
              className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-xl luxury-gradient-gold text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 transition shadow-[0_0_28px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2.5 luxury-shimmer-btn"
            >
              <span>ENTER DROPS VAULT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!hasActiveMembership && (
              <Link
                to="/membership"
                className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-xl border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/15 font-bold text-xs sm:text-sm uppercase tracking-wider transition flex items-center justify-center gap-2 backdrop-blur-md shadow-sm"
              >
                <span>ACTIVATE VIP — ₹49/YR</span>
              </Link>
            )}
          </div>

          {/* Key Rule Indicators */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-5 max-w-5xl mx-auto pt-8 sm:pt-10 border-t border-luxury-border/60">
            <div className="royal-card p-4 sm:p-5 rounded-2xl luxury-card-hover text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block font-mono">
                RULE 01
              </span>
              <h4 className="font-bold text-white text-xs sm:text-sm mt-1.5">100 Seat Cap</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">Strict cap atomically locked per drop room</p>
            </div>

            <div className="royal-card p-4 sm:p-5 rounded-2xl luxury-card-hover text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block font-mono">
                RULE 02
              </span>
              <h4 className="font-bold text-white text-xs sm:text-sm mt-1.5">+₹10 Increment</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">Ultra-fast real-time server verified bidding</p>
            </div>

            <div className="royal-card p-4 sm:p-5 rounded-2xl luxury-card-hover text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block font-mono">
                RULE 03
              </span>
              <h4 className="font-bold text-white text-xs sm:text-sm mt-1.5">48-Hr Settle</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">Winner checkout window or item rolls over</p>
            </div>

            <div className="royal-card p-4 sm:p-5 rounded-2xl luxury-card-hover text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block font-mono">
                RULE 04
              </span>
              <h4 className="font-bold text-white text-xs sm:text-sm mt-1.5">₹49 Annual Pass</h4>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">365 days of unrestricted drop access</p>
            </div>
          </div>
        </div>
      </section>

      {/* HAUTE SALON MARQUEE TICKER */}
      <div className="border-b border-luxury-gold/25 bg-[#08090E] py-2.5 overflow-hidden shadow-inner">
        <div className="flex items-center justify-around gap-6 whitespace-nowrap text-[10px] sm:text-[11px] font-bold text-luxury-gold/90 tracking-[0.25em] uppercase font-mono overflow-x-auto scrollbar-none px-4">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#D4AF37]"></span>
            STRICT 100-SEAT ROOM CAP
          </span>
          <span className="text-gray-700">&bull;</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#D4AF37]"></span>
            ATOMIC ₹10 BID LOCK
          </span>
          <span className="text-gray-700">&bull;</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#D4AF37]"></span>
            100% ARCHIVAL PROVENANCE
          </span>
          <span className="text-gray-700">&bull;</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#D4AF37]"></span>
            48-HOUR WINNER SETTLEMENT
          </span>
          <span className="text-gray-700 hidden md:inline">&bull;</span>
          <span className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shadow-[0_0_8px_#D4AF37]"></span>
            MUMBAI HAND CONCIERGE
          </span>
        </div>
      </div>

      {/* ROYAL VIP PROVENANCE BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="royal-card rounded-2xl p-4 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-luxury-border/50 shadow-2xl">
          <div className="flex items-center gap-3 pt-2 sm:pt-0">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Provenance</div>
              <div className="text-xs sm:text-sm font-bold text-white">100% Authenticated</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Exclusivity</div>
              <div className="text-xs sm:text-sm font-bold text-white">Strict 100 Seat Cap</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 shadow-sm">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Fair Bidding</div>
              <div className="text-xs sm:text-sm font-bold text-white">₹10 Atomic Step</div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold shrink-0 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Delivery</div>
              <div className="text-xs sm:text-sm font-bold text-white">Mumbai Hand Concierge</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SELECTOR & DROPS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-luxury-gold uppercase tracking-widest mb-1.5 sm:mb-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white uppercase font-display">
              Live &amp; Upcoming Drops
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none w-auto max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider transition shrink-0 uppercase ${
                  selectedCategory === cat
                    ? 'bg-luxury-gold text-black shadow-luxury-gold'
                    : 'bg-luxury-surface text-gray-400 hover:text-white border border-luxury-border/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Drops Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <AuctionCardSkeleton key={i} />
            ))}
          </div>
        ) : auctions.length === 0 ? (
          <EmptyState
            title="No Drops Active Right Now"
            description="Our curators are staging the next 100-participant auction drops. Check back shortly or explore the full drop schedule."
            action={
              <Link
                to="/auctions"
                className="text-xs font-bold text-luxury-gold border border-luxury-gold/50 px-4 py-2 rounded-xl hover:bg-luxury-gold/10 transition"
              >
                View Drop Calendar
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS BANNER */}
      <section className="bg-luxury-charcoal/40 border-y border-luxury-border/60 py-20 relative overflow-hidden royal-spotlight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-luxury-gold uppercase mb-3 font-mono">
              THE PRIVATE ARCHIVE ADVANTAGE
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase font-display mb-4">
              WHY <span className="luxury-text-gold">GENZSTYLE</span> IS DIFFERENT
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-12">
              Traditional auctions let bots outbid collectors in milliseconds. GENZSTYLE guarantees pure human thrill by restricting every drop room to strictly 100 verified collectors with atomic ₹10 bid increments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="royal-card p-6 sm:p-7 rounded-2xl luxury-card-hover">
                <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold mb-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">100 Participants Max</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every drop room slot is atomically reserved. Zero infinite waitlists or high-frequency automated bots.
                </p>
              </div>

              <div className="royal-card p-6 sm:p-7 rounded-2xl luxury-card-hover">
                <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold mb-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <Gavel className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">Authoritative ₹10 Increments</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No sudden predatory price jumps. Bidding advances in predictable ₹10 steps verified strictly server-side.
                </p>
              </div>

              <div className="royal-card p-6 sm:p-7 rounded-2xl luxury-card-hover">
                <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold mb-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-base mb-1.5">100% Genuine Provenance</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every designer piece and archival accessory is individually inspected and authenticated before drop staging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
