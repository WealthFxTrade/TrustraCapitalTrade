import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { 
  History, Search, ShieldCheck, 
  UserCircle, Calendar, ArrowRight, 
  Database, Filter, Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SchemaLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async (currentPage) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/admin/audit-logs?page=${currentPage}&limit=15`);
      setLogs(data.logs);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      toast.error("Forensic Sync Failed: Audit Ledger Unreachable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <Database className="text-blue-500" /> Protocol <span className="text-blue-500">Forensics</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">
            Immutable Administrative Audit Trail
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2 px-3 border-r border-white/10">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[9px] font-black uppercase text-gray-400">Ledger Online</span>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400">
            <Filter size={16} />
          </button>
        </div>
      </div>

      

      {/* FORENSIC TABLE */}
      <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Querying Security Logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-8 py-6">Timestamp & Operator</th>
                  <th className="px-8 py-6">Action Event</th>
                  <th className="px-8 py-6">Target Node</th>
                  <th className="px-8 py-6">Delta Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Calendar size={14} className="text-gray-600" />
                        <div>
                          <p className="text-[11px] font-bold text-white">
                            {new Date(log.createdAt).toLocaleString()}
                          </p>
                          <p className="text-[9px] text-blue-500 font-black uppercase mt-1">
                            OP: {log.admin?.fullName || 'System Root'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${
                        log.action.includes('delete') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        log.action.includes('balance') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <UserCircle size={14} className="text-gray-600" />
                        <code className="text-[10px] text-gray-400 font-mono">
                          {log.target?.toString().substring(0, 12)}...
                        </code>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="max-w-xs overflow-hidden">
                        <ActionDetails details={log.details} action={log.action} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="p-8 bg-white/5 flex justify-between items-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase disabled:opacity-20 hover:bg-white/10 transition-all"
            >
              Previous
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase disabled:opacity-20 hover:bg-white/10 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// HELPER COMPONENT FOR LOG DATA
const ActionDetails = ({ details, action }) => {
  if (action === 'balance_update') {
    return (
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <span className="text-gray-500">{details.oldBalance}</span>
        <ArrowRight size={10} className="text-emerald-500" />
        <span className="text-white font-bold">{details.newBalance}</span>
        <span className="text-blue-500 text-[8px]">{details.walletType}</span>
      </div>
    );
  }
  
  return (
    <p className="text-[10px] text-gray-400 italic truncate">
      {JSON.stringify(details).replace(/[{}"]/g, '')}
    </p>
  );
};
