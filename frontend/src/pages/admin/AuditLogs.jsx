import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  Shield, Activity, User, database, 
  ArrowUpRight, ArrowDownRight, AlertTriangle, Search, Filter 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/admin/audit-logs');
      setLogs(data.logs);
    } catch (err) {
      toast.error("Audit Stream Disconnected");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getActionStyles = (action) => {
    if (action.includes('DEBIT') || action.includes('BAN') || action.includes('DELETE')) {
      return { icon: <ArrowDownRight className="text-red-500" />, bg: 'bg-red-500/10', border: 'border-red-500/20' };
    }
    if (action.includes('CREDIT') || action.includes('APPROVE')) {
      return { icon: <ArrowUpRight className="text-emerald-500" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    }
    return { icon: <Activity className="text-blue-500" />, bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
  };

  if (loading) return <div className="p-10 text-gray-500 font-black uppercase tracking-widest">Initialising Secure Stream...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Security Audit v8.4</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Action <span className="text-slate-800">/</span> Stream</h1>
        </div>
        
        <div className="flex gap-2 bg-[#0f1218] p-1.5 rounded-xl border border-white/5">
          {['all', 'CREDIT', 'DEBIT', 'KYC'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${filter === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40' : 'text-gray-500 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* TIMELINE STREAM */}
      <div className="space-y-4 relative">
        <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-white/5 hidden md:block" />
        
        {logs.filter(l => filter === 'all' || l.action.includes(filter)).map((log) => {
          const { icon, bg, border } = getActionStyles(log.action);
          return (
            <div key={log._id} className={`relative flex flex-col md:flex-row gap-6 p-6 rounded-[1.5rem] bg-[#0f1218] border ${border} hover:bg-white/[0.02] transition-all group`}>
              {/* Icon / Marker */}
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0 z-10 shadow-lg`}>
                {icon}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <h3 className="font-black italic uppercase tracking-tight text-lg text-white">
                    {log.action.replace(/_/g, ' ')}
                  </h3>
                  <span className="text-[10px] font-mono text-gray-600 bg-black/40 px-3 py-1 rounded-md">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                
                <p className="text-xs text-gray-400 font-medium leading-relaxed uppercase italic">
                  Operator <span className="text-white font-bold">{log.admin?.fullName || 'SYSTEM'}</span> modified 
                  target <span className="text-blue-400 font-mono">[{log.targetId?.slice(-8)}]</span>
                </p>

                {/* Metadata Badge */}
                {log.metadata && (
                  <div className="mt-4 p-3 bg-black/40 rounded-xl border border-white/5 inline-flex items-center gap-4">
                    {log.metadata.amount && (
                      <span className="text-[10px] font-black text-gray-500 uppercase">
                        Delta: <span className={log.metadata.amount > 0 ? 'text-emerald-500' : 'text-red-500'}>
                          €{Math.abs(log.metadata.amount).toLocaleString()}
                        </span>
                      </span>
                    )}
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      IP: <span className="text-gray-300 font-mono">{log.ip || 'INTERNAL'}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

