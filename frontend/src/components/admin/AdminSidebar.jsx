import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Gavel,
  Package,
  Users,
  CreditCard,
  ShoppingBag,
  Sliders,
  Sparkles,
  ArrowLeft,
  DollarSign,
} from 'lucide-react';

const AdminSidebar = () => {
  const links = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Auctions', path: '/admin/auctions', icon: Gavel },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Memberships', path: '/admin/memberships', icon: Sparkles },
    { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Settings & Audit', path: '/admin/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-luxury-charcoal/90 border-r border-luxury-border flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-6 border-b border-luxury-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-luxury-surface border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-sm shadow-luxury-gold">
            G
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-lg tracking-widest text-white">
              GENZ<span className="text-luxury-gold">STYLE</span>
            </span>
            <span className="text-[9px] font-mono text-luxury-gold tracking-widest uppercase -mt-0.5">
              Admin Console
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="p-4 space-y-1.5 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.label}
              to={link.path}
              end={link.path === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                  isActive
                    ? 'bg-luxury-gold text-black shadow-luxury-gold'
                    : 'text-gray-400 hover:text-white hover:bg-luxury-surface/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Storefront return */}
      <div className="p-4 border-t border-luxury-border">
        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-luxury-gold transition p-2 rounded-lg hover:bg-luxury-surface"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Marketplace</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
