import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Users, Wallet, Zap, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.stats);
      } catch (err) {
        toast.error("Failed to sync platform metrics");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-10 text-gray-500">Syncing Trustra Node...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">Global Operations</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin <span className="text-slate-800">/</span> Control</h1>
        </div>
        <div className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Last Sync: {new Date(stats.timestamp).toLocaleTimeString()}
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total Liquidity" value={`€${stats.totalLiquidity.toLocaleString()}`} icon={<Wallet className="text-blue-500" />} />
        <AdminStatCard title="Active Schemas" value={stats.activePlans} icon={<Zap className="text-amber-500" />} />
        <AdminStatCard title="Total Investors" value={stats.totalUsers} icon={<Users className="text-purple-500" />} />
        <AdminStatCard title="Pending KYC" value={stats.pendingKyc} icon={<ShieldCheck className="text-emerald-500" />} highlight={stats.pendingKyc > 0} />
      </div>

      {/* Quick Action: Pending Withdrawals */}
      <section className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-10 flex justify-between items-center group hover:border-red-500/20 transition-all">
        <div>
          <h3 className="text-xl font-black italic uppercase">Withdrawal Queue</h3>
          <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-widest">{stats.pendingWithdrawals} Requests Awaiting Audit</p>
        </div>
        <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition shadow-xl shadow-red-900/20">
          Process Queue <ArrowUpRight className="inline ml-2" size={16} />
        </button>
      </section>
    </div>
  );
}

function AdminStatCard({ title, value, icon, highlight = false }) {
  return (
    <div className={`bg-[#0f1218] border ${highlight ? 'border-emerald-500/30' : 'border-white/5'} p-8 rounded-[2rem] space-y-4`}>
      <div className="p-3 bg-white/5 rounded-xl w-fit">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black italic mt-1 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

