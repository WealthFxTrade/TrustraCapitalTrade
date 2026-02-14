import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    // Only fetch if authenticated
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      // Corrected: Uses the /user prefix as defined in backend app.js
      const res = await api.get("/user/dashboard");

      if (res.data && res.data.success) {
        setStats(res.data.stats);
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("UserContext Sync Error:", err);
      // Fallback to zeros to prevent UI crash
      setStats({
        mainBalance: 0,
        profit: 0,
        activeNodes: 0,
        dailyROI: 0,
        activePlan: "N/A"
      });
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    fetchStats();
    // Refresh every minute
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <UserContext.Provider value={{ stats, transactions, loading, fetchStats }}>
      {children}
    </UserContext.Provider>
  );
};
