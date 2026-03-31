// src/pages/Dashboard/AuditLogTable.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { History, ShieldAlert, User as UserIcon, Calendar, Activity } from 'lucide-react';
import api from '../../api/api';

export default function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        setLogs(data.logs || []);
      } catch (err) { console.error("Audit sync failed"); }
      finally { setLoading(false); }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <History className="text-indigo-400" size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Security Audit Log</h2>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Administrative Oversight Protocol</p>
        </div>
      </div>

      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                <th className="px-8 py-6">Administrator</th>
                <th className="px-8 py-6">Action</th>
                <th className="px-8 py-6">Target Identity</th>
                <th className="px-8 py-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center animate-pulse text-[10px] font-black uppercase text-gray-700 tracking-widest">Accessing Immutable Records...</td></tr>
              ) : logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.01] transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black border border-indigo-500/20 text-xs">A</div>
                      <p className="text-xs font-black text-white uppercase">{log.admin?.fullName || 'System'}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                      log.action === 'user_delete' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                      log.action === 'balance_update' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-white/5 text-gray-400 border-white/10'
                    }`}>
                      {log.action.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                    {log.target}
                  </td>
                  <td className="px-8 py-6 text-right text-[10px] font-black text-gray-600 uppercase">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
