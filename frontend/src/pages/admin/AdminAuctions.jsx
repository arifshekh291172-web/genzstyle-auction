import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, Trash2, Gavel, Calendar, Users, Radio } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../api/client';

const AdminAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/auctions');
      if (res.data.success) {
        setAuctions(res.data.auctions || []);
      }
    } catch (err) {
      console.error('Failed to load admin auctions:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleDelete = async (id, status) => {
    if (status === 'LIVE') {
      alert('Cannot delete an auction while it is LIVE. You can cancel it instead.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this auction?')) return;

    try {
      const res = await api.delete(`/admin/auctions/${id}`);
      if (res.data.success) {
        setAuctions((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete auction.');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="AUCTION DROPS MANAGEMENT"
        subtitle="Schedule, inspect, and monitor exclusive 100-collector rooms"
        actions={
          <Link
            to="/admin/auctions/create"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Drop</span>
          </Link>
        }
      />

      <div className="p-6 md:p-8 flex-1">
        {loading ? (
          <div className="py-20 text-center text-xs text-gray-400 font-mono tracking-widest uppercase">
            Loading drops catalog...
          </div>
        ) : auctions.length === 0 ? (
          <EmptyState
            title="No Auctions Scheduled"
            description="Create your first 100-participant auction drop to open rooms."
            action={
              <Link
                to="/admin/auctions/create"
                className="text-xs font-bold text-luxury-gold border border-luxury-gold/50 px-4 py-2 rounded-xl"
              >
                Schedule Drop Now
              </Link>
            }
          />
        ) : (
          <div className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden shadow-card-dark">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-luxury-card/70 border-b border-luxury-border text-gray-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Piece / Style ID</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Current Bid</th>
                    <th className="py-3.5 px-4">Collectors</th>
                    <th className="py-3.5 px-4">Start Time</th>
                    <th className="py-3.5 px-4">End Time</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-luxury-border/40 text-gray-300">
                  {auctions.map((a) => {
                    const product = a.productId || {};
                    return (
                      <tr key={a._id} className="hover:bg-luxury-card/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white line-clamp-1 max-w-xs">
                            {product.name || 'Unnamed Product'}
                          </div>
                          <span className="text-[10px] font-mono text-luxury-gold">
                            {product.styleId || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge status={a.status} size="xs" />
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          ₹{a.currentBid.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {a.participantCount} / {a.participantLimit || 100}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                          {new Date(a.startTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-gray-400">
                          {new Date(a.endTime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/auction/${a._id}`}
                              className="p-1.5 rounded-lg bg-luxury-card border border-luxury-border text-gray-300 hover:text-luxury-gold transition"
                              title="View Public Drop Room"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(a._id, a.status)}
                              className="p-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:text-red-300 transition"
                              title="Delete Auction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuctions;
