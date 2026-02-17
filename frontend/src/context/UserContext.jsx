import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "../api/api";

// Create context
export const UserContext = createContext(null);

// Custom hook to consume the context (this is what components use)
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [stats, setStats] = useState({
    mainBalance: 0,
    profit: 0,
    activeNodes: 0,
    dailyROI: 0,
    activePlan: "None",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/user/dashboard");

      if (res.data?.success) {
        const rawStats = res.data.stats || {};

        setStats({
          mainBalance: Number(rawStats.mainBalance ?? 0),
          profit: Number(rawStats.profit ?? 0),
          activeNodes: Number(rawStats.activeNodes ?? 0),
          dailyROI: Number(rawStats.dailyROI ?? 0),
          activePlan: rawStats.activePlan ?? "None",
        });

        setTransactions(res.data.transactions || []);
      } else {
        throw new Error(res.data?.message || "Invalid response format");
      }
    } catch (err) {
      console.error("❌ UserContext fetchStats failed:", err.message);
      setError(err.message || "Failed to load dashboard data");
      // Keep previous stats instead of resetting to zero
    } finally {
      setLoading(false);
    }
  }, []); // No deps needed – called only on mount or manual trigger

  useEffect(() => {
    // Only fetch if we have a token (auth guard)
    const token = localStorage.getItem("token");
    if (token) {
      fetchStats();

      // Optional: poll every 60 seconds
      const interval = setInterval(fetchStats, 60000);

      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("No authentication token found");
    }
  }, [fetchStats]);

  return (
    <UserContext.Provider
      value={{
        stats,
        transactions,
        loading,
        error,
        fetchStats,          // Allow manual refresh from components
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
