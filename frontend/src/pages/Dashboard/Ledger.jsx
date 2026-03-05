import React, { useState, useEffect } from 'react';
import { 
  History, ArrowDownLeft, ArrowUpRight, 
  Zap, RefreshCw, Search, Filter, 
  ChevronRight, Download, CheckCircle2, 
  Clock, XCircle 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function Ledger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    try {
      const { data } = await api.get('/transactions/my-history');
      setTransactions(data);
    } catch (err) {
      toast.error("Ledger Sync Failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'pending': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit': return <ArrowDownLeft className="text-blue-400" size={18} />;
      case 'withdrawal': return <ArrowUpRight className="text-rose-400" size={18} />;
      case 'investment': return <Zap className="text-yellow-500" size={18} />;
      case 'exchange': return <RefreshCw className="text-purple-400" size={18} />;
      default: return <History className="text-gray-400" size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020408] text-white p-6 md:p-12 pt-28 font-sans selection:bg-yellow-500/30">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
              Protocol <span className="text-yellow-500">Ledger</span>
            </h1>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
              Synchronized Capital Flow History v8.4.1
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </header>

        {/* ── FILTERS ── */}
        <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
          {['all', 'deposit', 'withdrawal', 'investment', 'exchange'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filter === f ? 'bg-yellow-500 text-black' : 'bg-[#0a0c10] border border-white/5 text-gray-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── DATA TABLE ── */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Event</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Asset/Details</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Volume</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 className="animate-spin text-yellow-500 mx-auto" size={32} />
                    </td>
                  </tr>
                ) : transactions.filter(t => filter === 'all' || t.type === filter).map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-yellow-500/30 transition-all">
                          {getTypeIcon(tx.type)}
                        </div>
                        <span className="text-[11px] font-black uppercase italic tracking-tight">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[11px] font-bold text-gray-400 uppercase">{tx.description || tx.method || 'Internal Transfer'}</p>
                      <p className="text-[8px] font-mono text-gray-700 tracking-tighter uppercase">{tx._id}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className={`text-sm font-black italic ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-white'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}€{tx.amount.toLocaleString('de-DE')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(tx.status)}`}>
                        {tx.status === 'completed' && <CheckCircle2 size={10} />}
                        {tx.status === 'pending' && <Clock size={10} className="animate-pulse" />}
                        {tx.status === 'rejected' && <XCircle size={10} />}
                        {tx.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-bold text-gray-600 uppercase">
                      {new Date(tx.createdAt).toLocaleDateString()}
                      <br />
                      <span className="opacity-40">{new Date(tx.createdAt).toLocaleTimeString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && transactions.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <History size={48} className="mx-auto text-gray-800" />
              <p className="text-[10px] font-black uppercase text-gray-600 tracking-widest">No transaction logs detected in local storage</p>
            </div>
          )}
        </div>

        {/* ── LEDGER FOOTER ── */}
        <div className="bg-[#0a0c10] border border-white/5 p-8 rounded-[2.5rem] flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Real-time Node Synchronizer Active</p>
          </div>
          <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">
            Note: All timestamps are recorded in UTC+1 (Zurich). Transactions are finalized upon 3-node confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}
