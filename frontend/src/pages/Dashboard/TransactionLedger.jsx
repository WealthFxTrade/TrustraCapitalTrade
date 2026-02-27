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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { API_ENDPOINTS } from '../../constants/api';

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const endpoint = API_ENDPOINTS.USER_TRANSACTIONS || '/user/transactions';
        const res = await api.get(endpoint);
        const data = res.data?.transactions || res.data || [];
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Transaction fetch error:', err);
        toast.error('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredLogs = transactions.filter((tx) =>
    filter === 'all' ? true : tx.type?.toLowerCase() === filter.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <Activity className="text-indigo-500 mb-4" size={32} />
        <div className="text-[10px] font-black uppercase text-white/20 tracking-[0.5em]">
          Loading Transaction History...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0 min-h-screen bg-transparent text-white font-sans">
      {/* Warning Banner */}
      <div className="bg-amber-900/30 border border-amber-500/50 rounded-3xl p-6 mb-8 flex items-start gap-4 max-w-6xl mx-auto">
        <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
        <div>
          <h4 className="font-bold text-amber-300 mb-2">Important Notice</h4>
          <p className="text-amber-200 text-sm leading-relaxed">
            All cryptocurrency transactions are final and irreversible. Always double-check details before proceeding. This history is for reference only.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Transaction History
            </h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">
              View all deposits, withdrawals, investments, and other activity
            </p>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 overflow-x-auto">
            {['all', 'deposit', 'investment', 'profit', 'withdrawal'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.01] text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                <tr>
                  <th className="px-8 py-6">Type / Date</th>
                  <th className="px-8 py-6">Reference</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((tx) => (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-all group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2.5 rounded-xl ${
                              tx.type === 'deposit' || tx.type === 'profit'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-indigo-500/10 text-indigo-400'
                            }`}
                          >
                            {tx.type === 'deposit' || tx.type === 'profit' ? (
                              <ArrowDownLeft size={18} />
                            ) : (
                              <ArrowUpRight size={18} />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] font-black uppercase tracking-tight text-white/90">
                              {tx.description || tx.type?.replace('_', ' ') || 'Transaction'}
                            </p>
                            <p className="text-[9px] font-bold text-white/20 flex items-center gap-1.5 uppercase mt-1">
                              <Clock size={10} />
                              {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white/20 group-hover:text-indigo-400/50 transition-colors cursor-pointer">
                          <Hash size={12} />
                          <code className="text-[10px] font-mono tracking-tighter">
                            {tx.txHash ? `${tx.txHash.substring(0, 12)}...` : 'INTERNAL'}
                          </code>
                          {tx.txHash && (
                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`text-sm font-black tabular-nums font-mono ${
                            tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'} €
                          {(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[9px] font-black px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-all">
                          {tx.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-24 text-center text-white/10 italic text-[10px] uppercase font-black tracking-[0.5em]">
                      No Transactions Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center px-8 text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
          <span>Transaction Log</span>
          <span className="flex items-center gap-2">
            <Search size={12} /> All records secured
          </span>
        </div>
      </div>
    </div>
  );
}
