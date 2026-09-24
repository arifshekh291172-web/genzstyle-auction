import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bannerAlert, setBannerAlert] = useState(null); // High-priority popups like Outbid

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notifications?limit=20');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err.message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Listen for real-time socket notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleOutbid = (outbidData) => {
      setBannerAlert({
        type: 'OUTBID',
        title: "YOU'VE BEEN OUTBID",
        message: `Current highest bid is now ₹${outbidData.currentBid.toLocaleString('en-IN')}. Next valid bid is ₹${outbidData.nextBid.toLocaleString('en-IN')}.`,
        auctionId: outbidData.auctionId,
      });

      // Auto dismiss banner after 6 seconds
      setTimeout(() => {
        setBannerAlert(null);
      }, 6000);
    };

    socket.on('notification:new', handleNewNotification);
    socket.on('notification:outbid', handleOutbid);

    return () => {
      socket.off('notification:new', handleNewNotification);
      socket.off('notification:outbid', handleOutbid);
    };
  }, [socket]);

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  };

  const dismissBanner = () => setBannerAlert(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        bannerAlert,
        dismissBanner,
        markAsRead,
        markAllAsRead,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
