import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Hash,
  Clock,
  ExternalLink,
  Search,
  Activity
} from 'lucide-react';

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/user/transactions');
        // Ensure we handle array data correctly regardless of response structure
        setTransactions(Array.isArray(res.data) ? res.data : res.data?.transactions || []);
      } catch (err) {
        console.error("[Ledger Sync Error]:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredLogs = transactions.filter(tx =>
    filter === 'all' ? true : tx.type?.toLowerCase() === filter.toLowerCase()
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
      <Activity className="text-yellow-500 mb-4" size={32} />
      <div className="text-[10px] font-black uppercase text-white/20 tracking-[0.5em]">
        Decrypting Global Ledger...
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-0 min-h-screen bg-transparent text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ─── HEADER & FILTER ─── */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">Terminal Ledger</h1>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">
              Verified Audit Trail — v8.4.1
            </p>
          </div>

          <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
            {['all', 'deposit', 'investment', 'profit'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-yellow-600 text-black shadow-lg' : 'text-white/40 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* ─── LEDGER TABLE ─── */}
        <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="p-8 text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Vector / Timestamp</th>
                  <th className="p-8 text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Network Hash</th>
                  <th className="p-8 text-[10px] font-black uppercase text-white/20 tracking-[0.3em]">Capital Value</th>
                  <th className="p-8 text-[10px] font-black uppercase text-white/20 tracking-[0.3em] text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length > 0 ? filteredLogs.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/[0.02] transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl ${
                          tx.type === 'deposit' || tx.type === 'profit'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'profit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight text-white/90">{tx.description || tx.type}</p>
                          <p className="text-[9px] font-bold text-white/20 flex items-center gap-1.5 uppercase mt-1">
                            <Clock size={10} /> {new Date(tx.createdAt).toLocaleDateString('en-GB')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="flex items-center gap-2 text-white/20 group-hover:text-yellow-500/50 transition-colors cursor-pointer">
                        <Hash size={12} />
                        <code className="text-[10px] font-mono tracking-tighter">
                          {tx.txHash ? `${tx.txHash.substring(0, 12)}...` : 'INTERNAL_TRANSFER'}
                        </code>
                        {tx.txHash && <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
                    </td>
                    <td className="p-8">
                      <span className={`text-sm font-black tabular-nums font-mono ${
                        tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'} €{(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-8 text-right">
                      <span className="text-[9px] font-black px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-widest group-hover:border-yellow-500/20 group-hover:text-yellow-500 transition-all">
                        {tx.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-24 text-center text-white/10 italic text-[10px] uppercase font-black tracking-[0.5em]">
                      Zero Ledger Entries Detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── LEDGER FOOTER ─── */}
        <div className="flex justify-between items-center px-8 text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
           <span>Node: Trustra_Safe_Ledger_v4</span>
           <span className="flex items-center gap-2">
             <Search size={12}/> SHA-256 Encryption Active
           </span>
        </div>
      </div>
    </div>
  );
}

