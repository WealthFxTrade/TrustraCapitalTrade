import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { ShieldAlert, Terminal, Clock, ExternalLink } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error("Failed to sync audit stream");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  if (loading) return <div className="p-20 text-center text-indigo-500 font-mono animate-pulse uppercase tracking-widest">Accessing Secure Logs...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
              <ShieldAlert className="text-indigo-500" size={32} /> System Audit Trail
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">Immutable Ledger Oversight — Trustra Node v8</p>
          </div>
          <button onClick={fetchLogs} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all">
            <Clock size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="bg-[#0f121d] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Admin Node</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Action Executed</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Target Context</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">IP Signature</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <p className="text-xs font-bold text-indigo-400">{log.admin?.fullName || 'Root Admin'}</p>
                      <p className="text-[9px] text-gray-600 uppercase font-mono">{log.admin?.email}</p>
                    </td>
                    <td className="p-6">
                      <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full border border-indigo-500/20">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <Terminal size={12} className="text-gray-600" />
                        <p className="text-[10px] font-mono text-gray-400">
                          {log.targetModel}: {log.targetId?.slice(-8)}
                        </p>
                        <ExternalLink size={10} className="text-gray-700 opacity-0 group-hover:opacity-100 cursor-help" />
                      </div>
                    </td>
                    <td className="p-6 font-mono text-[10px] text-gray-500">
                      {log.ip || '0.0.0.0'}
                    </td>
                    <td className="p-6 text-right text-[10px] font-medium text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
