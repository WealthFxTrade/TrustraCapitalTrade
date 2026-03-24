// src/pages/Dashboard/TransactionLedger.jsx
import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import {
  ArrowDownLeft, ArrowUpRight, Hash, Clock,
  ShieldCheck, Zap, AlertTriangle, Loader2,
  Search, Download, Copy, Check, X, RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── AUDIT MODAL ──
const AuditReportModal = ({ isOpen, onClose, transaction }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const copyHash = async () => {
    const text = transaction.txHash || transaction._id || 'INTERNAL_LEDGER_SYNC';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Hash copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-[#020408]/95 backdrop-blur-xl">
      <div className="bg-[#0f1218] border border-white/10 rounded-[2rem] max-w-lg w-full relative shadow-2xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 rounded-full p-2"
          aria-label="Close audit modal"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center">
          <ShieldCheck size={48} className="text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black italic uppercase text-yellow-500 mb-2">
            Audit Verification
          </h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">
            AES-256 Secured • Immutable Ledger Proof
          </p>
        </div>

        <div className="space-y-6 px-8 pb-8 font-mono text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Type</p>
            <p className="font-bold text-white capitalize">{transaction.type || 'Internal Sync'}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Amount</p>
            <p className={`font-black text-xl ${transaction.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {transaction.amount >= 0 ? '+' : '-'} €{Math.abs(transaction.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</p>
            <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase border ${
              transaction.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
              transaction.status === 'pending' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
              'border-rose-500/30 text-rose-400 bg-rose-500/5'
            }`}>
              {transaction.status === 'completed' && <ShieldCheck size={14} />}
              {transaction.status || 'Processing'}
            </span>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Timestamp</p>
            <p className="text-gray-300">
              {new Date(transaction.createdAt).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: false
              })}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Transaction Hash / Node ID</p>
            <div className="flex items-center gap-3 bg-black/50 p-3 rounded-xl border border-white/5">
              <span className="font-mono text-xs text-yellow-400 break-all flex-1">
                {transaction.txHash || transaction._id || 'INTERNAL_LEDGER_SYNC'}
              </span>
              <button
                onClick={copyHash}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                aria-label="Copy transaction hash"
              >
                {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} className="text-gray-500" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTx, setSelectedTx] = useState(null);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  // Fetch transactions from backend
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get('/api/users/transactions'); // ← real endpoint (adjust if needed)
        const data = res.data?.data || res.data?.transactions || [];
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Ledger fetch failed:', err);
        const msg = err.response?.data?.message || 'Ledger synchronization failed. Node timeout.';
        toast.error(msg);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filtered & searched transactions (memoized for performance)
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter = filter === 'all' || tx.type?.toLowerCase() === filter.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount?.toString().includes(searchTerm) ||
        tx.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx._id?.includes(searchTerm) ||
        tx.txHash?.includes(searchTerm);

      return matchesFilter && matchesSearch;
    });
  }, [transactions, filter, searchTerm]);

  const handleOpenAudit = (tx) => {
    setSelectedTx(tx);
    setIsAuditOpen(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTransactions.length) return toast.error('No transactions to export');

    const headers = ['Type', 'Amount (€)', 'Status', 'Date', 'ID/Hash'];
    const rows = filteredTransactions.map(tx => [
      tx.type || 'Unknown',
      tx.amount || 0,
      tx.status || 'Pending',
      new Date(tx.createdAt).toISOString(),
      tx.txHash || tx._id || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trustra-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Ledger exported as CSV');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
        <div className="relative">
          <Loader2 className="h-20 w-20 animate-spin text-yellow-500" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-yellow-500/30" size={28} />
        </div>
        <div className="text-center">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-yellow-500/60 animate-pulse mb-2">
            Synchronizing Ledger Protocol
          </p>
          <p className="text-sm text-gray-600">Fetching immutable transaction stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-6">
        <AlertTriangle size={72} className="text-rose-500" />
        <h2 className="text-3xl font-black text-white">Ledger Access Denied</h2>
        <p className="text-gray-400 max-w-lg text-lg">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-3 px-10 py-5 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-700 rounded-2xl text-rose-200 font-black uppercase text-sm transition-all"
        >
          <RefreshCw size={18} /> Reconnect Node
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 min-h-screen bg-transparent text-white font-sans">
      {/* Audit & Compliance Banner */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-500/5 border border-yellow-500/15 rounded-[2.5rem] p-8 mb-12 flex items-start gap-6 max-w-6xl mx-auto relative overflow-hidden group shadow-xl"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-yellow-500/50" />
        <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1.5" size={32} />
        <div className="space-y-3">
          <h4 className="font-black text-yellow-500 uppercase tracking-[0.3em] text-[12px]">
            Audit & Compliance Protocol v8.4.4 • Active
          </h4>
          <p className="text-gray-400 text-[10px] lg:text-sm leading-relaxed">
            All transactions are cryptographically signed and immutable. Status <span className="text-emerald-400 font-bold">'Completed'</span> indicates final blockchain settlement. Use audit proof for third-party verification.
          </p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header + Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic leading-none">
              Protocol <span className="text-yellow-500">Ledger</span>
            </h1>
            <p className="text-[10px] lg:text-sm font-black text-gray-600 uppercase tracking-[0.4em]">
              Real-time immutable event stream • {filteredTransactions.length} records
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search type, amount, status, hash..."
                className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 rounded-2xl text-sm outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex bg-white/[0.03] p-1.5 rounded-2xl border border-white/8 overflow-x-auto">
              {['all', 'deposit', 'investment', 'profit', 'withdrawal'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-5 py-2.5 rounded-xl text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    filter === f ? 'bg-white text-black shadow-xl scale-105' : 'text-gray-500 hover:text-white'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={!filteredTransactions.length}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <Download size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table / Empty / Error */}
        <div className="bg-white/[0.02] border border-white/8 rounded-[3rem] overflow-hidden backdrop-blur-3xl shadow-2xl">
          {filteredTransactions.length === 0 ? (
            <div className="py-24 text-center space-y-6">
              <AlertTriangle size={64} className="text-yellow-500/50 mx-auto" />
              <h3 className="text-2xl font-black text-gray-400">No Transactions Found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your ledger is currently empty. Make a deposit or investment to generate activity.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/8">
                    <th className="px-8 lg:px-12 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">Event Type</th>
                    <th className="px-8 lg:px-12 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center">Amount (€)</th>
                    <th className="px-8 lg:px-12 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center">Status</th>
                    <th className="px-8 lg:px-12 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-center">Date</th>
                    <th className="px-8 lg:px-12 py-8 text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] text-right">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions.map((tx) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        key={tx._id}
                        className="group hover:bg-white/[0.03] transition-colors focus-within:bg-white/[0.05]"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleOpenAudit(tx)}
                      >
                        <td className="px-8 lg:px-12 py-8">
                          <div className="flex items-center gap-6">
                            <div className={`p-4 rounded-2xl ${
                              ['deposit', 'profit', 'investment'].includes(tx.type?.toLowerCase())
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}>
                              {['deposit', 'profit', 'investment'].includes(tx.type?.toLowerCase())
                                ? <ArrowDownLeft size={20} />
                                : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                              <h4 className="font-black italic uppercase text-base tracking-tight text-white">
                                {tx.type || 'Internal Sync'}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                                <Clock size={12} /> {new Date(tx.createdAt).toLocaleString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 lg:px-12 py-8 text-center font-mono font-black italic text-xl">
                          <span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {tx.amount >= 0 ? '+' : '-'} {Math.abs(tx.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="px-8 lg:px-12 py-8 text-center">
                          <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            tx.status === 'completed' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' :
                            tx.status === 'pending' ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5' :
                            'border-rose-500/30 text-rose-400 bg-rose-500/5'
                          }`}>
                            {tx.status === 'completed' && <ShieldCheck size={14} />}
                            {tx.status || 'Processing'}
                          </span>
                        </td>

                        <td className="px-8 lg:px-12 py-8 text-center text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>

                        <td className="px-8 lg:px-12 py-8 text-right">
                          <button
                            onClick={() => handleOpenAudit(tx)}
                            className="p-3.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all hover:border-yellow-500/40 group-hover:scale-110 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
                            aria-label={`View audit proof for transaction ${tx._id}`}
                          >
                            <Hash size={18} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AuditReportModal
          isOpen={isAuditOpen}
          onClose={() => setIsAuditOpen(false)}
          transaction={selectedTx}
        />
      </div>
    </div>
  );
}
