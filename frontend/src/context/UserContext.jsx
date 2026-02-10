import React, { createContext, useState, useEffect, useCallback } from "react";
import { getUserStats, getUserTransactions } from "../api";
import { useAuth } from "./AuthContext";
import { connectSocket, disconnectSocket } from "../services/socket";

export const UserContext = createContext();

const EMPTY_STATS = {
  mainBalance: 0,
  btcBalance: 0,
  usdtBalance: 0,
  activePlan: "Basic Node",
  dailyRate: 0,
};

export const UserProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const [stats, setStats] = useState(EMPTY_STATS);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── SANITY GUARD ───────────────────────────────────────────
  const normalizeStats = (data = {}) => ({
    mainBalance:
      Number(data?.mainBalance ?? data?.balances?.EUR ?? data?.balance ?? 0),
    btcBalance:
      Number(data?.btcBalance ?? data?.balances?.BTC ?? 0),
    usdtBalance:
      Number(data?.usdtBalance ?? data?.balances?.USDT ?? 0),
    activePlan:
      data?.activePlan ?? data?.plan ?? "Starter",
    dailyRate:
      Number(data?.dailyRate ?? 0.46),
  });

  // ─── API FALLBACK SYNC ──────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [statsData, txData] = await Promise.all([
        getUserStats(),
        getUserTransactions(),
      ]);

      setStats(normalizeStats(statsData));
      setTransactions(
        Array.isArray(txData)
          ? txData
          : txData?.transactions || []
      );
    } catch (err) {
      console.error("UserContext API sync failed:", err);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  // ─── WEBSOCKET LIVE PUSH ────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = connectSocket(token);

    socket.on("balance:update", (payload) => {
      setStats((prev) => ({
        ...prev,
        ...normalizeStats(payload),
      }));
    });

    socket.on("transaction:new", (tx) => {
      if (!tx?._id) return;
      setTransactions((prev) => [tx, ...prev]);
    });

    return () => {
      socket.off("balance:update");
      socket.off("transaction:new");
    };
  }, [token, isAuthenticated]);

  // ─── SESSION LIFECYCLE ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setStats(EMPTY_STATS);
      setTransactions([]);
      setLoading(false);
      disconnectSocket();
      return;
    }

    fetchStats();
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchStats]);

  // ─── OPTIMISTIC UPDATE + HARD SYNC ──────────────────────────
  const addTransaction = (tx) => {
    if (!tx?.amount) return;

    setTransactions((prev) => [tx, ...prev]);

    setStats((prev) => {
      const keyMap = {
        BTC: "btcBalance",
        USDT: "usdtBalance",
        BANK: "mainBalance",
      };
      const key = keyMap[tx.method] || "mainBalance";

      return {
        ...prev,
        [key]: Number(prev[key]) + Number(tx.amount),
      };
    });

    // Ensure truth
    setTimeout(fetchStats, 1500);
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
