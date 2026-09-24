import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Sparkles } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import api from '../../api/client';

const AdminCreateAuction = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    productId: '',
    startingBid: '',
    bidIncrement: 10,
    participantLimit: 100,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/admin/products');
        if (res.data.success) {
          setProducts(res.data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products for auction creation:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleProductSelect = (e) => {
    const pId = e.target.value;
    const selectedProd = products.find((p) => p._id === pId);
    setFormData((prev) => ({
      ...prev,
      productId: pId,
      startingBid: selectedProd ? selectedProd.startingPrice : prev.startingBid,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Please provide valid start and end dates and times.');
      return;
    }

    if (endDateTime <= startDateTime) {
      setError('Auction End Time must be later than Start Time.');
      return;
    }

    if (Number(formData.startingBid) < 0) {
      setError('Starting bid cannot be negative.');
      return;
    }

    if (Number(formData.bidIncrement) < 1) {
      setError('Bid increment must be at least ₹1.');
      return;
    }

    if (Number(formData.participantLimit) < 1) {
      setError('Participant limit must be at least 1.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/admin/auctions', {
        productId: formData.productId,
        startingBid: Number(formData.startingBid),
        bidIncrement: Number(formData.bidIncrement),
        participantLimit: Number(formData.participantLimit),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      if (res.data.success) {
        navigate('/admin/auctions');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create auction drop.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <AdminHeader
        title="SCHEDULE AUCTION DROP"
        subtitle="Configure 100-collector room parameters and timing"
      />

      <div className="p-6 md:p-8 max-w-4xl">
        <div className="mb-6">
          <Link
            to="/admin/auctions"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Auctions</span>
          </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-luxury-surface border border-luxury-border rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Select Product From Catalog
            </label>
            <select
              required
              value={formData.productId}
              onChange={handleProductSelect}
              className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-luxury-gold"
            >
              <option value="">-- Choose verified piece --</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.styleId}) &mdash; Base Price ₹{p.startingPrice}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Starting Bid (INR)
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.startingBid}
                onChange={(e) => setFormData({ ...formData, startingBid: e.target.value })}
                placeholder="2150"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Bid Increment (INR)
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.bidIncrement}
                onChange={(e) => setFormData({ ...formData, bidIncrement: e.target.value })}
                placeholder="10"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Default: ₹10</span>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Collector Limit
              </label>
              <input
                type="number"
                required
                min={1}
                value={formData.participantLimit}
                onChange={(e) => setFormData({ ...formData, participantLimit: e.target.value })}
                placeholder="100"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold font-mono"
              />
              <span className="text-[10px] text-gray-500 mt-1 block">Default: 100 Collectors</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-3 p-4 rounded-xl bg-luxury-card/50 border border-luxury-border/60">
              <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider block">
                Start Schedule
              </span>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-luxury-surface border border-luxury-border rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">Start Time</label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-luxury-surface border border-luxury-border rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-luxury-card/50 border border-luxury-border/60">
              <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider block">
                End Schedule
              </span>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-luxury-surface border border-luxury-border rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase block mb-1">End Time</label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-luxury-surface border border-luxury-border rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'CREATING DROP...' : 'PUBLISH AUCTION DROP'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateAuction;
