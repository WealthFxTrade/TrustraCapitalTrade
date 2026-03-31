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
    totalAUM: 0,
    verifiedNodes: 0,
    pendingOutbound: 0,
    dailyYieldAvg: 1.5,
    systemHealth: 'Optimal'
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLiveStats = async () => {
    setRefreshing(true);
    try {
      const { data } = await api.get('/admin/stats');
      
      if (data?.success) {
        setStats({
          totalAUM: data.data?.totalAUM || 0,
          verifiedNodes: data.data?.totalUsers || 0,
          pendingOutbound: data.data?.pendingWithdrawals || 0,
          dailyYieldAvg: data.data?.yieldRate || 1.5,
          systemHealth: data.data?.health || 'Optimal'
        });
      }
    } catch (err) {
      console.error('[ADMIN SYNC ERROR]', err);
      toast.error('Failed to synchronize with Mainframe', {
        style: { background: '#0a0c10', color: '#ef4444' }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
    const interval = setInterval(fetchLiveStats, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const statConfig = [
    {
      label: 'Total AUM',
      value: `€${Number(stats.totalAUM).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: 'text-emerald-500'
    },
    {
      label: 'Verified Nodes',
      value: stats.verifiedNodes.toString(),
      icon: Users,
      color: 'text-blue-500'
    },
    {
      label: 'Pending Outbound',
      value: `€${Number(stats.pendingOutbound).toLocaleString('de-DE', { minimumFractionDigits: 2 })}`,
      icon: ArrowUpRight,
      color: 'text-rose-500'
    },
    {
      label: 'Daily Yield Avg',
      value: `${stats.dailyYieldAvg}%`,
      icon: Activity,
      color: 'text-amber-500'
    },
  ];

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-emerald-500">
          Decrypting Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 p-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Command <span className="text-emerald-500">Center</span>
          </h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-3">
            Platform-Wide Analytics • Zurich Mainframe
          </p>
        </div>

        <button
          onClick={fetchLiveStats}
          disabled={refreshing}
          className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all group active:scale-95"
        >
          <RefreshCcw 
            size={14} 
            className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} 
          />
          {refreshing ? 'Syncing...' : 'Refresh Ledger'}
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statConfig.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl group hover:border-emerald-500/20 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <ShieldCheck size={14} className="text-emerald-500/20 group-hover:text-emerald-500 transition-all" />
            </div>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1">
              {stat.label}
            </p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">
              {stat.value}
            </h4>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-500">
              <Zap size={20} fill="currentColor" className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Protocol Status: {stats.systemHealth}
              </span>
            </div>
            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">
              System Performance Optimal
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md">
              The automated Yield Engine is currently distributing ROI at the target rate of {stats.dailyYieldAvg}% daily.
              The Bitcoin node is synchronized with Block 835,214.
            </p>
          </div>

          <div className="relative">
            <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={24} />
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-rose-500/5 border border-rose-500/10 rounded-[3rem] p-10 flex flex-col justify-between group">
          <div className="space-y-4">
            <AlertCircle className="text-rose-500" size={28} />
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">Pending Approvals</h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
              There are {stats.pendingOutbound > 0 ? 'active' : 'no'} withdrawal requests awaiting cryptographic signature.
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/admin/withdrawals'}
            className="mt-6 w-full py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
          >
            Review Outbound Queue
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
