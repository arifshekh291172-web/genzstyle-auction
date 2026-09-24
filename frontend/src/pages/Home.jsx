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
    <div className="min-h-screen">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-luxury-border/60">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-luxury-gold/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Strictly 100 Collectors Per Drop</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase font-display leading-[0.95] mb-6">
            TOMORROW’S <br />
            <span className="luxury-text-gold">100 AUCTIONS</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-300 font-medium tracking-wide max-w-2xl mx-auto mb-10">
            Join today. Bid tomorrow. Archival fashion and luxury drops accessible only to 100 verified collectors with authoritative ₹10 increments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/auctions"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-sm uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center justify-center gap-2"
            >
              <span>EXPLORE ALL DROPS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!hasActiveMembership && (
              <Link
                to="/membership"
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10 font-bold text-sm uppercase tracking-wider transition flex items-center justify-center gap-2"
              >
                <span>ACTIVATE VIP — ₹49</span>
              </Link>
            )}
          </div>

          {/* Key Rule Indicators */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-luxury-border/60">
            <div className="p-4 rounded-xl bg-luxury-surface/50 border border-luxury-border/60 text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block">
                Rule 01
              </span>
              <h4 className="font-bold text-white text-sm mt-1">100 Cap</h4>
              <p className="text-xs text-gray-400 mt-0.5">Strict limit atomically reserved per auction</p>
            </div>

            <div className="p-4 rounded-xl bg-luxury-surface/50 border border-luxury-border/60 text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block">
                Rule 02
              </span>
              <h4 className="font-bold text-white text-sm mt-1">+₹10 Increment</h4>
              <p className="text-xs text-gray-400 mt-0.5">Fast, competitive server-authorized clicks</p>
            </div>

            <div className="p-4 rounded-xl bg-luxury-surface/50 border border-luxury-border/60 text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block">
                Rule 03
              </span>
              <h4 className="font-bold text-white text-sm mt-1">48-Hr Checkout</h4>
              <p className="text-xs text-gray-400 mt-0.5">Winners settle within 48h or drop defaults</p>
            </div>

            <div className="p-4 rounded-xl bg-luxury-surface/50 border border-luxury-border/60 text-left">
              <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block">
                Rule 04
              </span>
              <h4 className="font-bold text-white text-sm mt-1">₹49 Annual Pass</h4>
              <p className="text-xs text-gray-400 mt-0.5">365 days of full drop participation access</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SELECTOR & DROPS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-luxury-gold uppercase tracking-widest mb-2">
              <Flame className="w-4 h-4 text-red-500" />
              <span>Curated Selection</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white uppercase font-display">
              Live &amp; Upcoming Drops
            </h2>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
      <section className="bg-luxury-charcoal/60 border-y border-luxury-border/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase font-display mb-4">
              WHY GENZSTYLE IS DIFFERENT
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-10">
              Traditional auctions let bots bid millions in fractions of a second. GENZSTYLE guarantees fair, thrilling human competition by capping every auction at 100 real participants with strict ₹10 bid increments.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
                <Users className="w-8 h-8 text-luxury-gold mb-3" />
                <h4 className="font-bold text-white text-base mb-1">100 Participants Max</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every drop slot is atomically reserved. No infinite waitlists or automated bidding bots.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
                <Gavel className="w-8 h-8 text-luxury-gold mb-3" />
                <h4 className="font-bold text-white text-base mb-1">Authoritative ₹10 Increments</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  No crazy price leaps. Bidding advances in predictable ₹10 steps calculated exclusively server-side.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
                <Award className="w-8 h-8 text-luxury-gold mb-3" />
                <h4 className="font-bold text-white text-base mb-1">100% Genuine Provenance</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Every jacket, sneaker, and archive accessory is verified and authenticated before entering a drop.
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
