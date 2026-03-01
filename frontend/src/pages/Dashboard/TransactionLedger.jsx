import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Hash,
  Clock,
  ExternalLink,
  Search,
  Activity,
  AlertTriangle,
  Globe,
  ShieldCheck,
  ChevronRight,
  Zap,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../constants/api';
import AuditReportModal from '../../components/ui/AuditReportModal';

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [selectedTx, setSelectedTx] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const endpoint = API_ENDPOINTS.USER_TRANSACTIONS || '/user/transactions';
        const res = await api.get(endpoint);
        const data = res.data?.transactions || res.data || [];
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Handshake Error:', err);
        toast.error('LEDGER SYNC FAILED: CONNECTION REFUSED');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleOpenAudit = (tx) => {
    setSelectedTx(tx);
    setIsAuditOpen(true);
  };

  const filteredLogs = transactions.filter((tx) =>
    filter === 'all' ? true : tx.type?.toLowerCase() === filter.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-yellow-500" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500/30" size={20} />
        </div>
        <p className="text-[10px] font-black uppercase text-yellow-500/40 tracking-[0.6em] animate-pulse">
          Synchronizing Ledger Data...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 min-h-screen bg-transparent text-white font-sans animate-in fade-in duration-700">
      
      {/* 1. Audit Protocol Banner */}
      <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] p-8 mb-12 flex items-start gap-6 max-w-6xl mx-auto relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/40" />
        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={28} />
        <div className="space-y-2">
          <h4 className="font-black text-yellow-500 uppercase tracking-[0.3em] text-[11px]">Audit Protocol v8.4.1 Active</h4>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            All crypto-asset movements are executed via <span className="text-white">Managed Nodes</span>. Transactions marked as <span className="text-yellow-500">'Settled'</span> have cleared the global ledger. Handshake verified by Trustra Security.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* 2. Header & Terminal Filters */}
        <div className="flex flex-col xl:flex-row justify-between items-end gap-8">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Protocol <span className="text-yellow-500">Ledger</span>
            </h1>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
              Event Log • Real-time Transaction Stream
            </p>
          </div>

          <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/5 overflow-x-auto w-full xl:w-auto">
            {['all', 'deposit', 'investment', 'profit', 'withdrawal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === f 
                  ? 'bg-white text-black shadow-xl scale-105' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Data Table */}
        <div className="bg-[#0a0f1e]/60 backdrop-blur-xl border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02] text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] border-b border-white/5">
                <tr>
                  <th className="px-10 py-7">Event Identifier</th>
                  <th className="px-10 py-7">Network Cipher</th>
                  <th className="px-10 py-7">Quantum (EUR)</th>
                  <th className="px-10 py-7 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((tx) => (
                    <tr 
                      key={tx._id || tx.id} 
                      onClick={() => handleOpenAudit(tx)}
                      className="hover:bg-white/[0.02] transition-all group cursor-pointer"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`p-3 rounded-2xl border border-white/5 ${
                              tx.type === 'deposit' || tx.type === 'profit'
                                ? 'bg-emerald-500/5 text-emerald-400'
                                : 'bg-yellow-500/5 text-yellow-500'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'profit' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <p className="text-sm font-black italic uppercase tracking-tighter text-white group-hover:text-yellow-500 transition-colors">
                              {tx.description || tx.type?.replace('_', ' ') || 'Internal Transfer'}
                            </p>
                            <p className="text-[9px] font-black text-slate-600 flex items-center gap-2 uppercase mt-1.5 tracking-tighter">
                              <Clock size={10} /> {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2 text-slate-600 group-hover:text-yellow-500/50 transition-colors">
                          <Hash size={12} />
                          <code className="text-[10px] font-mono tracking-tighter uppercase">
                            {tx.txHash ? `${tx.txHash.substring(0, 14)}...` : 'Relay_0x2026'}
                          </code>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className={`text-lg font-black italic tabular-nums ${
                            tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'}€
                          {(tx.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 group-hover:border-yellow-500/30 transition-all">
                          <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'Completed' || tx.status === 'Settled' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-yellow-500 animate-pulse'}`} />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                            {tx.status || 'Settling'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                       <div className="flex flex-col items-center gap-4 opacity-10">
                         <Search size={48} />
                         <p className="text-[10px] uppercase font-black tracking-[1em]">Log_Empty</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Footer Identity */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 px-4 py-8 border-t border-white/5">
           <div className="flex items-center gap-6 opacity-30">
              <div className="flex items-center gap-2">
                <Globe size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Node: Frankfurt_Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">AES-256 Active</span>
              </div>
           </div>
           <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
             Click any record for institutional audit verification
           </p>
        </div>
      </div>

      {/* 5. Audit Modal Injection */}
      <AuditReportModal 
        isOpen={isAuditOpen} 
        onClose={() => setIsAuditOpen(false)} 
        txData={selectedTx} 
      />
    </div>
  );
}

