import React, { useState, useEffect } from 'react';
import { Users, Wallet, Zap, ShieldCheck, ArrowUpRight, Activity, Landmark, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminLive } from '../../context/AdminLiveContext'; 
import ActivityFeed from '../../components/admin/ActivityFeed'; 

export default function AdminDashboard() {
  const { adminStats, fetchAdminStats } = useAdminLive();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sync = async () => {
      try {
        await fetchAdminStats();
      } catch (err) {
        toast.error("System Handshake Failed");
      } finally {
        setLoading(false);
      }
    };
    sync();
  }, [fetchAdminStats]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#020408] text-yellow-500 font-black tracking-[0.5em] uppercase text-[10px] animate-pulse italic">
      Synchronizing Master Node...
    </div>
  );

  return (
    <div className="p-8 lg:p-12 bg-[#020408] min-h-screen text-white space-y-12 font-sans selection:bg-rose-500/30">
      
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-500 mb-1">
            <ShieldAlert size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">System Level: Superuser</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            Master <span className="text-gray-800">/</span> <span className="text-rose-600">Control</span>
          </h1>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">Live Ledger Sync Active</span>
          </div>
          <p className="text-[8px] font-black text-gray-700 uppercase tracking-[0.3em]">Last Global Audit: {new Date().toLocaleTimeString()}</p>
        </div>
      </header>

      {/* 2. High-Priority Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard 
          title="Global BTC Liquidity" 
          value={`${adminStats.totalDepositedBtc?.toFixed(4) || '0.0000'} BTC`} 
          icon={<Landmark className="text-yellow-500" />} 
          subtext="Total Asset Volume"
        />
        <AdminStatCard 
          title="Active Nodes" 
          value={adminStats.activeUsers || 0} 
          icon={<Zap className="text-blue-500" />} 
          subtext="Concurrent Sessions"
        />
        <AdminStatCard 
          title="Extraction Requests" 
          value={adminStats.pendingWithdrawals || 0} 
          icon={<Activity className="text-rose-500" />} 
          subtext="Awaiting Manual Audit"
          highlight={adminStats.pendingWithdrawals > 0}
        />
        <AdminStatCard 
          title="System Integrity" 
          value="Healthy" 
          icon={<ShieldCheck className="text-emerald-500" />} 
          subtext="Protocol v8.4.3"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 3. Live Transaction Pulse (Left) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 italic">Live Pulse</h3>
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping" />
          </div>
          <ActivityFeed />
        </div>

        {/* 4. Action Center & Registry (Right) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Action: Withdrawal Management */}
          <section className="bg-[#0a0c10] border border-white/5 rounded-[3rem] p-10 flex flex-col md:flex-row justify-between items-center group hover:border-rose-500/20 transition-all shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <ArrowUpRight size={160} />
            </div>
            
            <div className="relative z-10 text-center md:text-left mb-6 md:mb-0">
              <h3 className="text-2xl font-black italic uppercase text-white/90 tracking-tighter">Extraction Queue</h3>
              <p className="text-rose-500/60 text-[10px] font-black mt-2 uppercase tracking-[0.2em] italic">
                {adminStats.pendingWithdrawals} Pending Handshakes Detected
              </p>
            </div>
            
            <button className="relative z-10 bg-rose-600 hover:bg-rose-500 text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition shadow-xl shadow-rose-900/20 flex items-center group/btn active:scale-95">
              Review Transactions <ArrowUpRight className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} />
            </button>
          </section>

          {/* Investor Registry */}
          <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden">
            <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <h3 className="text-xs font-black italic uppercase tracking-[0.3em] text-gray-400">Node Registry</h3>
              <button className="text-[9px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">View All Users</button>
            </div>
            
            <div className="p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-white/10">
                <Users size={24} className="text-gray-700" />
              </div>
              <p className="text-[10px] text-gray-700 font-black uppercase tracking-[0.4em] italic leading-loose">
                System awaiting /api/admin/users connection...<br/>
                Registry currently in standby mode.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, icon, subtext, highlight = false }) {
  return (
    <div className={`bg-[#0a0c10] border ${highlight ? 'border-rose-500/30 bg-rose-500/[0.02]' : 'border-white/5'} p-8 rounded-[2.5rem] space-y-4 hover:border-white/10 transition-all group`}>
      <div className="p-4 bg-white/5 rounded-2xl w-fit shadow-inner group-hover:bg-white/10 transition-colors">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1 italic">{title}</p>
        <p className="text-3xl font-black italic tracking-tighter text-white">{value}</p>
        <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-2">{subtext}</p>
      </div>
    </div>
  );
}
