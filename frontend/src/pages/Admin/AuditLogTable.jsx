import React, { useState, useEffect } from 'react';
import { 
  History, ShieldAlert, User as UserIcon, 
  Calendar, Activity, Fingerprint, ShieldCheck, 
  Clock, Database, Loader2 
} from 'lucide-react';
import api from '../../constants/api'; // Use standardized constant
import toast from 'react-hot-toast';

export default function AuditLogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data } = await api.get('/admin/audit-logs');
        if (data.success) {
          setLogs(data.logs || []);
        }
      } catch (err) { 
        console.error("Audit sync failed", err);
        toast.error("IMMUTABLE LEDGER UNREACHABLE");
      } finally { 
        setLoading(false); 
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 p-2">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Fingerprint className="text-emerald-500" size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              Security <span className="text-emerald-500">Audit Log</span>
            </h2>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-1">
              Administrative Oversight Protocol • AES-256
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 px-6 py-3 bg-[#0a0c10] border border-white/5 rounded-2xl">
           <div className="text-right">
              <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Integrity Status</p>
              <p className="text-[10px] font-black text-emerald-500 uppercase">Verified & Signed</p>
           </div>
           <ShieldCheck className="text-emerald-500" size={20} />
        </div>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                <th className="px-10 py-8">Administrator Node</th>
                <th className="px-10 py-8">Action Protocol</th>
                <th className="px-10 py-8">Target Identity</th>
                <th className="px-10 py-8 text-right">System Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <Loader2 className="animate-spin text-emerald-500" size={32} />
                      <p className="text-[10px] font-black uppercase text-gray-700 tracking-[0.5em]">
                        Accessing Immutable Records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="group hover:bg-white/[0.01] transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black border border-emerald-500/20 text-xs shadow-inner">
                          {log.admin?.fullName?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase tracking-tight">
                            {log.admin?.fullName || 'System Core'}
                          </p>
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                            ID: {log.admin?._id?.slice(-8) || 'AUTO-GEN'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <Activity size={14} className="text-gray-600" />
                        <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors ${
                          log.action.includes('delete') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-black' :
                          log.action.includes('balance') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-black' :
                          'bg-white/5 text-gray-400 border-white/10 group-hover:bg-white/20'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500 uppercase tracking-tighter">
                        <Database size={12} className="text-gray-700" />
                        {log.target}
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] font-black text-white uppercase tracking-tighter italic">
                          {new Date(log.createdAt).toLocaleDateString('de-DE')}
                        </span>
                        <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">
                    No Security Overrides Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
