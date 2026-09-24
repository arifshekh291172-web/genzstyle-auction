import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmPassword,
      });

      if (res.data.success) {
        setSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-luxury-surface border border-luxury-border rounded-2xl p-4 xs:p-6 sm:p-8 shadow-card-dark text-center">
        {success ? (
          <div className="py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-2">
              Password Updated
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Your password has been changed securely. You can now log in using your new credentials.
            </p>
            <Link
              to="/login"
              className="w-full block py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-1">
              Choose New Password
            </h1>
            <p className="text-xs text-gray-400 mb-6">
              Enter your new secure password below (minimum 8 characters)
            </p>

            {error && (
              <div className="mb-6 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <div className="leading-relaxed">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                <span>{loading ? 'RESETTING PASSWORD...' : 'SET NEW PASSWORD'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
