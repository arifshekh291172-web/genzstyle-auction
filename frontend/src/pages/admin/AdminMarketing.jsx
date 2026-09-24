import React, { useState, useEffect } from 'react';
import {
  Flame,
  Send,
  Users,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Share2,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import StatCard from '../../components/admin/StatCard';
import api from '../../api/client';

const AdminMarketing = () => {
  const [auctions, setAuctions] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadMarketingData = async () => {
      try {
        const [auctionsRes, statsRes] = await Promise.all([
          api.get('/admin/auctions'),
          api.get('/marketing/stats'),
        ]);

        if (auctionsRes.data.success) {
          setAuctions(auctionsRes.data.auctions || []);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      } catch (err) {
        console.error('Failed to load marketing dashboard data:', err);
      }
    };

    loadMarketingData();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!selectedAuction) {
      setError('Please select an auction drop to broadcast.');
      return;
    }

    setBroadcasting(true);
    setStatusMessage(null);
    setError(null);

    try {
      const res = await api.post('/marketing/broadcast', {
        auctionId: selectedAuction,
        subject: customSubject || undefined,
        customMessage: customMessage || undefined,
      });

      if (res.data.success) {
        setStatusMessage(`Successfully dispatched drop alert to ${res.data.result?.count || 0} registered collectors!`);
        setCustomSubject('');
        setCustomMessage('');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Broadcast failed.');
    } finally {
      setBroadcasting(false);
    }
  };

  const selectedAuctionData = auctions.find((a) => a._id === selectedAuction);
  const adminWhatsAppShareUrl = selectedAuctionData
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `🔥 GENZSTYLE EXCLUSIVE DROP ALERT: ${selectedAuctionData.productId?.name || 'Street Luxury Piece'} is dropping! Strictly 100 collectors per room. Enter now: ${window.location.origin}/auction/${selectedAuctionData._id}`
      )}`
    : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="AUTOMATED MARKETING & FOMO ENGINE"
        subtitle="Real-time multi-channel collector re-engagement and broadcast command center"
      />

      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 flex-1 min-w-0 w-full max-w-6xl">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
          <StatCard
            title="TOTAL COLLECTORS"
            value={stats?.totalCollectors || 0}
            icon={Users}
            color="gold"
          />
          <StatCard
            title="ACTIVE MEMBERS"
            value={stats?.activeMembers || 0}
            icon={Sparkles}
            color="emerald"
          />
          <StatCard
            title="CONVERSION RATE"
            value={stats?.conversionRate || '0%'}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="CAMPAIGNS DISPATCHED"
            value={stats?.campaignsSent || 0}
            icon={Flame}
            color="red"
          />
        </div>

        {/* Status Alerts */}
        {statusMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2-Column Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: 1-Click Drop Broadcast (7 cols) */}
          <div className="lg:col-span-7 bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2.5 pb-4 border-b border-luxury-border mb-6">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  1-Click Drop Alert Broadcast
                </h3>
                <p className="text-xs text-gray-400">
                  Instantly pushes real-time WebSocket alert + Email blast to all collectors
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Select Drop To Broadcast
                </label>
                <select
                  required
                  value={selectedAuction}
                  onChange={(e) => setSelectedAuction(e.target.value)}
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-luxury-gold"
                >
                  <option value="">-- Choose active or upcoming drop --</option>
                  {auctions.map((a) => (
                    <option key={a._id} value={a._id}>
                      [{a.status}] {a.productId?.name} &bull; ₹{a.currentBid || a.startingBid} ({a.participants?.length || 0}/100 seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Broadcast Headline (Optional)
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="e.g. 🚨 DROP STARTING: Only 10 Seats Left in Balenciaga Room!"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider block mb-1.5">
                  Custom Notification Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Enter urgency announcement. If left blank, standard street-luxury copy is used..."
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <button
                type="submit"
                disabled={broadcasting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-luxury-gold text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{broadcasting ? 'DISPATCHING LIVE...' : 'LAUNCH REAL-TIME BROADCAST'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Viral Marketing Tools (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* WhatsApp Admin Broadcast Card */}
            <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    WhatsApp Status / Broadcast Link
                  </h4>
                  <p className="text-[11px] text-gray-400">Post directly to your WhatsApp status</p>
                </div>
              </div>

              {adminWhatsAppShareUrl ? (
                <a
                  href={adminWhatsAppShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share Selected Drop on WhatsApp</span>
                </a>
              ) : (
                <p className="text-xs text-gray-500 p-3 rounded-xl bg-luxury-card border border-luxury-border text-center">
                  Select a drop in the left form to generate instant WhatsApp broadcast text.
                </p>
              )}
            </div>

            {/* Active Real-Time Features Summary */}
            <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-6 space-y-3.5">
              <h4 className="text-xs font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Automated Systems Active
              </h4>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-luxury-card/60 border border-luxury-border/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Real-Time Social Proof Toaster</span>
                    <span className="text-[11px] text-gray-400">Pushes genuine bids & simulated Mumbai locality events every 14s.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-luxury-card/60 border border-luxury-border/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Drop Scarcity Ticker</span>
                    <span className="text-[11px] text-gray-400">Top-of-screen urgency stream highlighting 100-seat limits & 48h dispatch.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-luxury-card/60 border border-luxury-border/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Instant Outbid Re-engagement</span>
                    <span className="text-[11px] text-gray-400">Automated socket ping and email when a user's lead is overtaken.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMarketing;
