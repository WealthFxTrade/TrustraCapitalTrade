// frontend/src/pages/Dashboard/Ledger.jsx
import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  TrendingUp
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

  const formatValue = (amount, currency = 'EUR') => {
    const num = Number(amount || 0);
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(currency?.toUpperCase());

    const formatter = new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: isCrypto ? 8 : 2,
      maximumFractionDigits: isCrypto ? 8 : 2,
    });

    return isCrypto 
      ? `${formatter.format(num)} ${currency.toUpperCase()}` 
      : `€${formatter.format(num)}`;
  };

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

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'deposit') return <ArrowDownLeft className="text-emerald-500" size={18} />;
    if (t === 'withdrawal') return <ArrowUpRight className="text-rose-500" size={18} />;
    if (t === 'yield' || t === 'roi') return <TrendingUp className="text-blue-400" size={18} />;
    return <Zap className="text-amber-500" size={18} />;
  };

  const filteredTransactions = transactions.filter(tx =>
    filter === 'all' || tx.type?.toLowerCase() === filter
  );

  return (
    <div className="space-y-8">
      {/* Toolbar - Updated with 'Yield' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex overflow-x-auto gap-2 bg-white/5 border border-white/10 rounded-2xl p-1 no-scrollbar">
          {['all', 'deposit', 'withdrawal', 'investment', 'yield'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === type
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-3 px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 disabled:opacity-60 transition-all"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          Sync Ledger
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-[#0a0c10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-[10px] font-black uppercase tracking-widest text-gray-500">
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6">Operation</th>
                <th className="px-8 py-6 text-right">Volume</th>
                <th className="px-8 py-6 text-center">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => {
                    const isOutflow = ['withdrawal', 'investment'].includes(tx.type?.toLowerCase());
                    const isYield = ['yield', 'roi'].includes(tx.type?.toLowerCase());
                    
                    return (
                      <motion.tr
                        key={tx._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">
                            {new Date(tx.createdAt).toLocaleDateString('de-DE')}
                          </div>
                          <div className="text-[10px] text-gray-600 font-black uppercase mt-1">
                            {new Date(tx.createdAt).toLocaleTimeString('de-DE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-white/10 transition-colors">
                              {getTypeIcon(tx.type)}
                            </div>
                            <div>
                              <p className="font-bold text-white uppercase text-xs tracking-wider">
                                {tx.type}
                              </p>
                              <p className="text-[11px] text-gray-500 line-clamp-1 max-w-[200px]">
                                {tx.description || 'Blockchain interaction'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right whitespace-nowrap">
                          <p className={`font-black text-lg tracking-tighter ${
                            isOutflow ? 'text-rose-500' : isYield ? 'text-blue-400' : 'text-emerald-400'
                          }`}>
                            {isOutflow ? '-' : '+'}{formatValue(tx.amount, tx.currency)}
                          </p>
                        </td>

                        <td className="px-8 py-6 flex justify-center">
                          {getStatusBadge(tx.status)}
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <p className="text-gray-600 italic text-sm font-medium">
                        No transactions found in this protocol.
                      </p>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

