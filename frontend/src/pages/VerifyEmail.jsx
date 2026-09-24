import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Key } from 'lucide-react';
import api from '../api/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const queryToken = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(queryToken);
  const [resendEmail, setResendEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  useEffect(() => {
    // If token passed in URL query, verify automatically
    if (queryToken) {
      handleAutoVerify(queryToken);
    }
  }, [queryToken]);

  const handleAutoVerify = async (tok) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmail(tok);
      if (res.success) {
        setVerifiedSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide a verification token.');
      return;
    }
    handleAutoVerify(token.trim());
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) {
      setError('Please provide your email to resend verification.');
      return;
    }
    setResending(true);
    setResendMessage(null);
    setError(null);

    try {
      const res = await api.post('/auth/resend-verification', { email: resendEmail.trim() });
      setResendMessage(res.data?.message || 'Verification email resent.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-luxury-surface border border-luxury-border rounded-2xl p-8 shadow-card-dark text-center">
        {verifiedSuccess ? (
          <div className="py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-2">
              Email Verified!
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Your account has been officially authenticated. You are now eligible to activate membership and reserve seats in 100-participant drops.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/membership')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center justify-center gap-2"
              >
                <span>ACTIVATE MEMBERSHIP (₹49)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/auctions')}
                className="w-full py-2.5 rounded-xl border border-luxury-border text-gray-300 hover:text-white text-xs font-semibold transition"
              >
                Browse Drops First
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-luxury-card border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-2xl shadow-luxury-gold mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-1">
              Verify Account
            </h1>
            <p className="text-xs text-gray-400 mb-6">
              Enter your verification token or click the link received in your inbox
            </p>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            {resendMessage && (
              <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2.5 text-left">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="leading-relaxed">{resendMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div>
                <input
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your 64-character verification token"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold font-mono transition text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2"
              >
                <span>{loading ? 'VERIFYING TOKEN...' : 'CONFIRM VERIFICATION'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="border-t border-luxury-border/60 pt-6 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                Didn't receive the email?
              </h4>
              <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
                Check your spam folder or request a new verification token:
              </p>
              <form onSubmit={handleResend} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your-email@example.com"
                  className="flex-1 bg-luxury-card border border-luxury-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
                />
                <button
                  type="submit"
                  disabled={resending}
                  className="px-3.5 py-2 rounded-xl bg-luxury-card border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold/10 text-xs font-bold uppercase tracking-wider transition shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>Resend</span>
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
