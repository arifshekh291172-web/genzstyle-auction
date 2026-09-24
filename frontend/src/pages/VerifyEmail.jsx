import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Key, ShieldCheck, Mail } from 'lucide-react';
import api from '../api/client';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const queryToken = searchParams.get('token') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [token, setToken] = useState(queryToken);
  const [useTokenMode, setUseTokenMode] = useState(!initialEmail && Boolean(queryToken));

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  const inputRefs = useRef([]);

  // Auto-verify if full link token in URL
  useEffect(() => {
    if (queryToken) {
      handleTokenVerify(queryToken);
    }
  }, [queryToken]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleTokenVerify = async (tok) => {
    setLoading(true);
    setError(null);
    try {
      const res = await verifyEmail({ token: tok });
      if (res.success) {
        setVerifiedSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      if (newOtp.every((digit) => digit !== '')) {
        submitOtp(newOtp.join(''));
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (code) => {
    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await verifyEmail({
        email: email.trim(),
        otp: code,
      });
      if (res.success) {
        setVerifiedSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }
    submitOtp(code);
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to receive a new OTP.');
      return;
    }

    setResending(true);
    setResendMessage(null);
    setError(null);

    try {
      const res = await api.post('/auth/resend-verification', { email: email.trim() });
      setResendMessage(res.data?.message || 'New 6-digit OTP code sent.');
      setCooldown(30);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification code.');
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
              Account Verified!
            </h1>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              Your identity has been verified. To join exclusive 100-collector drops, activate your annual ₹49 membership.
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
            <div className="w-14 h-14 rounded-2xl bg-luxury-card border border-luxury-gold/40 flex items-center justify-center text-luxury-gold shadow-luxury-gold mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h1 className="text-2xl font-black text-white uppercase tracking-wider font-display mb-1">
              Verify Your Account
            </h1>

            {email ? (
              <p className="text-xs text-gray-400 mb-6">
                Enter the 6-digit code sent to <span className="text-luxury-gold font-mono font-bold">{email}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-400 mb-6">
                Enter your email address and 6-digit verification code
              </p>
            )}

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

            {!useTokenMode ? (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {!initialEmail && (
                  <div className="text-left">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 font-mono">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold transition font-mono"
                    />
                  </div>
                )}

                {/* 6-Digit OTP Boxes */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-3 font-mono">
                    6-Digit Verification OTP
                  </label>
                  <div className="flex justify-center items-center gap-2.5 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono text-white bg-luxury-card border border-luxury-border rounded-xl focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:outline-none transition shadow-sm"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>VERIFY OTP & ACTIVATE ACCOUNT</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs pt-2">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    className="text-luxury-gold font-mono hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    <span>{cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP Code'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUseTokenMode(true)}
                    className="text-gray-400 hover:text-white transition font-mono text-[11px]"
                  >
                    Paste Token Instead →
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTokenVerify(token.trim());
                }}
                className="space-y-4"
              >
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5 text-left font-mono">
                    Paste 64-Character Token
                  </label>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your token from the link"
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-luxury-gold font-mono transition text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-luxury-gold text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
                >
                  {loading ? 'VERIFYING...' : 'VERIFY WITH TOKEN'}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setUseTokenMode(false)}
                    className="text-luxury-gold hover:underline text-xs font-mono"
                  >
                    ← Back to 6-Digit OTP Mode
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
