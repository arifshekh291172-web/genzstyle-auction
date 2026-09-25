import React, { useState, useEffect } from 'react';
import { Sparkles, Gavel, ShieldCheck, Flame, X, UserCheck, TrendingUp } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const MUMBAI_LOCALITIES = [
  'Bandra West',
  'Andheri West',
  'Colaba',
  'Juhu',
  'Worli',
  'Powai',
  'Lower Parel',
  'Khar',
  'Santacruz',
  'Lokhandwala',
];

const RECENT_ACTIVITIES = [
  { type: 'membership', title: 'New Collector Joined', desc: 'activated 365-Day Drops Passport', icon: Sparkles, color: 'text-luxury-gold' },
  { type: 'seat', title: 'Seat Reserved', desc: 'secured seat in 100-Collector Drop', icon: ShieldCheck, color: 'text-emerald-400' },
  { type: 'bid', title: 'Live Bid Placed', desc: 'raised drop price by ₹10', icon: Gavel, color: 'text-amber-400' },
  { type: 'fomo', title: 'Room Filling Fast', desc: 'Less than 12 spots left in upcoming drop', icon: Flame, color: 'text-red-400' },
  { type: 'win', title: 'Drop Won', desc: 'secured authenticated archival piece', icon: TrendingUp, color: 'text-purple-400' },
];

const FIRST_NAMES = ['Aarav', 'Rhea', 'Kabir', 'Ananya', 'Zayn', 'Ishaan', 'Dev', 'Mira', 'Rohan', 'Tanvi', 'Aryan', 'Karan'];

const LiveMarketingToaster = () => {
  const { socket } = useSocket();
  const [currentEvent, setCurrentEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Function to show a notification toast
  const triggerToast = (eventData) => {
    if (dismissed) return;
    setCurrentEvent(eventData);
    setVisible(true);

    setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  // Listen to real-time socket events for genuine live activity
  useEffect(() => {
    if (!socket) return;

    const handleRealBid = (data) => {
      triggerToast({
        title: 'Real-Time Bid Placed',
        detail: `New high bid of ₹${data?.amount || data?.currentPrice || '---'} in active room`,
        location: 'Live Auction Room',
        icon: Gavel,
        color: 'text-luxury-gold',
      });
    };

    socket.on('auction:bidPlaced', handleRealBid);

    return () => {
      socket.off('auction:bidPlaced', handleRealBid);
    };
  }, [socket, dismissed]);

  // Periodic automated FOMO marketing events
  useEffect(() => {
    if (dismissed) return;

    const interval = setInterval(() => {
      // Pick random activity template
      const act = RECENT_ACTIVITIES[Math.floor(Math.random() * RECENT_ACTIVITIES.length)];
      const loc = MUMBAI_LOCALITIES[Math.floor(Math.random() * MUMBAI_LOCALITIES.length)];
      const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];

      triggerToast({
        title: act.title,
        detail: `${name} ${act.desc}`,
        location: loc,
        icon: act.icon,
        color: act.color,
      });
    }, 14000); // Trigger every 14 seconds

    return () => clearInterval(interval);
  }, [dismissed]);

  if (!visible || !currentEvent || dismissed) return null;

  const IconComponent = currentEvent.icon || Sparkles;

  return (
    <aside 
      aria-label="Real-time market updates"
      className="fixed bottom-20 md:bottom-6 right-3 xs:right-6 z-50 max-w-[320px] xs:max-w-[360px] animate-fade-in transition-all duration-300 pointer-events-auto"
    >
      <div className="bg-[#0E0F17]/95 border border-[#1E202B] backdrop-blur-xl p-3.5 xs:p-4 rounded-2xl shadow-2xl shadow-black/90 flex items-start gap-3 relative overflow-hidden">
        {/* Subtle Ambient Pulse */}
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />

        {/* Icon Badge */}
        <div className={`p-2.5 rounded-xl bg-luxury-card border border-luxury-border shrink-0 ${currentEvent.color}`}>
          <IconComponent className="w-4 h-4 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <h4 className="text-[11px] font-bold text-white uppercase tracking-wider truncate font-display">
              {currentEvent.title}
            </h4>
          </div>
          <p className="text-[11px] text-gray-300 leading-snug break-words">
            {currentEvent.detail}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[9px] text-gray-500 font-mono">
            <span>📍 {currentEvent.location}</span>
            <span>&bull;</span>
            <span className="text-luxury-gold">Just now</span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="text-gray-500 hover:text-white p-1 rounded-lg transition shrink-0"
          title="Dismiss updates"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};

export default LiveMarketingToaster;
