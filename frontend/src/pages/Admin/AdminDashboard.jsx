import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Wallet, ArrowUpRight, ArrowDownRight, 
  BarChart3, ShieldCheck, Clock, RefreshCw 
} from 'lucide-react';
import api from '../../api/api';
import SystemHealth from './SystemHealth'; // The manual ROI trigger we built
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
    activeNodes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      toast.error("Failed to sync system metrics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 lg:p-12 pt-28">
      {/* ── HEADER & SYNC ── */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-4 text-yellow-500">
            <ShieldCheck size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Command Center v8.6</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">System Oversight</h1>
        </div>
        
        <button 
          onClick={fetchDashboardData}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Nodes
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ── ROI PROTOCOL OVERRIDE (SystemHealth) ── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <SystemHealth />
        </motion.div>

        {/* ── CORE METRICS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Verified Investors" 
            value={stats.totalUsers} 
            icon={Users} 
            color="text-blue-400" 
          />
          <StatCard 
            label="System Liquidity" 
            value={`€${stats.totalDeposits?.toLocaleString()}`} 
            icon={Wallet} 
            color="text-emerald-400" 
          />
          <StatCard 
            label="Pending Extraction" 
            value={stats.pendingWithdrawals} 
            icon={ArrowUpRight} 
            color="text-red-400" 
          />
          <StatCard 
            label="Active Rio Nodes" 
            value={stats.activeNodes} 
            icon={BarChart3} 
            color="text-yellow-500" 
          />
        </div>

        {/* ── SECONDARY INTEL ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity Ledger */}
          <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 rounded-[3rem] p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic uppercase">Activity Ledger</h3>
              <Clock size={18} className="opacity-20" />
            </div>
            
            <div className="space-y-6">
              {/* This would ideally map through recent transactions */}
              <ActivityRow 
                user="Alysia_Admin" 
                action="Manual ROI Injection" 
                time="Just Now" 
                status="COMPLETED"
              />
              <ActivityRow 
                user="Investor_09" 
                action="Node Activation: Rio Elite" 
                time="2h ago" 
                status="SUCCESS"
              />
              <ActivityRow 
                user="Capital_Flux" 
                action="Withdrawal Request" 
                time="5h ago" 
                status="PENDING"
              />
            </div>
          </div>

          {/* System Integrity Info */}
          <div className="bg-gradient-to-br from-yellow-500/5 to-transparent border border-white/5 rounded-[3rem] p-10 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-black italic uppercase mb-4">Integrity Status</h3>
              <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest leading-relaxed">
                All nodes are currently synchronized with the Zurich liquidity pool. 
                AES-256 encryption is active on all outgoing extraction hashes.
              </p>
            </div>
            
            <div className="mt-10 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="opacity-30">Database Latency</span>
                <span className="text-emerald-500">14ms</span>
              </div>
              <div className="h-[2px] bg-white/5 w-full rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[95%]" />
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
    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2.5rem] hover:border-white/20 transition-all">
      <Icon className={`${color} mb-4`} size={24} />
      <p className="text-[9px] font-black uppercase opacity-30 tracking-widest mb-1">{label}</p>
      <h2 className="text-3xl font-black italic">{value}</h2>
    </div>
  );
}

function ActivityRow({ user, action, time, status }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-white/5 rounded-full flex items-center justify-center text-[10px] font-black">
          {user[0]}
        </div>
        <div>
          <p className="text-xs font-black uppercase italic">{user}</p>
          <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{action}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black uppercase tracking-widest mb-1">{status}</p>
        <p className="text-[8px] opacity-20 uppercase font-bold">{time}</p>
      </div>
    </div>
  );
}
