import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Clock, ShieldAlert } from 'lucide-react';

export default function WithdrawalManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/admin/withdrawals/pending');
      setRequests(res.data.withdrawals || []);
    } catch (err) {
      toast.error("Failed to sync with Security Node");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, status) => {
    const adminNote = window.prompt(`Reason for ${status}:`);
    if (adminNote === null) return;

    try {
      setActionInProgress(id);
      await api.put(`/admin/withdrawals/${id}`, { status, adminNote });
      toast.success(`Request ${status} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionInProgress(null);
    }
  };

  if (loading) return (
    <div className="p-20 text-center animate-pulse font-black text-gray-600">
      DECRYPTING ADMIN LEDGER...
    </div>
  );

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">Admin Control: Withdrawals</h1>
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em] mt-1">
            Manual Oversight Required — Protocol v8.4.1
          </p>
        </div>

        <div className="bg-[#0f121d] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/5">
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">User / Date</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Asset & Wallet</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount</th>
                <th className="p-6 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.length > 0 ? requests.map((req) => (
                <tr key={req._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <p className="text-sm font-bold text-white">{req.user?.email || 'Unknown User'}</p>
                    <p className="text-[9px] text-gray-600 font-black flex items-center gap-1 mt-1">
                      <Clock size={10} /> {new Date(req.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="p-6">
                    <span className="text-[10px] font-black bg-indigo-600/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                      {req.asset} / {req.walletSource}
                    </span>
                    <p className="text-[10px] font-mono text-gray-500 mt-2 truncate max-w-[150px]">{req.address}</p>
                  </td>
                  <td className="p-6">
                    <p className="text-lg font-black text-white">€{Number(req.amount || 0).toLocaleString()}</p>
                  </td>
                  <td className="p-6 text-right space-x-3">
                    <button
                      onClick={() => handleAction(req._id, 'rejected')}
                      disabled={actionInProgress === req._id}
                      className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition"
                    >
                      <XCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'approved')}
                      disabled={actionInProgress === req._id}
                      className="p-3 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition shadow-lg shadow-emerald-500/10"
                    >
                      <CheckCircle size={18} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="p-20 text-center text-gray-700 italic text-xs uppercase font-black tracking-widest">
                    Zero Pending Withdrawal Claims
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 bg-rose-500/5 border border-rose-500/10 p-6 rounded-2xl">
          <ShieldAlert className="text-rose-500 shrink-0" size={24} />
          <p className="text-[10px] leading-relaxed text-rose-200/60 font-bold uppercase tracking-widest">
            Attention: Approving a withdrawal triggers an immediate refund/transfer protocol. Ensure the destination address has been verified against 2026 Asset Recovery Protocols before final authorization.
          </p>
        </div>
      </div>
    </div>
  );
}
