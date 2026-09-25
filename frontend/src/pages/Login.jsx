import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(redirectUrl);
        }
      }
    } catch (err) {
      const errResponse = err.response?.data;
      if (errResponse?.error === 'EMAIL_NOT_VERIFIED') {
        setError(
          <span>
            {errResponse.message}{' '}
            <Link
              to={`/verify-email?email=${encodeURIComponent(email)}`}
              className="underline text-luxury-gold hover:text-white"
            >
              Verify Now
            </Link>
          </span>
        );
      } else {
        setError(errResponse?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-luxury-surface border border-luxury-border rounded-2xl p-4 xs:p-6 sm:p-8 shadow-card-dark">
        {/* Brand header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-5">
            <img
              src="/images/logo.png"
              alt="GENZSTYLE - Bid Now. Wear Tomorrow."
              className="h-16 sm:h-20 w-auto object-contain filter drop-shadow-[0_2px_18px_rgba(212,175,55,0.35)]"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-display">
            Collector Login
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Access 100-participant exclusive live drops
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <div className="leading-relaxed break-words">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
              />
              <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-[11px] text-luxury-gold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>{loading ? 'AUTHENTICATING...' : 'ENTER MARKETPLACE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-luxury-border/60 text-center space-y-2.5">
          <p className="text-xs text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-luxury-gold font-bold hover:underline">
              Create an account
            </Link>
          </p>
          <div>
            <Link
              to="/admin/login"
              className="text-[11px] text-gray-500 hover:text-luxury-gold transition font-mono tracking-wider"
            >
              Staff or Administrator Portal →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
