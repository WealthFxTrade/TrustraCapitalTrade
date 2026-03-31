import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  FileText,
  Clock,
  CircleDollarSign
} from 'lucide-react';
import api, { API_ENDPOINTS } from '../../constants/api';
import toast from 'react-hot-toast';

const AdminTransactionAudit = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, deposit, withdrawal, roi
  const [search, setSearch] = useState('');

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(API_ENDPOINTS.ADMIN.TRANSACTIONS);
      setTransactions(data.transactions || []);
    } catch (err) {
      toast.error("Ledger Sync Failed: Unauthorized Access or Network Timeout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLedger(); }, []);

  const filteredData = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = tx.user?.email?.toLowerCase().includes(search.toLowerCase()) || 
                         tx._id?.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* ── HEADER & CONTROL BAR ── */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 px-2">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
            Global <span className="text-emerald-500 underline underline-offset-8 decoration-emerald-500/20">Audit Log</span>
          </h2>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] mt-3">
            Real-Time Settlement Tracking • Zurich Protocol v8.4
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search TXID or User Email..."
              className="bg-[#0a0c10] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-[10px] text-white w-64 focus:border-emerald-500/40 outline-none uppercase font-black tracking-widest"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select 
            className="bg-[#0a0c10] border border-white/5 rounded-2xl px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none focus:border-emerald-500/40 cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Operations</option>
            <option value="deposit">Inbound Assets</option>
            <option value="withdrawal">Outbound Redemptions</option>
            <option value="roi">Yield Distributions</option>
          </select>

          <button onClick={fetchLedger} className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-emerald-500 hover:text-black transition-all">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div className="bg-[#06080c] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 italic">
                <th className="px-10 py-8">Timestamp / ID</th>
                <th className="px-10 py-8">Entity (Node)</th>
                <th className="px-10 py-8">Operation</th>
                <th className="px-10 py-8 text-right">Settlement Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-40 text-center animate-pulse text-[10px] font-black uppercase tracking-[0.5em] text-gray-700 italic">Decrypting Ledger Entries...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-40 text-center text-[10px] font-black uppercase tracking-[0.5em] text-gray-800 italic">No Matching Transactions found in History</td>
                </tr>
              ) : filteredData.map((tx) => (
                <tr key={tx._id} className="hover:bg-white/[0.01] transition-all group">
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase italic">
                        <Clock size={12} className="text-emerald-500/50" />
                        {new Date(tx.createdAt).toLocaleString()}
                      </div>
                      <code className="text-[9px] text-gray-700 font-mono tracking-tighter">TX-{tx._id.slice(-12).toUpperCase()}</code>
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white italic uppercase tracking-tight">{tx.user?.name || 'System Node'}</span>
                      <span className="text-[9px] text-gray-600 font-bold lowercase tracking-normal">{tx.user?.email}</span>
                    </div>
                  </td>

                  <td className="px-10 py-8">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      tx.type === 'deposit' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' :
                      tx.type === 'withdrawal' ? 'bg-rose-500/5 text-rose-500 border-rose-500/10' :
                      'bg-blue-500/5 text-blue-400 border-blue-500/10'
                    }`}>
                      {tx.type === 'deposit' && <ArrowDownLeft size={12} />}
                      {tx.type === 'withdrawal' && <ArrowUpRight size={12} />}
                      {tx.type === 'roi' && <CircleDollarSign size={12} />}
                      {tx.type}
                    </div>
                  </td>

                  <td className="px-10 py-8 text-right">
                    <span className={`text-lg font-black font-mono italic ${
                      tx.type === 'deposit' || tx.type === 'roi' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}
                      €{tx.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminTransactionAudit;
