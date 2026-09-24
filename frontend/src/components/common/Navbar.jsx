import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  User,
  Shield,
  LogOut,
  Sparkles,
  ShoppingBag,
  Gavel,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, hasActiveMembership, logout } = useAuth();
  const { notifications, unreadCount, bannerAlert, dismissBanner, markAsRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* High-Priority Banner Alerts (Outbid, Important Notices) */}
      {bannerAlert && (
        <div className="bg-red-950/90 border-b border-red-500/40 text-white px-4 py-2.5 transition-all animate-fade-in relative z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="p-1 bg-red-600 rounded-full animate-ping"></span>
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <span className="font-bold tracking-wider text-red-200 text-sm uppercase mr-2">
                  {bannerAlert.title}
                </span>
                <span className="text-xs md:text-sm text-gray-200">{bannerAlert.message}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {bannerAlert.auctionId && (
                <button
                  onClick={() => {
                    navigate(`/auction/${bannerAlert.auctionId}`);
                    dismissBanner();
                  }}
                  className="text-xs bg-red-600 hover:bg-red-500 text-white font-semibold px-3 py-1 rounded transition"
                >
                  VIEW DROP
                </button>
              )}
              <button
                onClick={dismissBanner}
                className="text-gray-400 hover:text-white p-1"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Desktop & Mobile Header */}
      <header className="sticky top-0 z-40 glass-nav border-b border-luxury-border/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg bg-luxury-surface border border-luxury-gold/40 flex items-center justify-center font-display font-black text-luxury-gold text-base sm:text-xl shadow-luxury-gold group-hover:border-luxury-gold transition-colors shrink-0">
              G
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base sm:text-xl md:text-2xl tracking-[0.15em] sm:tracking-[0.2em] text-white flex items-center">
                GENZ<span className="text-luxury-gold">STYLE</span>
              </span>
              <span className="hidden xs:block text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] text-gray-400 uppercase -mt-0.5 sm:-mt-1 font-medium">
                Limited &bull; Competitive &bull; Yours
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/auctions"
              className={`transition-colors tracking-wide ${
                isActive('/auctions') ? 'text-luxury-gold font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Drops
            </Link>
            <Link
              to="/my-auctions"
              className={`transition-colors tracking-wide ${
                isActive('/my-auctions') ? 'text-luxury-gold font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              My Auctions
            </Link>
            <Link
              to="/orders"
              className={`transition-colors tracking-wide ${
                isActive('/orders') ? 'text-luxury-gold font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Orders
            </Link>
            <Link
              to="/membership"
              className={`flex items-center gap-1.5 transition-colors tracking-wide px-3 py-1 rounded-full border ${
                hasActiveMembership
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20'
                  : 'border-luxury-gold/40 text-luxury-gold hover:bg-luxury-gold/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasActiveMembership ? 'VIP Active' : 'Membership ₹49'}</span>
            </Link>
          </nav>

          {/* Right Action Icons & Auth Profile */}
          <div className="flex items-center gap-4">
            {/* Admin Badge Quick Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 text-xs bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30 hover:bg-luxury-gold/20 font-semibold px-2.5 py-1 rounded-md transition"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </Link>
            )}

            {/* Notification Bell Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfileMenu(false);
                  }}
                  className="relative p-2 text-gray-300 hover:text-white rounded-full hover:bg-luxury-surface/80 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Flyout */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-96 glass-panel rounded-xl shadow-2xl p-4 z-50 border border-luxury-border">
                    <div className="flex items-center justify-between pb-3 border-b border-luxury-border">
                      <span className="font-semibold text-sm text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-luxury-gold" /> Activity Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-xs text-luxury-gold bg-luxury-gold/10 px-2 py-0.5 rounded">
                          {unreadCount} new
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-luxury-border/40 mt-2">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-gray-400 py-6 text-center">No notifications yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => markAsRead(n._id)}
                            className={`p-3 text-xs transition cursor-pointer hover:bg-luxury-surface/50 rounded-lg ${
                              !n.read ? 'bg-luxury-gold/5' : ''
                            }`}
                          >
                            <p className="font-semibold text-white mb-0.5">{n.title}</p>
                            <p className="text-gray-300 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Dropdown / Login CTA */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProfileMenu(!showProfileMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-luxury-border hover:border-luxury-gold/50 bg-luxury-surface transition"
                >
                  <div className="w-7 h-7 rounded-full bg-luxury-gold/20 text-luxury-gold font-bold text-xs flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-xs font-semibold text-gray-200 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-3 w-56 max-w-[calc(100vw-2rem)] glass-panel rounded-xl shadow-2xl p-2 z-50 border border-luxury-border text-sm">
                    <div className="px-3 py-2 border-b border-luxury-border">
                      <p className="font-semibold text-white truncate">{user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-luxury-surface rounded-lg mt-1"
                    >
                      <User className="w-4 h-4 text-luxury-gold" /> Collector Dashboard
                    </Link>
                    <Link
                      to="/my-auctions"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-luxury-surface rounded-lg"
                    >
                      <Gavel className="w-4 h-4 text-gray-400" /> Joined Drops
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-luxury-surface rounded-lg"
                    >
                      <ShoppingBag className="w-4 h-4 text-gray-400" /> My Pickup Orders
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-luxury-surface rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-gray-400" /> Shipping & Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-luxury-gold hover:bg-luxury-gold/10 rounded-lg font-medium"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-luxury-border my-1"></div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xs:gap-3 shrink-0">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-gray-300 hover:text-white font-medium px-2 sm:px-3 py-1.5 transition whitespace-nowrap"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-[11px] sm:text-xs md:text-sm bg-gradient-to-r from-luxury-gold to-luxury-gold-dark text-black font-bold px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:brightness-110 transition shadow-luxury-gold whitespace-nowrap"
                >
                  <span className="hidden xs:inline">Join Drop Club</span>
                  <span className="xs:hidden">Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
