import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  TrendingUp, Wallet, Users, Activity, 
  BarChart3, PieChart, PieChart as PieIcon, 
  ArrowUpRight, ArrowDownRight, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGlobalStats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/stats');
      setData(data.stats);
    } catch (err) {
      toast.error("Telemetry Offline: Failed to fetch platform metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020408]">
      <Loader2 className="animate-spin text-rose-500 mb-4" size={48} />
      <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Calculating Global Liquidity...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Platform <span className="text-rose-500">Intelligence</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-600 tracking-[0.4em] mt-2">
            Real-Time Asset Under Management (AUM) & Node Metrics
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black text-gray-500 uppercase">Last Synchronized</p>
          <p className="text-[11px] font-mono text-white">{new Date(data.timestamp).toLocaleString()}</p>
        </div>
      </div>

      {/* CORE METRIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Total Investors" 
          value={data.totalUsers} 
          subValue={`${data.activeUsers} Active Nodes`}
          icon={Users} 
          color="text-blue-500" 
        />
        <MetricCard 
          label="Identity Backlog" 
          value={data.pendingKyc} 
          subValue="Awaiting Verification"
          icon={Activity} 
          color="text-yellow-500" 
        />
        <MetricCard 
          label="Capital Egress" 
          value={data.pendingWithdrawals} 
          subValue="Pending Requests"
          icon={ArrowUpRight} 
          color="text-rose-500" 
        />
        <MetricCard 
          label="Platform Status" 
          value="STABLE" 
          subValue="All Gateways Online"
          icon={TrendingUp} 
          color="text-emerald-500" 
        />
      </div>

      {/* LIQUIDITY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0a0f1e] border border-white/5 rounded-[3rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <Wallet className="text-rose-500" size={24} />
              </div>
              <h3 className="text-xl font-black uppercase italic italic tracking-tighter">Liquidity Pools</h3>
            </div>
            <BarChart3 className="text-gray-800" size={32} />
          </div>

          <div className="space-y-6">
            {data.totalLiquidity.map((pool) => (
              <LiquidityRow key={pool._id} label={pool._id} value={pool.total} />
            ))}
          </div>
        </div>

        {/* SYSTEM HEALTH / SIDEBAR */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-rose-600 to-rose-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-rose-900/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Operational Integrity</p>
            <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Security Clearance</h4>
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-bold border-b border-white/10 pb-2">
                <span className="opacity-60 uppercase">Auth Protocol</span>
                <span>JWT-AES256</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold border-b border-white/10 pb-2">
                <span className="opacity-60 uppercase">DB Clusters</span>
                <span className="text-emerald-300 uppercase">Synchronized</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="opacity-60 uppercase">Withdrawal Lock</span>
                <span>ENABLED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* HELPER COMPONENTS */

const MetricCard = ({ label, value, subValue, icon: Icon, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-[#0a0f1e] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group transition-all"
  >
    <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity ${color}`}>
      <Icon size={120} />
    </div>
    <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] mb-1">{label}</p>
    <h2 className={`text-4xl font-black italic tracking-tighter mb-2 ${color}`}>{value}</h2>
    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{subValue}</p>
  </motion.div>
);

const LiquidityRow = ({ label, value }) => {
  // Simple logic to set percentage bar (usually based on a goal or max)
  const percentage = Math.min((value / 100000) * 100, 100); 

  return (
    <div className="group">
      <div className="flex justify-between items-end mb-2">
        <p className="text-xs font-black uppercase text-white group-hover:text-rose-500 transition-colors">{label}</p>
        <p className="text-sm font-mono font-black text-white">€{value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}</p>
      </div>
      <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-rose-600 to-rose-400"
        />
      </div>
    </div>
  );
};
