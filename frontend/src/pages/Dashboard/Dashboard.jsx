import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// Components
import DashboardHeader from "../../components/DashboardHeader";
import AccountSummary from "../../components/AccountSummary";
import WalletDashboard from "../../components/WalletDashboard";
import RecentActivity from "../../components/RecentActivity";
import StatCard from "../../components/StatCard";
import BtcPrice from "../../components/BtcPrice";

import api from "../../api/api";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [btcPrice, setBtcPrice] = useState(null);
  const [stats, setStats] = useState({ balance: 0, profit: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoOpenNode, setAutoOpenNode] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!user) navigate("/login");

    if (location.state?.autoOpenNode) {
      setAutoOpenNode(location.state.autoOpenNode);
    }
  }, [user, navigate, location.state]);

  // Fetch BTC price (EUR)
  const fetchBTCPrice = async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=eur"
      );
      setBtcPrice(res.data.bitcoin.eur);
    } catch (err) {
      console.error("BTC Sync Error:", err);
    }
  };

  // Fetch dashboard stats & transactions
  const fetchDashboard = async () => {
    try {
      const statsRes = await api.get("/user/dashboard-stats");
      setStats(statsRes.data || { balance: 0, profit: 0 });

      const txRes = await api.get("/transactions");
      setTransactions(txRes.data || []);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBTCPrice();
    fetchDashboard();
    const interval = setInterval(() => {
      fetchBTCPrice();
      fetchDashboard();
    }, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-[#05070a] min-h-screen">
        <p className="text-white font-black text-center text-xl">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-300 selection:bg-blue-500/30">
      {/* Header with BTC price & User Info */}
      <DashboardHeader user={user} btcPrice={btcPrice} />

      {/* Main Content */}
      <main className="px-6 lg:px-20 py-12 space-y-16 max-w-7xl mx-auto">
        {/* BTC & Account Summary */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BtcPrice price={btcPrice} />
          <AccountSummary user={user} stats={stats} autoOpenNode={autoOpenNode} />
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Balance" value={`€${stats.balance.toLocaleString()}`} />
          <StatCard title="Total Profit" value={`€${stats.profit.toLocaleString()}`} />
          <StatCard title="Active Nodes" value={user?.activeNodes || 0} />
          <StatCard title="Daily ROI" value={`€${stats.dailyROI?.toLocaleString() || 0}`} />
        </section>

        {/* Wallets & Recent Activity */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WalletDashboard user={user} />
          <RecentActivity transactions={transactions} />
        </section>
      </main>
    </div>
  );
}
