import React from 'react';

const StatCard = ({ title, value, icon: Icon, change = null, isCurrency = false, color = 'gold' }) => {
  const colorMap = {
    gold: 'border-luxury-gold/30 bg-luxury-gold/5 text-luxury-gold',
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    purple: 'border-purple-500/30 bg-purple-500/5 text-purple-400',
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
  };

  const formattedValue = isCurrency
    ? `₹${Number(value || 0).toLocaleString('en-IN')}`
    : Number(value || 0).toLocaleString('en-IN');

  return (
    <div className="bg-luxury-surface border border-luxury-border/80 rounded-2xl p-3.5 sm:p-5 flex flex-col justify-between shadow-card-dark">
      <div className="flex items-center justify-between gap-1 mb-2.5 sm:mb-3">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-400 truncate">
          {title}
        </span>
        <div className={`p-1.5 sm:p-2 rounded-xl border shrink-0 ${colorMap[color] || colorMap.gold}`}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1">
        <span className="font-display font-black text-lg xs:text-xl sm:text-2xl text-white truncate">
          {formattedValue}
        </span>
        {change && (
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-400 shrink-0">
            {change}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
