import React, { useState, useEffect } from 'react';
import { 
  Zap, Loader2, ShieldCheck, Activity, Play, 
  Landmark, TrendingUp, AlertCircle, RefreshCw 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function SystemHealth() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🛰️ FETCH ANALYTICS
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/system-health');
      setStats(data.stats);
    } catch (err) {
      toast.error("Failed to fetch Mainnet analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  // 🚀 MANUAL ROI TRIGGER
  const triggerManualROI = async () => {
    if (!window.confirm("CONFIRM: Inject 24h yield into all active nodes?")) return;
    setIsSyncing(true);
    const loadToast = toast.loading("Executing Rio Protocol Handshake...");

    try {
      const res = await api.post('/admin/trigger-roi');
      toast.success(res.data.message, { id: loadToast });
      fetchStats(); // Refresh stats after payout
    } catch (err) {
      toast.error(err.response?.data?.message || "Engine Stall", { id: loadToast });
    } finally {
      setIsSyncing(false);
    }
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-yellow-500" /></div>;

  return (
    <div className="space-y-8">
      {/* ── ANALYTICS GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard label="Total AUM" value={`€${stats?.totalAUM?.toLocaleString()}`} icon={Landmark} color="text-white" />
        <MetricCard label="ROI Liability" value={`€${stats?.totalRoiLiability?.toLocaleString()}`} icon={AlertCircle} color="text-yellow-500" />
        <MetricCard label="24h Yield" value={`€${stats?.dailyYieldOutflow?.toLocaleString()}`} icon={TrendingUp} color="text-emerald-500" />
        <MetricCard label="Active Nodes" value={stats?.activeNodes} icon={Activity} color="text-blue-400" />
      </div>

      {/* ── YIELD INFRASTRUCTURE TERMINAL ── */}
      <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-500">
              <Activity size={16} className="animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Engine Status: Active</span>
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Yield Protocol Alpha</h3>
            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest max-w-sm">
              Force-synchronize the Rio Engine to distribute daily profits across all qualified investor vaults.
            </p>
          </div>

          <button
            onClick={triggerManualROI}
            disabled={isSyncing}
            className={`px-8 py-5 rounded-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all active:scale-95 ${
              isSyncing ? 'bg-white/5 text-gray-500' : 'bg-yellow-500 text-black hover:bg-white'
            }`}
          >
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
            {isSyncing ? 'Synchronizing...' : 'Execute ROI Protocol'}
          </button>
        </div>

        {/* SPECS OVERLAY */}
        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatusMetric label="Cron Status" value="Online" color="text-emerald-500" />
          <StatusMetric label="Solvency" value={`${stats?.solvencyRatio}x`} />
          <StatusMetric label="Auth Level" value="Root/Admin" />
          <StatusMetric label="Encryption" value="AES-256" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
      <Icon className={`${color} mb-4`} size={20} />
      <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <h4 className={`text-xl font-black italic uppercase ${color}`}>{value}</h4>
    </div>
  );
}

function StatusMetric({ label, value, color = "text-white" }) {
  return (
    <div>
      <p className="text-[8px] font-black uppercase opacity-30 tracking-widest mb-1">{label}</p>
      <p className={`text-[10px] font-black uppercase tracking-widest ${color}`}>{value}</p>
    </div>
  );
}
