import React, { useEffect, useState, useCallback, useContext } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import api from "../../api/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// Components
import DashboardHeader from "../../components/DashboardHeader";
import AccountSummary from "../../components/AccountSummary";
import StatCard from "../../components/StatCard";

export default function Dashboard() {
  const { user } = useAuth();
  // stats here contains { balances: { BTC, EUR, EUR_PROFIT }, investedAmount, etc }
  const { stats, fetchStats, loading } = useContext(UserContext) || {};
  const [btcPrice, setBtcPrice] = useState(null);

  // ─── Real-Time Socket for Profit/Deposit Updates ───
  useEffect(() => {
    // Use user.id or user._id depending on your JWT payload
    const userId = user?.id || user?._id;
    if (!userId) return;

    const socket = io("https://trustracapitaltrade-backend.onrender.com", {
      transports: ["websocket"],
    });

    socket.emit("join_room", userId);

    // Listen for ROI payouts from cronJob.js
    socket.on("profit_update", (data) => {
      toast.success(data.message, { duration: 6000, icon: "💰" });
      fetchStats?.(); // Trigger UserContext to refresh all balances from DB
    });

    // Listen for BTC deposits from btcWatcher.js
    socket.on("balance_update", (data) => {
      toast.success("BTC Deposit Confirmed", { icon: "₿" });
      fetchStats?.(); 
    });

    return () => socket.disconnect();
  }, [user, fetchStats]);

  // ─── BTC Market Data Fetch ───
  const getMarketData = useCallback(async () => {
    try {
      // Fetching from your internal market route
      const res = await api.get("/market/btc-price");
      setBtcPrice(res.data.price);
    } catch {
      // Fallback to CoinGecko if your internal route fails
      const fallback = await fetch('https://api.coingecko.com');
      const data = await fallback.json();
      setBtcPrice(data.bitcoin.eur);
    }
  }, []);

  useEffect(() => {
    getMarketData();
    const interval = setInterval(getMarketData, 60000); 
    return () => clearInterval(interval);
  }, [getMarketData]);

  // ─── Display Logic: Prioritize Live Stats over Auth User ───
  const balances = stats?.balances || user?.balances || { EUR: 0, EUR_PROFIT: 0, BTC: 0 };
  
  const displayStats = {
    mainBalance: balances.EUR ?? 0,
    profit: balances.EUR_PROFIT ?? 0,
    btc: balances.BTC ?? 0,
    activeNodes: (stats?.isPlanActive || user?.isPlanActive) ? 1 : 0,
    dailyROI: (stats?.investedAmount || user?.investedAmount || 0) * (stats?.dailyRoiRate || user?.dailyRoiRate || 0),
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans">
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-8 max-w-7xl mx-auto">
        
        {/* Account Summary Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
             <AccountSummary user={user} stats={displayStats} />
          </div>
        </section>

        {/* 📊 High-End Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Equity" 
            value={`€${displayStats.mainBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
          />
          <StatCard 
            title="Yield Profit" 
            value={`€${displayStats.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}`} 
            highlight 
          />
          <StatCard 
            title="BTC Wallet" 
            value={`${displayStats.btc.toFixed(8)} BTC`} 
          />
          <StatCard 
            title="Est. Daily ROI" 
            value={`€${displayStats.dailyROI.toFixed(2)}`} 
          />
        </section>

        {/* BTC Address Display (Derived from HD Wallet) */}
        <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Your Unique Node Address</p>
          <code className="text-yellow-500 font-mono text-sm md:text-lg break-all bg-black/40 px-4 py-2 rounded-lg border border-white/5">
            {user?.btcAddress || "GENERATING..."}
          </code>
        </div>
      </main>
    </div>
  );
}

