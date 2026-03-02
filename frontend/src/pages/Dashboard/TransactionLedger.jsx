import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  ArrowDownLeft, ArrowUpRight, Hash, Clock, 
  ShieldCheck, Zap, AlertTriangle, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Dummy component if AuditReportModal isn't built yet
const AuditReportModal = ({ isOpen, onClose, transaction }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#020408]/90 backdrop-blur-xl">
      <div className="bg-[#0f1218] border border-white/10 p-8 rounded-[2rem] max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white">✕</button>
        <h3 className="text-xl font-black italic uppercase text-yellow-500 mb-4">Audit Proof</h3>
        <div className="space-y-4 font-mono text-[10px] break-all">
          <p className="opacity-40 uppercase tracking-widest">Transaction Hash:</p>
          <p className="text-white">{transaction?.txHash || 'INTERNAL_LEDGER_SYNC'}</p>
          <p className="opacity-40 uppercase tracking-widest mt-4">Node ID:</p>
          <p className="text-white">{transaction?._id}</p>
        </div>
      </div>
    </div>
  );
};

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Aligned with backend: GET /api/withdrawal/my (or your dedicated ledger route)
        const res = await api.get('/withdrawal/my'); 
        const data = res.data?.data || res.data?.transactions || [];
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        toast.error('LEDGER SYNC FAILED: NODE TIMEOUT');
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
    <div className="p-4 md:p-10 min-h-screen bg-transparent text-white font-sans">
      
      {/* 1. Audit Protocol Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-500/5 border border-yellow-500/10 rounded-[2.5rem] p-8 mb-12 flex items-start gap-6 max-w-6xl mx-auto relative overflow-hidden group"
      >
        <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/40" />
        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" size={28} />
        <div className="space-y-2">
          <h4 className="font-black text-yellow-500 uppercase tracking-[0.3em] text-[11px]">Audit Protocol v8.4.4 Active</h4>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            All extractions are verified via <span className="text-white">AES-256 Handshake</span>. Transactions marked as <span className="text-emerald-500">'Completed'</span> represent finalized blockchain settlement.
          </p>
        </div>
      </motion.div>

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
                  filter === f ? 'bg-white text-black shadow-xl scale-105' : 'text-slate-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Terminal Table Protocol */}
        <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden backdrop-blur-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5">
                  <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Handshake Event</th>
                  <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Amount (€)</th>
                  <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Status</th>
                  <th className="px-10 py-8 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                <AnimatePresence mode="popLayout">
                  {filteredLogs.map((tx) => (
                    <motion.tr 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={tx._id} 
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <div className={`p-4 rounded-2xl ${
                            ['deposit', 'profit'].includes(tx.type) ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {['deposit', 'profit'].includes(tx.type) ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                          </div>
                          <div>
                            <h4 className="font-black italic uppercase text-sm tracking-tight">{tx.type}</h4>
                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                              <Clock size={10} /> {new Date(tx.createdAt).toLocaleDateString('de-DE')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-center font-mono font-black italic text-lg">
                        <span className={tx.signedAmount >= 0 ? 'text-emerald-400' : 'text-white'}>
                          {tx.signedAmount >= 0 ? '+' : '-'} {Math.abs(tx.amount || 0).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          tx.status === 'completed' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                          tx.status === 'pending' ? 'border-yellow-500/20 text-yellow-500 bg-yellow-500/5' :
                          'border-red-500/20 text-red-400 bg-red-500/5'
                        }`}>
                          {tx.status === 'completed' && <ShieldCheck size={10} />}
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <button 
                          onClick={() => handleOpenAudit(tx)}
                          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:border-yellow-500/30 group-hover:scale-110"
                        >
                          <Hash size={16} className="text-slate-400 group-hover:text-yellow-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AuditReportModal 
        isOpen={isAuditOpen} 
        onClose={() => setIsAuditOpen(false)} 
        transaction={selectedTx} 
      />
    </div>
  );
}

