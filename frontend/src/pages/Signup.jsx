import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.acceptedTerms) {
      setError('You must review and accept the GENZSTYLE Terms & Conditions to create an account.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await signup(formData);
      if (res.success) {
        // Navigate directly to OTP verification page with pre-filled email
        navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-luxury-surface border border-luxury-border rounded-2xl p-8 shadow-card-dark">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-luxury-card border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-2xl shadow-luxury-gold mx-auto mb-3">
            G
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display">
            Create Collector Account
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            One email = one account. Join India's exclusive 100-participant drop club.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Aarav Varma"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Email Address (OTP sent here) *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Phone Number (For auction deliveries & SMS)
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition font-mono"
              />
              <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Password (min 8 characters) *
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
              />
              <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Mandatory Age & Mumbai Delivery Affirmation */}
          <div className="p-3.5 rounded-xl border border-luxury-border/80 bg-luxury-card/50 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                required
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-luxury-gold/50 cursor-pointer accent-[#D4AF37]"
              />
              <label htmlFor="acceptedTerms" className="text-xs text-gray-300 leading-snug cursor-pointer select-none">
                I certify that <strong>I am 18 years of age or older</strong> and agree to the{' '}
                <Link to="/terms" target="_blank" className="text-luxury-gold font-bold underline hover:text-white transition">
                  GENZSTYLE Terms & Conditions
                </Link>.
              </label>
            </div>

            <div className="text-[11px] text-gray-400 pl-6 space-y-1 font-mono">
              <p className="flex items-center gap-1.5 text-luxury-gold/90">
                <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold"></span>
                <span><strong>Demographic:</strong> Curated for 18 to 40 collectors.</span>
              </p>
              <p className="flex items-center gap-1.5 text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span><strong>Service Zone:</strong> Deliveries strictly in Mumbai (MMR) region.</span>
              </p>
              <p className="flex items-center gap-1.5 text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span><strong>Drop Policies:</strong> ₹49 non-refundable pass • 100-cap • 48h winner deadline.</span>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !formData.acceptedTerms}
            className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'SENDING OTP...' : 'SIGN UP & GET 6-DIGIT OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-luxury-border/60 text-center">
          <p className="text-xs text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="text-luxury-gold font-bold hover:underline">
              Log in to your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
