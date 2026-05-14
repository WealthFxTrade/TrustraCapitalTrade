// src/pages/Dashboard/Ledger.jsx
import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Ledger({ transactions = [], refreshBalances }) {
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (!refreshBalances) return;

    setIsRefreshing(true);
    try {
      await refreshBalances(true);
    } catch (err) {
      console.error('Ledger refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatValue = (amount, currency = 'EUR') => {
    const num = Number(amount || 0);
    const curr = (currency || 'EUR').toUpperCase();
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(curr);

    const formatter = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: isCrypto ? 6 : 2,
      maximumFractionDigits: isCrypto ? 8 : 2,
    });

    // PRODUCTION FIX: Corrected malformed template literal syntax string block
    return isCrypto
      ? `${formatter.format(num)} ${curr}`
      : `€${formatter.format(num)}`;
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();

    if (['completed', 'confirmed', 'success'].includes(s)) {
      return (
        <span className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest">
          <CheckCircle2 size={12} /> Confirmed
        </span>
      );
    }

    if (s === 'pending') {
      return (
        <span className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-[10px] font-black uppercase tracking-widest">
          <Clock size={12} className="animate-pulse" /> Pending
        </span>
      );
    }

    return (
      <span className="flex items-center gap-2 px-4 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-full text-[10px] font-black uppercase tracking-widest">
        <XCircle size={12} /> Failed
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const t = (type || '').toLowerCase();

    if (t === 'deposit') return <ArrowDownLeft className="text-emerald-500" size={20} />;
    if (t === 'withdrawal') return <ArrowUpRight className="text-rose-500" size={20} />;
    if (['yield', 'roi', 'profit', 'compound'].includes(t)) return <TrendingUp className="text-blue-400" size={20} />;
    if (t === 'investment') return <Zap className="text-purple-400" size={20} />;

    return <Zap className="text-amber-500" size={20} />;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter === 'all') return true;

      const t = (tx.type || '').toLowerCase();

      if (filter === 'yield') {
        return ['yield', 'roi', 'profit', 'compound'].includes(t);
      }

      return t === filter;
    });
  }, [transactions, filter]);

  return (
    <div className="space-y-8">
      {/* Toolbar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 no-scrollbar">
          {['all', 'deposit', 'withdrawal', 'investment', 'yield'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === type
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {type === 'all' ? 'All Transactions' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
          SYNC LEDGER
        </button>
      </div>

      {/* Ledger Table Container */}
      <div className="bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6 w-40">Timestamp</th>
                <th className="px-8 py-6">Operation</th>
                <th className="px-8 py-6 text-right">Amount</th>
                <th className="px-8 py-6 text-center w-48">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 relative">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => {
                    const txType = (tx.type || '').toLowerCase();
                    const isOutflow = ['withdrawal', 'investment'].includes(txType);
                    const isYield = ['yield', 'roi', 'profit', 'compound'].includes(txType);
                    
                    // PRODUCTION FIX: Secure structural unique identification mapping fallback configuration
                    const continuousKey = tx._id || tx.id || `tx-fallback-${index}`;

                    return (
                      <motion.tr
                        key={continuousKey}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.015] transition-colors group"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-semibold text-white">
                            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('de-DE') : '—'}
                          </div>
                          <div className="text-[10px] text-gray-600 font-mono mt-0.5">
                            {tx.createdAt
                              ? new Date(tx.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
                              : ''}
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/20 transition-colors">
                              {getTypeIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm uppercase tracking-wider">
                                {tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'Transaction'}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                {tx.description || 'Vault ledger entry'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <p className={`font-black text-lg tracking-tighter ${
                            isOutflow ? 'text-rose-500' : isYield ? 'text-blue-400' : 'text-emerald-400'
                          }`}>
                            {isOutflow ? '−' : '+'}
                            {formatValue(tx.amount, tx.currency)}
                          </p>
                        </td>

                        {/* PRODUCTION FIX: Restored unshortened structural markup paths and closed out nodes layout loop */}
                        <td className="px-8 py-6">
                          <div className="flex justify-center items-center h-full">
                            {getStatusBadge(tx.status)}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td colSpan="4" className="text-center py-20 text-gray-500 font-medium text-sm">
                      No matching records found in this vault cluster node ledger.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

