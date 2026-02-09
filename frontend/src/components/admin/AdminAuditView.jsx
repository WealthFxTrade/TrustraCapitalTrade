import React, { useEffect, useState } from 'react';
import { Shield, Activity, Clock, User, Terminal, Search, Filter } from 'lucide-react';
import api from '../../api/apiService';
import toast from 'react-hot-toast';

export default function AdminAuditView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        if (data.success) setLogs(data.logs);
      } catch (err) {
        toast.error("Audit Stream Sync Failed");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getActionColor = (action) => {
    if (action.includes('REJECT') || action.includes('BAN')) return 'text-red-500 bg-red-500/10';
    if (action.includes('APPROVE') || action.includes('UNBAN')) return 'text-emerald-500 bg-emerald-500/10';
    return 'text-blue-500 bg-blue-500/10';
  };

  return (
    <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
      {/* Header Area */}
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.01]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Terminal size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Audit Telemetry</h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Immutable System Event Stream</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/5 rounded-xl">
          <Activity size={14} className="text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Monitoring Active</span>
        </div>
      </div>

      {/* Audit List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.01] border-b border-white/5">
            <tr>
              <th className="px-8 py-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Timestamp</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Administrator</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Operation</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Target Node</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">IP Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="5" className="px-8 py-6 bg-white/[0.01]"></td>
                </tr>
              ))
            ) : logs.map((log) => (
              <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-mono">{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <User size={14} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-200">{log.admin?.fullName || 'Root Node'}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${getActionColor(log.action)}`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="text-[10px] font-mono text-slate-500">
                    {log.targetModel}: {log.targetId.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td className="px-8 py-6 text-[10px] font-mono text-slate-600 group-hover:text-blue-500 transition-colors">
                  {log.ip || '0.0.0.0'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

