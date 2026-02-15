import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import api from "../../api"; // Using your fixed axios instance

// Components
import DashboardHeader from "../../components/DashboardHeader";
import AccountSummary from "../../components/AccountSummary";
import WalletDashboard from "../../components/WalletDashboard";
import RecentActivity from "../../components/RecentActivity";
import StatCard from "../../components/StatCard";
import BtcPrice from "../../components/BtcPrice";

export default function Dashboard() {
  const { user } = useAuth();
  const { stats, transactions, loading: contextLoading, fetchStats } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [btcPrice, setBtcPrice] = useState(null);
  const [autoOpenNode, setAutoOpenNode] = useState(null);

  // 1. Strict Auth Guard
  useEffect(() => {
    if (!user && !contextLoading) {
      navigate("/login");
    }
    if (location.state?.autoOpenNode) {
      setAutoOpenNode(location.state.autoOpenNode);
    }
  }, [user, navigate, location.state, contextLoading]);

  // 2. Market Sync - Points to your fixed backend feed
  const fetchBTCPrice = useCallback(async () => {
    try {
      // Prioritize your own backend market feed for data consistency
      const res = await api.get("/market/btc-price");
      if (res.data?.price) {
        setBtcPrice(res.data.price);
      }
    } catch (err) {
      // Fallback to CoinGecko if your backend feed is offline
      try {
        const cgRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur");
        const data = await cgRes.json();
        setBtcPrice(data.bitcoin.eur);
      } catch (cgErr) {
        console.error("Global Market Sync Failure");
      }
    }
  }, []);

  useEffect(() => {
    fetchBTCPrice();
    if (user) fetchStats();

    const interval = setInterval(() => {
      fetchBTCPrice();
      if (user) fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchBTCPrice, fetchStats, user]);

  // 3. Resilient Loading State
  if (contextLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070a]">
        <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-600 animate-pulse">
          Synchronizing Secure Node...
        </p>
      </div>
    );
  }

  // 4. Data Normalization (Handling Mongoose Map balances)
  // Ensure the frontend reads from the correct Map keys we defined in User.js
  const displayStats = {
    mainBalance: user?.balances?.EUR || 0,
    profit: user?.balances?.EUR_PROFIT || 0,
    btcBalance: user?.balances?.BTC || 0,
    activeNodes: user?.isPlanActive ? 1 : 0,
    dailyROI: user?.dailyRoiRate ? (user.investedAmount * user.dailyRoiRate) : 0,
    ...stats // Allow UserContext to override if it fetches fresh aggregated data
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 selection:bg-yellow-500/30">
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-12 max-w-7xl mx-auto">
        
        {/* Market & Identity Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
             <BtcPrice price={btcPrice} />
          </div>
          <div className="lg:col-span-2">
             <AccountSummary user={user} stats={displayStats} autoOpenNode={autoOpenNode} />
          </div>
        </section>

        {/* Financial Intelligence Grid */}
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

        {/* Transactional & Asset Modules */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 pb-20">
          <div className="lg:col-span-3">
            <WalletDashboard user={user} stats={displayStats} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity transactions={transactions || user?.ledger || []} />
          </div>
        </section>
      </main>
    </div>
  );
}

