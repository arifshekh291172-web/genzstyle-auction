import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAdmin, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in as Admin, redirect immediately
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const email = formData.email.trim();
      const password = formData.password.trim();
      const data = await login(email, password);
      if (data.user?.role !== 'ADMIN') {
        setError('ACCESS_DENIED: This account does not have administrator privileges.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (err) {
      if (err.message === 'Network Error' || !err.response) {
        setError('NETWORK_ERROR: Unable to reach backend server at http://localhost:5000. Ensure "npm run dev" is active.');
      } else {
        setError(
          err.response?.data?.message || 'Authentication failed. Please check your admin email and password.'
        );
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#070709] flex flex-col justify-center py-8 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      {/* Background ambient security glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[600px] max-w-full h-[350px] bg-red-950/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-luxury-surface border border-red-500/30 flex items-center justify-center shadow-2xl shadow-red-950/40">
            <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-red-400" />
          </div>
        </div>

        <h1 className="text-center text-xl sm:text-2xl font-black tracking-widest text-white uppercase font-display">
          GENZSTYLE
        </h1>
        <p className="mt-1 text-center text-[10px] sm:text-xs font-mono tracking-wider text-red-400/90 uppercase px-2">
          Restricted Command Console // Authorized Personnel Only
        </p>
      </div>

      <div className="mt-6 sm:mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-2 sm:px-0">
        <div className="bg-luxury-surface/90 border border-luxury-border/80 backdrop-blur-xl py-6 sm:py-8 px-4 xs:px-6 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs text-red-200 leading-relaxed font-mono">
                {error}
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                Admin Email Address
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@genzstyle.com"
                  className="block w-full pl-10 pr-4 py-3 bg-black/50 border border-luxury-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                Master Passphrase
              </label>
              <div className="mt-2 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-4 py-3 bg-black/50 border border-luxury-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/80 focus:ring-1 focus:ring-red-500/80 transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-red-500/40 rounded-xl shadow-lg text-sm font-bold uppercase tracking-wider text-white bg-gradient-to-r from-red-900/80 to-red-700/80 hover:from-red-800 hover:to-red-600 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Access Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-luxury-border/60 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Marketplace</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-600 font-mono">
            SECURE RESTRICTED ACCESS • ALL ACTIONS AUDITED & TIMESTAMPED
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
