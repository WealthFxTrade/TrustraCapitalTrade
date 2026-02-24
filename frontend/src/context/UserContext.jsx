import React, { createContext, useState, useEffect, useCallback, useContext, useRef } from "react";
import api from "../api/api";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext"; // ⚡ FIX: Sync with Auth state

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user, token, initialized } = useAuth(); // 🛡️ Actual Work: Get token from Context, not just localStorage
  
  const [stats, setStats] = useState({
    balances: { BTC: 0, EUR: 0, EUR_PROFIT: 0, USDT: 0 },
    activeNodes: 0,
    investedAmount: 0,
    btcAddress: ""
  });
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // 1. Initial Fetch of Dashboard Data
  const fetchStats = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await api.get("/user/dashboard");
      if (res.data?.success) {
        // Normalize response to ensure balances object exists
        const data = res.data.stats || res.data.data;
        setStats(prev => ({
          ...prev,
          ...data,
          balances: data.balances || prev.balances
        }));
      }
    } catch (err) {
      console.warn("[UserContext]: Dashboard sync failed.", err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 2. Real-Time Socket Integration (Synced with Auth)
  useEffect(() => {
    // ⚡ FIX: Only connect if authenticated and token exists
    if (!token || !initialized) return;

    // ACTUAL WORK: Strip '/api' from VITE_API_URL for Socket.io (Socket.io connects to root)
    const socketUrl = (import.meta.env.VITE_API_URL || "https://trustracapitaltrade-backend.onrender.com").replace(/\/api$/, "");

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnectionAttempts: 5,
      timeout: 10000
    });

    // Handle ROI payouts
    newSocket.on("profit_update", (data) => {
      setStats(prev => ({
        ...prev,
        balances: { 
          ...prev.balances, 
          EUR_PROFIT: data.newProfit || data.balances?.EUR_PROFIT 
        }
      }));
    });

    // Handle BTC deposit confirmations
    newSocket.on("balance_update", (data) => {
      setStats(prev => ({ 
        ...prev, 
        balances: data.balances || prev.balances 
      }));
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [token, initialized]);

  // Trigger fetch when token is valid
  useEffect(() => {
    if (token) fetchStats();
  }, [fetchStats, token]);

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

