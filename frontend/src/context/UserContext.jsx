import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  
  // 🛠️ FIX 1: Initialize stats with 0 values to prevent "undefined" crashes
  const [stats, setStats] = useState({
    mainBalance: 0,
    profit: 0,
    activeNodes: 0,
    dailyROI: 0,
    activePlan: "None"
  });
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    // Only fetch if authenticated and token exists
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      // 🛠️ FIX 2: Added a timeout or check to ensure we don't hang
      const res = await api.get("/user/dashboard");

      if (res.data && res.data.success) {
        // Handle Mongoose Map conversion if necessary
        const rawStats = res.data.stats || {};
        
        setStats({
          mainBalance: Number(rawStats.mainBalance || 0),
          profit: Number(rawStats.profit || 0),
          activeNodes: Number(rawStats.activeNodes || 0),
          dailyROI: Number(rawStats.dailyROI || 0),
          activePlan: rawStats.activePlan || "None"
        });
        
        setTransactions(res.data.transactions || []);
      }
    } catch (err) {
      console.error("❌ UserContext Sync Error:", err.message);
      // Stay with previous stats or 0s rather than null
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      const interval = setInterval(fetchStats, 60000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
    }
  }, [fetchStats, isAuthenticated]);

  return (
    <UserContext.Provider value={{ 
      stats, 
      transactions, 
      loading, 
      fetchStats 
    }}>
      {children}
    </UserContext.Provider>
  );
};

