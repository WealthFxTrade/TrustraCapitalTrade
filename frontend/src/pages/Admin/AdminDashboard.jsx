import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Wallet, ArrowUpRight, 
  BarChart3, ShieldCheck, Clock, RefreshCw, Zap
} from 'lucide-react';
import api from '../../api/api';
import SystemHealth from './SystemHealth'; 
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeNodes: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      // Ensure we handle nested data if your backend sends { data: { ... } }
      setStats(res.data.data || res.data);
    } catch (err) {
      toast.error("Failed to sync system metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28">
      {/* ── HEADER ── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4 text-yellow-500">
            <ShieldCheck size={20} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Command Center v8.6</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            System <span className="text-yellow-500">Oversight</span>
          </h1>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-yellow-500 transition-all group"
        >
          <RefreshCw size={14} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          {loading ? "Syncing Nodes..." : "Refresh Network"}
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ── CORE METRICS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Verified Investors"
            value={stats.totalUsers || 0}
            icon={Users}
            color="text-blue-400"
          />
          <StatCard
            label="System Liquidity"
            value={`€${(stats.totalDeposits || 0).toLocaleString()}`}
            icon={Wallet}
            color="text-emerald-400"
          />
          <StatCard
            label="Pending Extraction"
            value={stats.pendingWithdrawals || 0}
            icon={ArrowUpRight}
            color="text-red-400"
          />
          <StatCard
            label="Active Rio Nodes"
            value={stats.activeNodes || 0}
            icon={BarChart3}
            color="text-yellow-500"
          />
        </div>

        {/* ── INFRASTRUCTURE CONTROL ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SystemHealth />
        </motion.div>

        {/* ── ACTIVITY & INTEGRITY ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Activity Ledger</h3>
              <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Stream
              </div>
            </div>
            <div className="space-y-2">
              <ActivityRow user="Admin_Root" action="ROI Protocol Triggered" time="Just Now" status="COMPLETED" />
              <ActivityRow user="User_492" action="Deposit: €25,000" time="14m ago" status="SUCCESS" />
              <ActivityRow user="User_108" action="Withdrawal: €4,200" time="1h ago" status="PENDING" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between">
            <div>
              <Zap className="text-yellow-500 mb-6" size={32} fill="currentColor" />
              <h3 className="text-xl font-black italic uppercase mb-4 tracking-tighter">Network Integrity</h3>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
                All nodes are synchronized with the Zurich liquidity pool. AES-256 encryption active.
              </p>
            </div>
            <div className="mt-10 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                <span className="opacity-40">System Latency</span>
                <span className="text-emerald-500">12ms</span>
              </div>
              <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[98%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-white/20 transition-all group relative overflow-hidden">
      <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
        <Icon size={120} />
      </div>
      <Icon className={`${color} mb-4 relative z-10`} size={24} />
      <p className="text-[9px] font-black uppercase opacity-30 tracking-[0.2em] mb-1 relative z-10">{label}</p>
      <h2 className="text-3xl font-black italic relative z-10">{value}</h2>
    </div>
  );
}

function ActivityRow({ user, action, time, status }) {
  const isPending = status === 'PENDING';
  return (
    <div className="flex items-center justify-between py-5 border-b border-white/5 last:border-0 hover:bg-white/[0.01] px-2 rounded-xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-black border border-white/10 uppercase italic">
          {user.charAt(0)}
        </div>
        <div>
          <p className="text-xs font-black uppercase italic tracking-tight">{user}</p>
          <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{action}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isPending ? 'text-yellow-500' : 'text-emerald-500'}`}>
          {status}
        </p>
        <p className="text-[8px] opacity-20 uppercase font-bold">{time}</p>
      </div>
    </div>
  );
}
