import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      auth: { token: token || null },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  const joinAuction = (auctionId) => {
    if (socket && connected && auctionId) {
      socket.emit('auction:join', { auctionId });
    }
  };

  const leaveAuction = (auctionId) => {
    if (socket && connected && auctionId) {
      socket.emit('auction:leave', { auctionId });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinAuction, leaveAuction }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
