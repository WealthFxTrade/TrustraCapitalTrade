import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { UserContext } from "../../context/UserContext";
import axios from "axios";

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

  // 1. Auth & Route State Guard
  useEffect(() => {
    if (!user) navigate("/login");

    const autoNode = location.state?.autoOpenNode;
    if (autoNode) setAutoOpenNode(autoNode);
  }, [user, navigate, location.state]);

  // 2. BTC Price Fetch
  const fetchBTCPrice = async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
      );
      setBtcPrice(res.data.bitcoin.eur);
    } catch (err) {
      console.error("BTC Sync Error:", err);
      setBtcPrice(null);
    }
  };

  useEffect(() => {
    fetchBTCPrice();
    fetchStats();

    const interval = setInterval(() => {
      fetchBTCPrice();
      fetchStats();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  // 3. Loading UI
  if (contextLoading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05070a] text-blue-500">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="font-black uppercase tracking-widest text-[10px]">Initializing Secure Node...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-blue-500/30">
      {/* Header */}
      <DashboardHeader btcPrice={btcPrice} />

      <main className="px-6 lg:px-20 py-12 space-y-16 max-w-7xl mx-auto">
        {/* Top Summary Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BtcPrice price={btcPrice} />
          <AccountSummary user={user} stats={stats} autoOpenNode={autoOpenNode} />
        </section>

        {/* Global Statistics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Balance" 
            value={`€${(stats.mainBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          />
          <StatCard 
            title="Total Profit" 
            value={`€${(stats.profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          />
          <StatCard 
            title="Active Nodes" 
            value={stats.activeNodes || 0} 
          />
          <StatCard 
            title="Daily ROI" 
            value={`€${(stats.dailyROI || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
          />
        </section>

        {/* Secondary Modules */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          <WalletDashboard user={user} stats={stats} />
          <RecentActivity transactions={transactions} />
        </section>
      </main>
    </div>
  );
}
