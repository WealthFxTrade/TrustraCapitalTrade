import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import {
  Search,
  RefreshCw,
  AlertTriangle,
  FileText,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Download,
  Terminal
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

/** ── HELPER: FOOTER METRIC ── */
const Metric = ({ label, value, color }) => (
  <div className="flex flex-col">
    <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-sm font-black italic tracking-tighter ${color}`}>{value}</span>
  </div>
);

export default function GlobalLedger() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  /** ── 🛰️ FETCH GLOBAL NETWORK LOGS ── */
  const fetchLedger = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      // Targets router.get('/admin/ledger', protect, getGlobalLedger)
      const { data } = await api.get('/admin/ledger', { timeout: 10000 });
      
      // Accessing the 'data' array from the backend response object
      const ledgerArray = data.data || data || [];
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
  }, []);

  useEffect(() => {
    fetchLedger();
    const interval = setInterval(fetchLedger, 60000); // Auto-sync every 60s
    return () => clearInterval(interval);
  }, [fetchLedger]);

  /** ── 🔍 REAL-TIME FILTERING ── */
  const filteredLogs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return logs;

    return logs.filter((log) =>
      log.username?.toLowerCase().includes(term) ||
      log.email?.toLowerCase().includes(term) ||
      log.description?.toLowerCase().includes(term) ||
      log.type?.toLowerCase().includes(term) ||
      log._id?.toLowerCase().includes(term)
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
    <div className="p-6 md:p-8 lg:p-10 space-y-10 bg-[#020408] min-h-screen text-white font-sans selection:bg-yellow-500/20">
      
      {/* ── HEADER SECTION ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
            GLOBAL <span className="text-yellow-500">LEDGER</span>
          </h1>
          <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-[0.3em] font-black italic">
            Immutable Audit Trail • System-Wide Capital Flow
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3 focus-within:border-yellow-500/50 transition-all shadow-2xl">
            <Search size={14} className="text-gray-600" />
            <input 
              type="text" 
              placeholder="Search Node / TXID..." 
              className="bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest w-40 md:w-60"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button
            onClick={fetchLedger}
            disabled={refreshing}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-yellow-500 hover:text-black rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/10 disabled:opacity-50 group"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} />
            {refreshing ? 'Syncing...' : 'Force Sync'}
          </button>
        </div>
      </div>

      {/* ── ERROR STATE ── */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-2xl flex items-center gap-4 text-red-500 animate-in fade-in slide-in-from-top-4">
          <AlertTriangle size={24} />
          <div className="text-xs font-bold uppercase tracking-widest">
            <p>Protocol Interruption: {error}</p>
          </div>
        </div>
      )}

      {/* ── LEDGER INTERFACE ── */}
      <div className="bg-[#0A0C10] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
             <Terminal size={14}/> Network Operations Registry
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-black text-yellow-500 italic">
            <Activity size={14} className="animate-pulse" /> LIVE AUDIT FEED
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-6">Timestamp / TXID</th>
                <th className="px-8 py-6">Node Identity</th>
                <th className="px-8 py-6">Protocol Type</th>
                <th className="px-8 py-6">Value / Asset</th>
                <th className="px-8 py-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm font-medium">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log, i) => (
                  <tr key={log._id || i} className="group hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-6 font-mono">
                      <p className="text-white font-bold text-xs leading-none">
                        {log.createdAt ? format(new Date(log.createdAt), 'dd.MM.yy HH:mm') : '—'}
                      </p>
                      <p className="text-[9px] text-gray-600 uppercase mt-2">TXN: {log._id?.slice(-12).toUpperCase()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-[10px] text-yellow-500 border border-white/5 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                          {log.username?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white uppercase italic tracking-tighter leading-none mb-1">{log.username || 'System'}</p>
                          <p className="text-[9px] text-gray-600 font-bold lowercase tracking-widest leading-none">{log.email || 'internal@node'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          log.amount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {log.amount > 0 ? <ArrowDownLeft size={12} strokeWidth={3}/> : <ArrowUpRight size={12} strokeWidth={3}/>}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{log.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono">
                      <p className={`text-sm font-black italic tracking-tighter ${
                        log.amount > 0 ? 'text-green-500' : 'text-white'
                      }`}>
                        {log.amount > 0 ? '+' : ''}{log.amount.toFixed(log.currency === 'EUR' ? 2 : 6)}
                      </p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase mt-1">{log.currency || 'EUR'}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded border tracking-widest ${
                        log.status === 'completed' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 
                        log.status === 'pending' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5 animate-pulse' : 
                        'border-red-500/30 text-red-500 bg-red-500/5'
                      }`}>
                        {log.status || 'PROCESSED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-32 text-center">
                    <div className="relative inline-block mb-6">
                       <FileText className="w-16 h-16 text-white/5" />
                       <ShieldCheck className="absolute bottom-0 right-0 text-white/10 w-6 h-6"/>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-700">No Ledger Entries Detected</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── FOOTER METRICS ── */}
        <div className="p-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 bg-white/[0.01]">
          <div className="flex gap-10">
            <Metric label="Inbound Protocol" value={`+${filteredLogs.filter(l => l.amount > 0).length}`} color="text-green-500" />
            <Metric label="Outbound Protocol" value={`-${filteredLogs.filter(l => l.amount < 0).length}`} color="text-red-500" />
            <Metric label="Security Sync" value="Verified" color="text-yellow-500" />
          </div>
          
          <div className="flex items-center gap-4">
             <button className="text-[9px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors flex items-center gap-2">
                <Download size={12}/> Export Archive
             </button>
             <p className="text-[8px] font-black text-gray-700 uppercase tracking-widest italic border-l border-white/5 pl-4">
               Zurich Mainnet // Command Center v8.6
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

