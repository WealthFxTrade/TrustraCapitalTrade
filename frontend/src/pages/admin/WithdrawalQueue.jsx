import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { Check, X, ExternalLink, Loader2, Clock, Wallet } from 'lucide-react';

export default function WithdrawalQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchQueue = async () => {
    try {
      const { data } = await api.get('/admin/withdrawals?status=pending');
      setRequests(data.withdrawals);
    } catch (err) {
      toast.error("Failed to sync withdrawal queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAction = async (id, status) => {
    let txHash = '';
    if (status === 'approved') {
      txHash = prompt("Enter Blockchain Transaction Hash (TXID):");
      if (!txHash) return; // Cancel if no hash provided
    }

    setProcessingId(id);
    try {
      await api.patch(`/admin/withdrawals/${id}/status`, { 
        status, 
        txHash,
        adminNote: status === 'rejected' ? 'Security Review Failed' : 'Authorized'
      });
      toast.success(`Withdrawal ${status.toUpperCase()}`);
      fetchQueue(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="p-10 text-gray-500 font-black uppercase tracking-widest">Syncing Ledger...</div>;

  return (
    <div className="p-8 bg-[#05070a] min-h-screen text-white">
      <header className="mb-10">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Withdrawal <span className="text-red-500">Queue</span></h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Pending Egress Authorizations</p>
      </header>

      <div className="bg-[#0f1218] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[9px] text-gray-500 uppercase tracking-[0.3em]">
            <tr>
              <th className="px-8 py-6 font-black">Investor</th>
              <th className="px-8 py-6 font-black text-center">Amount (€)</th>
              <th className="px-8 py-6 font-black text-center">Source Wallet</th>
              <th className="px-8 py-6 font-black">Destination Address</th>
              <th className="px-8 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.length > 0 ? requests.map((req) => (
              <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-black text-white italic uppercase text-sm">{req.user?.fullName}</span>
                    <span className="text-[9px] text-gray-600 font-bold">{req.user?.email}</span>
                  </div>
                </td>
                <td className="px-8 py-6 font-mono font-black text-center text-lg text-white">
                  €{req.amount.toLocaleString()}
                </td>
                <td className="px-8 py-6 text-center">
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-md border ${
                    req.walletSource === 'profit' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'
                  }`}>
                    {req.walletSource}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 group-hover:text-blue-400 transition-colors">
                    {req.address.slice(0, 12)}...{req.address.slice(-4)}
                    <ExternalLink size={12} className="cursor-pointer" />
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {processingId === req._id ? (
                    <Loader2 size={20} className="animate-spin ml-auto text-gray-600" />
                  ) : (
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleAction(req._id, 'approved')}
                        className="p-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all"
                        title="Approve & Send"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(req._id, 'rejected')}
                        className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl border border-red-500/20 transition-all"
                        title="Reject & Refund"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className="py-32 text-center">
                  <div className="opacity-20 flex flex-col items-center gap-4">
                    <Clock size={48} />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em]">The Queue is Clear</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

