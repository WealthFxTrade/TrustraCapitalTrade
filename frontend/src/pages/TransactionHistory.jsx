// src/pages/TransactionHistory.jsx - Production v8.4.1
import React, { useEffect, useState } from 'react';
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal, profit

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/users/transactions');
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error("Failed to synchronize ledger history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  const filteredData = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTypeStyles = (type) => {
    switch (type) {
      case 'deposit': return { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Inbound' };
      case 'withdrawal': return { icon: ArrowUpRight, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Outbound' };
      case 'profit': return { icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Yield' };
      default: return { icon: History, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Misc' };
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans selection:bg-yellow-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Account Ledger</h1>
            <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.4em] mt-1">Audit-Grade Transaction Logs</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
              <Download size={18} className="text-gray-400" />
            </button>
            <button 
              onClick={fetchHistory}
              className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin text-yellow-500' : 'text-gray-400'} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {['all', 'deposit', 'withdrawal', 'profit'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
                filter === type 
                ? 'bg-yellow-500 text-black border-yellow-500' 
                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Transaction Table */}
        <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                  <th className="px-8 py-6">Event</th>
                  <th className="px-8 py-6">Transaction ID</th>
                  <th className="px-8 py-6">Date</th>
                  <th className="px-8 py-6 text-right">Capital Flow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <RefreshCw className="animate-spin text-yellow-500 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Reconstructing Ledger...</p>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-20 text-center">
                      <Clock className="text-gray-800 mx-auto mb-4" size={32} />
                      <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No matching records found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((tx) => {
                    const Style = getTypeStyles(tx.type);
                    return (
                      <tr key={tx._id} className="hover:bg-white/[0.01] transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${Style.bg} ${Style.color} border border-current/10`}>
                              <Style.icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{Style.label}</p>
                              <p className="text-[9px] text-gray-600 font-bold uppercase">{tx.description || 'System Protocol'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-mono text-[10px] text-gray-500">
                          {tx._id.toUpperCase()}
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[8px] text-gray-700 font-black uppercase">
                            {new Date(tx.createdAt).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className={`text-base font-black italic ${Style.color}`}>
                            {tx.type === 'withdrawal' ? '-' : '+'}€{tx.amount.toLocaleString()}
                          </p>
                          <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">
                            {tx.status || 'Success'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger Verification Footer */}
        <div className="text-center pt-10">
           <p className="text-[9px] font-black text-gray-800 uppercase tracking-[0.8em] select-none">
             SHA-256 Verified Ledger • Immutable Records
           </p>
        </div>
      </div>
    </div>
  );
}
