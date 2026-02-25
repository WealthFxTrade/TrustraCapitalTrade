import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/api';
import { useAuth } from './AuthContext';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user, token, initialized } = useAuth();
  const [stats, setStats] = useState(null); // null = loading
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    if (!stats) setLoading(true);

    try {
      const res = await api.get('/user/dashboard');
      const data = res.data.stats || res.data.data || res.data;
      setStats(data);
    } catch (err) {
      console.warn('[UserContext] fetchStats failed:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, stats]);

  // Real-time socket connection
  useEffect(() => {
    if (!token || !initialized) return;

    const socketUrl = (import.meta.env.VITE_API_URL || 'https://trustracapitaltrade-backend.onrender.com').replace(/\/api$/, '');
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnectionAttempts: 5,
    });

    socket.on('profit_update', (data) => {
      setStats((prev) => ({
        ...prev,
        balances: { ...prev?.balances, EUR_PROFIT: data.newProfit || data.balances?.EUR_PROFIT },
      }));
    });

    socket.on('balance_update', (data) => {
      setStats((prev) => ({ ...prev, balances: data.balances || prev?.balances }));
    });

    socketRef.current = socket;
    return () => socketRef.current?.close();
  }, [token, initialized]);

  // Fetch stats when token changes
  useEffect(() => {
    if (token) fetchStats();
  }, [token, fetchStats]);

  return (
    <UserContext.Provider value={{ stats, setStats, loading, fetchStats, socket: socketRef.current }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
