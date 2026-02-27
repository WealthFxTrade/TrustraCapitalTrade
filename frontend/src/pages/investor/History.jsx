import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Zap,
  TrendingUp,
  Search,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const transactions = user?.ledger || [];

  const filtered = transactions.filter((item) =>
    filter === 'all' ? true : item.type?.toLowerCase() === filter.toLowerCase()
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-500 bg-green-500/10';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 animate-pulse';
      case 'failed': return 'text-red-500 bg-red-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  const getTypeIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'deposit') return <ArrowDownLeft className="text-green-500" size={16} />;
    if (t === 'exchange') return <RefreshCw className="text-blue-500" size={16} />;
    if (t === 'investment') return <Zap className="text-amber-500" size={16} />;
    if (t === 'roi_profit') return <TrendingUp className="text-indigo-500" size={16} />;
    if (t === 'withdrawal') return <ArrowUpRight className="text-red-500" size={16} />;
    return <Search className="text-slate-500" size={16} />;
  };

  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white space-y-8">
      {/* Warning */}
      <div className="bg-amber-900/30 border border-amber-500/50 rounded-3xl p-6 flex items-start gap-4 max-w-6xl mx-auto">
        <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-bold text-amber-300 mb-2">Transaction History</h4>
          <p className="text-amber-200 text-sm">
            Review all past activity. Cryptocurrency transactions are irreversible — verify details carefully.
          </p>
        </div>
      </div>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-2">Audit Trail</p>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">
            Transaction History
          </h1>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto">
          {['all', 'deposit', 'roi_profit', 'investment', 'withdrawal'].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === t ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-[#0f172a]/40 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shadow-3xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Event</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Timestamp</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-slate-600 font-black uppercase tracking-widest text-xs italic">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filtered.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="text-xs font-black uppercase italic tracking-tighter">
                          {tx.type?.replace('_', ' ') || 'Transaction'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-8 py-5 text-sm font-black italic tabular-nums ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })} {tx.currency || 'EUR'}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(tx.status)}`}>
                        {tx.status || 'Completed'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      {new Date(tx.createdAt).toLocaleDateString()} <br />
                      <span className="opacity-50">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-8 py-5 text-[10px] text-slate-400 font-medium max-w-xs truncate italic">
                      {tx.description || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
