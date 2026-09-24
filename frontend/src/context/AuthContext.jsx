import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('genzstyle_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('genzstyle_token'));
  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState(null);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setMembership(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/users/me');
      if (res.data.success) {
        setUser(res.data.user);
        setMembership(res.data.membership);
        localStorage.setItem('genzstyle_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.warn('Session expired or invalid, logging out.');
      setUser(null);
      setToken(null);
      setMembership(null);
      localStorage.removeItem('genzstyle_token');
      localStorage.removeItem('genzstyle_user');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('genzstyle_token', res.data.token);
      localStorage.setItem('genzstyle_user', JSON.stringify(res.data.user));
      await fetchProfile();
    }
    return res.data;
  };

  const signup = async (formData) => {
    const res = await api.post('/auth/signup', formData);
    return res.data;
  };

  const verifyEmail = async (payload) => {
    const requestBody = typeof payload === 'string' ? { token: payload } : payload;
    const res = await api.post('/auth/verify-email', requestBody);
    if (res.data.success && res.data.token) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('genzstyle_token', res.data.token);
      localStorage.setItem('genzstyle_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    try {
      api.post('/auth/logout').catch(() => {});
    } finally {
      setUser(null);
      setToken(null);
      setMembership(null);
      localStorage.removeItem('genzstyle_token');
      localStorage.removeItem('genzstyle_user');
    }
  };

  const refreshUser = async () => {
    await fetchProfile();
  };

  const value = {
    user,
    token,
    membership,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'ADMIN',
    hasActiveMembership: membership?.status === 'ACTIVE' && membership?.auctionAccessStatus === 'ACTIVE',
    loading,
    login,
    signup,
    verifyEmail,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
