import React from 'react';

const Badge = ({ status, size = 'sm', className = '' }) => {
  const normalized = status ? status.toUpperCase() : 'UNKNOWN';

  const config = {
    LIVE: {
      label: 'LIVE NOW',
      classes: 'bg-red-500/20 text-red-300 border-red-500/60 shadow-[0_0_14px_rgba(239,68,68,0.35)]',
      dot: 'bg-red-500 animate-ping',
    },
    OPEN: {
      label: 'OPEN FOR ENTRY',
      classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
      dot: 'bg-emerald-400',
    },
    UPCOMING: {
      label: 'UPCOMING DROP',
      classes: 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
      dot: 'bg-amber-400',
    },
    FULL: {
      label: '100/100 FULL',
      classes: 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
      dot: 'bg-purple-400',
    },
    ENDED: {
      label: 'AUCTION ENDED',
      classes: 'bg-gray-800/80 text-gray-400 border-gray-700/60',
    },
    PAYMENT_PENDING: {
      label: 'PAYMENT PENDING',
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/40',
      dot: 'bg-amber-400',
    },
    CONFIRMED: {
      label: 'CONFIRMED',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    PROCESSING: {
      label: 'PROCESSING',
      classes: 'bg-blue-500/10 text-blue-400 border-blue-500/40',
      dot: 'bg-blue-400',
    },
    SHIPPED: {
      label: 'SHIPPED',
      classes: 'bg-purple-500/10 text-purple-400 border-purple-500/40',
      dot: 'bg-purple-400',
    },
    DELIVERED: {
      label: 'DELIVERED',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    DEFAULTED: {
      label: 'DEFAULTED',
      classes: 'bg-red-950/40 text-red-400 border-red-500/30',
      dot: 'bg-red-500',
    },
    ACTIVE: {
      label: 'ACTIVE',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-400',
    },
    EXPIRED: {
      label: 'EXPIRED',
      classes: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
    FORFEITED: {
      label: 'FORFEITED',
      classes: 'bg-red-950/40 text-red-400 border-red-500/30',
    },
    BLOCKED: {
      label: 'ACCESS BLOCKED',
      classes: 'bg-red-950/60 text-red-400 border-red-500/40',
    },
  };

  const current = config[normalized] || {
    label: normalized,
    classes: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px]'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-widest uppercase font-bold backdrop-blur-md shadow-sm ${current.classes} ${sizeClasses} ${className}`}
    >
      {current.dot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>}
      {current.label}
    </span>
  );
};

export default Badge;
