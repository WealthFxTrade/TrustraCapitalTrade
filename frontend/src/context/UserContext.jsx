import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from "react";
import api from "../api/api";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user, token, initialized } = useAuth();
  const [stats, setStats] = useState(null); // Initialized to null for easier Skeleton detection
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // 1. Initial Fetch (Interceptors handle nProgress)
  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    // Only set loading if we don't have stats yet (to show skeleton)
    if (!stats) setLoading(true);

    try {
      const res = await api.get("/user/dashboard");
      // res.data.success is usually true if it hits 200, but we check just in case
      const data = res.data.stats || res.data.data || res.data;
      setStats(data);
    } catch (err) {
      // Global api.js handles the toast; local catch silences unhandled promise errors
      console.warn("[UserContext]: Dashboard sync failed.", err.message);
    } finally {
      setLoading(false);
    }
  }, [token, stats]);

  // 2. Real-Time Socket Integration
  useEffect(() => {
    if (!token || !initialized) return;

    // Correct URL handling for Socket.io vs REST API
    const socketUrl = (import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com").replace(/\/api$/, "");
    
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnectionAttempts: 5,
    });

    newSocket.on("profit_update", (data) => {
      setStats(prev => ({
        ...prev,
        balances: {
          ...prev?.balances,
          EUR_PROFIT: data.newProfit || data.balances?.EUR_PROFIT
        }
      }));
    });

    newSocket.on("balance_update", (data) => {
      setStats(prev => ({
        ...prev,
        balances: data.balances || prev?.balances
      }));
    });

    socketRef.current = newSocket;

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [token, initialized]);

  // Sync logic when token changes
  useEffect(() => {
    if (token) fetchStats();
  }, [token]); // removed fetchStats to prevent unnecessary re-runs if it's not memoized perfectly

  return (
    <UserContext.Provider value={{ 
      stats, 
      setStats, 
      loading, 
      fetchStats, 
      socket: socketRef.current 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
