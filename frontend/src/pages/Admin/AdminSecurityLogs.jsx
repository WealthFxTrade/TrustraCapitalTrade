import React, { useEffect, useState } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ShieldAlert, Globe, Monitor, Lock, Unlock } from 'lucide-react';

export default function AdminSecurityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityLogs = async () => {
    try {
      // Endpoint filters AuditLogs where action starts with 'LOGIN_' or 'AUTH_'
      const res = await api.get('/admin/audit-logs?category=security');
      setLogs(res.data.logs || []);
    } catch (err) {
      toast.error("Security Node: Failed to sync access logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSecurityLogs(); }, []);

  if (loading) return (
    <div className="p-20 text-center font-mono text-indigo-500 animate-pulse uppercase tracking-[0.5em]">
      Scanning Security Perimeter...
    </div>
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Access <span className="text-indigo-500">Sentinel</span></h1>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">Trustra Firewall — Admin Session Logs</p>
      </div>

      <div className="bg-[#0f121d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
              <tr>
                <th className="p-6">Identity</th>
                <th className="p-6">Event Type</th>
                <th className="p-6">Origin / IP</th>
                <th className="p-6">System Info</th>
                <th className="p-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.action.includes('FAIL') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {log.action.includes('FAIL') ? <Lock size={14} /> : <Unlock size={14} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{log.admin?.fullName || 'System'}</p>
                        <p className="text-[9px] text-gray-600 font-mono">{log.admin?.email || 'External IP'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                      log.action.includes('FAIL') 
                        ? 'border-rose-500/20 bg-rose-500/5 text-rose-500' 
                        : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Globe size={12} className="text-indigo-500" />
                      <span className="text-[11px] font-mono">{log.ip}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-500 truncate max-w-[200px]" title={log.userAgent}>
                      <Monitor size={12} />
                      <span className="text-[9px] truncate">{log.userAgent || 'Unknown Agent'}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right text-[10px] font-medium text-gray-600">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <div className="p-20 text-center text-gray-600 italic text-xs">
              No recent security incidents logged.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
