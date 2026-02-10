// src/context/UserContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/apiService';
import toast from 'react-hot-toast';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [stats, setStats] = useState({ mainBalance: 0, totalProfit: 0, activePlan: 'No Active Plan' });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, txRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/transactions/my'),
      ]);
      if (statsRes.data?.success) setStats(statsRes.data.stats || stats);
      setTransactions(txRes.data?.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // refresh every 1 min
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <UserContext.Provider value={{ stats, setStats, transactions, setTransactions, loading, fetchDashboardData }}>
      {children}
    </UserContext.Provider>
  );
};
