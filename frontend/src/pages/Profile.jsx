import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Sparkles, ShieldCheck, CheckCircle2, Save } from 'lucide-react';
import Badge from '../components/common/Badge';
import api from '../api/client';

const Profile = () => {
  const { user, membership, hasActiveMembership, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.shippingAddress?.fullName || user?.name || '',
    phone: user?.shippingAddress?.phone || user?.phone || '',
    street: user?.shippingAddress?.street || '',
    city: user?.shippingAddress?.city || '',
    state: user?.shippingAddress?.state || '',
    pinCode: user?.shippingAddress?.pinCode || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await api.patch('/users/me', {
        name,
        phone,
        shippingAddress,
      });

      if (res.data.success) {
        setMessage('Profile and shipping details saved successfully.');
        await refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 md:py-12 pb-mobile-nav">
      <div className="pb-6 sm:pb-8 border-b border-luxury-border/60">
        <h1 className="text-2xl xs:text-3xl md:text-5xl font-black text-white uppercase font-display">
          COLLECTOR PROFILE
        </h1>
        <p className="text-xs md:text-sm text-gray-400 mt-1">
          Manage your personal credentials, contact info, and authenticated delivery destinations.
        </p>
      </div>

      {message && (
        <div className="my-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 my-6 sm:my-8">
        {/* Left Column: Account Summary Card */}
        <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-6 h-fit space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-luxury-card border-2 border-luxury-gold/50 flex items-center justify-center font-display font-black text-luxury-gold text-2xl shadow-luxury-gold mx-auto mb-3">
              {user?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <h3 className="font-bold text-base text-white">{user?.name}</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>

          <div className="border-t border-luxury-border/60 pt-4 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Email Status</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Membership</span>
              <Badge status={hasActiveMembership ? 'ACTIVE' : 'INACTIVE'} size="xs" />
            </div>

            {hasActiveMembership && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Validity</span>
                <span className="font-mono text-luxury-gold">
                  {membership?.daysRemaining || 365} Days Remaining
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Account Role</span>
              <span className="font-mono text-gray-200">{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Editable Details Form */}
        <div className="md:col-span-2 bg-luxury-surface border border-luxury-border rounded-2xl p-4 sm:p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-luxury-border">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 pl-10 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-luxury-border pt-4">
              Default Shipping Address
            </h3>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Street Address / Apartment
              </label>
              <textarea
                rows={2}
                value={shippingAddress.street}
                onChange={(e) =>
                  setShippingAddress({ ...shippingAddress, street: e.target.value })
                }
                placeholder="402, Highline Residency, Bandra West"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, city: e.target.value })
                  }
                  placeholder="Mumbai"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, state: e.target.value })
                  }
                  placeholder="Maharashtra"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={shippingAddress.pinCode}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, pinCode: e.target.value })
                  }
                  placeholder="400050"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'SAVING...' : 'SAVE CHANGES'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
