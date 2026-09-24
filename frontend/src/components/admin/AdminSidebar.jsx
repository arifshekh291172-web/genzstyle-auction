import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
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
  Menu,
  X,
  Shield,
  Flame,
} from 'lucide-react';

const AdminSidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Auctions', path: '/admin/auctions', icon: Gavel },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Marketing & FOMO', path: '/admin/marketing', icon: Flame },
    { label: 'Memberships', path: '/admin/memberships', icon: Sparkles },
    { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Settings & Audit', path: '/admin/settings', icon: Sliders },
  ];

  const renderNavLinks = (isMobile = false) => (
    <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.label}
            to={link.path}
            end={link.path === '/admin'}
            onClick={() => isMobile && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition ${
                isActive
                  ? 'bg-luxury-gold text-black shadow-luxury-gold'
                  : 'text-gray-400 hover:text-white hover:bg-luxury-surface/60'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Top App Bar with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-luxury-surface/95 backdrop-blur-md border-b border-luxury-border px-4 h-14 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-luxury-card border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-xs shadow-luxury-gold">
            G
          </div>
          <span className="font-display font-black text-sm tracking-wider text-white">
            GENZ<span className="text-luxury-gold">STYLE</span>
            <span className="text-[10px] text-luxury-gold ml-1 font-mono uppercase font-normal">
              Admin
            </span>
          </span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-gray-300 hover:text-white rounded-lg hover:bg-luxury-card transition"
          aria-label="Toggle admin menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-luxury-gold" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Off-Canvas Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Off-Canvas Drawer Menu */}
      <div
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-luxury-charcoal border-r border-luxury-border flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-luxury-border flex items-center justify-between">
          <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-luxury-surface border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-sm shadow-luxury-gold">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base tracking-widest text-white">
                GENZ<span className="text-luxury-gold">STYLE</span>
              </span>
              <span className="text-[9px] font-mono text-luxury-gold tracking-widest uppercase -mt-0.5">
                Admin Console
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {renderNavLinks(true)}

        <div className="p-4 border-t border-luxury-border">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-luxury-gold transition p-2 rounded-lg hover:bg-luxury-surface"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Marketplace</span>
          </Link>
        </div>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-luxury-charcoal/90 border-r border-luxury-border flex-col shrink-0 min-h-screen sticky top-0 h-screen">
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

        {/* Desktop Nav Links */}
        {renderNavLinks(false)}

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
    </>
  );
};

export default AdminSidebar;
