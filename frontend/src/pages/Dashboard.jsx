import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Gavel,
  History,
  Trophy,
  AlertTriangle,
  Clock,
  ArrowRight,
  Shield,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/admin/StatCard';
import Badge from '../components/common/Badge';
import api from '../api/client';

const Dashboard = () => {
  const { user, membership, hasActiveMembership } = useAuth();
  const [stats, setStats] = useState({
    auctionsJoined: 0,
    totalBids: 0,
    auctionsWon: 0,
    pendingPayments: 0,
  });
  const [recentBids, setRecentBids] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [auctionsRes, bidsRes, ordersRes] = await Promise.all([
          api.get('/users/me/auctions'),
          api.get('/users/me/bids'),
          api.get('/users/me/orders'),
        ]);

        const joined = auctionsRes.data.auctions || [];
        const bids = bidsRes.data.bids || [];
        const orders = ordersRes.data.orders || [];

        const won = orders.filter((o) => ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(o.orderStatus));
        const pending = orders.filter((o) => o.paymentStatus === 'PAYMENT_PENDING' && o.orderStatus === 'PAYMENT_PENDING');

        setStats({
          auctionsJoined: joined.length,
          totalBids: bids.length,
          auctionsWon: won.length,
          pendingPayments: pending.length,
        });

        setRecentBids(bids.slice(0, 5));
        setPendingOrders(pending);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-mobile-nav">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-luxury-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">
              COLLECTOR SANCTUARY
            </span>
            <Badge status={hasActiveMembership ? 'ACTIVE' : 'INACTIVE'} size="xs" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase font-display">
            WELCOME, {user?.name?.split(' ')[0] || 'COLLECTOR'}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time activity overview across your 100-collector drops and pickups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/auctions"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center gap-2"
          >
            <Gavel className="w-4 h-4" />
            <span>BROWSE LIVE DROPS</span>
          </Link>
        </div>
      </div>

      {/* Pending 48h Payment Action Alert */}
      {stats.pendingPayments > 0 && (
        <div className="my-6 p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-300 uppercase tracking-wide">
                ACTION REQUIRED: {stats.pendingPayments} WINNING PAYMENT PENDING
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                Complete checkout within the 48-hour deadline to prevent drop default and access restriction.
              </p>
            </div>
          </div>
          <Link
            to="/orders"
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs uppercase tracking-wider transition shrink-0 text-center"
          >
            SETTLE NOW
          </Link>
        </div>
      )}

      {/* DASHBOARD CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 my-8">
        <StatCard
          title="MEMBERSHIP"
          value={hasActiveMembership ? 'ACTIVE' : 'INACTIVE'}
          icon={Sparkles}
          color={hasActiveMembership ? 'emerald' : 'red'}
        />

        <StatCard
          title="DAYS LEFT"
          value={membership?.daysRemaining || 0}
          icon={Clock}
          color="gold"
        />

        <StatCard
          title="DROPS JOINED"
          value={stats.auctionsJoined}
          icon={Gavel}
          color="blue"
        />

        <StatCard
          title="TOTAL BIDS"
          value={stats.totalBids}
          icon={History}
          color="purple"
        />

        <StatCard
          title="AUCTIONS WON"
          value={stats.auctionsWon}
          icon={Trophy}
          color="emerald"
        />

        <StatCard
          title="PENDING DUE"
          value={stats.pendingPayments}
          icon={AlertTriangle}
          color={stats.pendingPayments > 0 ? 'red' : 'gold'}
        />
      </div>

      {/* Two Column Grid: Pending Orders & Recent Bids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        {/* Pending Orders Box */}
        <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-border mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-luxury-gold" /> Pending Drop Pickups
            </h3>
            <Link to="/orders" className="text-xs text-luxury-gold hover:underline">
              View All Orders
            </Link>
          </div>

          {pendingOrders.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              No pending payment deadlines. All drop accounts clear.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <div
                  key={order._id}
                  className="p-4 rounded-xl bg-luxury-card border border-luxury-border/60 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="font-bold text-xs text-white truncate max-w-xs">
                      {order.productId?.name || 'Exclusive Piece'}
                    </h4>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                      Winning Bid: <strong className="text-luxury-gold">₹{order.winningBid}</strong>
                    </span>
                  </div>
                  <Link
                    to="/orders"
                    className="px-3.5 py-1.5 rounded-lg bg-luxury-gold text-black text-xs font-bold hover:brightness-110 transition shrink-0"
                  >
                    Pay Now
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bids Box */}
        <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6">
          <div className="flex items-center justify-between pb-3 border-b border-luxury-border mb-4">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-luxury-gold" /> Recent Bidding History
            </h3>
            <Link to="/my-auctions" className="text-xs text-luxury-gold hover:underline">
              Joined Drops
            </Link>
          </div>

          {recentBids.length === 0 ? (
            <p className="text-xs text-gray-500 py-8 text-center">
              No bids recorded yet. Enter a live drop to start bidding!
            </p>
          ) : (
            <div className="space-y-2.5">
              {recentBids.map((b) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl bg-luxury-card/60 border border-luxury-border/40 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-200 block truncate max-w-xs">
                      {b.auctionId?.productId?.name || 'Archival Piece'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(b.serverTimestamp || b.createdAt).toLocaleDateString()} &bull;{' '}
                      {new Date(b.serverTimestamp || b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="font-display font-black text-sm text-luxury-gold">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
