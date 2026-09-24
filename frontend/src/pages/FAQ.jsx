import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Why is there a ₹49 annual membership?',
      a: 'The ₹49 fee is an anti-bot identity barrier that guarantees every person in an auction room is an authentic, human collector with a verified Razorpay payment method. It remains active for 365 full days.',
    },
    {
      q: 'How does the 100-participant limit work?',
      a: 'Our database enforces a strict atomic concurrency check. Once 100 collectors join an auction, subsequent attempts are rejected by the backend server. The room is locked.',
    },
    {
      q: 'Why can’t I type a custom bid amount?',
      a: 'To guarantee fairness and prevent bot sniping, every bid increases the current highest price by exactly ₹10. You never type amounts; clicking the Bid button submits the authoritative server-calculated amount.',
    },
    {
      q: 'What happens if two people bid at the exact same millisecond?',
      a: 'Our backend uses atomic optimistic concurrency control. The first bid that lands succeeds, advancing the price by ₹10. The second request is safely rejected with "BID_CHANGED", and the bidder’s interface instantly updates with the new amount.',
    },
    {
      q: 'What is the 48-hour payment deadline?',
      a: 'The highest bidder when the clock expires wins the auction and has 48 hours to complete payment for their winning bid via Razorpay. If payment is not completed within 48 hours, the order is marked DEFAULTED, auction access is paused, and the ₹49 fee is retained according to terms.',
    },
    {
      q: 'How do I reactivate my account if I defaulted on a win?',
      a: 'You can restore auction access at any time by paying ₹49 again on your dashboard or membership page. This resets your 365-day access period.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-8 md:py-20 pb-mobile-nav">
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
        <span className="text-xs font-bold text-luxury-gold uppercase tracking-widest">
          Knowledge Base
        </span>
        <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white uppercase font-display mt-2 mb-4">
          FREQUENTLY ASKED QUESTIONS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Everything you need to know about our 100-collector auction drops.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-luxury-surface border border-luxury-border rounded-2xl overflow-hidden transition"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-white"
            >
              <span>{faq.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-luxury-gold transition-transform duration-300 shrink-0 ${
                  openIndex === idx ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === idx && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs text-gray-300 leading-relaxed border-t border-luxury-border/40 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
