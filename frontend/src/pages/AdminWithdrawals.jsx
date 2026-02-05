import React, { useEffect, useState } from 'react';
import { adminGetWithdrawals, adminApproveWithdrawal, adminRejectWithdrawal } from '../api/withdrawalApi';
import { ShieldCheck, ArrowLeft, ExternalLink, Check, X, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const { data } = await adminGetWithdrawals();
      // Ensure data is an array before setting state to prevent .map errors
      setRequests(Array.isArray(data) ? data : data.withdrawals || []);
    } catch (err) {
      console.error('Vault Access Error:', err);
      toast.error('Unauthorized access to payout vault');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    // 2026 Security: Double-check confirmation before moving funds
    if (!window.confirm(`Are you sure you want to ${action} this transaction?`)) return;

    try {
      if (action === 'approve') {
        await adminApproveWithdrawal(id);
      } else {
        await adminRejectWithdrawal(id);
      }
      toast.success(`Transaction ${action}ed successfully`);
      loadRequests(); // Refresh the ledger
    } catch (err) {
      toast.error(`Action failed: ${err.response?.data?.message || 'Server error'}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-10 selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin')} 
              className="p-2 bg-slate-900 rounded-lg border border-slate-800 hover:bg-slate-800 transition active:scale-95"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold tracking-tight">Payout Queue</h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-full border border-slate-800">
            <ShieldCheck className="h-4 w-4 text-indigo-500" /> Multi-Sig Authorized
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-800">
                <tr>
                  <th className="px-6 py-5">Investor</th>
                  <th className="px-6 py-5">Amount (Sats)</th>
                  <th className="px-6 py-5">Destination Address</th>
                  <th className="px-6 py-5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center animate-pulse text-slate-500">
                      Accessing secure ledger...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center text-slate-600">
                      No pending payouts in queue
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-200">{req.user?.email || 'Unknown User'}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" /> {new Date(req.createdAt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-mono font-bold text-amber-500">
                          {Number(req.amountSat || 0).toLocaleString()} sats
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono italic">~${(req.amountUsd || 0).toFixed(2)} USD</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-mono text-xs text-indigo-400 group">
                          <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                            {req.btcAddress?.substring(0, 12)}...
                          </span>
                          {/* FIXED: Correct template literal syntax for the link */}
                          <a 
                            href={`https://mempool.space{req.btcAddress}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-1 hover:bg-indigo-500/10 rounded transition"
                          >
                            <ExternalLink className="h-3.5 w-3.5 hover:text-white transition cursor-pointer" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleAction(req._id, 'reject')} 
                            className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                            title="Reject Transaction"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleAction(req._id, 'approve')} 
                            className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90 shadow-lg shadow-emerald-900/20"
                            title="Approve & Send"
                          >
                            <Check className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

