// src/pages/Dashboard/Ledger.jsx - FULLY CORRECTED & UNSHORTENED VERSION
import React, { useState, useEffect } from 'react';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchLedger = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/user/ledger');
      
      if (res.data?.success) {
        const data = res.data.data || [];
        // Sort by date (newest first)
        const sorted = [...data].sort((a, b) => 
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
        );
        setTransactions(sorted);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('[LEDGER FETCH ERROR]', err);
      setError('Failed to load ledger. Please try again.');
      toast.error('Ledger Sync Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'rejected':
      case 'failed':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="text-emerald-400" size={18} />;
      case 'withdrawal':
        return <ArrowUpRight className="text-rose-400" size={18} />;
      case 'compound':
      case 'yield':
        return <Zap className="text-yellow-500" size={18} />;
      case 'investment':
        return <Zap className="text-purple-400" size={18} />;
      default:
        return <History className="text-gray-400" size={18} />;
    }
  };

  const getAmountColor = (amount) => {
    return amount > 0 ? 'text-emerald-400' : 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Protocol <span className="text-yellow-500">Ledger</span>
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
              Synchronized Capital Flow History • Real-time Node Sync
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={fetchLedger}
              disabled={loading}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
              Refresh
            </button>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </header>

        {/* FILTERS */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {['all', 'deposit', 'withdrawal', 'compound', 'investment'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f 
                  ? 'bg-yellow-500 text-black shadow-lg' 
                  : 'bg-[#0a0c10] border border-white/5 text-gray-500 hover:text-white hover:border-white/20'
              }`}
            >
              {f === 'all' ? 'ALL TRANSACTIONS' : f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* LEDGER TABLE */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Event</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Details</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 className="animate-spin text-yellow-500 mx-auto mb-4" size={40} />
                      <p className="text-gray-500 text-sm">Synchronizing ledger from node...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <AlertTriangle className="text-rose-500 mx-auto mb-4" size={48} />
                      <p className="text-rose-400 mb-4">{error}</p>
                      <button
                        onClick={fetchLedger}
                        className="px-8 py-3 bg-rose-600 hover:bg-rose-500 rounded-2xl text-white font-black uppercase tracking-widest text-sm"
                      >
                        Retry Sync
                      </button>
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <History size={48} className="mx-auto text-gray-700 mb-4" />
                      <p className="text-gray-500">No matching transactions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, index) => (
                    <tr key={tx._id || index} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-yellow-500/30 transition-all">
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="text-[11px] font-black uppercase italic tracking-tight">
                            {tx.type || 'transaction'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[11px] font-medium text-white">
                          {tx.description || 'Internal Transfer'}
                        </p>
                        {tx.address && (
                          <p className="text-[10px] font-mono text-gray-600 truncate max-w-[220px]">
                            {tx.address}
                          </p>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`text-lg font-black italic ${getAmountColor(tx.amount)}`}>
                          {tx.amount > 0 ? '+' : ''}€{Math.abs(tx.amount || 0).toLocaleString('en-IE', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 px-5 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(tx.status)}`}>
                          {tx.status === 'completed' && <CheckCircle2 size={12} />}
                          {tx.status === 'pending' && <Clock size={12} className="animate-pulse" />}
                          {tx.status === 'rejected' && <XCircle size={12} />}
                          {tx.status || 'unknown'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-bold text-gray-600 uppercase">
                        {new Date(tx.createdAt || tx.date).toLocaleDateString('en-GB')}
                        <br />
                        <span className="opacity-50">
                          {new Date(tx.createdAt || tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              Real-time Node Synchronizer Active
            </p>
          </div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
            All timestamps recorded in UTC+1 (Zurich). Transactions finalized upon blockchain confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
