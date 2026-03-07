import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function GlobalLedger() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLedger = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data } = await api.get('/admin/ledger', { timeout: 10000 });
      
      // Accessing the 'data' array from the backend response object
      const ledgerArray = data.data || [];
      setLogs(ledgerArray);
    } catch (err) {
      console.error('Failed to load global ledger:', err);
      const msg = err.response?.data?.message || err.message || 'Server unreachable.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return logs;

    return logs.filter((log) =>
      log.username?.toLowerCase().includes(term) ||
      log.email?.toLowerCase().includes(term) ||
      log.description?.toLowerCase().includes(term) ||
      log.type?.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  if (loading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#020408] gap-4">
        <RefreshCw className="w-10 h-10 text-yellow-500 animate-spin" />
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.3em]">Querying Node Ledger...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 space-y-10 bg-[#020408] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
            GLOBAL <span className="text-yellow-500">LEDGER</span>
          </h1>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-medium">
            Immutable Audit Trail • System-Wide Capital Flow
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={refreshing}
          className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-xs font-bold border border-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Syncing...' : 'Sync Ledger'}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="text"
          placeholder="Filter by user, email, or transaction type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0A0C10] border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-yellow-500/50 transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/[0.03] text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              <tr>
                <th className="p-6">Timestamp</th>
                <th className="p-6">Investor Node</th>
                <th className="p-6">Operation</th>
                <th className="p-6">Delta</th>
                <th className="p-6">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filteredLogs.map((log, index) => (
                <tr key={log._id || index} className="hover:bg-white/[0.01] transition-colors">
                  <td className="p-6 text-gray-500 whitespace-nowrap">
                    {log.createdAt ? format(new Date(log.createdAt), 'MM/dd HH:mm:ss') : '—'}
                  </td>
                  <td className="p-6">
                    <span className="text-white font-bold block">{log.username || 'SYSTEM'}</span>
                    <span className="text-[10px] text-gray-600">{log.email}</span>
                  </td>
                  <td className="p-6">
                    <LogTypeBadge type={log.type} />
                  </td>
                  <td className={`p-6 font-bold ${log.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {log.amount >= 0 ? '+' : ''}{log.amount?.toLocaleString()} {log.currency || 'EUR'}
                  </td>
                  <td className="p-6 text-gray-400 italic max-w-xs truncate">
                    {log.description || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 grayscale opacity-50">
              <FileText className="w-12 h-12" />
              <p className="text-sm uppercase tracking-widest">No entries found in ledger memory</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── REUSABLE BADGE ──
function LogTypeBadge({ type }) {
  const base = "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border";
  
  const styles = {
    yield: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    withdrawal: 'bg-red-500/10 text-red-500 border-red-500/20',
    deposit: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    override: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const style = styles[type?.toLowerCase()] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';

  return (
    <span className={`${base} ${style}`}>
      {type || 'UNKNOWN'}
    </span>
  );
}
