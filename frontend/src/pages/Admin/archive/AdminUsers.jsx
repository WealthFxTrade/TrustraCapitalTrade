import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import AdminTable from '../../components/admin/AdminTable';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Activity, 
  Wallet, 
  Users,
  ArrowUpRight,
  Globe,
  Loader2
} from 'lucide-react';
import api from '../../api/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLiquidity: 0,
    activeNodes: 0,
    pendingRedemptions: 0,
    dailyYield: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // --- DATA AGGREGATION ---
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/health');
        if (data.success) {
          // Mapping platform-wide analytics
          setStats({
            totalLiquidity: data.totalLiquidity || 0,
            activeNodes: data.activeUsers || 0,
            pendingRedemptions: data.pendingWithdrawals || 0,
            dailyYield: data.totalDailyYield || 0
          });
        }
      } catch (err) {
        console.error('Platform analytics sync failed');
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  const formatEUR = (val) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(val || 0);

  // --- RENDER LOGIC ---
  const renderRow = (txn) => (
    <div key={txn._id} className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all group">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-xl uppercase tracking-tight">{txn.username || 'System Node'}</span>
            <span className="text-[10px] bg-white/5 px-3 py-1 rounded-lg font-bold text-gray-600 uppercase tracking-widest">
              REF: {txn._id?.slice(-8).toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-gray-500 font-medium">{txn.email}</div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            {txn.type} 
            {txn.type === 'deposit' || txn.type === 'yield' ? <TrendingUp size={14} /> : <TrendingDown size={14} className="text-rose-500" />}
          </div>
        </div>

        <div className="flex items-center gap-6 lg:ml-auto">
          <div className="text-right">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Asset Value</p>
            <p className="text-xl font-bold text-white">{formatEUR(txn.amount)}</p>
          </div>
          <div className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${
            txn.status === 'completed'
              ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
              : txn.status === 'pending'
                ? 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                : 'text-rose-500 border-rose-500/20 bg-rose-500/5'
          }`}>
            {txn.status}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-10">
      {/* --- PLATFORM ANALYTICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Liquidity', value: formatEUR(stats.totalLiquidity), icon: Wallet, color: 'text-emerald-500' },
          { label: 'Active Nodes', value: stats.activeNodes, icon: Activity, color: 'text-emerald-500' },
          { label: 'Pending Redemptions', value: stats.pendingRedemptions, icon: ArrowUpRight, color: 'text-amber-500' },
          { label: '24h Yield Dist.', value: formatEUR(stats.dailyYield), icon: TrendingUp, color: 'text-emerald-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0a0c10] border border-white/10 p-8 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/30 transition-all">
            <s.icon className={`absolute right-[-10px] top-[-10px] opacity-5 scale-150 ${s.color}`} size={100} />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{s.label}</p>
            <h3 className="text-2xl font-bold text-white">{loadingStats ? <Loader2 className="animate-spin" size={20} /> : s.value}</h3>
          </div>
        ))}
      </div>

      {/* --- RECENT ACTIVITY TABLE --- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-emerald-500">
              <Globe size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Global Transaction Audit</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-white">Market <span className="text-emerald-500">Activity</span></h2>
          </div>
        </div>

        <AdminTable
          fetchUrl="/admin/transactions"
          tableName="Transactions"
          rowRenderer={renderRow}
        />
      </div>
    </div>
  );
}

