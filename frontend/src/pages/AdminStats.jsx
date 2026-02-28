// src/pages/AdminStats.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { 
  Users, Landmark, Activity, AlertCircle, 
  RefreshCw, ShieldCheck, ArrowUpRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load global ledger data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-yellow-500" size={32} />
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Synchronizing Analytics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Investors', val: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/5' },
    { label: 'Platform Liquidity', val: `€${(stats.totalLiquidity || 0).toLocaleString()}`, icon: Landmark, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
    { label: 'Active Trade Nodes', val: stats.activePlans, icon: Activity, color: 'text-yellow-500', bg: 'bg-yellow-500/5' },
    { label: 'Pending Payouts', val: stats.pendingWithdrawals, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/5' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="text-yellow-500" size={24} />
              <h1 className="text-4xl font-black italic uppercase tracking-tighter">System Pulse</h1>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em]">Node Protocol v8.4.1 Audit Dashboard</p>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={fetchStats} 
               className="p-4 bg-[#0a0c10] border border-white/5 rounded-2xl hover:bg-white/5 transition-all active:scale-95 shadow-xl"
             >
               <RefreshCw size={20} className="text-gray-400" />
             </button>
          </div>
        </header>

        {/* Metric Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, i) => (
            <div key={i} className="bg-[#0a0c10] border border-white/5 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:border-yellow-500/20 transition-all">
              <div className={`absolute -right-4 -bottom-4 h-28 w-28 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 ${s.color}`}>
                <s.icon size={112} />
              </div>
              
              <div className={`w-12 h-12 ${s.bg} rounded-2xl flex items-center justify-center mb-6 border border-white/5`}>
                 <s.icon className={s.color} size={20} />
              </div>

              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
              <h2 className="text-3xl font-black italic tracking-tighter text-white">
                {s.val}
              </h2>
            </div>
          ))}
        </div>

        {/* Strategic Alerts & Shortcuts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payout Alert */}
          {stats.pendingWithdrawals > 0 ? (
            <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-10 flex flex-col justify-between items-start gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4 text-red-500">
                  <AlertCircle size={24} />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.3em]">Critical Action Required</h4>
                </div>
                <p className="text-red-200/40 text-[10px] font-bold uppercase leading-relaxed tracking-widest max-w-md">
                  There are currently <b>{stats.pendingWithdrawals}</b> withdrawal requests pending authorization. 
                  Protocol v8.4.1 requires manual review of these hashes within 24 hours.
                </p>
              </div>
              <button 
                onClick={() => navigate('/admin/withdrawals')}
                className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-red-500 transition-all shadow-lg shadow-red-500/10 flex items-center gap-3"
              >
                Open Payout Queue <ArrowUpRight size={14} />
              </button>
            </div>
          ) : (
             <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-10 flex items-center gap-6">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                   <ShieldCheck size={24} />
                </div>
                <p className="text-emerald-200/40 text-[10px] font-black uppercase tracking-[0.3em]">
                   All liquidity extraction requests have been settled.
                </p>
             </div>
          )}

          {/* Operational Status */}
          <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Node Status</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Operational
                </span>
             </div>
             <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-yellow-500 w-[94%] shadow-[0_0_15px_rgba(234,179,8,0.3)]" />
             </div>
             <p className="text-[9px] text-gray-600 font-bold uppercase mt-4 tracking-widest">
               Platform Health: 99.9% Uptime (Rio Node Cluster B)
             </p>
          </div>
        </div>

        {/* Footer Ledger Identity */}
        <div className="text-center py-10 opacity-20">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.8em]">
            Trustra Capital International • Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
