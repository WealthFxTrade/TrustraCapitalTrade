import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import api from "../../api";

// Components
import DashboardHeader from "../../components/DashboardHeader";
import AccountSummary from "../../components/AccountSummary";
import WalletDashboard from "../../components/WalletDashboard";
import RecentActivity from "../../components/RecentActivity";
import StatCard from "../../components/StatCard";
import BtcPrice from "../../components/BtcPrice";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, transactions, loading: contextLoading, fetchStats, error: contextError } = useContext(UserContext);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [btcPrice, setBtcPrice] = useState(null);
  const [btcError, setBtcError] = useState(null);
  const [autoOpenNode, setAutoOpenNode] = useState(null);
  const [mounted, setMounted] = useState(true);

  // Handle auto-open node from navigation state (one-time)
  useEffect(() => {
    if (location.state?.autoOpenNode) {
      setAutoOpenNode(location.state.autoOpenNode);
    }
  }, [location.state]);

  // Fetch BTC price – no navigation on failure
  const fetchBTCPrice = useCallback(async () => {
    if (!mounted) return;

    try {
      const res = await api.get("/market/btc-price");
      if (res.data?.price && mounted) {
        setBtcPrice(res.data.price);
        setBtcError(null);
      }
    } catch (err) {
      console.warn("BTC price fetch failed", err);
      setBtcError("Market data unavailable");

      // Optional fallback (low priority)
      try {
        const cgRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur");
        const data = await cgRes.json();
        if (mounted) setBtcPrice(data.bitcoin?.eur);
      } catch {
        // silent fallback failure
      }
    }
  }, [mounted]);

  // Data fetching & polling
  useEffect(() => {
    if (!user) return;

    fetchBTCPrice();
    fetchStats?.(); // safe call

    const interval = setInterval(() => {
      if (mounted) {
        fetchBTCPrice();
        fetchStats?.();
      }
    }, 60000); // 1 min

    return () => {
      clearInterval(interval);
      setMounted(false);
    };
  }, [user, fetchBTCPrice, fetchStats]);

  // Show loading while context is fetching critical data
  if (contextLoading && !stats && !transactions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070a]">
        <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-wider text-yellow-600 animate-pulse">
          Loading secure node...
        </p>
      </div>
    );
  }

  // Safe stats with defaults & normalization
  const displayStats = {
    mainBalance: user?.balances?.EUR ?? 0,
    profit:      user?.balances?.EUR_PROFIT ?? 0,
    btcBalance:  user?.balances?.BTC ?? 0,
    activeNodes: user?.isPlanActive ? 1 : 0,
    dailyROI:    user?.dailyRoiRate && user?.investedAmount 
                   ? user.investedAmount * user.dailyRoiRate 
                   : 0,
    ...stats, // override with fresh context data if available
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-yellow-500/30">
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-12 max-w-7xl mx-auto">
        {/* Market & Identity Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <BtcPrice price={btcPrice} error={btcError} />
          </div>
          <div className="lg:col-span-2">
            <AccountSummary 
              user={user} 
              stats={displayStats} 
              autoOpenNode={autoOpenNode} 
            />
          </div>
        </section>

        {/* Financial Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Equity Balance"
            value={`€${displayStats.mainBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="+0.00%"
          />
          <StatCard
            title="Rio Profit"
            value={`€${displayStats.profit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            highlight
          />
          <StatCard
            title="Active Deployments"
            value={displayStats.activeNodes}
          />
          <StatCard
            title="Estimated Daily ROI"
            value={`€${displayStats.dailyROI.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          />
        </section>

        {/* Wallet & Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-20">
          <div className="lg:col-span-3">
            <WalletDashboard user={user} stats={displayStats} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity 
              transactions={transactions || user?.ledger || []} 
              error={contextError}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
