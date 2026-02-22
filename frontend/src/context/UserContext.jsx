import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import api from "../api/api";
import { io } from "socket.io-client";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [stats, setStats] = useState({ 
    balances: { BTC: 0, EUR: 0, EUR_PROFIT: 0, USDT: 0 },
    activeNodes: 0,
    investedAmount: 0 
  });
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // 1. Initial Fetch of Dashboard Data
  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await api.get("/user/dashboard");
      if (res.data?.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn("User data fetch failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Real-Time Socket Integration
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Connect to backend (adjust URL if needed)
    const newSocket = io(import.meta.env.VITE_API_URL || "http://localhost:10000", {
      transports: ["websocket"],
      auth: { token }
    });

    // Handle incoming ROI payouts from cronJob.js
    newSocket.on("profit_update", (data) => {
      setStats(prev => ({
        ...prev,
        balances: { ...prev.balances, EUR_PROFIT: data.newProfit }
      }));
    });

    // Handle BTC deposits from btcWatcher.js
    newSocket.on("balance_update", (data) => {
      setStats(prev => ({ ...prev, balances: data.balances }));
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => { 
    fetchStats(); 
  }, [fetchStats]);

  return (
    <UserContext.Provider value={{ stats, setStats, loading, fetchStats, socket }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};

