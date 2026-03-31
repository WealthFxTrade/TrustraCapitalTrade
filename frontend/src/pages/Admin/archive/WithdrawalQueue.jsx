import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import { Check, X, ExternalLink, Loader2, Clock, Wallet, ShieldAlert } from 'lucide-react';

export default function WithdrawalQueue() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchQueue = async () => {
    try {
      // Aligned with backend: GET /admin/withdrawals
      const { data } = await api.get('/admin/withdrawals?status=pending');
      // Ensure we handle the data structure from your controller
      setRequests(data.data || data.withdrawals || []);
    } catch (err) {
      toast.error("Protocol Sync Failed: Admin Feed Offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    // Optional: Auto-refresh pulse every 30 seconds
    const pulse = setInterval(fetchQueue, 30000);
    return () => clearInterval(pulse);
  }, []);

  const handleAction = async (id, status) => {
    let txHash = '';
    if (status === 'completed') {
      txHash = prompt("ENTER BLOCKCHAIN SETTLEMENT HASH (TXID):");
      if (!txHash) return; // Abort if no hash provided for approval
    }

    setProcessingId(id);
    try {
      // Aligned with backend: PATCH /admin/withdrawals/:id/status
      await api.patch(`/admin/withdrawals/${id}/status`, {
        status, // 'completed' or 'rejected'
        txHash,
        adminNote: status === 'rejected' ? 'Security Protocol: Rejected' : 'Authorized'
      });

      toast.success(`NODE UPDATE: Withdrawal ${status.toUpperCase()}`);
      fetchQueue(); // Refresh the live queue
    } catch (err) {
      toast.error(err.response?.data?.message || "Override Protocol Failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-red-500" size={40} />
          <span className="text-gray-500 font-black uppercase tracking-[0.5em] text-[10px]">Syncing Ledger...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-[#05070a] min-h-screen text-white font-sans">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            Withdrawal <span className="text-red-500">Queue</span>
          </h1>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
            Pending Egress Authorizations
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full">
          <ShieldAlert size={14} className="text-red-500 animate-pulse" />
          <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">High Liquidity Alert</span>
        </div>
      </header>

      <div className="bg-[#0f1218] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[9px] text-gray-500 uppercase tracking-[0.3em]">
              <tr>
                <th className="px-8 py-6 font-black">Investor Node</th>
                <th className="px-8 py-6 font-black text-center">Amount (€)</th>
                <th className="px-8 py-6 font-black text-center">Method</th>
                <th className="px-8 py-6 font-black">Destination Cipher</th>
                <th className="px-8 py-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {requests.length > 0 ? requests.map((req) => (
                <tr key={req._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-white italic uppercase text-sm tracking-tight">
                        {req.user?.fullName || 'Unknown User'}
                      </span>
                      <span className="text-[9px] text-gray-600 font-bold uppercase">
                        {req.user?.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono font-black text-center text-lg text-white">
                    €{req.amount?.toLocaleString('de-DE')}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="text-[9px] font-black uppercase px-3 py-1 rounded-md border border-yellow-500/20 text-yellow-500 bg-yellow-500/5">
                      {req.currency || 'BTC'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 group-hover:text-blue-400 transition-colors">
                      {req.walletAddress ? `${req.walletAddress.slice(0, 12)}...${req.walletAddress.slice(-4)}` : 'NO_ADDR_ERR'}
                      <ExternalLink size={12} className="cursor-pointer opacity-30 group-hover:opacity-100" />
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        disabled={processingId === req._id}
                        onClick={() => handleAction(req._id, 'rejected')}
                        className="p-3 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
                      >
                        {processingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <X size={18} />}
                      </button>
                      
                      <button
                        disabled={processingId === req._id}
                        onClick={() => handleAction(req._id, 'completed')}
                        className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 shadow-lg shadow-red-500/5"
                      >
                        {processingId === req._id ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-8 py-32 text-center text-gray-600 font-black uppercase tracking-[0.5em] italic">
                    Node Egress Clear: No Pending Requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

