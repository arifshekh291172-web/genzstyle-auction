import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import MobileBottomNav from './components/common/MobileBottomNav';
import AdminSidebar from './components/admin/AdminSidebar';

// Public & Collector Pages
import Home from './pages/Home';
import Auctions from './pages/Auctions';
import AuctionDetail from './pages/AuctionDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Membership from './pages/Membership';
import Dashboard from './pages/Dashboard';
import MyAuctions from './pages/MyAuctions';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import TermsAndConditions from './pages/TermsAndConditions';

import AdminLogin from './pages/admin/AdminLogin';
import AdminOverview from './pages/admin/AdminOverview';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminCreateAuction from './pages/admin/AdminCreateAuction';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMemberships from './pages/admin/AdminMemberships';
import AdminPayments from './pages/admin/AdminPayments';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

// Protected Route Guard for Collectors
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// App Layout Controller
const AppLayout = () => {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/admin/login';
  const isAdminPath = location.pathname.startsWith('/admin') && !isAdminLogin;

  if (isAdminLogin) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    );
  }

  if (isAdminPath) {
    return (
      <AdminRoute>
        <div className="flex bg-luxury-black min-h-screen text-white">
          <AdminSidebar />
          <div className="flex-1 overflow-x-hidden flex flex-col">
            <Routes>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/auctions" element={<AdminAuctions />} />
              <Route path="/admin/auctions/create" element={<AdminCreateAuction />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/memberships" element={<AdminMemberships />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-luxury-black text-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Exploration Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/auction/:auctionId" element={<AuctionDetail />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/terms" element={<TermsAndConditions />} />

          {/* Authentication Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Protected Collector Pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-auctions"
            element={
              <ProtectedRoute>
                <MyAuctions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            <AppLayout />
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
