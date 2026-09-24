import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Radio, CheckCircle, Clock } from 'lucide-react';
import AuctionCard from '../components/auction/AuctionCard';
import { AuctionCardSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import api from '../api/client';

const MyAuctions = () => {
  const [activeTab, setActiveTab] = useState('LIVE');
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'LIVE', label: 'LIVE NOW', icon: Radio, count: 0 },
    { id: 'UPCOMING', label: 'UPCOMING & OPEN', icon: Clock, count: 0 },
    { id: 'COMPLETED', label: 'COMPLETED', icon: CheckCircle, count: 0 },
  ];

  const fetchMyAuctions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/users/me/auctions?status=${activeTab}`);
      if (res.data.success) {
        setAuctions(res.data.auctions || []);
      }
    } catch (err) {
      console.error('Failed to load my auctions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12 pb-mobile-nav">
      <div className="pb-6 sm:pb-8 border-b border-luxury-border/60">
        <h1 className="text-2xl xs:text-3xl md:text-5xl font-black text-white uppercase font-display">
          MY JOINED AUCTIONS
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Exclusive 100-collector rooms where your seat is securely reserved.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 sm:gap-3 py-4 sm:py-6 border-b border-luxury-border/60 overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 ${
                isActive
                  ? 'bg-luxury-gold text-black shadow-luxury-gold'
                  : 'bg-luxury-surface text-gray-400 hover:text-white border border-luxury-border/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      ) : auctions.length === 0 ? (
        <div className="pt-8">
          <EmptyState
            title={`No ${activeTab.toLowerCase()} joined drops`}
            description="You have not reserved seats in drops matching this status."
            action={
              <Link
                to="/auctions"
                className="text-xs font-bold text-luxury-gold border border-luxury-gold/50 px-5 py-2.5 rounded-xl hover:bg-luxury-gold/10 transition inline-block"
              >
                Browse Available Drops
              </Link>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={{ ...auction, hasJoined: true }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAuctions;
