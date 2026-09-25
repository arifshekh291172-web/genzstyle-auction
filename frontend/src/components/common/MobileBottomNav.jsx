import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gavel, Radio, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'HOME', path: '/', icon: Home },
    { label: 'BIDS', path: '/my-auctions', icon: Gavel },
    { label: 'LIVE', path: '/auctions?status=LIVE', icon: Radio, highlight: true },
    { label: 'ORDERS', path: '/orders', icon: ShoppingBag },
    { label: 'PROFILE', path: isAuthenticated ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060608]/95 backdrop-blur-2xl border-t border-luxury-gold/25 px-2 py-1.5 safe-area-inset-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-around h-13">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold tracking-wider transition-all duration-200 truncate relative ${
                  isActive
                    ? 'text-luxury-gold filter drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.highlight ? (
                    <div className="relative">
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                      <Icon className="w-5 h-5 text-red-500 mb-0.5" />
                    </div>
                  ) : (
                    <Icon className="w-5 h-5 mb-0.5" />
                  )}
                  <span className="truncate max-w-full uppercase">{item.label}</span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-luxury-gold shadow-[0_0_6px_#D4AF37] mt-0.5"></span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
