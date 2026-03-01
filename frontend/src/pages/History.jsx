import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { 
  FileText, ArrowDownLeft, ArrowUpRight, 
  RefreshCcw, TrendingUp, Search, Calendar, Loader2
} from 'lucide-react';

const TYPE_CONFIG = {
  deposit: { icon: ArrowDownLeft, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Inbound' },
  exchange: { icon: RefreshCcw, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Swap' },
  investment: { icon: ArrowUpRight, color: 'text-cyan-500', bg: 'bg-cyan-500/10', label: 'Commit' },
  profit: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'ROI Yield' },
  withdrawal: { icon: ArrowUpRight, color: 'text-rose-500', bg: 'bg-rose-500/10', label: 'Outbound' }
};

export default function History() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/user/profile'); // Using profile to get latest ledger
        setTransactions(data.ledger?.reverse() || []);
      } catch (err) {
        console.error("Audit sync failed");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-yellow-500 mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Decrypting Ledger...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter flex items-center gap-3">
            <FileText className="text-yellow-500" /> Audit <span className="text-yellow-500">Logs</span>
          </h1>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mt-2">v8.4.2 Immutable Transaction History</p>
        </div>
        
        <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
          <Calendar size={14} className="text-gray-500" />
          <span className="text-[10px] font-black uppercase tracking-widest italic">Retention: 2016 – 2026</span>
        </div>
      </div>

      <div className="bg-[#0a0f1e] border border-white/5 rounded-[2.5rem] overflow-hidden">
        {transactions.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">No activity detected on this node.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="px-8 py-5">Protocol</th>
                  <th className="px-8 py-5">Amount</th>
                  <th className="px-8 py-5">Details</th>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-8 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx, i) => {
                  const config = TYPE_CONFIG[tx.type] || { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'General' };
                  const Icon = config.icon;

                  return (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${config.bg} ${config.color}`}>
                            <Icon size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-bold">
                        <span className={tx.type === 'profit' ? 'text-emerald-400' : 'text-white'}>
                          {tx.currency === 'EUR' ? '€' : ''}{tx.amount.toLocaleString()} {tx.currency !== 'EUR' ? tx.currency : ''}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-xs text-gray-500 italic max-w-xs truncate">
                        {tx.description}
                      </td>
                      <td className="px-8 py-6 text-[10px] font-medium text-gray-400">
                        {new Date(tx.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl flex items-center justify-between">
         <p className="text-[9px] font-black text-gray-600 uppercase italic">Zürich Node Compliance: ISO-27001 Certified Logging</p>
         <button className="text-[9px] font-black text-yellow-500 uppercase hover:underline">Export CSV Audit</button>
      </div>
    </div>
  );
}
