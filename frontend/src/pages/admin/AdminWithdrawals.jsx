import React, { useState, useEffect } from 'react';
import api from '../api/api';
import toast from 'react-hot-toast';
import { Check, X, Loader2, Clock } from 'lucide-react';

export default function AdminWithdrawals() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/withdrawals/pending');
      setRequests(res.data.transactions);
    } catch (err) {
      toast.error("Failed to load pending nodes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAudit = async (id, status) => {
    try {
      await api.patch(`/admin/withdrawals/${id}`, { status });
      toast.success(`Liquidation ${status}`);
      fetchRequests(); // Refresh list
    } catch (err) {
      toast.error("Audit action failed");
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse italic text-slate-500">Scanning for liquidation requests...</div>;

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Liquidation Audit</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2">Manual Security Review Required</p>
      </header>

      <div className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] uppercase font-black text-slate-500 tracking-[0.2em]">
            <tr>
              <th className="p-6">Investor</th>
              <th className="p-6">Amount</th>
              <th className="p-6">Destination</th>
              <th className="p-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.length > 0 ? requests.map((tx) => (
              <tr key={tx._id} className="hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <p className="text-xs font-bold text-white">{tx.user?.fullName}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{tx.user?.email}</p>
                </td>
                <td className="p-6 font-mono font-bold text-indigo-400">€{tx.amount.toLocaleString()}</td>
                <td className="p-6">
                   <p className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{tx.walletAddress}</p>
                </td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => handleAudit(tx._id, 'completed')} className="p-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-white transition"><Check size={14} /></button>
                  <button onClick={() => handleAudit(tx._id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition"><X size={14} /></button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-20 text-center text-slate-600 italic text-xs uppercase tracking-widest">No pending extractions detected</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

