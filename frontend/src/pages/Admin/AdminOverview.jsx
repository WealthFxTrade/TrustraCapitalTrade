// src/pages/Admin/AdminOverview.jsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../constants/api';
import toast from 'react-hot-toast';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeInvestors: 0,
    totalInvested: 0,
    totalProfit: 0,
    pendingWithdrawals: 0,
    lastSettlement: null
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveStats = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/api/admin/overview');

      if (data?.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('[ADMIN SYNC ERROR]', err);
      toast.error('Failed to sync admin data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statConfig = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Active Investors',
      value: stats.activeInvestors,
      icon: Activity,
      color: 'text-emerald-500'
    },
    {
      label: 'Total Invested',
      value: `€${Number(stats.totalInvested).toLocaleString('de-DE')}`,
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    {
      label: 'Total Profit Paid',
      value: `€${Number(stats.totalProfit).toLocaleString('de-DE')}`,
      icon: ArrowUpRight,
      color: 'text-amber-500'
    },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8">

      {/* HEADER */}
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-black">
          Admin Control Center
        </h2>

        <button
          onClick={fetchLiveStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2 bg-white/5 rounded-xl hover:bg-emerald-500 hover:text-black"
        >
          <RefreshCcw className={refreshing ? 'animate-spin' : ''} size={16} />
          Refresh
        </button>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statConfig.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0c10] border border-white/10 p-6 rounded-2xl"
          >
            <stat.icon className={`${stat.color} mb-3`} />
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* SYSTEM STATUS */}
      <div className="grid md:grid-cols-2 gap-6">

        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <Zap size={16} />
            RIO Engine Status
          </div>
          <p className="text-lg font-bold">ACTIVE</p>
          <p className="text-xs text-gray-500 mt-2">
            Last Settlement: {stats.lastSettlement
              ? new Date(stats.lastSettlement).toLocaleString()
              : 'N/A'}
          </p>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <AlertCircle size={16} />
            Pending Withdrawals
          </div>
          <p className="text-lg font-bold">
            {stats.pendingWithdrawals || 0}
          </p>

          <button
            onClick={() => window.location.href = '/admin/withdrawals'}
            className="mt-4 w-full py-2 bg-rose-500/20 rounded-xl text-xs"
          >
            Review Queue
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminOverview;
