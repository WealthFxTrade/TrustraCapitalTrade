import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api"; // Use your central API instance
import { useAuth } from "./AuthContext";

export const UserContext = createContext();

const EMPTY_STATS = {
  mainBalance: 0,
  btcBalance: 0,
  usdtBalance: 0,
  activePlan: "Standard Node",
  dailyRate: 0.46,
};

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(EMPTY_STATS);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── DATA NORMALIZER (Fixed to match your Backend app.js) ───
  const normalizeStats = (data = {}) => ({
    mainBalance: Number(data?.balance ?? data?.mainBalance ?? 0),
    btcBalance: Number(data?.btcBalance ?? 0),
    usdtBalance: Number(data?.usdtBalance ?? 0),
    activePlan: data?.activePlan ?? "Standard Node",
    dailyRate: Number(data?.dailyRate ?? 0.46),
  });

  // ─── API SYNC ───
  const fetchStats = useCallback(async () => {
    // If no token, stop loading and clear data
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      // Synchronize with your backend app.use('/api/user', userRoutes)
      const [statsRes, txRes] = await Promise.all([
        api.get("/user/dashboard"),
        api.get("/transactions")
      ]);

      setStats(normalizeStats(statsRes.data));
      setTransactions(Array.isArray(txRes.data) ? txRes.data : txRes.data?.transactions || []);
    } catch (err) {
      console.error("UserContext Sync Error:", err);
    } finally {
      setLoading(false); // CRITICAL: This prevents the infinite black screen
    }
  }, [token, isAuthenticated]);

  // ─── LIFECYCLE MANAGEMENT ───
  useEffect(() => {
    if (!isAuthenticated) {
      setStats(EMPTY_STATS);
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchStats]);

  return (
    <UserContext.Provider
      value={{
        stats,
        transactions,
        loading,
        fetchStats,
        addTransaction: (tx) => {
          setTransactions((prev) => [tx, ...prev]);
          setTimeout(fetchStats, 2000); // Re-sync with server after local update
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

