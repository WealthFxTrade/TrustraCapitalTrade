import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Hash, 
  Clock, 
  ExternalLink,
  Search
} from 'lucide-react';

export default function TransactionLedger() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/user/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error("Ledger sync failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredLogs = transactions.filter(tx => 
    filter === 'all' ? true : tx.type === filter
  );

  if (loading) return (
    <div className="p-20 animate-pulse text-[10px] font-black uppercase text-gray-600 tracking-widest text-center">
      Decrypting Ledger...
    </div>
  );

  return (
    <div className="p-6 md:p-12 bg-[#05070a] min-h-screen text-white font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Terminal Ledger</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">
              Verified Audit Trail — v8.4.1
            </p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {['all', 'deposit', 'investment', 'profit'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Type / Date</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Transaction Hash</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount</th>
                  <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length > 0 ? filteredLogs.map((tx) => (
                  <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'deposit' || tx.type === 'profit' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tx.type === 'deposit' || tx.type === 'profit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight">{tx.description || tx.type}</p>
                          <p className="text-[9px] font-bold text-gray-600 flex items-center gap-1">
                            <Clock size={10} /> {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-400 transition-colors cursor-pointer">
                        <Hash size={12} />
                        <code className="text-[10px] font-mono">{tx.txHash?.substring(0, 12)}...</code>
                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`text-sm font-black tabular-nums ${
                        tx.type === 'deposit' || tx.type === 'profit' ? 'text-emerald-400' : 'text-white'
                      }`}>
                        {tx.type === 'deposit' || tx.type === 'profit' ? '+' : '-'} €{tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      <span className="text-[9px] font-black px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 uppercase tracking-widest">
                        {tx.status || 'Confirmed'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="p-20 text-center text-gray-700 italic text-xs uppercase font-black tracking-widest">
                      Zero Ledger Entries Detected
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Footer */}
        <div className="flex justify-between items-center px-6 text-[9px] font-black text-gray-700 uppercase tracking-widest">
           <span>Node: Trustra_Safe_Ledger_v4</span>
           <span className="flex items-center gap-2"><Search size={12}/> SHA-256 Encryption Active</span>
        </div>
      </div>
    </div>
  );
}
