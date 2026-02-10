import React, { createContext, useState, useEffect, useCallback } from "react";
// This import now looks for the named exports we added to src/api/index.js
import { getUserStats, getUserTransactions } from "../api"; 
import { useAuth } from "./AuthContext"; 

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  const [stats, setStats] = useState({
    mainBalance: 0,
    btcBalance: 0,
    usdtBalance: 0,
    activePlan: "Basic Node",
    dailyRate: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    // 🛑 Prevent API calls if unauthorized to avoid 401 errors
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Parallel fetching for 2026 performance standards
      const [statsData, txData] = await Promise.all([
        getUserStats(),
        getUserTransactions()
      ]);

      // Map backend response keys to frontend state
      setStats({
        mainBalance: statsData?.mainBalance || statsData?.balance || 0,
        btcBalance: statsData?.btcBalance || 0,
        usdtBalance: statsData?.usdtBalance || 0,
        activePlan: statsData?.activePlan || "Starter",
        dailyRate: statsData?.dailyRate || 0,
      });

      // Handle nested transaction arrays or direct arrays
      setTransactions(txData?.transactions || txData || []);
    } catch (err) {
      console.error("User Data Sync Failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // Handle Session Lifecycle
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    } else {
      // Security: Wipe state on logout
      setStats({ mainBalance: 0, btcBalance: 0, usdtBalance: 0, activePlan: "Basic Node", dailyRate: 0 });
      setTransactions([]);
      setLoading(false);
    }
  }, [isAuthenticated, fetchStats]);

  // Optimistic UI Update for Deposits/Withdrawals
  const addTransaction = (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    setStats((prev) => {
      const keyMap = { BTC: 'btcBalance', USDT: 'usdtBalance', BANK: 'mainBalance' };
      const key = keyMap[tx.method] || 'mainBalance';
      return { ...prev, [key]: prev[key] + (tx.amount || 0) };
    });
  };

  return (
    <UserContext.Provider
      value={{
        stats,
        transactions,
        loading,
        fetchStats,
        addTransaction,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

