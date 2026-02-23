import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { Users, Wallet, Zap, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminLive } from '../../context/AdminLiveContext'; // 🔌 Live Socket Data
import ActivityFeed from '../../components/admin/ActivityFeed'; // ₿ Live BTC Feed

export default function AdminDashboard() {
  const { adminStats, events, fetchAdminStats } = useAdminLive();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      await fetchAdminStats();
      setLoading(false);
    };
    sync();
  }, [fetchAdminStats]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#05070a] text-indigo-500 font-black tracking-widest uppercase text-xs animate-pulse">
      Syncing Trustra Node...
    </div>
  );

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white space-y-10 font-sans">
      <header className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">Global Operations</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin <span className="text-slate-800">/</span> Control</h1>
        </div>
        <div className="text-right text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          Node Status: <span className="text-green-500">Live Sync</span>
        </div>
      </header>

      {/* 📊 Metrics Grid - Updated with Live Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard title="Total BTC Deposited" value={`${adminStats.totalDepositedBtc?.toFixed(4)} BTC`} icon={<Wallet className="text-blue-500" />} />
        <AdminStatCard title="Active Schemas" value={adminStats.activeUsers || 0} icon={<Zap className="text-amber-500" />} />
        <AdminStatCard title="Pending Payouts" value={adminStats.pendingWithdrawals || 0} icon={<Activity className="text-purple-500" />} />
        <AdminStatCard title="Security Check" value="Healthy" icon={<ShieldCheck className="text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* ₿ Live Activity Feed (Left Column) */}
        <div className="lg:col-span-1">
          <ActivityFeed />
        </div>

        {/* 🛠️ Withdrawal & User Management (Right Column) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Action: Pending Withdrawals */}
          <section className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-10 flex justify-between items-center group hover:border-red-500/20 transition-all shadow-2xl">
            <div>
              <h3 className="text-xl font-black italic uppercase text-white/90">Withdrawal Queue</h3>
              <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-widest">
                {adminStats.pendingWithdrawals} Requests Awaiting Audit
              </p>
            </div>
            <button className="bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition shadow-xl shadow-red-900/20 flex items-center">
              Process Queue <ArrowUpRight className="ml-2" size={16} />
            </button>
          </section>

          {/* User List Placeholder */}
          <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-lg font-black italic uppercase mb-6">Investor Registry</h3>
            <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-gray-600 uppercase text-[10px] font-black tracking-[0.2em]">
              Connect /api/admin/users to populate registry
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon, highlight = false }) {
  return (
    <div className={`bg-[#0f1218] border ${highlight ? 'border-emerald-500/30' : 'border-white/5'} p-8 rounded-[2rem] space-y-4 hover:bg-[#151921] transition-colors`}>
      <div className="p-3 bg-white/5 rounded-xl w-fit shadow-inner">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-black italic mt-1 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

