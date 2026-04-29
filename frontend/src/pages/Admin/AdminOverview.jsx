// src/pages/Admin/AdminOverview.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Users, ArrowUpRight, Activity,
  Zap, Loader2, AlertCircle, RefreshCcw, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../../constants/api'; // ✅ IMPORT ENDPOINTS
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
      // ✅ USE CENTRALIZED CONSTANT
      const { data } = await api.get(API_ENDPOINTS.ADMIN.OVERVIEW);

      if (data?.success) {
        setStats(data);
      }
    } catch (err) {
      console.error('[ADMIN SYNC ERROR]', err);
      toast.error('System synchronization failed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    // Auto-sync every 5 minutes to keep metrics fresh
    const interval = setInterval(fetchLiveStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statConfig = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
    { label: 'Active Nodes', value: stats.activeInvestors, icon: Activity, color: 'text-emerald-500' },
    { label: 'Total Volume', value: `€${Number(stats.totalInvested || 0).toLocaleString('de-DE')}`, icon: TrendingUp, color: 'text-emerald-500' },
    { label: 'Total Payouts', value: `€${Number(stats.totalProfit || 0).toLocaleString('de-DE')}`, icon: ArrowUpRight, color: 'text-amber-500' },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest">Initialising Admin Vault...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-6 lg:p-10">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white uppercase italic">Command Center</h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-2">Institutional System Oversight</p>
        </div>
        <button
          onClick={fetchLiveStats}
          disabled={refreshing}
          className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group"
        >
          <RefreshCcw className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">{refreshing ? 'Syncing...' : 'Sync Node'}</span>
        </button>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((stat, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/5 border border-white/10 p-8 rounded-[2rem] group hover:border-white/20 transition-all"
          >
            <stat.icon className={`${stat.color} mb-4 group-hover:scale-110 transition-transform`} size={24} />
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-black italic">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* RIO ENGINE STATUS */}
        <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-emerald-400 mb-6 font-black uppercase tracking-widest text-[10px]">
              <Zap size={18} fill="currentColor" className="animate-pulse" /> RIO Engine Status
            </div>
            <p className="text-5xl font-black mb-4 italic tracking-tighter">ONLINE</p>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
              LAST SETTLEMENT: {stats.lastSettlement ? new Date(stats.lastSettlement).toLocaleString() : 'PENDING SYNC'}
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/5 blur-[80px] group-hover:bg-emerald-500/10 transition-all"></div>
        </div>

        {/* PAYOUT QUEUE ALERT */}
        <div className={`p-10 rounded-[3rem] border transition-all ${stats.pendingWithdrawals > 0 ? 'bg-rose-500/5 border-rose-500/20 shadow-2xl shadow-rose-500/5' : 'bg-white/5 border-white/5'}`}>
          <div className="flex items-center gap-3 text-rose-500 mb-6 font-black uppercase tracking-widest text-[10px]">
            <AlertCircle size={18} /> Action Required
          </div>
          <p className="text-5xl font-black mb-4 italic tracking-tighter">{stats.pendingWithdrawals || 0}</p>
          <p className="text-[10px] text-gray-500 font-mono mb-8 uppercase tracking-widest">Pending Withdrawals</p>

          <Link
            to="/admin/withdrawals"
            className="flex items-center justify-between w-full p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all group"
          >
            <span className="font-black uppercase tracking-widest text-[10px]">Access Payout Queue</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

