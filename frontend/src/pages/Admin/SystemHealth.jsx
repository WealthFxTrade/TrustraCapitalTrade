import React, { useState } from 'react';
import { 
  Zap, Loader2, ShieldCheck, 
  Activity, Play, AlertCircle 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function SystemHealth() {
  const [isSyncing, setIsSyncing] = useState(false);

  const triggerManualROI = async () => {
    if (!window.confirm("CONFIRM: Inject 24h yield into all active nodes?")) return;

    setIsSyncing(true);
    const loadToast = toast.loading("Executing Rio Protocol Handshake...");

    try {
      const res = await api.post('/admin/trigger-roi');
      toast.success(res.data.message, { id: loadToast });
    } catch (err) {
      toast.error("Handshake Failed: " + (err.response?.data?.message || "Internal Engine Error"), { id: loadToast });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-3xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-500">
            <Activity size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Engine Status: Active</span>
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">Yield Infrastructure</h3>
          <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest max-w-sm">
            Manually trigger the daily profit distribution for all synchronized investor nodes.
          </p>
        </div>

        <button
          onClick={triggerManualROI}
          disabled={isSyncing}
          className={`px-8 py-5 rounded-2xl font-black uppercase italic tracking-tighter flex items-center gap-3 transition-all active:scale-95 ${
            isSyncing 
            ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
            : 'bg-yellow-500 text-black hover:bg-white'
          }`}
        >
          {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
          {isSyncing ? 'Syncing Nodes...' : 'Execute ROI Protocol'}
        </button>
      </div>

      {/* SYSTEM SPECS OVERLAY */}
      <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatusMetric label="Cron Status" value="Online" color="text-emerald-500" />
        <StatusMetric label="Timezone" value="UTC/Zurich" />
        <StatusMetric label="Auth Level" value="Root/Admin" />
        <StatusMetric label="Encryption" value="AES-256" />
      </div>
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
