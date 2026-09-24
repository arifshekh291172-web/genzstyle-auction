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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-luxury-border/60">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase font-display">
            ALL EXCLUSIVE DROPS
          </h1>
          <p className="text-xs md:text-sm text-gray-400 mt-1">
            Limited to 100 collectors per room. Strictly authoritative ₹10 increments.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by brand, item, or style ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-luxury-surface border border-luxury-border/80 rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-6">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition flex items-center gap-1.5 shrink-0 ${
                selectedStatus === s.value
                  ? 'bg-luxury-gold text-black shadow-luxury-gold'
                  : 'bg-luxury-surface text-gray-400 hover:text-white border border-luxury-border/60'
              }`}
            >
              {s.isLive && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
                selectedCategory === c
                  ? 'text-luxury-gold bg-luxury-gold/10 border border-luxury-gold/30'
                  : 'text-gray-400 hover:text-white hover:bg-luxury-surface/50'
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
