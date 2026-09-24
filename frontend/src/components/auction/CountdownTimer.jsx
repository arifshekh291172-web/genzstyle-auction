import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CountdownTimer = ({ targetDate, onEnd = null, size = 'md', className = '' }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onEnd) onEnd();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onEnd]);

  if (timeLeft.isExpired) {
    return <span className="text-gray-500 font-mono text-xs uppercase tracking-wider">Concluded</span>;
  }

  const pad = (num) => String(num).padStart(2, '0');

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-2 font-mono ${className}`}>
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center bg-luxury-card px-2.5 py-1.5 rounded-lg border border-luxury-border">
            <span className="text-lg md:text-xl font-bold text-white">{pad(timeLeft.days)}</span>
            <span className="text-[9px] text-gray-400 uppercase">Days</span>
          </div>
        )}
        <div className="flex flex-col items-center bg-luxury-card px-2.5 py-1.5 rounded-lg border border-luxury-border">
          <span className="text-lg md:text-xl font-bold text-white">{pad(timeLeft.hours)}</span>
          <span className="text-[9px] text-gray-400 uppercase">Hrs</span>
        </div>
        <span className="text-luxury-gold font-bold text-lg">:</span>
        <div className="flex flex-col items-center bg-luxury-card px-2.5 py-1.5 rounded-lg border border-luxury-border">
          <span className="text-lg md:text-xl font-bold text-white">{pad(timeLeft.minutes)}</span>
          <span className="text-[9px] text-gray-400 uppercase">Min</span>
        </div>
        <span className="text-luxury-gold font-bold text-lg">:</span>
        <div className="flex flex-col items-center bg-luxury-card px-2.5 py-1.5 rounded-lg border border-luxury-border">
          <span className="text-lg md:text-xl font-bold text-luxury-gold">{pad(timeLeft.seconds)}</span>
          <span className="text-[9px] text-gray-400 uppercase">Sec</span>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs text-luxury-gold font-semibold ${className}`}>
      <Clock className="w-3.5 h-3.5 text-luxury-gold shrink-0" />
      {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
      {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  );
};

export default CountdownTimer;
