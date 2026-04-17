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

  const handleManualRefresh = async () => {
    if (!refreshBalances) return;
    
    setIsRefreshing(true);
    try {
      await refreshBalances();
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  /**
   * Safe value formatter for EUR and BTC
   */
  const formatValue = (amount, currency = 'EUR') => {
    const num = Number(amount || 0);
    const isBTC = currency?.toUpperCase() === 'BTC';

    const formatter = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: isBTC ? 8 : 2,
      maximumFractionDigits: isBTC ? 8 : 2,
    });

    return isBTC 
      ? `${formatter.format(num)} BTC` 
      : `€${formatter.format(num)}`;
  };

  /**
   * Status badge component
   */
  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();

    switch (s) {
      case 'completed':
      case 'confirmed':
      case 'success':
        return (
          <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case 'pending':
      case 'processing':
        return (
          <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Clock size={12} className="animate-pulse" /> Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            <XCircle size={12} /> Failed
          </span>
        );
    }
  };

  /**
   * Transaction type icon
   */
  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'deposit') return <ArrowDownLeft className="text-emerald-500" size={18} />;
    if (t === 'withdrawal') return <ArrowUpRight className="text-rose-500" size={18} />;
    return <Zap className="text-blue-500" size={18} />;
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => 
    filter === 'all' || tx.type?.toLowerCase() === filter
  );

  return (
    <div className="space-y-8">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 w-fit">
          {['all', 'deposit', 'withdrawal', 'compound'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === type 
                  ? 'bg-emerald-500 text-black shadow-md' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh Ledger
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] font-black uppercase tracking-[0.5px] text-gray-500">
                <th className="px-8 py-6">Date & Time</th>
                <th className="px-8 py-6">Transaction</th>
                <th className="px-8 py-6 text-right">Amount</th>
                <th className="px-8 py-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <motion.tr
                      key={tx._id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.015] transition-colors group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">
                          {new Date(tx.createdAt).toLocaleDateString('de-DE')}
                        </div>
                        <div className="text-xs text-gray-600 font-mono mt-0.5">
                          {new Date(tx.createdAt).toLocaleTimeString('de-DE', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-white/10 transition-colors">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-white capitalize">
                              {tx.type || 'Internal'}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1 max-w-[220px]">
                              {tx.description || 'Node transaction'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <p className={`font-black text-lg tracking-tighter ${
                          tx.type?.toLowerCase() === 'withdrawal' ? 'text-rose-500' : 'text-emerald-400'
                        }`}>
                          {tx.type?.toLowerCase() === 'withdrawal' ? '−' : '+'}
                          {formatValue(tx.amount, tx.currency)}
                        </p>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          {getStatusBadge(tx.status)}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <Search className="mx-auto mb-4 text-gray-700" size={40} />
                      <p className="text-sm font-medium text-gray-500">No transactions found</p>
                      <p className="text-xs text-gray-600 mt-1">Try changing the filter or refresh the ledger</p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Note */}
      <div className="flex items-center gap-3 px-6 py-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <p className="text-xs text-blue-400 font-medium tracking-wide">
          All transactions are recorded on the institutional audit ledger and cannot be altered.
        </p>
      </div>
    </div>
  );
}
