import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Gavel, Radio, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileBottomNav = () => {
  const { isAuthenticated } = useAuth();

  const navItems = [
    { label: 'HOME', path: '/', icon: Home },
    { label: 'MY AUCTIONS', path: '/my-auctions', icon: Gavel },
    { label: 'LIVE', path: '/auctions?status=LIVE', icon: Radio, highlight: true },
    { label: 'ORDERS', path: '/orders', icon: ShoppingBag },
    { label: 'PROFILE', path: isAuthenticated ? '/dashboard' : '/login', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-luxury-black/95 backdrop-blur-lg border-t border-luxury-border/80 px-2 py-1 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[9px] font-bold tracking-wider transition-colors ${
                  isActive
                    ? 'text-luxury-gold'
                    : 'text-gray-400 hover:text-gray-200'
                }`
              }
            >
              {item.highlight ? (
                <div className="relative">
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  <Icon className="w-5 h-5 text-red-500 mb-0.5" />
                </div>
              ) : (
                <Icon className="w-5 h-5 mb-0.5" />
              )}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
