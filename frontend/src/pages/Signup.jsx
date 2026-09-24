import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successNotice, setSuccessNotice] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
        setSuccessNotice(true);
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
        {successNotice ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase font-display mb-2">
              Verification Link Dispatched
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto mb-6">
              We have dispatched a cryptographic verification link to <strong className="text-white">{formData.email}</strong>. Please click the link in your email to activate your account.
            </p>
            <div className="space-y-3">
              <Link
                to={`/verify-email?email=${encodeURIComponent(formData.email)}`}
                className="w-full block py-3 rounded-xl bg-luxury-gold text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
              >
                I Have My Code / Token
              </Link>
              <Link
                to="/login"
                className="w-full block py-2.5 rounded-xl border border-luxury-border text-gray-400 hover:text-white text-xs font-semibold transition"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-luxury-card border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-2xl shadow-luxury-gold mx-auto mb-3">
                G
              </div>
              <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display">
                Create Collector Account
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                One email = one account. Join India's 100-participant auction club.
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
                  Full Name
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
                  Email Address
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
                  Password (min 8 characters)
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
                  Confirm Password
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

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
              >
                <span>{loading ? 'REGISTERING ACCOUNT...' : 'REGISTER & GET VERIFICATION'}</span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Signup;
