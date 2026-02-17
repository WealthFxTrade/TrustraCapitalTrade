import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Terminal, 
  Search, 
  Filter, 
  ShieldAlert, 
  Cpu, 
  RefreshCcw,
  Download
} from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

export default function SchemaLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, security, financial, system

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/logs?type=${filter}`);
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error("Audit Stream Synchronization Failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getLogTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'security': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'financial': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'system': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6 lg:p-10 bg-[#020617] min-h-screen text-white">
      {/* TERMINAL HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-500">
            <Cpu size={14} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure Logs</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Audit <span className="text-slate-800">/</span> Ledger</h1>
        </div>

        <div className="flex gap-3">
          <button onClick={fetchLogs} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
            <Download size={14} /> Export Dump
          </button>
        </div>
      </header>

      {/* FILTER TERMINAL */}
      <div className="flex gap-2 p-1 bg-slate-900/50 rounded-2xl border border-slate-800 w-fit">
        {['all', 'security', 'financial', 'system'].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              filter === type ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* LOG TERMINAL VIEW */}
      <div className="glass-card bg-black/40 border-slate-800 font-mono overflow-hidden">
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
          </div>
          <span className="text-[10px] text-slate-500 font-bold ml-2">root@trustra-capital:~# tail -f /var/log/syslog</span>
        </div>

        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 text-[9px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Initiator</th>
                <th className="px-6 py-4">Action Details</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-indigo-500 animate-pulse font-bold">Connecting to Data Stream...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-600 font-bold uppercase text-[10px]">No Logs Found in Active Buffer</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors text-[11px]">
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md border font-black uppercase text-[8px] tracking-widest ${getLogTypeColor(log.type)}`}>
                        {log.type || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-300">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="px-6 py-4 text-indigo-400 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="uppercase font-bold tracking-widest text-[9px]">{log.status || 'OK'}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

