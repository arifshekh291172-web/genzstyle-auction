import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest">
          Concierge Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase font-display mt-2 mb-4">
          CONTACT GENZSTYLE
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Our team is on standby for auction inquiries, order logistics, and authenticity verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-luxury-surface border border-luxury-border rounded-2xl p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Inquiry</h4>
              <p className="text-xs text-gray-400 mt-0.5">concierge@genzstyle.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">HQ Vault</h4>
              <p className="text-xs text-gray-400 mt-0.5">Bandra West, Mumbai, Maharashtra 400050</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-luxury-card/70 border border-luxury-border text-[11px] text-gray-400 leading-relaxed">
            Concierge hours: Monday &ndash; Saturday, 10:00 AM &ndash; 8:00 PM IST.
          </div>
        </div>

        <div className="md:col-span-2 bg-luxury-surface border border-luxury-border rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-base text-white uppercase font-display mb-1">
                Message Dispatched
              </h3>
              <p className="text-xs text-gray-400">
                A member of our drops team will reply to your registered email shortly.
              </p>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Topic / Auction Style ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. Question regarding GZS-BAL-01 drop"
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry..."
                  className="w-full bg-luxury-card border border-luxury-border rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-luxury-gold"
                />
              </div>

              <button
                type="submit"
                className="py-3 px-8 rounded-xl bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-extrabold text-xs uppercase tracking-wider hover:brightness-110 transition shadow-luxury-gold flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>DISPATCH INQUIRY</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
