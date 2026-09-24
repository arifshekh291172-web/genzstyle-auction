import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Clock,
  AlertTriangle,
  ArrowRight,
  Award,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Badge from '../components/common/Badge';

const Membership = () => {
  const { user, isAuthenticated, hasActiveMembership, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [membershipData, setMembershipData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/membership/status');
      if (res.data.success) {
        setMembershipData(res.data.membership);
      }
    } catch (err) {
      console.error('Failed to load membership status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [isAuthenticated]);

  const handleActivatePayment = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/membership');
      return;
    }

    if (!user?.emailVerified) {
      alert('Please verify your email address before activating membership.');
      navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
      return;
    }

    if (!acceptedTerms) {
      setError('You must review and accept the Membership Terms & Conditions to proceed.');
      return;
    }

    setProcessingPayment(true);
    setError(null);

    try {
      // 1. Create Real Razorpay Order on Backend with Terms Verification
      const orderRes = await api.post('/membership/create-order', { acceptedTerms: true });
      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Open Official Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount,
        currency,
        name: 'GENZSTYLE Marketplace',
        description: 'Annual Drop Club Membership (365 Days)',
        order_id: orderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '',
        },
        theme: {
          color: '#D4AF37',
        },
        handler: async function (response) {
          // 3. DO NOT TRUST FRONTEND ALONE — Cryptographically verify on backend!
          try {
            const verifyRes = await api.post('/membership/verify-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              confetti({
                particleCount: 180,
                spread: 90,
                origin: { y: 0.6 },
              });
              await refreshUser();
              await fetchStatus();
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Payment signature verification failed.');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
          },
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay Checkout SDK failed to initialize. Please check your network connection.');
        setProcessingPayment(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate membership checkout.');
      setProcessingPayment(false);
    }
  };

  const isPaused = membershipData?.auctionAccessStatus === 'BLOCKED' && membershipData?.status === 'FORFEITED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-xs font-bold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Collector Passport</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display">
          GENZSTYLE MEMBERSHIP
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">
          Your key to unlocking 100-collector real-time drop rooms with authoritative ₹10 bidding.
        </p>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-8 p-4 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Paused Access Alert if defaulted on 48h payment */}
      {isPaused && (
        <div className="max-w-2xl mx-auto mb-10 p-6 rounded-2xl bg-red-950/40 border border-red-500/50 text-left animate-fade-in shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/20 rounded-xl text-red-400 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white text-base uppercase tracking-wider">
                  AUCTION ACCESS PAUSED
                </h3>
                <Badge status="FORFEITED" size="xs" />
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-4">
                Your 48-hour payment deadline expired on a previous winning auction. Under GENZSTYLE published terms, your prior membership fee was forfeited and drop room access paused.
              </p>
              <button
                onClick={handleActivatePayment}
                disabled={processingPayment}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center gap-2"
              >
                <span>{processingPayment ? 'CONNECTING...' : 'REACTIVATE ACCESS — ₹49'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Membership Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center max-w-4xl mx-auto">
        {/* Luxury Gold Membership Card (7 cols) */}
        <div className="md:col-span-7 bg-gradient-to-br from-luxury-surface via-[#181924] to-luxury-card border-2 border-luxury-gold/50 rounded-3xl p-6 sm:p-8 shadow-luxury-glow relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          {/* Decorative Gold Sheen Background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-luxury-gold/15 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-luxury-surface border border-luxury-gold flex items-center justify-center font-display font-black text-luxury-gold text-sm shadow-luxury-gold">
                  G
                </div>
                <span className="font-display font-black text-sm tracking-[0.2em] text-white">
                  GENZ<span className="text-luxury-gold">STYLE</span>
                </span>
              </div>
              <Badge status={hasActiveMembership ? 'ACTIVE' : 'INACTIVE'} size="sm" />
            </div>

            <div className="mb-6">
              <span className="text-[11px] font-mono text-luxury-gold uppercase tracking-widest font-bold">
                ANNUAL COLLECTOR PASSPORT
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-black text-4xl sm:text-5xl text-white">
                  ₹49
                </span>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                  / 365 Days
                </span>
              </div>
            </div>

            {/* Active Status Dates if Active */}
            {hasActiveMembership && membershipData && (
              <div className="p-4 rounded-xl bg-luxury-surface/80 border border-luxury-gold/30 mb-6 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400">Activated:</span>
                  <span className="font-mono text-white">
                    {new Date(membershipData.activatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                  <span className="text-gray-400">Expires:</span>
                  <span className="font-mono text-white">
                    {new Date(membershipData.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-bold pt-1 border-t border-luxury-border">
                  <span>Days Remaining:</span>
                  <span className="font-mono text-sm">{membershipData.daysRemaining} Days</span>
                </div>
              </div>
            )}

            {/* Privileges checklist */}
            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-luxury-gold/20 text-luxury-gold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Unrestricted access to 100-collector drops</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-luxury-gold/20 text-luxury-gold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Real-time Socket.IO live bidding privileges</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-luxury-gold/20 text-luxury-gold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Authoritative ₹10 increments with race collision safety</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-luxury-gold/20 text-luxury-gold">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Winner checkout order &amp; concierge dispatch tracking</span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-8 pt-6 border-t border-luxury-border/60">
            {hasActiveMembership ? (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> VIP PASSPORT ACTIVE
                </span>
                <span className="font-mono">{membershipData?.daysRemaining}d left</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl border border-luxury-border/80 bg-black/40 flex items-start gap-2.5 text-left">
                  <input
                    type="checkbox"
                    id="acceptMembershipTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-luxury-border bg-black text-luxury-gold focus:ring-luxury-gold/50 cursor-pointer accent-[#D4AF37]"
                  />
                  <label htmlFor="acceptMembershipTerms" className="text-[11px] text-gray-300 leading-snug cursor-pointer select-none">
                    I accept the{' '}
                    <Link to="/terms" target="_blank" className="text-luxury-gold font-bold underline hover:text-white transition">
                      Membership Terms
                    </Link>
                    : The ₹49 fee is non-refundable, valid for 365 days, and will be forfeited if I win an auction and default on the 48-hour payment deadline.
                  </label>
                </div>

                <button
                  onClick={handleActivatePayment}
                  disabled={processingPayment || !acceptedTerms}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-luxury-gold via-yellow-400 to-luxury-gold-dark text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-luxury-gold flex items-center justify-center gap-2 font-display disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {processingPayment
                      ? 'CONNECTING TO RAZORPAY...'
                      : 'ACTIVATE MEMBERSHIP — ₹49'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Explainer Column (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">
              Why an annual ₹49 commitment?
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              By collecting a nominal ₹49 annual fee verified through Razorpay, we eliminate bots, duplicate accounts, and fake bidders—ensuring every participant in your room is a genuine collector.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">
              Exact 365-Day Validity
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Your membership does not expire on login or when joining an auction. It remains valid for 365 calendar days from the moment payment signature is confirmed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-luxury-surface border border-luxury-border">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm mb-1">
              Cryptographic Signature Verification
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Payments are verified server-side with HMAC SHA-256 signatures directly with Razorpay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Membership;
