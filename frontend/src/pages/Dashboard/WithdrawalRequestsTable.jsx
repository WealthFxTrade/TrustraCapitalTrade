// src/pages/Dashboard/WithdrawalRequestsTable.jsx - Production v8.4.1
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, Clock, CheckCircle, 
  XCircle, ExternalLink, Wallet, 
  Search, RefreshCw 
} from 'lucide-react';
import api from '../../api/api';
import toast from 'react-hot-toast';

export default function WithdrawalRequestsTable() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      // Endpoint targeting pending transactions specifically
      const { data } = await api.get('/api/admin/transactions/pending-withdrawals');
      setRequests(data.transactions || []);
    } catch (err) {
      toast.error("Failed to sync withdrawal queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const handleProcess = async (id, status) => {
    try {
      await api.patch(`/api/admin/transactions/${id}`, { status });
      toast.success(`Transaction ${status.toUpperCase()}`, {
        icon: status === 'completed' ? '✅' : '🚫'
      });
      fetchWithdrawals(); // Refresh list
    } catch (err) {
      toast.error("Update failed. Transaction locked.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">Outbound Queue</h2>
          <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mt-1">Pending Liquidity Requests</p>
        </div>
        <button onClick={fetchWithdrawals} className="p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all">
          <RefreshCw size={18} className={loading ? 'animate-spin text-yellow-500' : 'text-gray-400'} />
        </button>
      </div>

      <div className="bg-[#0a0c10] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">
                <th className="px-8 py-6">Investor</th>
                <th className="px-8 py-6">Amount</th>
                <th className="px-8 py-6">Wallet Address</th>
                <th className="px-8 py-6">Timestamp</th>
                <th className="px-8 py-6 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-gray-700">Awaiting Ledger Feed...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-800 italic">No Pending Withdrawals</td></tr>
              ) : requests.map((tx) => (
                <tr key={tx._id} className="hover:bg-white/[0.01] transition-all">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-white">{tx.user?.fullName}</p>
                    <p className="text-[10px] text-gray-600 font-bold">{tx.user?.email}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-red-400 font-black italic">
                      <ArrowUpRight size={14} />
                      €{tx.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 font-mono text-[10px] text-gray-500 bg-white/5 p-2 rounded-lg border border-white/5 max-w-[200px] overflow-hidden">
                      <Wallet size={12} className="shrink-0" />
                      <span className="truncate">{tx.walletAddress || 'Internal Account'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500">
                      <Clock size={12} />
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleProcess(tx._id, 'completed')}
                        className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-emerald-500/20"
                      >
                        Approve <CheckCircle size={14} />
                      </button>
                      <button 
                        onClick={() => handleProcess(tx._id, 'rejected')}
                        className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/20"
                      >
                        Reject <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
