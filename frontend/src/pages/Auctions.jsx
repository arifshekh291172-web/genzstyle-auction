import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Radio } from 'lucide-react';
import AuctionCard from '../components/auction/AuctionCard';
import { AuctionCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import api from '../api/client';

const Auctions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

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

  const statuses = [
    { label: 'ALL DROPS', value: 'ALL' },
    { label: 'LIVE NOW', value: 'LIVE', isLive: true },
    { label: 'OPEN FOR JOINING', value: 'OPEN' },
    { label: 'UPCOMING', value: 'UPCOMING' },
    { label: 'COMPLETED', value: 'COMPLETED' },
  ];

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') {
        params.append('status', selectedStatus);
      }
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      params.append('limit', '30');

      const res = await api.get(`/auctions?${params.toString()}`);
      if (res.data.success) {
        setAuctions(res.data.auctions);
      }
    } catch (err) {
      console.error('Failed to load auctions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
      {/* Header & Search */}
      <div className="relative rounded-2xl p-6 sm:p-8 md:p-10 mb-8 border border-luxury-gold/20 royal-card royal-spotlight overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
              <span>ARCHIVAL &bull; LIMITED &bull; STRICT 100 SEATS</span>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase font-display tracking-tight">
              EXCLUSIVE <span className="luxury-text-gold">DROPS</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 max-w-xl leading-relaxed">
              Reserved for 100 verified collectors per room. Atomic ₹10 increments, authenticated provenance, and zero bots.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-88 shrink-0">
            <input
              type="text"
              placeholder="Search by designer, style ID, silhouette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0A0B10]/90 border border-luxury-gold/30 rounded-xl px-4 py-3 pl-10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold/30 transition shadow-inner"
            />
            <Search className="w-4 h-4 text-luxury-gold/80 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-3 sm:py-4 mb-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none w-auto max-w-full">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 shrink-0 ${
                selectedStatus === s.value
                  ? 'luxury-gradient-gold text-black shadow-[0_0_18px_rgba(212,175,55,0.4)]'
                  : 'bg-[#12131C] text-gray-400 hover:text-white border border-luxury-border/60 hover:border-luxury-gold/30'
              }`}
            >
              {s.isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none w-auto max-w-full">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition shrink-0 ${
                selectedCategory === c
                  ? 'text-luxury-gold bg-luxury-gold/15 border border-luxury-gold/40 shadow-[0_0_10px_rgba(212,175,55,0.15)]'
                  : 'text-gray-400 hover:text-white hover:bg-luxury-surface/50 border border-transparent'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>


      {/* Grid of Auctions */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <EmptyState
          title="No Drops Match Your Search"
          description="Try selecting a different status filter or clearing your search term."
          action={
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedCategory('All');
                setSearchTerm('');
              }}
              className="text-xs font-bold text-luxury-gold border border-luxury-gold/40 px-4 py-2 rounded-xl hover:bg-luxury-gold/10 transition"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} onJoinSuccess={fetchAuctions} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Auctions;
