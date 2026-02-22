import React, { useEffect, useState, useCallback, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import api from "../../api/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// Components
import DashboardHeader from "../../components/DashboardHeader";
import AccountSummary from "../../components/AccountSummary";
import StatCard from "../../components/StatCard";
import BtcPrice from "../../components/BtcPrice";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, fetchStats, loading } = useContext(UserContext) || {};
  const [btcPrice, setBtcPrice] = useState(null);
  const location = useLocation();

  // 📡 Real-Time Socket Connection
  useEffect(() => {
    if (!user?.id) return;

    const socket = io("https://trustracapitaltrade-backend.onrender.com", {
      transports: ['websocket']
    });

    socket.emit('join_room', user.id);

    socket.on('profit_update', (data) => {
      toast.success(data.message, { duration: 6000, icon: '💰' });
      fetchStats?.(); // Auto-refresh balances in UI
    });

    return () => socket.disconnect();
  }, [user?.id, fetchStats]);

  // ₿ Market Data Sync
  const getMarketData = useCallback(async (isMounted) => {
    try {
      const res = await api.get("/market/btc-price");
      if (isMounted) setBtcPrice(res.data.price);
    } catch { /* fallback handled by component */ }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getMarketData(isMounted);
    const interval = setInterval(() => getMarketData(isMounted), 60000);
    return () => { isMounted = false; clearInterval(interval); };
  }, [getMarketData]);

  const displayStats = {
    mainBalance: user?.balances?.EUR ?? 0,
    profit: user?.balances?.EUR_PROFIT ?? 0,
    activeNodes: user?.isPlanActive ? 1 : 0,
    dailyROI: (user?.investedAmount || 0) * (user?.dailyRoiRate || 0),
    ...stats,
  };

  if (loading && !stats) return <div className="min-h-screen bg-[#020617] animate-pulse" />;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300">
      <DashboardHeader btcPrice={btcPrice} />
      
      <main className="px-6 lg:px-20 py-12 space-y-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BtcPrice price={btcPrice} />
          <div className="lg:col-span-2">
            <AccountSummary user={user} stats={displayStats} />
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Equity" value={`€${displayStats.mainBalance.toLocaleString()}`} />
          <StatCard title="Yield Profit" value={`€${displayStats.profit.toLocaleString()}`} highlight />
          <StatCard title="Active Nodes" value={displayStats.activeNodes} />
          <StatCard title="Est. Daily" value={`€${displayStats.dailyROI.toFixed(2)}`} />
        </section>
      </main>
    </div>
  );
}

