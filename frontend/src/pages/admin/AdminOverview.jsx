import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Sparkles,
  Gavel,
  Radio,
  History,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import api from '../../api/client';

const AdminOverview = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/metrics');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        console.error('Failed to load metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="EXECUTIVE OVERVIEW"
        subtitle="Real-time verified operations telemetry from MongoDB"
      />

      <div className="p-6 md:p-8 space-y-8 flex-1">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Aggregating MongoDB Collections...
          </div>
        ) : (
          <>
            {/* Top Revenue Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-luxury-surface to-luxury-card border-2 border-luxury-gold/50 rounded-2xl p-6 shadow-luxury-glow">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  GROSS PLATFORM VOLUME
                </span>
                <span className="font-display font-black text-3xl md:text-4xl text-white">
                  ₹{Number(metrics?.totalGrossVolume || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-luxury-gold mt-2 block font-semibold">
                  Membership + Auction Sales
                </span>
              </div>

              <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  MEMBERSHIP REVENUE (₹49)
                </span>
                <span className="font-display font-black text-3xl text-luxury-gold">
                  ₹{Number(metrics?.membershipRevenue || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-400 mt-2 block">
                  {metrics?.activeMemberships || 0} Active VIP Passports
                </span>
              </div>

              <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  SETTLED AUCTION SALES
                </span>
                <span className="font-display font-black text-3xl text-emerald-400">
                  ₹{Number(metrics?.auctionSales || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-400 mt-2 block">
                  {metrics?.completedOrders || 0} Settled Orders
                </span>
              </div>
            </div>

            {/* Operational Telemetry Grid */}
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display pt-4">
              Real Database Metrics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <StatCard
                title="TOTAL USERS"
                value={metrics?.totalUsers}
                icon={Users}
                color="gold"
              />

              <StatCard
                title="VERIFIED USERS"
                value={metrics?.verifiedUsers}
                icon={ShieldCheck}
                color="emerald"
              />

              <StatCard
                title="ACTIVE MEMBERSHIPS"
                value={metrics?.activeMemberships}
                icon={Sparkles}
                color="gold"
              />

              <StatCard
                title="ACTIVE AUCTIONS"
                value={metrics?.activeAuctions}
                icon={Gavel}
                color="blue"
              />

              <StatCard
                title="LIVE NOW"
                value={metrics?.liveAuctions}
                icon={Radio}
                color="red"
              />

              <StatCard
                title="TOTAL PARTICIPANTS"
                value={metrics?.totalParticipants}
                icon={Users}
                color="purple"
              />

              <StatCard
                title="TOTAL BIDS PLACED"
                value={metrics?.totalBids}
                icon={History}
                color="gold"
              />

              <StatCard
                title="PAYMENT PENDING"
                value={metrics?.paymentPendingOrders}
                icon={Clock}
                color="red"
              />

              <StatCard
                title="COMPLETED ORDERS"
                value={metrics?.completedOrders}
                icon={CheckCircle2}
                color="emerald"
              />

              <StatCard
                title="DEFAULTED AUCTIONS"
                value={metrics?.defaultedAuctions}
                icon={AlertTriangle}
                color="red"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
