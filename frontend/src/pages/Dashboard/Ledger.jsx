// src/pages/Dashboard/Ledger.jsx
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  RefreshCw, 
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Ledger({ transactions = [], refreshBalances }) {
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual trigger for refresh from the parent
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalances();
    setIsRefreshing(false);
  };

  /**
   * Safe Currency Formatter
   * Prevents Intl errors with non-ISO codes like BTC
   */
  const formatValue = (amount, currency = 'EUR') => {
    const isBTC = currency?.toUpperCase() === 'BTC';
    const formatter = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: isBTC ? 8 : 2,
      maximumFractionDigits: isBTC ? 8 : 2,
    });
    return isBTC ? `${formatter.format(amount)} BTC` : `€${formatter.format(amount)}`;
  };

  /**
   * Themed Status Badges
   */
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    const baseClass = "flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border";

    switch(s) {
      case 'completed':
      case 'confirmed':
      case 'success':
        return (
          <span className={`${baseClass} bg-emerald-500/10 border-emerald-500/20 text-emerald-400`}>
            <CheckCircle2 size={10} /> Confirmed
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className={`${baseClass} bg-amber-500/10 border-amber-500/20 text-amber-400`}>
            <Clock size={10} className="animate-pulse" /> Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClass} bg-rose-500/10 border-rose-500/20 text-rose-400`}>
            <XCircle size={10} /> Failed
          </span>
        );
    }
  };

  /**
   * Transaction Type Icons
   */
  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'deposit') return <ArrowDownLeft className="text-emerald-500" size={14} />;
    if (t === 'withdrawal') return <ArrowUpRight className="text-rose-500" size={14} />;
    return <Zap className="text-blue-500" size={14} />; // Compounding/Internal
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' ? true : tx.type?.toLowerCase() === filter
  );

  return (
    <div className="space-y-6">
      {/* Ledger Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-xl w-fit">
          {['all', 'deposit', 'withdrawal', 'compound'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === t ? 'bg-emerald-500 text-black' : 'text-gray-500 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Sync Audit Log
        </button>
      </div>

      {/* Audit Table */}
      <div className="bg-[#020408]/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5">Event Type</th>
                <th className="px-8 py-5 text-right">Net Value</th>
                <th className="px-8 py-5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, idx) => (
                    <motion.tr
                      key={tx._id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-5 whitespace-nowrap">
                        <p className="text-xs font-bold text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString('de-DE')}
                        </p>
                        <p className="text-[9px] text-gray-600 font-mono mt-0.5">
                          {new Date(tx.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white italic">
                              {tx.type || 'Transaction'}
                            </p>
                            <p className="text-[9px] text-gray-600 truncate max-w-[150px]">
                              {tx.description || 'Internal Node Transfer'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <p className={`text-sm font-black italic ${tx.type === 'withdrawal' ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}
                          {formatValue(tx.amount, tx.currency || 'EUR')}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          {getStatusBadge(tx.status)}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-24 text-center">
                      <Search className="mx-auto text-gray-800 mb-4" size={32} />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        No Ledger Entries Found
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">
          Immutable Audit Log: All transactions are cryptographically signed by the Vault Node.
        </p>
      </div>
    </div>
  );
}

