import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Users, Landmark, Activity, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data.stats);
    } catch (err) {
      toast.error("Failed to load global ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><RefreshCw className="animate-spin text-indigo-500" /></div>;

  const statCards = [
    { label: 'Total Investors', val: stats.totalUsers, icon: Users, color: 'text-blue-400' },
    { label: 'Platform Liquidity', val: `$${stats.totalLiquidity.toLocaleString()}`, icon: Landmark, color: 'text-emerald-400' },
    { label: 'Active Trade Nodes', val: stats.activePlans, icon: Activity, color: 'text-indigo-400' },
    { label: 'Pending Payouts', val: stats.pendingWithdrawals, icon: AlertCircle, color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">System Pulse</h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">2026 Global Metrics</p>
          </div>
          <button onClick={fetchStats} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition">
            <RefreshCw size={20} />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
              <s.icon className={`absolute -right-4 -bottom-4 h-24 w-24 opacity-5 group-hover:scale-110 transition-transform ${s.color}`} />
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{s.label}</p>
              <h2 className={`text-3xl font-bold ${s.color}`}>{s.val}</h2>
            </div>
          ))}
        </div>
        
        {/* Quick Action: Redirect to Payouts */}
        {stats.pendingWithdrawals > 0 && (
          <div className="mt-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-between">
            <p className="text-amber-200 text-sm">There are <b>{stats.pendingWithdrawals}</b> withdrawals awaiting your authorization.</p>
            <button className="bg-amber-500 text-slate-950 px-6 py-2 rounded-xl font-bold text-xs uppercase">Review Queue</button>
          </div>
        )}
      </div>
    </div>
  );
}

