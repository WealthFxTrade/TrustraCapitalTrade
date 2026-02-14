import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import MarketIntel from '../../components/Admin/MarketIntel'; // The component we just built
import { 
  Users, 
  Activity, 
  Wallet, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      // Hits the faceted aggregation endpoint we wrote in the adminController
      const res = await api.get('/admin/stats');
      setData(res.data.stats);
    } catch (err) {
      toast.error("Failed to synchronize with Central Node");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Decrypting Ledger...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ─── HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Control <span className="text-indigo-500">Center</span></h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Node Status: Optimal</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          <Clock size={14} className="text-indigo-500" />
          <span className="text-[10px] font-mono font-bold text-gray-400">{new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* ─── MARKET INTELLIGENCE LAYER ─── */}
      <MarketIntel totalBtc={data.totalBTC} totalEth={0} />

      {/* ─── CORE METRICS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Investors" value={data.totalUsers} icon={<Users size={20}/>} color="indigo" />
        <StatCard title="Active Plans" value={data.activePlans} icon={<TrendingUp size={20}/>} color="emerald" />
        <StatCard title="Platform Liabilities" value={`€${data.totalLiquidity?.toLocaleString()}`} icon={<Wallet size={20}/>} color="blue" />
        <StatCard title="Profit Payouts" value={`€${data.totalProfit?.toLocaleString()}`} icon={<ArrowUpRight size={20}/>} color="amber" />
      </div>

      {/* ─── SYSTEM ALERTS & ACTIONS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Urgent Review */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f121d] border border-white/5 rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-500" /> Administrative Queue
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QueueItem 
                label="KYC Verifications" 
                count={data.pendingKyc} 
                link="/admin/users" 
                urgent={data.pendingKyc > 0} 
              />
              <QueueItem 
                label="Pending Withdrawals" 
                count={data.pendingWithdrawals} 
                link="/admin/withdrawals" 
                urgent={data.pendingWithdrawals > 0} 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Security Status */}
        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-6 flex items-center gap-2">
              <Activity size={16} /> Audit Stream
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-[2px] bg-indigo-500/20" />
                <p className="text-[11px] text-gray-500 leading-relaxed italic">
                  "All administrative actions are currently being logged via the Rio Immutable Ledger. Check Audit Trail for specific node changes."
                </p>
              </div>
            </div>
          </div>
          <button className="mt-8 w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
            Export Global Report
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SUB-COMPONENTS ─── */

function StatCard({ title, value, icon, color }) {
  const colors = {
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20"
  };

  return (
    <div className="bg-[#0f121d] border border-white/5 p-6 rounded-[2rem] hover:border-white/10 transition-all group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</p>
      <h2 className="text-2xl font-black mt-1 tracking-tight">{value}</h2>
    </div>
  );
}

function QueueItem({ label, count, link, urgent }) {
  return (
    <div className={`p-6 rounded-[2rem] border transition-all ${urgent ? 'bg-rose-500/5 border-rose-500/20' : 'bg-white/5 border-white/5'}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
          <h4 className={`text-3xl font-black mt-2 ${urgent ? 'text-rose-500' : 'text-white'}`}>{count}</h4>
        </div>
        {urgent && <AlertTriangle size={18} className="text-rose-500 animate-bounce" />}
      </div>
    </div>
  );
}
