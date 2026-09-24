import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Clock } from 'lucide-react';

const AdminHeader = ({ title, subtitle, actions = null }) => {
  const { user } = useAuth();

  return (
    <header className="border-b border-luxury-border/60 bg-luxury-surface/50 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-wide font-display">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {actions}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-luxury-border bg-luxury-card text-xs text-gray-300">
          <Clock className="w-3.5 h-3.5 text-luxury-gold" />
          <span className="font-mono">{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-luxury-gold/30 bg-luxury-gold/10 text-xs font-semibold text-luxury-gold">
          <Shield className="w-3.5 h-3.5" />
          <span>{user?.name || 'Administrator'}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
