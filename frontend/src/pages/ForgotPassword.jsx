import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../api/client';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-luxury-surface border border-luxury-border rounded-2xl p-4 xs:p-6 sm:p-8 shadow-card-dark">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>

        {submitted ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase font-display mb-2">
              Instructions Dispatched
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              If an account with <strong className="text-white">{email}</strong> exists in our system, you will receive a password reset link shortly.
            </p>
            <Link
              to="/login"
              className="w-full block py-3 rounded-xl bg-luxury-card border border-luxury-border text-gray-300 hover:text-white text-xs font-semibold text-center transition"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-1">
                Reset Password
              </h1>
              <p className="text-xs text-gray-400">
                Enter your registered email address to receive secure reset instructions
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
              >
                <span>{loading ? 'SENDING INSTRUCTIONS...' : 'SEND RESET LINK'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
