import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No items found',
  description = 'There are no active records in this category right now.',
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-luxury-border/80 bg-luxury-surface/20 my-6">
      <div className="w-14 h-14 rounded-2xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold mb-4 shadow-luxury-gold">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-white tracking-wide mb-1">{title}</h3>
      <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
