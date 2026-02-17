import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "../api/api";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [stats, setStats] = useState({ mainBalance: 0, profit: 0, activeNodes: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    setLoading(true);
    try {
      const res = await api.get("/user/dashboard");
      if (res.data?.success) setStats(res.data.stats);
    } catch (err) {
      console.warn("User data not available.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <UserContext.Provider value={{ stats, loading, fetchStats }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  return context || {}; // Prevents crashing if used outside provider
};

