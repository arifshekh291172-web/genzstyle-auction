import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Gavel, Clock, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      step: '01',
      title: 'Verify & Activate Membership',
      description: 'Register with your verified email and unlock a 365-day collector passport for ₹49 via secure Razorpay checkout.',
      icon: Sparkles,
    },
    {
      step: '02',
      title: 'Atomically Reserve Your Spot',
      description: 'Browse drops before they go live. Reserve 1 of strictly 100 available participant seats. Our database engine rejects the 101st collector.',
      icon: Users,
    },
    {
      step: '03',
      title: 'Real-Time ₹10 Bidding',
      description: 'When the timer hits zero, enter the live room. Bids advance in strict ₹10 increments. You never manually type numbers—just click to take the lead.',
      icon: Gavel,
    },
    {
      step: '04',
      title: '48-Hour Winner Checkout',
      description: 'When the auction clock ends, the highest valid bid wins. Complete payment for your winning bid within 48 hours for immediate dispatch.',
      icon: Clock,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest">
          Marketplace Mechanics
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display mt-2 mb-4">
          HOW GENZSTYLE WORKS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
          Designed from the ground up for fair, bot-free, thrilling street luxury competition. Here are the 4 core steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="bg-luxury-surface border border-luxury-border rounded-2xl p-8 flex gap-6 luxury-card-hover"
            >
              <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold flex items-center justify-center shrink-0 font-display font-black text-xl">
                {s.step}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase font-display mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-luxury-charcoal border border-luxury-gold/30 rounded-3xl p-8 md:p-12 text-center max-w-3xl mx-auto shadow-luxury-glow">
        <h3 className="text-2xl font-black text-white uppercase font-display mb-3">
          READY TO SECURE ARCHIVAL DROPS?
        </h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto mb-6 leading-relaxed">
          Join India's most exclusive 100-participant auction club today for only ₹49 for an entire year.
        </p>
        <Link
          to="/membership"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold"
        >
          <span>ACTIVATE MEMBERSHIP (₹49)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default HowItWorks;
